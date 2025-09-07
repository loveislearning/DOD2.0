// Toggle forms
document.getElementById("show-signup").addEventListener("click", () => {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("signup-box").classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", () => {
  document.getElementById("signup-box").classList.add("hidden");
  document.getElementById("login-box").classList.remove("hidden");
});

// SIGN UP
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("✅ Account created successfully!");
  window.location.href = "index.html"; // Redirect to index.html
});

// LOGIN
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("✅ Login successful!");
  window.location.href = "index.html"; // Redirect to index.html
});
