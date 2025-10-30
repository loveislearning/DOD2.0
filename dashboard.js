document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'http://localhost:3000';
  const loggedInUserId = localStorage.getItem('loggedInUserId');


  if (!loggedInUserId) {
    window.location.href = 'login.html';
    return; 
  }

  
  const welcomeHeader = document.querySelector('.header-title h1');
  const viewFullName = document.getElementById('view-fullName');
  const viewEmail = document.getElementById('view-email');
  const viewPhone = document.getElementById('view-phone');
  const editFullName = document.getElementById('edit-fullName');
  const editEmail = document.getElementById('edit-email');
  const editPhone = document.getElementById('edit-phone');


  async function loadUserData() {
    try {
      const res = await fetch(`${API_URL}/users/${loggedInUserId}`);
      if (!res.ok) {
        throw new Error('User not found');
      }
      const user = await res.json();
      welcomeHeader.textContent = `Welcome, ${user.name.split(' ')[0]}👋`;


      viewFullName.textContent = user.name;
      viewEmail.textContent = user.email;
      viewPhone.textContent = user.phone || 'Not provided'; 

      editFullName.value = user.name;
      editEmail.value = user.email;
      editPhone.value = user.phone || '';

    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('loggedInUserId');
      window.location.href = 'login.html';
    }
  }


  const menuLinks = document.querySelectorAll('.sidebar .menu a');
  const contentSections = document.querySelectorAll('.main-content .content-section');

  menuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.dataset.target;
      
      // Check if it's the logout link (which has no target)
      if (!targetId) {
        if (this.id === 'logout-btn') {
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        }
        return;
      }
      
      menuLinks.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      contentSections.forEach(section => {
        section.id === targetId ? section.classList.add('active') : section.classList.remove('active');
      });
    });
  });
  
  // --- Profile edit toggle logic (This is your original, correct code) ---
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const profileViewMode = document.getElementById('profile-view-mode');
  const profileEditMode = document.getElementById('profile-edit-mode');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  editProfileBtn.addEventListener('click', () => {
    profileViewMode.classList.add('hidden');
    profileEditMode.classList.remove('hidden');
    editProfileBtn.classList.add('hidden');
  });

  cancelEditBtn.addEventListener('click', () => {
    profileEditMode.classList.add('hidden');
    profileViewMode.classList.remove('hidden');
    editProfileBtn.classList.remove('hidden');
  });

  // --- MODIFIED: Profile "Save" logic ---
  profileEditMode.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    
    // Get new values from the form
    const newName = editFullName.value;
    const newEmail = editEmail.value;
    const newPhone = editPhone.value;

    // TODO: Add password change logic if newPassword fields are filled
    
    const updatedUserData = {
      name: newName,
      email: newEmail,
      phone: newPhone
    };

    try {
      // Send the new data to the server
      const res = await fetch(`${API_URL}/users/${loggedInUserId}`, {
        method: 'PATCH', // PATCH only updates the fields we send
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData)
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Update the "view" mode text
      viewFullName.textContent = newName;
      viewEmail.textContent = newEmail;
      viewPhone.textContent = newPhone || 'Not provided';
      
      // Update the welcome header in case name changed
      welcomeHeader.textContent = `Welcome, ${newName.split(' ')[0]}👋`;

      // Toggle forms back
      profileEditMode.classList.add('hidden');
      profileViewMode.classList.remove('hidden');
      editProfileBtn.classList.remove('hidden');

      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('There was an error saving your changes.');
    }
  });

  // --- NEW: Call the function to load data when the page opens ---
  loadUserData();
});
async function loadCars() {
  const res = await fetch("http://localhost:3000/api/cars");
  const cars = await res.json();
  const container = document.getElementById("car-list");
  container.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.classList.add("car-card");
    card.innerHTML = `
      <h3>${car.model}</h3>
      <p><strong>Owner:</strong> ${car.name}</p>
      <p><strong>Email:</strong> ${car.email}</p>
      <p><strong>Price:</strong> ₹${car.price}</p>
      <button onclick="editCar('${car.id}')">Edit</button>
      <button onclick="deleteCar('${car.id}')">Delete</button>
    `;
    container.appendChild(card);
  });
}

async function deleteCar(id) {
  await fetch(`http://localhost:3000/api/cars/${id}`, { method: "DELETE" });
  loadCars();
}

async function editCar(id) {
  const newPrice = prompt("Enter new price:");
  if (!newPrice) return;
  await fetch(`http://localhost:3000/api/cars/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ price: newPrice })
  });
  loadCars();
}

window.onload = loadCars;
const loggedInUserId = localStorage.getItem("loggedInUserId");

async function loadUserCars() {
  if (!loggedInUserId) {
    document.getElementById("car-list").innerHTML = "<p>Please log in to see your listings.</p>";
    return;
  }

  const res = await fetch("http://localhost:3000/api/cars");
  const allCars = await res.json();
  const userCars = allCars.filter(car => car.userId === loggedInUserId);

  const listContainer = document.getElementById("car-list");
  if (userCars.length === 0) {
    listContainer.innerHTML = "<p>No cars listed yet.</p>";
  } else {
    listContainer.innerHTML = userCars
      .map(car => `
        <div class="car-card">
          <h3>${car.model}</h3>
          <p><strong>Price:</strong> ₹${car.price}</p>
          <p><strong>Owner:</strong> ${car.name}</p>
        </div>
      `)
      .join("");
  }
}

loadUserCars();

