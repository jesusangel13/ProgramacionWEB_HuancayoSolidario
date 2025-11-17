const container = document.querySelector(".container");
const btnSignIn = document.getElementById("btn-sign-in");
const btnSignUp = document.getElementById("btn-sign-up");

// Cambiar entre formularios
btnSignIn.addEventListener("click", () => {
    container.classList.remove("toggle");
    console.log("Cambiando a formulario de Iniciar Sesión");
});

btnSignUp.addEventListener("click", () => {
    container.classList.add("toggle");
    console.log("Cambiando a formulario de Registrarse");
});

// Manejar envío de formularios
document.addEventListener("DOMContentLoaded", function() {
    // Formulario de Login
    const loginForm = document.querySelector(".sign-in");
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const username = formData.get("username");
        const password = formData.get("password");

        console.log("Intentando login:", username);

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ username, password }),
            });

            if (response.ok) {
                console.log("✅ Login exitoso, redirigiendo...");
                window.location.href = "/";
            } else if (response.status === 401) {
                alert("Usuario o contraseña incorrectos");
            } else {
                const errorData = await response.text();
                console.error("Error del servidor:", errorData);
                alert("Error interno del servidor");
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            alert("No se pudo conectar con el servidor");
        }
    });

    // Formulario de Registro
    const registerForm = document.querySelector(".sign-up");
    registerForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");

        console.log("Intentando registro:", username, email);

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ username, email, password }),
            });

            if (response.ok) {
                alert("✅ Registro exitoso! Ahora puedes iniciar sesión");
                container.classList.remove("toggle"); // Cambiar a formulario de login
            } else if (response.status === 400) {
                alert("El usuario ya existe");
            } else {
                const errorData = await response.text();
                console.error("Error del servidor:", errorData);
                alert("Error interno del servidor");
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            alert("No se pudo conectar con el servidor");
        }
    });
});

// Debug: Verificar que los elementos existen
console.log("Elementos cargados:", {
    container: !!container,
    btnSignIn: !!btnSignIn,
    btnSignUp: !!btnSignUp,
    loginForm: !!document.querySelector(".sign-in"),
    registerForm: !!document.querySelector(".sign-up")
});