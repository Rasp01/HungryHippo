const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const csv = require('csv-parser');
const app = express();
app.use(express.static('public'));
const { OpenAI } = require('openai');


const API_KEY = "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";

const openai = new OpenAI({
  apiKey: API_KEY,
});

let recipesData = {};

app.get('/scrape-random-recipes', (req, res) => {
  const csvFilePath = path.join(__dirname, 'HungaryHippoRecipies.csv');
  const recipes = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      recipes.push(row);
    })
    .on('end', () => {
      // Select three random recipes
      const randomRecipes = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        randomRecipes.push(recipes[randomIndex]);
      }

      // Store the selected recipes in the global variable
      recipesData = randomRecipes.reduce((acc, recipe) => {
        acc[recipe['Recipe Name']] = recipe.URL;
        return acc;
      }, {});

      res.json(recipesData);

      // Serialize the dictionary into a JSON string
      const recipesJson = JSON.stringify(recipesData);
      
      // Get the text data from the recipes
      // Specify the full path to the Python executable
      const pythonExecutable = 'C:/Users/raffy/anaconda3/envs/spareroomScraping/python.exe'; // Update this path as needed
      const pythonScriptPath = path.join(__dirname, 'scrapeText.py');

      // Construct the command with the JSON string as an argument
      const command = `${pythonExecutable} ${pythonScriptPath} '${recipesJson}'`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).json({ error: 'Error executing Python script' });
        }

        if (stderr) {
          console.error(`Python script error: ${stderr}`);
          return res.status(500).json({ error: 'Python script error' });
        }
    });
  });
});

app.get('/get-recipes', (req, res) => {
  console.log('Fetching recipes');
  const recipeNames = recipesData;
  console.log('Fetched recipes:', recipeNames);
  res.json(recipeNames);
});

app.get('/recipes/:recipe', (req, res) => {
  console.log('Fetching recipe:', req.params.recipe);
  const recipeName = req.params.recipe;
  const recipeUrl = recipesData[recipeName];
  if (recipeUrl) {
    res.json({ url: recipeUrl });
  } else {
    res.status(404).send('Recipe not found');
  }
});

app.get('/generate-shopping-list', async (req, res) => {
  try {
    const recipesDir = path.join(__dirname, 'public', 'recipes');
    const recipeFiles = fs.readdirSync(recipesDir);
    const recipeContents = recipeFiles.map(file => {
      const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
      return content; // Read text content from the file
    });

    let shoppingList = [];
    for (const recipeContent of recipeContents) {
      const individualPrompt = `Generate a shopping list for the following recipe:\n\n${recipeContent}. Make it concise `;
      const response = await retryRequest(() => openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "developer", content: "You are a helpful assistant." },
          { role: "user", content: individualPrompt }
        ],
        max_tokens: 700,
      }));
      console.log(response.choices[0].message.content.trim());
      shoppingList.push(response.choices[0].message.content.trim());
    }

    const combinedPrompt = `Combine the following shopping lists into one comprehensive shopping list:\n\n${shoppingList.join('\n\n')}.
    Present the ingredients as an unordered HTML list (<ul>). 
    Each ingredient should be in its own list item (<li>).`;
    const finalResponse = await retryRequest(() => openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        { role: "user", content: combinedPrompt }
      ],
      max_tokens: 700,
    }));

    if (finalResponse.choices && finalResponse.choices.length > 0) {
      const htmlContent = finalResponse.choices[0].message.content.match(/<ul>[\s\S]*<\/ul>/);
      if (htmlContent) {
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
