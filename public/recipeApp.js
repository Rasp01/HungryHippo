document.addEventListener('DOMContentLoaded', () => {
  const addUserForm = document.getElementById('add-user-form');
  const userDropdownModal = document.getElementById('user-dropdown-modal');
  const loadUserButton = document.getElementById('confirmUserButton');

  // Handle new user form submission
  addUserForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const userName = document.getElementById('new-user-name').value.trim();
    const userFile = document.getElementById('user-file').files[0];

    if (!userName || !userFile) {
      alert('Please provide a user name and a file.');
      return;
    }

    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('userFile', userFile);

    fetch('/add-user', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add user');
        }
        return response.json();
      })
      .then((data) => {
        alert('User added successfully!');
        const option = document.createElement('option');
        option.value = data.userName;
        option.textContent = data.userName;
        userDropdownModal.appendChild(option);
        addUserForm.reset();
      })
      .catch((error) => {
        console.error('Error adding user:', error);
        alert('Error adding user. Please try again.');
      });
  });

  // Fetch and populate the user dropdown
  const loadUsersForModal = () => {
    return fetch('/get-users') // Return the fetch promise
      .then(response => response.json())
      .then(users => {
        users.forEach(user => {
          const option = document.createElement('option');
          option.value = user;
          option.textContent = user;
          userDropdownModal.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        throw error; // Re-throw the error to propagate it to the caller
      });
  };

  const loadShoppingList = () => {
    const selectedUser = userDropdownModal.value;
    if (!selectedUser) {
      console.error('No user selected. Cannot load shopping list.');
      return;
    }
  
    fetch(`/users/${selectedUser}/shoppingList.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error('No shopping list available for the selected user');
        }
        return response.text();
      })
      .then(data => {
        console.log('Loaded shopping list:', data); // Log the shopping list to debug
        document.getElementById('shopping-list').innerHTML = data;
        document.getElementById('shopping-list-content').style.display = 'flex';
      })
      .catch(error => {
        console.error('Error loading shopping list:', error.message);
        console.log('No shopping list available for the selected user');
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
    const selectedUser = userDropdownModal.value;
    if (!selectedUser) {
      alert('Please select a user.');
      return;
    }

    return fetch(`/generate-shopping-list?username=${selectedUser}`)
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

    // Load the shopping list for the selected user
    loadShoppingList();

    // Hide the modal
    $('#userSelectionModal').modal('hide');
    });

  // Show the modal on page load
  $('#userSelectionModal').modal('show');

  // Initialize
  loadUsersForModal()

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