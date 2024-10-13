
import csv
import random
import requests
import os
from bs4 import BeautifulSoup

class getRecipes():
  def __init__(self,csv_file, recipe_folder, num_rows_to_pick):
    self.csv_file = csv_file
    self.recipe_folder = recipe_folder
    self.num_rows_to_pick = num_rows_to_pick
    self.recipe_data = []
    self.count = 0

  def scrape_data_main(self,url):
    page = requests.get(url)
    if page.status_code == 200:
        soup = BeautifulSoup(page.content, "html.parser")

        # Use soup.select or soup.find to select the elements you want to scrape
        listings = soup.find_all("div", class_="StackedRatingsCardWrapper-fRZEyp brTrfS SummaryCollectionGridSummaryItem-WColm bpbpOH")
        # select a random value from the list
        random_value = random.choice(listings)
        # extract url
        listing = random_value.find("div", class_="ClampContent-hilPkr fvKowN")
        local_url = listing.contents[0].attrs['href']
        name = listing.text
        global_url = "https://www.bonappetit.com" + local_url

    return name,global_url

    
  def pick_random_rows(self):
    """Picks random rows from a CSV file.

    Args:
      csv_file: The path to the CSV file.
      num_rows: The number of random rows to pick.

    Returns:
      A list of random rows from the CSV file.
    """

    with open(self.csv_file, 'r') as f:
      reader = csv.reader(f)
      rows = list(reader)

    random_rows = random.sample(rows, self.num_rows_to_pick)
    return random_rows
  
  def extract_html(self,url):
      recipe_filename = f"recipe/recipe_{self.count}.html"
      recipe_filepath = os.path.join(self.recipe_folder, recipe_filename)
      response = requests.get(url)
      response.raise_for_status()  # Raise an exception for error HTTP status codes
      soup = BeautifulSoup(response.text, 'html.parser')
      with open(recipe_filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))

      return recipe_filename


  def get_recipe_data(self):
    """Gets recipe data from a CSV file and saves the HTML to a file.

    Args:
      csv_file: The path to the CSV file.
      recipe_folder: The path to the recipe folder.
      num_rows_to_pick: The number of random rows to pick.

    Returns:
      A list of dictionaries, each containing the recipe name and filepath.
    """

    random_rows = self.pick_random_rows()

    self.count += 1
    for row in random_rows:
      recipe_name = row[0]  # Assuming the recipe name is in the first column
      recipe_url = row[1]
      recipe_filename = self.extract_html(recipe_url)

      self.recipe_data.append({'name': recipe_name, 'filepath': recipe_filename})
      self.count +=1

    return self.recipe_data
  
  def get_random_recipe(self,random_url):
    recipe_name,recipe_url = self.scrape_data_main(random_url)
    recipe_filename = self.extract_html(recipe_url)

    self.recipe_data.append({'name': recipe_name, 'filepath': recipe_filename})
    self.count +=1




def main():
  # Example usage:
  csv_file = 'HungaryHippoRecipies.csv'
  num_rows_to_pick = 3
  # Get the current working directory
  current_dir = os.path.dirname(__file__)

  # Construct the path to the recipe folder relative to the current directory
  recipe_folder = os.path.join(current_dir, 'templates')

  getRecipesInstance = getRecipes(csv_file, recipe_folder, num_rows_to_pick)

  getRecipesInstance.get_recipe_data()

  getRecipesInstance.get_random_recipe("https://www.bonappetit.com/simple-cooking/quick?filter=vegetarian%2Cvegan%2Ceasy%2Cweeknight-meals%2Cdinner&sort=most-recent")

  print(getRecipesInstance.recipe_data)

if __name__ == "__main__":
    main() 

