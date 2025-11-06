document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000'; 
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const carsContainer = document.getElementById('my-cars-container'); 
    
    const sellCarForm = document.getElementById('sell-car-form'); 
    const savedCarsContainer = document.getElementById('saved-cars-grid');
    const transactionsTableBody = document.getElementById('transactions-table-body');

    // 1. MANDATORY CHECK & REDIRECT 
    if (!loggedInUserId) {
        console.warn("User ID missing. Redirecting to login.");
        window.location.href = 'login.html';
        return; // Stop script execution immediately
    }

    // --- DOM Elements ---
    const welcomeHeader = document.querySelector('.header-title h1');
    const viewFullName = document.getElementById('view-fullName');
    const viewEmail = document.getElementById('view-email');
    const viewPhone = document.getElementById('view-phone');
    const editFullName = document.getElementById('edit-fullName');
    const editEmail = document.getElementById('edit-email');
    const editPhone = document.getElementById('edit-phone');
    
    const sellerNameInput = document.getElementById('seller-name');
    const sellerEmailInput = document.getElementById('seller-email');
    
    const menuLinks = document.querySelectorAll('.sidebar .menu a');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditMode = document.getElementById('profile-edit-mode');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('logout-btn');


    // --- 1. Personalized Welcome & User Data ---
    
    let currentUserName = 'User'; // Default
    
    async function loadUserData() {
        try {
            const res = await fetch(`${API_URL}/users/${loggedInUserId}`);
            if (!res.ok) throw new Error('User not found');
            
            const user = await res.json();
            
            // FIX 1: Personalized Welcome Message
            currentUserName = user.name ? user.name.split(' ')[0] : 'User';
            welcomeHeader.textContent = `Welcome, ${currentUserName}👋`;
            
            // Update dashboard views
            viewFullName.textContent = user.name || 'N/A';
            viewEmail.textContent = user.email || 'N/A';
            viewPhone.textContent = user.phone || 'Not provided'; 

            // Update profile edit mode
            editFullName.value = user.name || '';
            editEmail.value = user.email || '';
            editPhone.value = user.phone || '';
            
            // Pre-fill the sell form with user data
            if (sellerNameInput) sellerNameInput.value = user.name || '';
            if (sellerEmailInput) sellerEmailInput.value = user.email || '';

        } catch (error) {
            console.error('Error loading user data. Removing ID and redirecting:', error);
            // This is critical, only remove ID if the user fetch fails
            // localStorage.removeItem('loggedInUserId');
            // window.location.href = 'login.html';
        }
    }


    // --- 2. Listings (My Cars) Functions ---
    
    function createListingCardHTML(car, isSaved = false) {
        // Shared HTML structure for My Listings and Saved Cars
        const actions = isSaved 
            ? `<div class="listing-actions">
                  <button class="btn btn-success">Book Now</button>
                  <button class="btn btn-secondary remove-saved-btn" data-id="${car.id}">Remove</button>
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
                    <p>Price: ${car.price}</p>
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
            const res = await fetch(`${API_URL}/cars?userId=${loggedInUserId}`); // Filter on the server
            if (!res.ok) throw new Error('Failed to fetch car listings');

            const userCars = await res.json();
            
            if (userCars.length === 0) {
                 // FIX 2: Corrected link to trigger List My Car tab switch
                 carsContainer.innerHTML = '<h2>You currently have no cars listed. Go to the <a href="#" data-target="list-car" class="sidebar-link-trigger">List My Car</a> tab to add one!</h2>';
                 
                 // Add listener for the dynamically created link
                 carsContainer.querySelector('.sidebar-link-trigger').addEventListener('click', function(e) {
                     e.preventDefault();
                     const targetId = this.getAttribute('data-target');
                     // Trigger the click event on the actual sidebar link
                     document.querySelector(`.sidebar .menu a[data-target="${targetId}"]`).click();
                 });
                 return;
            }
            carsContainer.innerHTML = userCars.map(car => createListingCardHTML(car)).join('');
            
            carsContainer.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteListing);
            });

        } catch (error) {
            console.error('Error loading car listings:', error);
            carsContainer.innerHTML = '<p>❌ Server error loading listings. Please check your server connection.</p>';
        }
    }
    
    async function handleDeleteListing(event) {
        const carId = event.target.dataset.id;
        if (!confirm(`Are you sure you want to delete Car ID ${carId}?`)) return;

        try {
            const res = await fetch(`${API_URL}/cars/${carId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Listing removed successfully!');
                loadUserListings(); 
            } else {
                alert('Failed to delete listing.');
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('An error occurred while trying to remove the listing.');
        }
    }


    // --- 3. Saved Cars Function ---

    async function loadSavedCars() {
        if (!savedCarsContainer) return;
        savedCarsContainer.innerHTML = '<p>Fetching your saved cars...</p>';

        try {
            // Requires /saved-cars?userId=X endpoint in db.json
            const res = await fetch(`${API_URL}/saved-cars?userId=${loggedInUserId}`);
            if (!res.ok) throw new Error('Failed to fetch saved cars');
            
            const savedCars = await res.json();
            
            if (savedCars.length === 0) {
                savedCarsContainer.innerHTML = '<h2>You haven\'t saved any cars yet.</h2>';
                return;
            }

            savedCarsContainer.innerHTML = savedCars.map(car => createListingCardHTML(car, true)).join('');
            
        } catch (error) {
            console.error('Error loading saved cars:', error);
            savedCarsContainer.innerHTML = '<p>❌ Server error loading saved cars. Please check your server connection and db.json structure.</p>';
        }
    }
    
    // --- 4. Transactions Function ---

    function createTransactionRowHTML(transaction) {
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
            // Requires /transactions?userId=X endpoint in db.json
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
                loadSavedCars();
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

    // 🔑 Car Listing Submission Handler
    if (sellCarForm) {
        sellCarForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const carData = {
                name: document.getElementById('seller-name').value, 
                email: document.getElementById('seller-email').value,
                model: document.getElementById('car-model').value,
                image: document.getElementById('car-image-url').value,
                price: document.getElementById('car-price').value,
                userId: loggedInUserId 
            };

            if (!carData.model || !carData.image || !carData.price) {
                alert('Please fill out all car details fields.');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/cars`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData)
                });

                if (res.ok) {
                    alert('Listing submitted successfully! Check the "My Listings" tab.');
                    sellCarForm.reset(); 
                    
                    // Switch to My Listings tab dynamically
                    document.querySelector('.sidebar .menu a[data-target="my-listings"]').click();
                    
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

    // Profile Toggle Logic 
    if (editProfileBtn) editProfileBtn.addEventListener('click', () => {
        profileViewMode.classList.add('hidden');
        profileEditMode.classList.remove('hidden');
        editProfileBtn.classList.add('hidden');
    });

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => {
        profileEditMode.classList.add('hidden');
        profileViewMode.classList.remove('hidden');
        editProfileBtn.classList.remove('hidden');
    });

    // Logout Logic 
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        });
    }

    // Profile Save Logic 
    if (profileEditMode) profileEditMode.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        const newName = editFullName.value;
        const newEmail = editEmail.value;
        const newPhone = editPhone.value;
        
        const updatedUserData = {
            name: newName,
            email: newEmail,
            phone: newPhone
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
    // Initial content is always My Listings
});