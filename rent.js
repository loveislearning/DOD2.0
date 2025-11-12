document.addEventListener('DOMContentLoaded', () => {
    const carGrid = document.getElementById('rent-listings');
    const API_URL = 'http://localhost:3000/cars'; // **NOTE:** Adjust the URL/port if your server.js uses a different one

    /**
     * Creates the HTML structure for a single car card.
     * @param {object} car - The car data object.
     * @returns {string} The HTML string for the car card.
     */
    function createCarCardHTML(car) {
        return `
            <div class="car-card" data-car-id="${car.id}">
                <img src="${car.image}" alt="${car.name}">
                <h3>${car.name}</h3>
                <p>₹ ${car.price.toLocaleString()} / Day</p>
                <button class="remove-btn" data-id="${car.id}">Remove Listing</button>
            </div>
        `;
    }

    /**
     * Renders all car listings on the page.
     * @param {array} cars - Array of car objects.
     */
    function renderCarListings(cars) {
        if (cars.length === 0) {
            carGrid.innerHTML = '<p>No cars currently available for rent.</p>';
            return;
        }

        carGrid.innerHTML = cars.map(createCarCardHTML).join('');
        
        // Add event listeners for the remove buttons after rendering
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveListing);
        });
    }

    /**
     * Fetches car data from the server.
     */
    async function fetchCarData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();
            renderCarListings(cars);
        } catch (error) {
            console.error('Could not fetch car listings:', error);
            carGrid.innerHTML = '<p>Error loading listings. Please check the server connection.</p>';
        }
    }

    /**
     * Handles the removal of a car listing.
     * (NOTE: This assumes your server.js/backend is configured to handle DELETE requests)
     */
    async function handleRemoveListing(event) {
        const carId = event.target.dataset.id;
        if (!confirm(`Are you sure you want to remove the listing for car ID ${carId}?`)) {
            return;
        }

        try {
            // Simulated DELETE request to the server
            const response = await fetch(`${API_URL}/${carId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the card from the DOM without a full page reload
                const carCard = document.querySelector(`.car-card[data-car-id="${carId}"]`);
                if (carCard) {
                    carCard.remove();
                    alert('Listing removed successfully!');
                }
            } else {
                alert('Failed to remove listing. Server might not be configured for DELETE.');
                console.error('Failed to delete:', await response.text());
            }
        } catch (error) {
            console.error('Error during removal:', error);
            alert('An error occurred while trying to remove the listing.');
        }
    }

    // Initial call to fetch and display the data
    fetchCarData();
});