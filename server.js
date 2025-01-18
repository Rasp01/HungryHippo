const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.static('public'));

const API_KEY = "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";

app.get('/get-recipes', (req, res) => {
  fs.readdir('recipes', (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading recipes directory');
    } else {
      console.log(files); // Log the files to debug
      res.json(files);
    }
  });
});

app.get('/recipes/:recipe', (req, res) => {
  const recipePath = path.join(__dirname, 'recipes', req.params.recipe);
  res.sendFile(recipePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('Recipe not found');
    }
  });
});

// app.get('/generate-shopping-list', async (req, res) => {
//   try {
//     const recipeFiles = fs.readdirSync('recipes');
//     const recipeContents = recipeFiles.map(file => fs.readFileSync(path.join(__dirname, 'recipes', file), 'utf-8'));

//     const shoppingListPrompt = `Generate a shopping list based on the following recipes:\n\n${recipeContents.join('\n\n')}`;
//     const response = await axios.post("https://api.openai.com/v1/chat/completions", {
//       model: "gpt-3.5-turbo",
//       messages: [{
//         role: "user",
//         content: shoppingListPrompt
//       }],
//       max_tokens: 150,
//     }, {
//       headers: {
//         Authorization: `Bearer ${API_KEY}`,
//         "Content-Type": "application/json"
//       }
//     });

//     console.log(response.data); // Log the response to debug
//     res.json({ shoppingList: response.data.choices[0].message.content.trim() });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error generating shopping list');
//   }
// });

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});