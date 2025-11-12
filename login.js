let currentUserId = null; 
const API_URL = 'http://localhost:3000'; 

// [ ... All the unchanged variable declarations ... ]
const GOOGLE_CLIENT_ID = '418403210125-a7h5rooiau9tmuggc25o71ser63aioj7.apps.googleusercontent.com';
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const backToLoginBtn = document.getElementById('back-to-login');

const loginFormContainer = document.getElementById('login-form-container');
const signupFormContainer = document.getElementById('signup-form-container');
const detailsFormContainer = document.getElementById('details-form-container');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const detailsForm = document.getElementById('details-form');

const successModal = document.getElementById('success-modal');
const successMessageTitle = document.getElementById('success-message-title');
const successMessageText = document.getElementById('success-message-text');
const proceedBtn = document.getElementById('proceed-btn');

function switchForms(hideForm, showForm) {
    hideForm.classList.remove('show');
    hideForm.classList.add('hide');

    setTimeout(() => {
        showForm.classList.remove('hide');
        showForm.classList.add('show');
    }, 300);
}

showSignupBtn.addEventListener('click', (e) => { e.preventDefault(); switchForms(loginFormContainer, signupFormContainer); });
showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); switchForms(signupFormContainer, loginFormContainer); });
backToLoginBtn.addEventListener('click', (e) => { e.preventDefault(); switchForms(detailsFormContainer, loginFormContainer); });

function setupPasswordToggle(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);
    const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.12 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>`;
    const eyeSlashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.94 5.94 0 0 1 8 5.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.288.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 6.884-12-12 .708-.708 12 12-.708.708z"/></svg>`;
    toggleIcon.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.innerHTML = eyeSlashIcon;
        } else {
            passwordInput.type = 'password';
            toggleIcon.innerHTML = eyeIcon;
        }
    });
}
setupPasswordToggle('login-password', 'toggle-login-password');
setupPasswordToggle('signup-password', 'toggle-signup-password');
setupPasswordToggle('signup-confirm-password', 'toggle-confirm-password');

