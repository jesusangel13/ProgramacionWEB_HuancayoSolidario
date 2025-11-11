const container = document.querySelector(".container");
const btnSignIn = document.getElementById("btn-sign-in");
const btnSignUp = document.getElementById("btn-sign-up");
const btnLogin = document.getElementById("btn-login");

// Cambiar entre formularios
btnSignIn.addEventListener("click", () => container.classList.remove("toggle"));
btnSignUp.addEventListener("click", () => container.classList.add("toggle"));

// Iniciar sesión
btnLogin.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.querySelector(".sign-in input[placeholder='Email']").value;
  const password = document.querySelector(".sign-in input[placeholder='contraseña']").value;

  if (!username || !password) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ username, password }),
    });

    if (response.ok) {
      // ✅ Redirige a index.html si el login es exitoso
      window.location.href = "/";
    } else if (response.status === 401) {
      alert("Correo o contraseña incorrectos");
    } else {
      alert("Error interno del servidor");
    }
  } catch (err) {
    alert("No se pudo conectar con el servidor");
    console.error(err);
  }
});
