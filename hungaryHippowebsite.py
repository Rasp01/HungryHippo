import os
from flask import Flask, render_template
from HungryHippo import getRecipes

app = Flask(__name__, static_folder='templates/recipe')  # Specify static folder location

@app.route('/')
def index():
  csv_file = 'HungaryHippoRecipies.csv'
  num_rows_to_pick = 3  # Adjust as needed

  current_dir = os.path.dirname(__file__)
  # Construct the path to the recipe folder relative to the current directory
  recipe_folder = os.path.join(current_dir, 'templates')

  recipe_data = getRecipes(csv_file, recipe_folder, num_rows_to_pick).get_recipe_data()
  return render_template('index.html', recipe_data=recipe_data)

if __name__ == '__main__':
  app.run(debug=True)