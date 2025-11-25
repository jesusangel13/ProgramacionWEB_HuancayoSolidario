// Cargar actividades desde la API
async function loadActivities() {
    try {
        const response = await fetch("/activities");
        const activities = await response.json();

        const grid = document.querySelector("#activitiesGrid");
        grid.innerHTML = "";

        if (activities.length === 0) {
            grid.innerHTML = `<p class="no-activities">No hay actividades registradas aún. ¡Sé el primero en registrarse!</p>`;
            return;
        }

        activities.forEach(act => {
            grid.innerHTML += `
                <div class="activity-card">
                    <div class="activity-header">
                        <div class="activity-name">${act.name}</div>
                        <div class="activity-role">${act.role}</div>
                    </div>
                    <div class="activity-description">${act.activity}</div>
                    <button class="delete-btn" onclick="deleteActivity(${act.id})">Eliminar</button>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error cargando actividades:", error);
    }
}

// Eliminar actividad usando API
async function deleteActivity(id) {
    if (confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
        try {
            const response = await fetch(`/activities/${id}`, { method: "DELETE" });
            if (response.ok) {
                loadActivities();
            } else {
                alert("No se pudo eliminar la actividad");
            }
        } catch (error) {
            console.error("Error eliminando actividad:", error);
        }
    }
}

// Animación de contadores
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const increment = target / 200;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.ceil(current).toLocaleString();
                setTimeout(updateCounter, 10);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

// NAVBAR DINÁMICO - Función para actualizar según el estado de login
function updateNavbar() {
    const guestMenu = document.getElementById('guestMenu');
    const userMenu = document.getElementById('userMenu');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    // Verificar si hay una cookie de usuario
    const cookies = document.cookie.split(';');
    let username = null;
    
    cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'username') {
            username = decodeURIComponent(value);
        }
    });
    
    console.log('Usuario detectado:', username);
    
    if (username) {
        // Usuario logueado - mostrar menú de usuario
        guestMenu.style.display = 'none';
        userMenu.style.display = 'flex';
        usernameDisplay.textContent = username;
    } else {
        // Usuario NO logueado - mostrar menú de invitado
        guestMenu.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// Configurar logout con confirmación
function setupLogout() {
    const logoutLinks = document.querySelectorAll('.logout-btn');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.location.href = '/logout';
            }
        });
    });
}

// Formulario de registro de voluntariado
function setupVolunteerForm() {
    const volunteerForm = document.getElementById('volunteerForm');
    if (!volunteerForm) return;

    volunteerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-volunteer-btn');
        const formData = new FormData(this);
        
        // Mostrar loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/register_activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    name: formData.get('name'),
                    role: formData.get('role'),
                    activity: formData.get('activity')
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Actividad registrada:', result);
                
                showVolunteerSuccess();
                volunteerForm.reset();
                await loadActivities();
            } else {
                const errorData = await response.json();
                alert(errorData.detail || 'Error al registrar el voluntariado.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Intenta nuevamente.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

function showVolunteerSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message show';
    successMsg.innerHTML = `
        <h3>¡Registro Exitoso! 🎉</h3>
        <p>Tu voluntariado ha sido registrado correctamente.</p>
    `;
    
    const form = document.getElementById('volunteerForm');
    form.parentNode.insertBefore(successMsg, form.nextSibling);
    
    setTimeout(() => {
        successMsg.remove();
    }, 5000);
}

// INICIALIZACIÓN COMPLETA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Huancayo Solidario...');
    
    // Cargar y configurar todo
    loadActivities();
    updateNavbar();
    setupLogout();
    setupVolunteerForm();
    
    // Configurar observador para contadores
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    });
    
    const metricsSection = document.querySelector('.metrics');
    if (metricsSection) {
        observer.observe(metricsSection);
    }
    
    // Actualizar navbar periódicamente (por si cambian las cookies)
    setInterval(updateNavbar, 2000);
});

// Agregar estilos para "no activities"
const style = document.createElement('style');
style.textContent = `
    .no-activities {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {

    const boton = document.getElementById("arteCulturaBtn");

    boton.addEventListener("click", () => {

        if (document.getElementById("modal-arte")) {
            document.getElementById("modal-arte").remove();
            return;
        }

        const modal = document.createElement("div");
        modal.id = "modal-arte";
        modal.className = "modal-arte";

        modal.innerHTML = `
            <div class="modal-box">

                <!-- Modelo PNG principal -->
                <img src="/images/model.png" class="modelo-centro">

                <!-- Carrusel 3D -->
                <div class="carrusel-3d-container">
                    <div class="carrusel-3d" style="--quantity: 10">
                        ${[1,2,3,4,5,6,7,8,9,10].map(i => `
                            <div class="item-carrusel" style="--position:${i}">
                                <img src="/images/dragon_${i}.jpg" class="imagen-carrusel">
                            </div>
                        `).join("")}
                    </div>
                </div>

                <!-- Textos -->
                <div class="contenido-texto">
                    <h1 class="titulo-principal">未来</h1>
                    <h2>LUN DEV</h2>
                    <p><b>Diseño web</b></p>
                    <p>Suscríbete al canal para ver muchos videos interesantes.</p>
                    <button class="btn-registro-3d">Registrarme en esta área</button>
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener("click", (e) => {
            if (e.target.id === "modal-arte") modal.remove();
        });
    });

});
