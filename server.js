const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
app.use(express.static('public'));
const { OpenAI } = require('openai');


const API_KEY = "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";

const openai = new OpenAI({
  apiKey: API_KEY,
});

app.get('/get-recipes', (req, res) => {
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
  const recipePath = path.join(__dirname,'public', 'recipes', req.params.recipe);
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
      const individualPrompt = `Generate a shopping list for the following recipe:\n\n${recipeContent}`;
      const response = await retryRequest(() => openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "developer", content: "You are a helpful assistant." },
          { role: "user", content: individualPrompt }
        ],
        max_tokens: 150,
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
      max_tokens: 150,
    }));
    console.log(finalResponse.choices[0].message.content.trim());
    res.json({ shoppingList: finalResponse.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating shopping list');
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