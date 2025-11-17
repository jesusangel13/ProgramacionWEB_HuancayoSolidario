document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const submitBtn = registerForm.querySelector('.submit-btn');
    const successMessage = document.getElementById('successMessage');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Mostrar/ocultar contraseña
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    });

    // Validación en tiempo real
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    // Envío del formulario
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            await submitForm();
        }
    });

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'text':
                if (field.name === 'username') {
                    if (value.length < 3) {
                        isValid = false;
                        errorMessage = 'El usuario debe tener al menos 3 caracteres';
                    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Solo se permiten letras, números y guiones bajos';
                    }
                }
                break;

            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un email válido';
                }
                break;

            case 'password':
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                }
                break;
        }

        // Validación de confirmación de contraseña
        if (field.name === 'confirmPassword') {
            const password = document.getElementById('password').value;
            if (value !== password) {
                isValid = false;
                errorMessage = 'Las contraseñas no coinciden';
            }
        }

        updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }

    function updateFieldStatus(field, isValid, errorMessage) {
        const inputGroup = field.parentElement;
        
        // Remover estados anteriores
        inputGroup.classList.remove('valid', 'invalid');
        
        if (field.value.trim() !== '') {
            if (isValid) {
                inputGroup.classList.add('valid');
            } else {
                inputGroup.classList.add('invalid');
            }
        }

        // Remover mensaje de error anterior
        let existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Agregar nuevo mensaje de error
        if (!isValid && errorMessage) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.style.cssText = `
                color: #e74c3c;
                font-size: 12px;
                margin-top: 5px;
                animation: slideDown 0.3s ease;
            `;
            inputGroup.appendChild(errorElement);
        }
    }

    function validateForm() {
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        // Validar términos y condiciones
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            isValid = false;
            const checkboxGroup = termsCheckbox.parentElement;
            checkboxGroup.style.color = '#e74c3c';
            checkboxGroup.style.fontWeight = '600';
            
            // Agregar mensaje de error si no existe
            let existingError = checkboxGroup.querySelector('.error-message');
            if (!existingError) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = 'Debes aceptar los términos y condiciones';
                errorElement.style.cssText = `
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 5px;
                `;
                checkboxGroup.appendChild(errorElement);
            }
        } else {
            // Limpiar error si está marcado
            const checkboxGroup = termsCheckbox.parentElement;
            checkboxGroup.style.color = '';
            checkboxGroup.style.fontWeight = '';
            let existingError = checkboxGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        }

        return isValid;
    }

    async function submitForm() {
        const formData = new FormData(registerForm);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        console.log('📤 Enviando datos de registro:', data);

        // Mostrar loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: data.username,
                    email: data.email,
                    password: data.password
                })
            });

            console.log('📥 Respuesta recibida:', response.status, response.redirected);

            // ✅ MANEJO CORRECTO DE REDIRECCIONES
            if (response.redirected) {
                console.log('🔄 Redirección detectada, yendo a:', response.url);
                window.location.href = response.url;
                return;
            }

            if (response.ok) {
                // Si llega aquí (no debería con redirección), mostrar éxito
                console.log('✅ Registro exitoso');
                showSuccessMessage();
                registerForm.reset();
                
                // Redirigir automáticamente después de 2 segundos
                setTimeout(() => {
                    console.log('🔄 Redirigiendo a login...');
                    window.location.href = '/login';
                }, 2000);
                
            } else if (response.status === 400 || response.status === 500) {
                // Manejar errores específicos
                try {
                    const errorData = await response.json();
                    console.log('❌ Error del servidor:', errorData);
                    alert(errorData.detail || 'Error al registrar usuario');
                } catch (jsonError) {
                    // Si no puede parsear JSON, mostrar error genérico
                    console.log('❌ Error sin JSON:', response.status);
                    alert('Error al registrar usuario. Intenta nuevamente.');
                }
            } else {
                console.log('❌ Error inesperado:', response.status);
                alert('Error inesperado. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('💥 Error en el registro:', error);
            alert('Error de conexión. Verifica tu internet e intenta nuevamente.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    function showSuccessMessage() {
        console.log('🎉 Mostrando mensaje de éxito');
        successMessage.classList.add('show');
        
        // Agregar animación de confeti
        createConfetti();
    }

    function createConfetti() {
        const colors = ['#3AB397', '#3AA8AD', '#27ae60', '#3498db', '#9b59b6'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                z-index: 999;
            `;
            
            document.body.appendChild(confetti);
            
            // Remover después de la animación
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
    }

    // Agregar estilos CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .input-group.valid .input-highlight {
            background: #27ae60 !important;
        }
        
        .input-group.invalid .input-highlight {
            background: #e74c3c !important;
        }
        
        .input-group.valid input {
            border-color: #27ae60 !important;
        }
        
        .input-group.invalid input {
            border-color: #e74c3c !important;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 12px;
            margin-top: 5px;
            animation: slideDown 0.3s ease;
        }

        .submit-btn.loading {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .btn-loader {
            display: none;
        }

        .submit-btn.loading .btn-text {
            display: none;
        }

        .submit-btn.loading .btn-loader {
            display: flex;
        }

        .loader-dot {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            margin: 0 2px;
            animation: loaderBounce 1.4s ease-in-out infinite both;
        }

        .loader-dot:nth-child(1) { animation-delay: -0.32s; }
        .loader-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes loaderBounce {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ register.js cargado correctamente');
});

function redirectToLogin() {
    console.log('🔄 Redirigiendo manualmente a login');
    window.location.href = '/login';
}