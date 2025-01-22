const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const app = express();
app.use(express.static('public'));
const { OpenAI } = require('openai');


const API_KEY = "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";

const openai = new OpenAI({
  apiKey: API_KEY,
});

app.get('/get-recipes', (req, res) => {
  console.log('Fetching recipes');
  const recipesDir = path.join(__dirname, 'public', 'recipes');
  fs.readdir(recipesDir, (err, files) => {
    if (err) {
      console.error('Error reading recipes directory:', err);
      res.status(500).send('Error reading recipes directory');
    } else {
      console.log('Recipes found:', files);
      res.json(files);
    }
  });
});

app.get('/recipes/:recipe', (req, res) => {
  console.log('Fetching recipe:', req.params.recipe);
  const recipePath = path.join(__dirname, 'public', 'recipes', req.params.recipe);
  res.sendFile(recipePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('Recipe not found');
    }
  });
});

app.get('/generate-shopping-list', async (req, res) => {
  try {
    const recipesDir = path.join(__dirname, 'public', 'recipes');
    const recipeFiles = fs.readdirSync(recipesDir);
    const recipeContents = recipeFiles.map(file => {
      const content = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
      const $ = cheerio.load(content);
      return $('body').text(); // Extract text content from the body
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

app.get('/scrape-random-recipes', async (req, res) => {
  try {
    const recipesDir = path.join(__dirname, 'public', 'recipes');
    const csvFilePath = path.join(__dirname, 'HungaryHippoRecipies.csv');
    const recipes = [];

    // Delete previous files in the recipes folder
    fs.readdir(recipesDir, (err, files) => {
      if (err) {
        console.error('Error reading recipes directory:', err);
      } else {
        files.forEach(file => {
          fs.unlink(path.join(recipesDir, file), err => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    });

    // Read the CSV file and parse it
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        recipes.push(row);
      })
      .on('end', async () => {
        // Select three random recipes
        const randomRecipes = [];
        for (let i = 0; i < 3; i++) {
          const randomIndex = Math.floor(Math.random() * recipes.length);
          randomRecipes.push(recipes[randomIndex]);
        }

        // Scrape the HTML from the selected recipes and save to the recipes folder
        for (const recipe of randomRecipes) {
          const { 'Recipe Name': recipeName, URL } = recipe;
          const response = await axios.get(URL);
          const $ = cheerio.load(response.data);
          const htmlContent = $.html();

          // Save the HTML content to the recipes folder
          const fileName = `${recipeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
          const filePath = path.join(recipesDir, fileName);
          fs.writeFileSync(filePath, htmlContent);
        }

        res.json({ message: 'Scraped and saved three random recipes successfully.' });
      });
  } catch (error) {
    console.error('Error scraping recipes:', error);
    res.status(500).json({ error: 'An error occurred while scraping recipes.' });
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