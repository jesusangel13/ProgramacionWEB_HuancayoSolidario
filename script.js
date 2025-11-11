// ==============================
// SCRIPT GENERAL DE LA PÁGINA
// ==============================

// Ejemplo: animación de estadísticas
const stats = document.querySelectorAll('.stat');

stats.forEach(stat => {
  const target = +stat.getAttribute('data-target');
  let count = 0;

  const update = () => {
    if(count < target){
      count++;
      stat.textContent = count;
      setTimeout(update, 20);
    } else {
      stat.textContent = target;
    }
  }

  update();
});

// ==============================
// SCRIPT LOGIN / REGISTRO MODAL
// ==============================

// Abrir modal al hacer click en botones de login o registro
const loginModal = document.querySelector('.login-modal');
const btnOpenLogin = document.getElementById('btn-open-login'); // botón del navbar
const btnOpenRegister = document.getElementById('btn-open-register'); // botón del navbar

const container = document.querySelector(".login-modal .container");
const btnSignIn = document.getElementById("btn-sign-in");
const btnSignUp = document.getElementById("btn-sign-up");
const btnLogin = document.getElementById("btn-login");
const btnClose = document.querySelector('.close-modal');

// Abrir modal
btnOpenLogin?.addEventListener("click", () => {
  loginModal.style.display = "flex";
  container.classList.remove("toggle");
});
btnOpenRegister?.addEventListener("click", () => {
  loginModal.style.display = "flex";
  container.classList.add("toggle");
});

// Cerrar modal
btnClose?.addEventListener("click", () => {
  loginModal.style.display = "none";
});

// Cambiar entre formularios
btnSignIn?.addEventListener("click", () => container.classList.remove("toggle"));
btnSignUp?.addEventListener("click", () => container.classList.add("toggle"));

// Iniciar sesión
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.querySelector(".sign-in input[name='email']").value;
  const password = document.querySelector(".sign-in input[name='password']").value;

  if (!username || !password) {
    alert("Por favor completa todos los campos");
    return;
  }

  // Aquí puedes agregar tu fetch a backend real
  alert("Inicio de sesión exitoso 💛");
  loginModal.style.display = "none"; // Cierra modal tras login
});
