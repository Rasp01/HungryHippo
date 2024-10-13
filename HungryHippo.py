
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

    recipe_data = []
    count = 1
    for row in random_rows:
      recipe_name = row[0]  # Assuming the recipe name is in the first column
      recipe_filename = f"recipe/recipe_{count}.html"
      recipe_filepath = os.path.join(self.recipe_folder, recipe_filename)

      response = requests.get(row[1])
      response.raise_for_status()  # Raise an exception for error HTTP status codes
      soup = BeautifulSoup(response.text, 'html.parser')
      with open(recipe_filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))

      recipe_data.append({'name': recipe_name, 'filepath': recipe_filename})
      count +=1

    return recipe_data


def main():
  # Example usage:
  csv_file = 'HungaryHippoRecipies.csv'
  num_rows_to_pick = 3
  # Get the current working directory
  current_dir = os.path.dirname(__file__)

  # Construct the path to the recipe folder relative to the current directory
  recipe_folder = os.path.join(current_dir, 'templates')

  recipe_data = getRecipes(csv_file, recipe_folder, num_rows_to_pick).get_recipe_data()

  print(recipe_data)

if __name__ == "__main__":
    main() 

