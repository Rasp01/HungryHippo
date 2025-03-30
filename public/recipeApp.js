document.addEventListener('DOMContentLoaded', () => {
  const userDropdownModal = document.getElementById('user-dropdown-modal');
  const loadUserButton = document.getElementById('confirmUserButton');

  // Fetch and populate the user dropdown
  const loadUsersForModal = () => {
    fetch('/get-users')
      .then(response => response.json())
      .then(users => {
        users.forEach(user => {
          const option = document.createElement('option');
          option.value = user;
          option.textContent = user;
          userDropdownModal.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  // Preload the users recipes if exist when the page loads
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

  const loadUserRecipes = () => {
    const selectedUser = userDropdownModal.value;
    if (!selectedUser) {
      alert('Please select a user.');
      return;
    }

    fetch(`/get-recipes?username=${selectedUser}`)
      .then(response => {
        if (response.status === 404) {
          console.log('No pre-selected recipes found for the selected user.');
          // Open the "Refresh Recipes" modal
          $('#recipeModal').modal('show');
        }
        return response.json();
      })
      .then(recipes => {
        console.log('Loaded recipes for user:', selectedUser, recipes);
        const recipeLinksContainer = document.getElementById('recipe-links');
        const fragment = document.createDocumentFragment();
        Object.keys(recipes).forEach(recipeName => {
          console.log('Recipe name:', recipeName, 'URL:', recipes[recipeName]);
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

  // Handle user selection confirmation
  confirmUserButton.addEventListener('click', () => {
    const selectedUser = userDropdownModal.value;
    if (!selectedUser) {
      alert('Please select a user.');
      return;
    }

    // Set the selected user in the main dropdown
    const userDropdown = document.getElementById('user-dropdown-modal');
    userDropdown.value = selectedUser;

    // Load the user's recipes
    loadUserRecipes();

    // Hide the modal
    $('#userSelectionModal').modal('hide');
  });

  // Show the modal on page load
  $('#userSelectionModal').modal('show');

  // Initialize
  // Load the shopping list and recipes in parallel
  Promise.all([loadShoppingList(), loadUsersForModal()]);


  // Add event listener to the "Hungary Hippo" title
  document.querySelector('.navbar-brand').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('recipe-content').style.display = 'none';
    loadShoppingList();
  });


  // Add event listener to the number of recipes range input
  document.getElementById('numRecipesRange').addEventListener('input', function() {
    document.getElementById('numRecipesValue').textContent = this.value;
  });

  // Add event listener to the confirm button in the modal
  document.getElementById('confirmButton').addEventListener('click', function() {
    const userDropdown = document.getElementById('user-dropdown-modal');
    const selectedUser = userDropdown.value;
    if (!selectedUser) {
      alert('Please select a user.');
      return;
    }

    const numRecipes = document.getElementById('numRecipesRange').value;
    $('#recipeModal').modal('hide');
    // Show loading spinner
    document.getElementById('loading-circle').style.display = 'flex';
    // Make the request to scrape random recipes
    fetch(`/load-user-recipes?username=${selectedUser}&numRecipes=${numRecipes}`)
      .then(response => response.json())
      .then(data => {
        console.log('Recipes found:', data);
        // Handle the response data as needed
        loadUserRecipes(); // Refresh the navbar with the new recipes
        generateShoppingList(); // Generate and refresh the shopping list
        // remove loading spinner once the recipes are loaded
        // Hide loading spinner
        document.getElementById('loading-circle').style.display = 'none';
      })
      .catch(error => {
        console.error('Error scraping recipes:', error);
        // Hide loading spinner
        document.getElementById('loading-circle').style.display = 'none';
      });
  });
});
