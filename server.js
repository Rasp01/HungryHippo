const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/get-recipes', (req, res) => {
  fs.readdir('recipes', (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading recipes directory');
    } else {
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

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});