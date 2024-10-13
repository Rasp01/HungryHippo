from flask import Flask, render_template

app = Flask(__name__, static_folder='templates/recipe')  # Specify static folder location

@app.route('/')
def index():
  recipe_categories = [
    {"name": "Italian", "recipes": [
      {"title": "Spaghetti Bolognese", "url": "recipe/example.html"},
      {"title": "Pizza Margherita", "url": "example.html"}
    ]},
    {"name": "Asian", "recipes": [
      {"title": "Pad Thai", "url": "recipe/example.html"},
      {"title": "Chicken Curry", "url": "example.html"}
    ]}
  ]
  return render_template('index.html', recipe_categories=recipe_categories)

if __name__ == '__main__':
  app.run(debug=True)