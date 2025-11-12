document.addEventListener('DOMContentLoaded', function() {
    // **CRITICAL FIX**: Must include '/api'
    const API_URL = 'http://localhost:3000/api'; 
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const sellForm = document.getElementById('sell-car-form');

    // 1. Mandatory Login Check
    if (!loggedInUserId) {
        alert('You must be logged in to list a car.');
        window.location.href = 'login.html';
        return;
    }

    // 2. Fetch User Data to pre-fill form
    let userData = {};
    async function loadUserData() {
        try {
            const res = await fetch(`${API_URL}/users/${loggedInUserId}`);
            if (!res.ok) throw new Error('User not found');
            userData = await res.json();

            // Pre-fill the form fields with user data
            document.getElementById('seller-name').value = userData.name || '';
            document.getElementById('seller-email').value = userData.email || '';

        } catch (error) {
            console.error('Error loading user data for sell page:', error);
            alert('Failed to load your profile. Please log in again.');
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        }
    }

    // 3. Form Submission Handler
    sellForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const carData = {
            name: document.getElementById('seller-name').value,
            email: document.getElementById('seller-email').value,
            model: document.getElementById('car-model').value,
            image: document.getElementById('car-image-url').value,
            price: document.getElementById('car-price').value,
            // Include the necessary userId for the server
            userId: loggedInUserId 
        };

        // Simple validation check
        if (!carData.name || !carData.email || !carData.model || !carData.image || !carData.price) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            // **CRITICAL FIX**: Send POST request to the correct /api/cars endpoint
            const res = await fetch(`${API_URL}/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carData)
            });

            if (res.ok) {
                alert('Listing submitted successfully! Check your dashboard.');
                sellForm.reset(); // Clear the form
                // Redirect user to dashboard listings
                window.location.href = 'dashboard.html#my-listings';
            } else {
                const errorData = await res.json();
                alert(`Server error: ${errorData.message || 'Failed to submit listing.'}`);
            }

        } catch (error) {
            console.error('Error submitting car listing:', error);
            // This alert matches the error in your image, now with a check
            alert('Server error. Please check your backend connection (http://localhost:3000).');
        }
    });

    loadUserData();
});