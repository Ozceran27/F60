// FUNCIÓN CARGA CONTENIDO DINÁMICAMENTE -MAIN_CONTENT-
document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("main-content");

    async function loadContent(file) {
        console.log(file);
        try {
            const response = await fetch(file);
            if (response.ok) {
                const html = await response.text();
                mainContent.innerHTML = html;
            } else {
                console.error("Error al cargar el archivo:", file);
            }
        } catch (error) {
            console.error("Error al cargar el archivo:", error);
        }
    }

    // Cargar 'Configurar Perfil'
    const configButton = document.getElementById("config-profile");
    if (configButton) {
        configButton.addEventListener("click", () => {
            loadContent("pages/configuracion_perfil.html");
        });
    } else {
        console.error("Botón Configurar Perfil no encontrado");
    }

    // Cargar contenido para los enlaces de la barra lateral
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const file = link.getAttribute("data-file");
            loadContent(file);
        });
    });
});

// MANEJO LOGIN
document.addEventListener("DOMContentLoaded", () => {
    // Verificación de almacenamiento de usuario y contraseña
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (savedUsername) {
        document.getElementById("username").value = savedUsername;
    }
    if (savedPassword) {
        document.getElementById("password").value = savedPassword;
    }

    // Manejo de Login
    const loginButton = document.getElementById("login-button");
    if (loginButton) {
        loginButton.addEventListener("click", async () => {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const rememberMe = document.getElementById("remember-me").checked;
            const messageDiv = document.getElementById("message");

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                console.log("Respuesta del servidor:", data); // Esto lo pueso sacar dps.

                if (data.success) {
                    messageDiv.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; color: green;">Iniciando Sesión
                        <span class="spinner"></span></div>
                    `;
                    if (rememberMe) {
                        localStorage.setItem("username", username);
                        localStorage.setItem("password", password);
                    }

                    // Guardar el clienteId en localStorage
                    localStorage.setItem("clienteId", data.user.cliente_id);

                    setTimeout(() => {
                        window.location.href = "inicio.html";
                    }, 2000);
                } else {
                    messageDiv.innerHTML = `<span style="color: white;">${data.message}</span>`;
                }
            } catch (error) {
                console.error("Error al hacer la solicitud:", error);
                messageDiv.innerHTML = '<span style="color: red;">Error del servidor</span>';
            }
        });
    }
});

// CARGAR DATOS DE CONFIG. DE CLIENTES
document.addEventListener("DOMContentLoaded", () => {
    const clienteId = localStorage.getItem("clienteId");

    // Función para obtener datos del perfil
    async function obtenerDatosPerfil() {
        try {
            const response = await fetch(`http://localhost:3000/getProfileData?cliente_id=${clienteId}`);
            const data = await response.json();

            // Rellenar los campos del formulario
            document.getElementById("nombre").value = data.nombre_compania || "";
            document.getElementById("cvu").value = data.cuenta_bancaria || "";
            document.getElementById("provincia").value = data.provincia_id || "";
            document.getElementById("localidad").value = data.localidad_id || "";
            document.getElementById("email").value = data.email || "";
            document.getElementById("telefono").value = data.telefono || "";
        } catch (error) {
            console.error("Error al obtener los datos del perfil:", error);
        }
    }

    // Función para activar un campo de edición
    window.activarCampo = function (campoId) {
        document.getElementById(campoId).disabled = false;
    };

    // Función para guardar los cambios
    window.guardarCambios = async function () {
        const data = {
            cliente_id: clienteId,
            nombre_compania: document.getElementById("nombre").value,
            cvu: document.getElementById("cvu").value,
            provincia_id: document.getElementById("provincia").value,
            localidad_id: document.getElementById("localidad").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value,
        };

        try {
            const response = await fetch("http://localhost:3000/updateProfile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                alert("Perfil actualizado exitosamente.");
                obtenerDatosPerfil(); // Refresca los datos para mostrar el cambio
            } else {
                alert("Error al actualizar perfil.");
            }
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
        }
    };

    obtenerDatosPerfil(); // Cargar los datos al iniciar
});
