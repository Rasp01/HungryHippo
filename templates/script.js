const recipeList = document.getElementById('recipe-list');
const recipeContent = document.getElementById('recipe-content');

recipeList.addEventListener('click', (event) => {
  const clickedLink = event.target.closest('a');
  if (clickedLink) {
    const recipeUrl = clickedLink.dataset.recipeUrl;

    fetch(recipeUrl)
      .then(response => response.text())
      .then(htmlContent => {
        recipeContent.innerHTML = htmlContent;
      })
      .catch(error => {
        console.error('Error fetching recipe:', error);
        recipeContent.innerHTML = '<p>Error loading recipe.</p>';
      });
  }
});