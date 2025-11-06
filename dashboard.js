document.addEventListener('DOMContentLoaded', function() {
    // IMPORTANT: Ensure your JSON-Server is running on this URL
    const API_URL = 'http://localhost:3000'; 
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    
    // --- DOM Elements ---
    const carsContainer = document.getElementById('my-cars-container'); 
    const sellCarForm = document.getElementById('sell-car-form'); 
    const savedCarsContainer = document.getElementById('saved-cars-grid');
    const transactionsTableBody = document.getElementById('transactions-table-body');
    const welcomeHeader = document.querySelector('.header-title h1');
    const viewFullName = document.getElementById('view-fullName');
    const viewEmail = document.getElementById('view-email');
    const viewPhone = document.getElementById('view-phone');
    const sellerNameInput = document.getElementById('seller-name');
    const sellerEmailInput = document.getElementById('seller-email');
    const menuLinks = document.querySelectorAll('.sidebar .menu a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditMode = document.getElementById('profile-edit-mode');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');


    // 1. MANDATORY CHECK & REDIRECT 
    if (!loggedInUserId) {
        console.warn("User ID missing. Redirecting to login.");
        window.location.href = 'login.html';
        return; 
    }

    // --- User Data Load ---
    async function loadUserData() {
        try {
            const res = await fetch(`${API_URL}/users/${loggedInUserId}`);
            if (!res.ok) throw new Error('User not found');
            
            const user = await res.json();
            
            // Personalized Welcome Message
            const currentUserName = user.name ? user.name.split(' ')[0] : 'User';
            welcomeHeader.textContent = `Welcome, ${currentUserName}👋`;
            
            // Update profile views
            viewFullName.textContent = user.name || 'N/A';
            viewEmail.textContent = user.email || 'N/A';
            viewPhone.textContent = user.phone || 'Not provided'; 

            // Update profile edit mode (using destructured assignments for brevity)
            document.getElementById('edit-fullName').value = user.name || '';
            document.getElementById('edit-email').value = user.email || '';
            document.getElementById('edit-phone').value = user.phone || '';
            
            // Pre-fill the sell form with user data
            if (sellerNameInput) sellerNameInput.value = user.name || '';
            if (sellerEmailInput) sellerEmailInput.value = user.email || '';

        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }


    // --- 2. Listings (My Cars - SALE) Functions ---
    
    function createListingCardHTML(car, endpointType) {
        // endpointType is 'cars' for Sale (My Listings) or 'rentals' for Rent (Available Rentals)
        const isRental = endpointType === 'rentals';
        
        const priceLabel = isRental ? 'Daily Price:' : 'Sale Price:';
        const actions = isRental 
            ? `<div class="listing-actions">
                  <button class="btn btn-success">Book Now</button>
                  <button class="btn btn-secondary" data-id="${car.id}">Inquire</button>
               </div>`
            : `<div class="listing-actions">
                  <button class="btn btn-primary">Edit</button>
                  <button class="btn btn-danger delete-btn" data-id="${car.id}">Delete</button>
               </div>`;

        return `
            <div class="listing-card" data-car-id="${car.id}">
                <img src="${car.image || 'placeholder.jpg'}" alt="${car.model}">
                <div class="listing-details">
                    <h3>${car.model}</h3>
                    <p>${priceLabel} ${car.price}</p>
                    <p>Type: ${isRental ? 'RENT' : 'SALE'}</p>
                    <p>Status: <span class="status active">Active</span></p>
                </div>
                ${actions}
            </div>
        `;
    }

    async function loadUserListings() {
        if (!carsContainer) return;
        carsContainer.innerHTML = '<p>Fetching your listings...</p>';
        
        try {
            // Load SALE listings owned by the user
            const res = await fetch(`${API_URL}/cars?userId=${loggedInUserId}`); 
            if (!res.ok) throw new Error('Failed to fetch car listings');

            const userCars = await res.json();
            
            if (userCars.length === 0) {
                 carsContainer.innerHTML = '<h2>You currently have no cars listed for SALE. Go to the <a href="#" data-target="list-car" class="sidebar-link-trigger">List My Car</a> tab to add one!</h2>';
                 
                 carsContainer.querySelector('.sidebar-link-trigger').addEventListener('click', function(e) {
                     e.preventDefault();
                     const targetId = this.getAttribute('data-target');
                     document.querySelector(`.sidebar .menu a[data-target="${targetId}"]`).click();
                 });
                 return;
            }
            // Use 'cars' as the endpointType indicator
            carsContainer.innerHTML = userCars.map(car => createListingCardHTML(car, 'cars')).join('');
            
            carsContainer.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteListing);
            });

        } catch (error) {
            console.error('Error loading car listings:', error);
            carsContainer.innerHTML = '<p>❌ Server error loading SALE listings. Please check your server connection.</p>';
        }
    }
    
    async function handleDeleteListing(event) {
        const carId = event.target.dataset.id;
        if (!confirm(`Are you sure you want to delete Car ID ${carId}? This is a permanent Sale listing deletion.`)) return;

        try {
            const res = await fetch(`${API_URL}/cars/${carId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Sale Listing removed successfully!');
                loadUserListings(); 
            } else {
                alert('Failed to delete listing.');
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('An error occurred while trying to remove the listing.');
        }
    }


    // --- 3. Saved Cars (Available Rentals) Function ---

    async function loadAvailableRentals() {
        if (!savedCarsContainer) return;
        savedCarsContainer.innerHTML = '<p>Fetching available rental cars...</p>';

        try {
            // Load ALL rental listings from the new 'rentals' endpoint
            const res = await fetch(`${API_URL}/rentals`);
            if (!res.ok) throw new Error('Failed to fetch available rentals');
            
            const availableRentals = await res.json();
            
            if (availableRentals.length === 0) {
                savedCarsContainer.innerHTML = '<h2>There are currently no cars listed for rent.</h2>';
                return;
            }

            // Use 'rentals' as the endpointType indicator
            savedCarsContainer.innerHTML = availableRentals.map(car => createListingCardHTML(car, 'rentals')).join('');
            
        } catch (error) {
            console.error('Error loading available rentals:', error);
            savedCarsContainer.innerHTML = '<p>❌ Server error loading rentals. Please check your server connection and db.json structure (needs a "rentals" array).</p>';
        }
    }
    
    // --- 4. Transactions Function (Unchanged) ---
    function createTransactionRowHTML(transaction) {
        // ... (HTML logic for transactions row)
        const statusClass = transaction.status.toLowerCase().includes('completed') ? 'completed' : 
                            transaction.status.toLowerCase().includes('cancelled') ? 'cancelled' : 'active';
        return `
            <tr>
                <td>${transaction.carName || 'N/A'}</td>
                <td>${transaction.bookingDates || 'N/A'}</td>
                <td>${transaction.totalAmount || 'N/A'}</td>
                <td><span class="status ${statusClass}">${transaction.status || 'N/A'}</span></td>
            </tr>
        `;
    }

    async function loadTransactions() {
        if (!transactionsTableBody) return;
        transactionsTableBody.innerHTML = '<tr><td colspan="4">Fetching your transactions...</td></tr>';

        try {
            const res = await fetch(`${API_URL}/transactions?userId=${loggedInUserId}`);
            if (!res.ok) throw new Error('Failed to fetch transactions');
            
            const transactions = await res.json();
            
            if (transactions.length === 0) {
                transactionsTableBody.innerHTML = '<tr><td colspan="4"><h2>You have no transactions to display.</h2></td></tr>';
                return;
            }

            transactionsTableBody.innerHTML = transactions.map(createTransactionRowHTML).join('');

        } catch (error) {
            console.error('Error loading transactions:', error);
            transactionsTableBody.innerHTML = '<tr><td colspan="4">❌ Server error loading transactions. Please check your backend.</td></tr>';
        }
    }


    // --- 5. Navigation & Event Listeners ---
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-target');
            
            // Dynamic Content Loading based on tab click
            if (targetId === 'my-listings') {
                loadUserListings();
            } else if (targetId === 'saved-cars') {
                loadAvailableRentals(); // Use the new function for rentals
            } else if (targetId === 'transactions') {
                loadTransactions();
            }
            
            // UI Update Logic
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // 🔑 Car Listing Submission Handler (UPDATED LOGIC)
    if (sellCarForm) {
        sellCarForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const listingType = document.getElementById('listing-type').value; // Get new field
            const carData = {
                name: document.getElementById('seller-name').value, 
                email: document.getElementById('seller-email').value,
                model: document.getElementById('car-model').value,
                image: document.getElementById('car-image-url').value,
                price: document.getElementById('car-price').value,
                listingType: listingType, 
                userId: loggedInUserId 
            };

            if (!carData.model || !carData.image || !carData.price || !listingType) {
                alert('Please fill out all car details and select a Listing Type.');
                return;
            }

            let targetEndpoint = '';
            let successMessage = '';

            if (listingType === 'sale') {
                targetEndpoint = 'cars'; // My Listings
                successMessage = 'Car listed for SALE successfully! Check the "My Listings" tab.';
            } else if (listingType === 'rent') {
                targetEndpoint = 'rentals'; // Available Rentals
                successMessage = 'Car listed for RENT successfully! Check the "Available Rentals" tab.';
            } 

            try {
                const res = await fetch(`${API_URL}/${targetEndpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData)
                });

                if (res.ok) {
                    alert(successMessage);
                    sellCarForm.reset(); 
                    
                    // Switch to the relevant tab
                    const targetTabId = (listingType === 'sale') ? 'my-listings' : 'saved-cars';
                    document.querySelector(`.sidebar .menu a[data-target="${targetTabId}"]`).click();
                    
                } else {
                    const errorData = await res.json();
                    alert(`Server error: ${errorData.message || 'Failed to submit listing.'}`);
                }

            } catch (error) {
                console.error('Error submitting car listing:', error);
                alert('❌ Server error. Please check your backend connection.');
            }
        });
    }

    // Profile Toggle Logic (Unchanged)
    if (editProfileBtn) editProfileBtn.addEventListener('click', () => {
        profileViewMode.classList.add('hidden');
        profileEditMode.classList.remove('hidden');
        editProfileBtn.classList.add('hidden');
        // Ensure edit fields are populated (though loadUserData should cover this)
        document.getElementById('edit-fullName').value = viewFullName.textContent.trim();
        document.getElementById('edit-email').value = viewEmail.textContent.trim();
        document.getElementById('edit-phone').value = (viewPhone.textContent.trim() === 'Not provided' ? '' : viewPhone.textContent.trim());

    });

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => {
        profileEditMode.classList.add('hidden');
        profileViewMode.classList.remove('hidden');
        editProfileBtn.classList.remove('hidden');
    });

    // Logout Logic (Unchanged)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        });
    }

    // Profile Save Logic (Unchanged)
    if (profileEditMode) profileEditMode.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        const updatedUserData = {
            name: document.getElementById('edit-fullName').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value
        };

        try {
            const res = await fetch(`${API_URL}/users/${loggedInUserId}`, {
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUserData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            loadUserData(); 
            
            profileEditMode.classList.add('hidden');
            profileViewMode.classList.remove('hidden');
            editProfileBtn.classList.remove('hidden');

            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('There was an error saving your changes.');
        }
    });

    // --- INITIALIZATION ---
    loadUserData();
    loadUserListings(); 
});