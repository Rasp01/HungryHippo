document.addEventListener('DOMContentLoaded', () => {
  let shoppingListCache = null;

  const loadShoppingList = () => {
    if (shoppingListCache) {
      document.getElementById('shopping-list').innerHTML = shoppingListCache;
      document.getElementById('shopping-list-content').style.display = 'flex';
    } else {
      fetch('/generate-shopping-list')
        .then(response => response.json())
        .then(data => {
          console.log(data); // Log the shopping list to debug
          shoppingListCache = data.shoppingList;
          document.getElementById('shopping-list').innerHTML = shoppingListCache;
          document.getElementById('shopping-list-content').style.display = 'flex';
        });
    }
  };

  // Load the shopping list on initial load
  loadShoppingList();

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
          document.getElementById('shopping-list-content').style.display = 'none';
          document.getElementById('recipe-content').style.display = 'block';
        });
        listItem.appendChild(link);
        recipeLinksContainer.insertBefore(listItem, recipeLinksContainer.firstChild);
      });
    });

  // Add event listener to the "Hungary Hippo" title
  document.querySelector('.navbar-brand').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('recipe-content').style.display = 'none';
    loadShoppingList();
  });
});