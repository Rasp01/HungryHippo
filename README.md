# HungryHippo

HungryHippo is a web application that helps you get recipes for good food without having to make any decisions. It lets you choose how many recipes you want, generates a shopping list, and displays the recipes in an easy-to-use interface.

## Features

- Select random recipes from a users CSV file
- Display recipes in a navigable list
- Generate a comprehensive shopping list for selected recipes
- Reset recipes and regenerate the shopping list

## Prerequisites

Before running this application, ensure you have the following installed on your system:

1. **Anaconda**: Used to manage the Conda environment.
   - [Download Anaconda](https://www.anaconda.com/products/distribution)
2. **Python**: Required for running the python scripts.
   - [Download Python](https://www.python.org/downloads/)
3. **Node.js and npm**: Required for running the server and managing dependencies.
   - [Download Node.js](https://nodejs.org/)
4. **OpenAI API Key**: Required for generating shopping lists using OpenAI's API.
   - Obtain an API key from [OpenAI](https://platform.openai.com/signup/).
   - Populate the `.env` file in the root of the repository with your API key:
     ```properties
     OPENAI_API_KEY=your_openai_api_key_here
     ```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Rasp01/HungryHippo.git
   cd HungryHippo
   ```

2. Run the setup script:
   ```sh
   setup.bat
   ```

   This script will:
   - Check for Node.js and npm installation.
   - Install all required Node.js dependencies.
   - Set up the Conda environment using `environment.yml`.
   - Create necessary directories.
   - Start the server.

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. The application will automatically load the shopping list and display it.

2. Click on any recipe link in the navigation bar to view the recipe.

3. Click the "Reset Recipes" button to scrape new random recipes and regenerate the shopping list.

## API Endpoints

- POST /add-user: Takes user name and csv file and creates a new user profile with the name of the user
- GET /load-user-recipes: Takes as input a number which will be used to deteremine the number of random recipes from the users CSV file and store them in `selectedRecipes.json`.
- GET /get-recipes: Fetch the list of selected recipes.
- GET /recipes/:recipe: Fetch the URL of a specific recipe.
- GET /generate-shopping-list: Generate a comprehensive shopping list for the selected recipes.


## Disclaimer

This project includes code that scrapes content from websites using the `scrapeText.py` script. Please ensure that the websites you include in your recipes allow web scraping and comply with their terms of service. Unauthorized scraping may violate website policies or legal regulations.

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

For any questions or inquiries, please contact the project maintainer at raffy.sprent@gmail.com.