function validateInput(input, errorElement, validationFn) {
    const isValid = validationFn(input.value);
    if (isValid) {
        input.classList.remove('invalid');
        errorElement.style.display = 'none';
    } else {
        input.classList.add('invalid');
        errorElement.style.display = 'block';
    }
    return isValid;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginEmail = document.getElementById('login-email');
const loginEmailError = document.getElementById('login-email-error');
const signupEmail = document.getElementById('signup-email');
const signupEmailError = document.getElementById('signup-email-error');
const signupPassword = document.getElementById('signup-password');
const signupPasswordError = document.getElementById('signup-password-error');
const confirmPassword = document.getElementById('signup-confirm-password');
const confirmPasswordError = document.getElementById('confirm-password-error');

loginEmail.addEventListener('input', () => validateInput(loginEmail, loginEmailError, val => emailRegex.test(val)));
signupEmail.addEventListener('input', () => validateInput(signupEmail, signupEmailError, val => emailRegex.test(val)));
signupPassword.addEventListener('input', () => validateInput(signupPassword, signupPasswordError, val => val.length >= 8));
confirmPassword.addEventListener('input', () => validateInput(confirmPassword, confirmPasswordError, val => val === signupPassword.value));

const strengthMeter = document.getElementById('strength-meter');
const strengthText = document.getElementById('strength-text');
const strengthBars = strengthMeter.querySelectorAll('.strength-bar');

signupPassword.addEventListener('input', () => {
    const pass = signupPassword.value;
    let score = 0;
    if (!pass) {
        strengthMeter.className = 'strength-meter';
        strengthText.textContent = '';
        strengthBars.forEach(bar => bar.classList.remove('active'));
        return;
    }

    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    strengthBars.forEach(bar => bar.classList.remove('active'));

    strengthMeter.className = 'strength-meter';
    if (score > 0) {
        for (let i = 0; i < score; i++) {
            strengthBars[i].classList.add('active');
        }
    }

    switch (score) {
        case 1:
            strengthMeter.classList.add('weak');
            strengthText.textContent = 'Weak';
            break;
        case 2:
            strengthMeter.classList.add('medium');
            strengthText.textContent = 'Medium';
            break;
        case 3:
            strengthMeter.classList.add('strong');
            strengthText.textContent = 'Strong';
            break;
        case 4:
            strengthMeter.classList.add('very-strong');
            strengthText.textContent = 'Very Strong';
            break;
        default:
            strengthText.textContent = '';
    }
});

function showSuccessModal(title, text) {
    successMessageTitle.textContent = title;
    successMessageText.textContent = text;
    successModal.classList.remove('hide');
    successModal.classList.add('show');
}

// FIX: Remove the manual redirect listener, we will redirect directly in the form handlers.
// proceedBtn.addEventListener('click', () => {
//     window.location.href = './dashboard.html';
// });


async function handleFormSubmit(e, form, validations) {
    e.preventDefault();
    let isFormValid = true;
    for (const validation of validations) {
        const isValid = validateInput(validation.input, validation.errorElement, validation.validationFn);
        if (!isValid) isFormValid = false;
    }

    const genericLoginError = document.getElementById('login-generic-error');
    if (genericLoginError) genericLoginError.style.display = 'none';

    if (isFormValid) {
        const button = form.querySelector('.submit-btn');
        const spinner = button.querySelector('.spinner');
        spinner.style.display = 'block';
        button.disabled = true;

        try {
            if (form.id === 'login-form') {
                // --- 🔑 LOGIN LOGIC ---
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                // 1. Fetch all users
                const res = await fetch(`${API_URL}/users`);
                const allUsers = await res.json();
                
                // 2. Filter client-side
                const user = allUsers.find(
                    u => u.email === email && u.password === password
                );

                if (user) {
                    // --- 🔥 CRUCIAL FIX for the loop: Save ID and REDIRECT immediately ---
                    localStorage.setItem('loggedInUserId', user.id); 
                    
                    // You can still show the modal briefly if you want, but the redirect is key.
                    // For a smooth experience, we just redirect.
                    window.location.href = './dashboard.html'; 

                } else {
                    if (genericLoginError) genericLoginError.style.display = 'block';
                }

            } else if (form.id === 'signup-form') {
                // --- SIGNUP LOGIC ---
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;

                const checkRes = await fetch(`${API_URL}/users?email=${email}`);
                const existingUsers = await checkRes.json();

                if (existingUsers.length > 0) {
                    const signupEmailError = document.getElementById('signup-email-error');
                    signupEmailError.textContent = "This email is already registered.";
                    signupEmailError.style.display = 'block';
                    document.getElementById('signup-email').classList.add('invalid');
                } else {
                    const newUser = { name, email, password };
                    
                    // Post the new user
                    const res = await fetch(`${API_URL}/users`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser)
                    });

                    const createdUser = await res.json();
                    currentUserId = createdUser.id; // Store the new user's ID globally

                    switchForms(signupFormContainer, detailsFormContainer);
                }

            } else if (form.id === 'details-form') {
                // --- DETAILS LOGIC ---
                if (currentUserId) { 
                    const phone = document.getElementById('phone').value;
                    const address = document.getElementById('address').value;
                    const dob = document.getElementById('dob').value;

                    const profileDetails = { phone, address, dob };

                    await fetch(`${API_URL}/users/${currentUserId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profileDetails)
                    });
                    
                    // --- 🔥 CRUCIAL FIX for the loop: Log in the new user and REDIRECT ---
                    localStorage.setItem('loggedInUserId', currentUserId);

                    // Redirect immediately after successful signup/details to prevent the loop
                    window.location.href = './dashboard.html'; 

                    currentUserId = null; // Clear temporary ID

                } else {
                    console.error("No user ID to update details for.");
                    switchForms(detailsFormContainer, loginFormContainer);
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
            if (genericLoginError) {
                genericLoginError.textContent = "Cannot connect to server. Is it running?";
                genericLoginError.style.display = 'block';
            }
        }

        spinner.style.display = 'none';
        button.disabled = false;
    }
}

loginForm.addEventListener('submit', (e) => {
    const loginPassword = document.getElementById('login-password');
    const loginPasswordError = document.getElementById('login-password-error');
    const validations = [
        { input: loginEmail, errorElement: loginEmailError, validationFn: val => emailRegex.test(val) },
        { input: loginPassword, errorElement: loginPasswordError, validationFn: val => val.length > 0 }
    ];
    handleFormSubmit(e, loginForm, validations);
});

signupForm.addEventListener('submit', (e) => {
    const validations = [
        { input: signupEmail, errorElement: signupEmailError, validationFn: val => emailRegex.test(val) },
        { input: signupPassword, errorElement: signupPasswordError, validationFn: val => val.length >= 8 },
        { input: confirmPassword, errorElement: confirmPasswordError, validationFn: val => val === signupPassword.value }
    ];
    handleFormSubmit(e, signupForm, validations);
});

detailsForm.addEventListener('submit', (e) => { 
    // We pass an empty array for validations for the details form
    handleFormSubmit(e, detailsForm, []); 
});