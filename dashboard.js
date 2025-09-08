document.addEventListener('DOMContentLoaded', function() {

  const menuLinks = document.querySelectorAll('.sidebar .menu a');
  const contentSections = document.querySelectorAll('.main-content .content-section');

  menuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.dataset.target;
      if (!targetId) {
        window.location.href = this.href;
        return;
      }
      menuLinks.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      contentSections.forEach(section => {
        section.id === targetId ? section.classList.add('active') : section.classList.remove('active');
      });
    });
  });

  const editProfileBtn = document.getElementById('edit-profile-btn');
  const profileViewMode = document.getElementById('profile-view-mode');
  const profileEditMode = document.getElementById('profile-edit-mode');
  
  const saveProfileBtn = document.getElementById('save-profile-btn');
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

  profileEditMode.addEventListener('submit', (event) => {
    event.preventDefault(); 
    
    const newName = document.getElementById('edit-fullName').value;
    const newEmail = document.getElementById('edit-email').value;
    const newPhone = document.getElementById('edit-phone').value;

    document.getElementById('view-fullName').textContent = newName;
    document.getElementById('view-email').textContent = newEmail;
    document.getElementById('view-phone').textContent = newPhone;

    profileEditMode.classList.add('hidden');
    profileViewMode.classList.remove('hidden');
    editProfileBtn.classList.remove('hidden');

    alert('Profile updated successfully!');
  });
});