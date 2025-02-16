document.addEventListener('DOMContentLoaded', () => {
  const loadShoppingList = () => {
    fetch('/shoppingList.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('No shopping list available');
        }
        return response.text();
      })
      .then(data => {
        console.log(data); // Log the shopping list to debug
        document.getElementById('shopping-list').innerHTML = data;
        document.getElementById('shopping-list-content').style.display = 'flex';
      })
      .catch(error => {
        console.error('Error loading shopping list:', error.message);
        console.log('No shopping list available');
      });
  };

  const loadRecipes = () => {
    fetch('/get-recipes')
      .then(response => response.json())
      .then(recipes => {
        console.log(recipes); // Log the recipes to debug
        const recipeLinksContainer = document.getElementById('recipe-links');
        const fragment = document.createDocumentFragment();
        Object.keys(recipes).forEach(recipeName => {
          const listItem = document.createElement('li');
          listItem.className = 'nav-item';
          const link = document.createElement('a');
          link.className = 'nav-link';
          link.textContent = recipeName;
          link.href = '#';
          link.addEventListener('click', (event) => {
            event.preventDefault();
            const recipeUrl = recipes[recipeName];
            document.getElementById('recipe-iframe').src = recipeUrl;
            document.getElementById('shopping-list-content').style.display = 'none';
            document.getElementById('recipe-content').style.display = 'block';
          });
          listItem.appendChild(link);
          fragment.appendChild(listItem);
        });
        recipeLinksContainer.innerHTML = ''; // Clear existing links
        recipeLinksContainer.appendChild(fragment); // Batch update
      });
  };

  const generateShoppingList = () => {
    return fetch('/generate-shopping-list')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the response to debug
        loadShoppingList(); // Refresh the shopping list
      })
      .catch(error => {
        console.error('Error generating shopping list:', error);
      });
  };

  // Load the shopping list and recipes in parallel
  Promise.all([loadShoppingList(), loadRecipes()]);

  // Add event listener to the "Hungary Hippo" title
  document.querySelector('.navbar-brand').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('recipe-content').style.display = 'none';
    loadShoppingList();
  });

// Add event listener to the "Scrape Recipes" button
document.getElementById('scrape-recipes-button').addEventListener('click', async () => {
  const loadingCircle = document.getElementById('loading-circle');
  loadingCircle.style.display = 'flex';

  try {
    const response = await fetch('/scrape-random-recipes');
    const data = await response.json();
    console.log(data); // Log the response to debug
    loadRecipes(); // Refresh the navbar with the new recipes
    await generateShoppingList(); // Generate and refresh the shopping list
  } catch (error) {
    console.error('Error scraping recipes:', error);
  } finally {
    loadingCircle.style.display = 'none';
  }
});
});
