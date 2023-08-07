// API key to access Spoonacular API
const apiKey = 'enter your API code';

// DOM elements
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');
const recipeResults = document.getElementById('recipeResults');

// Check if the user is visiting for the first time
const isFirstVisit = localStorage.getItem('isFirstVisit');

if (!isFirstVisit) {
    // If it's the first visit, redirect to the welcome page
    window.location.replace('welcome.html');
    // Set the isFirstVisit flag in local storage to remember the user's visit
    localStorage.setItem('isFirstVisit', 'true');
}

// Event listener for input changes in the search box
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    if (query !== '') {
        // Fetch ingredient suggestions from Spoonacular API
        fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${query}&number=5`)
            .then(response => response.json())
            .then(data => displaySuggestions(data))
            .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        // Clear suggestions list if the search box is empty
        suggestionsList.innerHTML = '';
    }
});

// Function to display ingredient suggestions in the dropdown list
function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = '';

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        return;
    }

    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = suggestion.name;
        suggestionItem.addEventListener('click', () => {
            // Update the search input with the selected suggestion
            searchInput.value = suggestion.name;
            suggestionsList.innerHTML = '';
            // Fetch and display full recipe details when suggestion is clicked
            searchRecipes();
        });
        suggestionsList.appendChild(suggestionItem);
    });
}

// Event listener for the search button click
searchButton.addEventListener('click', () => {
    suggestionsList.innerHTML = ''; // Clear suggestions list when search button is clicked
    searchRecipes();
});

// Event listener for the Enter key press in the search input
searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') {
        suggestionsList.innerHTML = ''; // Clear suggestions list when Enter key is pressed
        searchRecipes();
    }
});

// Function to search recipes based on the ingredient input
function searchRecipes() {
    const query = searchInput.value.trim();

    if (query !== '') {
        // Fetch recipes from Spoonacular API based on the input ingredient
        fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${query}&number=5`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unable to fetch recipes. Please try again later.');
                }
                return response.json();
            })
            .then(data => displayRecipes(data))
            .catch(error => {
                console.error('Error fetching data:', error);
                recipeResults.innerHTML = '<p>An error occurred. Please try again later.</p>';
            });
    }
}

// Function to display the list of recipes and their details
function displayRecipes(recipes) {
    recipeResults.innerHTML = '';

    if (!Array.isArray(recipes) || recipes.length === 0) {
        recipeResults.innerHTML = '<p>No recipes found. Try different ingredients.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        const recipeName = document.createElement('h2');
        recipeName.textContent = recipe.title;

        const recipeImage = document.createElement('img');
        recipeImage.src = recipe.image;

        const recipeIngredients = document.createElement('ul');
        recipe.usedIngredients.forEach(ingredient => {
            const ingredientItem = document.createElement('li');
            ingredientItem.textContent = ingredient.originalString;
            recipeIngredients.appendChild(ingredientItem);
        });

        const showInstructionsButton = document.createElement('button');
        showInstructionsButton.textContent = 'Show Instructions';
        showInstructionsButton.addEventListener('click', () => {
            const instructionsExist = recipeCard.querySelector('.instructions');
            if (instructionsExist) {
                // If instructions are already shown, hide them and change the button text
                recipeCard.removeChild(instructionsExist);
                showInstructionsButton.textContent = 'Show Instructions';
            } else {
                // If instructions are not shown, fetch and display them and change the button text
                fetchRecipeInstructions(recipe.id, recipeCard);
                showInstructionsButton.textContent = 'Hide Instructions';
            }
        });

        recipeCard.appendChild(recipeName);
        recipeCard.appendChild(recipeImage);
        recipeCard.appendChild(recipeIngredients);
        recipeCard.appendChild(showInstructionsButton);

        recipeResults.appendChild(recipeCard);
    });
}

// Function to fetch and display the recipe instructions
function fetchRecipeInstructions(recipeId, recipeCard) {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to fetch recipe instructions. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            if (data.instructions) {
                const recipeInstructions = document.createElement('div');
                recipeInstructions.classList.add('instructions');
                recipeInstructions.innerHTML = '<h3>Instructions:</h3>';
                recipeInstructions.innerHTML += `<p>${data.instructions}</p>`;
                recipeCard.appendChild(recipeInstructions);
            }
        })
        .catch(error => {
            console.error('Error fetching recipe instructions:', error);
        });
}
