# HungryHippo

HungryHippo is a web application that helps you get recipes for good food without having to make any decisions. It scrapes random recipes, generates a shopping list, and displays the recipes in an easy-to-use interface.

## Features

- Scrape random recipes from a CSV file
- Display recipes in a navigable list
- Generate a comprehensive shopping list for selected recipes
- View recipes in an embedded iframe
- Reset recipes and regenerate the shopping list

## Project Structure

.
├── .gitignore
├── HungaryHippoRecipies.csv
├── package.json
├── public/
│   ├── homepage.html
│   ├── index.html
│   ├── recipeApp.js
│   ├── recipes/
│   ├── selectedRecipes.json
│   ├── shoppingList.html
├── README.md
├── scrapeText.py
├── server.js
├── style.css

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Rasp01/HungryHippo.git
   cd HungryHippo

2. Install depedancies:
    npm install

3. Start the server:
    npm start

## Usage

1. Open your browser and navigate to http://localhost:3000.

2. The application will automatically load the shopping list and display it.

3. Click on any recipe link in the navigation bar to view the recipe.

4. Click the "Reset Recipes" button to scrape new random recipes and regenerate the shopping list.

## API Endpoints
- GET /scrape-random-recipes: Scrape random recipes from the CSV file and store them in selectedRecipes.json.
- GET /get-recipes: Fetch the list of selected recipes.
- GET /recipes/:recipe: Fetch the URL of a specific recipe.
- GET /generate-shopping-list: Generate a comprehensive shopping list for the selected recipes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [Express](https://expressjs.com/)
- [OpenAI](https://openai.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Cheerio](https://cheerio.js.org/)
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or inquiries, please contact the project maintainer at [your-email@example.com].