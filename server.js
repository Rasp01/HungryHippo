const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const csv = require('csv-parser');
const app = express();
app.use(express.static('public'));
const { OpenAI } = require('openai');
const dotenv = require('dotenv'); // Add this line to import dotenv
dotenv.config(); // Load environment variables from .env file


const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: API_KEY,
});

let recipesData = {};

app.get('/scrape-random-recipes', (req, res) => {
  console.log('Getting random recipes');
  const csvFilePath = path.join(__dirname, 'HungaryHippoRecipies.csv');
  const recipes = [];
  const numRecipes = parseInt(req.query.numRecipes) || 3; // Default to 3 if not provided

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      recipes.push(row);
    })
    .on('end', () => {
      console.log('Finished reading CSV file.');
      // Select three random recipes
      const randomRecipes = [];
      const selectedIndices = new Set();

      while (randomRecipes.length < numRecipes && selectedIndices.size < recipes.length) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        if (!selectedIndices.has(randomIndex)) {
          selectedIndices.add(randomIndex);
          randomRecipes.push(recipes[randomIndex]);
        }
      }

      console.log('Selected random recipes:', randomRecipes);

      // Store the selected recipes in the global variable
      recipesData = randomRecipes.reduce((acc, recipe) => {
        acc[recipe['Recipe Name']] = recipe.URL;
        return acc;
      }, {});

      console.log('Recipes data:', recipesData);

      // Write the selected recipes to selectedRecipes.json in the public directory
      const selectedRecipesPath = path.join(__dirname, 'public', 'selectedRecipes.json');
      fs.writeFileSync(selectedRecipesPath, JSON.stringify(recipesData, null, 2), 'utf-8');

      console.log('Running Python script to process the selected recipes...');
      // Run the Python script to process the selected recipes
      const pythonExecutable = 'C:/Users/raffy/anaconda3/envs/spareroomScraping/python.exe'; // Update this path as needed
      const pythonScriptPath = path.join(__dirname, 'scrapeText.py');
      const command = `${pythonExecutable} ${pythonScriptPath}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).json({ error: 'Error executing Python script' });
        }

        if (stderr) {
          console.error(`Python script error: ${stderr}`);
          return res.status(500).json({ error: 'Python script error' });
        }

        console.log(`Python script output:\n${stdout}`);
        res.json(stdout);

      });

    });
});

app.get('/get-recipes', (req, res) => {
  console.log('Fetching recipes');
  const selectedRecipesPath = path.join(__dirname, 'public', 'selectedRecipes.json');
  if (fs.existsSync(selectedRecipesPath)) {
    const recipesData = JSON.parse(fs.readFileSync(selectedRecipesPath, 'utf-8'));
    res.json(recipesData);
  } else {
    res.status(404).send('No recipes found');
  }
});

app.get('/recipes/:recipe', (req, res) => {
  console.log('Fetching recipe:', req.params.recipe);
  const selectedRecipesPath = path.join(__dirname, 'public', 'selectedRecipes.json');
  if (fs.existsSync(selectedRecipesPath)) {
    const recipesData = JSON.parse(fs.readFileSync(selectedRecipesPath, 'utf-8'));
    const recipeName = req.params.recipe;
    const recipeUrl = recipesData[recipeName];
    if (recipeUrl) {
      res.json({ url: recipeUrl });
    } else {
      res.status(404).send('Recipe not found');
    }
  } else {
    res.status(404).send('No recipes found');
  }
});

app.get('/generate-shopping-list', async (req, res) => {
  try {
    const recipesDir = path.join(__dirname, 'public', 'recipes');
    const recipeFiles = fs.readdirSync(recipesDir);
    const recipeContents = recipeFiles.map(file => {
      const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
      console.log('Read content from file:', file);
      return content; // Read text content from the file
    });

    const combinedPrompt = `Generate a shopping list for the following recipes. Merge all the recipe ingredients together, then split the ingredients into separate lists as specified below.  Ensure all ingredients are placed within one of the provided div sections.

    <div class="fruit-veg">
      <h3>Fruit and Veg</h3>
      <ul>
      </ul>
    </div>
    
    <div class="dairy-deli">
      <h3>Dairy/Deli</h3>
      <ul>
      </ul>
    </div>
    
    <div class="bakery">
      <h3>Bakery</h3>
      <ul>
      </ul>
    </div>
    
    <div class="tinned-foods">
      <h3>Tinned Foods</h3>
      <ul>
      </ul>
    </div>
    
    <div class="herbs-spices">
      <h3>Herbs and Spices</h3>
      <ul>
      </ul>
    </div>
    
    <div class="other">
      <h3>Other</h3>
      <ul>
      </ul>
    </div>
    
    Explicitly categorize each ingredient in the following recipes.  Pay close attention to identifying fruits and vegetables.  If an item could arguably fit into multiple categories, make your best judgment.
    
    Here are the recipes:\n\n${recipeContents.join('\n\n')}`;
    
    const finalResponse = await retryRequest(() => openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        { role: "user", content: combinedPrompt }
      ],
      max_tokens: 1000,
    }));

    if (finalResponse.choices && finalResponse.choices.length > 0) {
      console.log('Final response:', finalResponse.choices[0].message.content);
      const htmlContent = finalResponse.choices[0].message.content.match(/```html([\s\S]*?)```/);
      if (htmlContent) {
        const shoppingListPath = path.join(__dirname, 'public', 'shoppingList.html');
        fs.writeFileSync(shoppingListPath, htmlContent[0], 'utf-8');
        res.json({ shoppingList: htmlContent[0] });
      } else {
        console.error('No HTML content found in response:', finalResponse);
        res.status(500).send('Error generating shopping list');
      }
    } else {
      console.error('No choices found in final response:', finalResponse);
      res.status(500).send('Error generating shopping list');
    }
  } catch (error) {
    console.error('Error generating shopping list:', error);
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = error.response.data.error.message;
      if (errorMessage.includes('token limit')) {
        res.status(400).json({ error: 'Token limit exceeded. Please reduce the size of your request.' });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    } else {
      res.status(500).json({ error: 'An error occurred while generating the shopping list.' + error.message });
    }
  }
});

async function retryRequest(requestFn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
