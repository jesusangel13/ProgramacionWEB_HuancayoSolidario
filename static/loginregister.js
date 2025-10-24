// Cambiar entre pestañas Login / Register
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const goLogin = document.getElementById('go-login');
const goRegister = document.getElementById('go-register');

function showLogin() {
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
}

function showRegister() {
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
}

loginTab.addEventListener('click', showLogin);
registerTab.addEventListener('click', showRegister);
goLogin.addEventListener('click', showLogin);
goRegister.addEventListener('click', showRegister);
