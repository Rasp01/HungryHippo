document.addEventListener('DOMContentLoaded', () => {
  // Load the homepage content by default
  document.getElementById('recipe-iframe').src = '/homepage.html';

  // Fetch and display recipe links
  fetch('/get-recipes')
    .then(response => response.json())
    .then(recipes => {
      console.log(recipes); // Log the recipes to debug
      const recipeLinksContainer = document.getElementById('recipe-links');
      recipes.forEach(recipe => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.textContent = recipe;
        link.href = '#';
        link.addEventListener('click', (event) => {
          event.preventDefault();
          document.getElementById('recipe-iframe').src = `/recipes/${recipe}`;
        });
        listItem.appendChild(link);
        recipeLinksContainer.insertBefore(listItem, recipeLinksContainer.firstChild);
      });
    });

  // Add event listener for the Shopping List link
  document.getElementById('shopping-list-link').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('recipe-iframe').src = '/homepage.html';
    fetch('/generate-shopping-list')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the shopping list to debug
        document.getElementById('shopping-list').innerHTML = data.shoppingList;
      });
  });
}); 