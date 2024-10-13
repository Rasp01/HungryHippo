
import csv
import random
import requests
from bs4 import BeautifulSoup

def pick_random_rows(csv_file, num_rows):
  """Picks random rows from a CSV file.

  Args:
    csv_file: The path to the CSV file.
    num_rows: The number of random rows to pick.

  Returns:
    A list of random rows from the CSV file.
  """

  with open(csv_file, 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

  random_rows = random.sample(rows, num_rows)
  return random_rows

# Example usage:
csv_file = 'HungaryHippoRecipies.csv'
num_rows_to_pick = 3
filename = 'example.html'


random_rows = pick_random_rows(csv_file, num_rows_to_pick)

for row in random_rows:
  print(row)
  response = requests.get(row[1])
  response.raise_for_status()  # Raise an exception for error HTTP status codes
  soup = BeautifulSoup(response.text, 'html.parser')
  with open(filename, 'w', encoding='utf-8') as f:
    f.write(str(soup))
  print(soup)



