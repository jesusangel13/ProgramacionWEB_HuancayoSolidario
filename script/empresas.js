// ======================================================
// SessionManager – Manejo REAL de sesión usando localStorage
// ======================================================

class SessionManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkSession();
        this.setupEventListeners();
    }

    // ========================= Sesión =========================

    checkSession() {
        const userData = localStorage.getItem('currentUser');

        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showUserMenu();
        } else {
            this.showGuestMenu();
        }
    }

    showUserMenu() {
        const guestMenu = document.getElementById("guestMenu");
        const userMenu = document.getElementById("userMenu");
        const usernameDisplay = document.getElementById("usernameDisplay");

        if (guestMenu) guestMenu.style.display = "none";
        if (userMenu) userMenu.style.display = "inline-flex";
        if (usernameDisplay) usernameDisplay.textContent = this.currentUser.username;
    }

    showGuestMenu() {
        const guestMenu = document.getElementById("guestMenu");
        const userMenu = document.getElementById("userMenu");

        if (guestMenu) guestMenu.style.display = "inline-flex";
        if (userMenu) userMenu.style.display = "none";
    }

    async login(username, password) {
        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

            const userData = await res.json();

            // Guardamos usuario real
            localStorage.setItem("currentUser", JSON.stringify(userData));
            this.currentUser = userData;
            this.showUserMenu();
            this.showNotification("Sesión iniciada correctamente", "success");

        } catch (err) {
            this.showNotification(err.message, "error");
        }
    }

    logout() {
        localStorage.removeItem("currentUser");
        this.currentUser = null;

        this.showGuestMenu();
        this.showNotification("Sesión cerrada", "info");

        window.location.href = "/empresas"; // opcional
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ======================= Eventos =======================

    setupEventListeners() {
        document.addEventListener("click", (e) => {
            if (e.target.closest(".logout-btn")) {
                e.preventDefault();
                this.logout();
            }
        });

        const btnPersonas = document.getElementById("btn-personas");
        if (btnPersonas) {
            btnPersonas.addEventListener("click", () => {
                window.location.href = "/personas";
            });
        }

        // Formulario de login
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const username = loginForm.querySelector("#loginUsername").value;
                const password = loginForm.querySelector("#loginPassword").value;
                await this.login(username, password);
            });
        }
    }

    // ======================= Notificaciones =======================

    showNotification(message, type = "info") {
        const n = document.createElement("div");
        n.className = `notification ${type}`;
        n.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        n.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === "success" ? "#4CAF50" : type === "error" ? "#D32F2F" : "#2196F3"};
            padding: 14px 18px;
            border-radius: 6px;
            color: white;
            font-size: 15px;
            z-index: 9999;
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        document.body.appendChild(n);

        n.querySelector(".notification-close").onclick = () => n.remove();

        setTimeout(() => n.remove(), 4000);
    }
}

// Activar SessionManager
document.addEventListener("DOMContentLoaded", () => {
    window.sessionManager = new SessionManager();
});

// ======================================================
// BASE DE DATOS DE EMPRESAS (simulación, luego va con FastAPI)
// ======================================================

const EMPRESAS = {
    1: { nombre: "Empresa Alpha", descripcion: "Empresa dedicada a desarrollo de software.", logo: "/static/images/empresa1.png" },
    2: { nombre: "Panadería Delicia", descripcion: "Panadería artesanal con tradición.", logo: "/static/images/panaderia.png" },
    3: { nombre: "TecnoWorld", descripcion: "Tienda de electrónicos premium.", logo: "/static/images/tecno.png" },
    4: { nombre: "Agmer Corporation", descripcion: "Soluciones empresariales avanzadas.", logo: "/static/images/agmer.png" },
    5: { nombre: "NovaPrint", descripcion: "Servicios de impresión digital y offset.", logo: "/static/images/empresa5.png" },
    6: { nombre: "EcoGreen", descripcion: "Productos ecológicos y biodegradables.", logo: "/static/images/empresa6.png" },
    7: { nombre: "MegaStore", descripcion: "Super tienda de productos variados.", logo: "/static/images/empresa7.png" },
    8: { nombre: "FoodExpress", descripcion: "Servicio de delivery rápido y confiable.", logo: "/static/images/empresa8.png" },
    9: { nombre: "CyberNet", descripcion: "Proveedor de internet y servicios de red.", logo: "/static/images/empresa9.png" },
    10: { nombre: "GoldGym", descripcion: "Centro de entrenamiento premium.", logo: "/static/images/empresa10.png" }
};

// ======================================================
// MANEJO DEL MODAL
// ======================================================

const modal = document.getElementById("modalEmpresa");
const modalLogo = document.getElementById("empresaLogo");
const modalNombre = document.getElementById("empresaNombre");
const modalDescripcion = document.getElementById("empresaDescripcion");
const btnCerrar = document.querySelector(".close-modal");

// Abrir modal haciendo clic en una empresa del slider
document.querySelectorAll(".slider .item").forEach(item => {
    item.addEventListener("click", () => {
        const id = item.dataset.id;

        if (EMPRESAS[id]) {
            modalLogo.src = EMPRESAS[id].logo;
            modalNombre.textContent = EMPRESAS[id].nombre;
            modalDescripcion.textContent = EMPRESAS[id].descripcion;

            modal.classList.remove("hidden");
        }
    });
});

// Cerrar modal
btnCerrar.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Cerrar tocando fuera del cuadro
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});
