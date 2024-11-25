//----------------------------------------------------------------------------------------------------------------------------

// CARGA CONTENIDO DINÁMICO | CARGA CONTENIDO DINÁMICO | CARGA CONTENIDO DINÁMICO | CARGA CONTENIDO DINÁMICO |
document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("main-content");

    async function loadContent(file) {
        console.log(file);
        try {
            const response = await fetch(file);
            if (response.ok) {
                const html = await response.text();
                mainContent.innerHTML = html;

                if (file.includes("configuracion_perfil.html")) {
                    loadProfileData();
                }
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

    // Fetch a los datos de Perfil
    async function loadProfileData() {
        const clienteId = localStorage.getItem("clienteId");

        if (clienteId) {
            console.log("ClienteId tomado");
            try {
                const response = await fetch(`http://localhost:3000/getProfileData?cliente_id=${clienteId}`);
                const data = await response.json();
                console.log("Fetch realizado");

                // Rellenar los datos en los campos
                document.getElementById("nombre_compania").textContent = data.nombre_compania || "";
                document.getElementById("nombre_titular").textContent = data.nombre_titular || "";
                document.getElementById("telefono").textContent = data.telefono || "";
                document.getElementById("email").textContent = data.email || "";
                document.getElementById("provincia").textContent = data.provincia || "";
                document.getElementById("localidad").textContent = data.localidad || "";
                document.getElementById("foto_perfil").src = data.foto_perfil || "../assets/default_profile.jpg";
                document.getElementById("foto_portada").src = data.foto_portada || "../assets/default_cover.jpg";
                console.log("Datos de perfil cargados correctamente");
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
            }
        }
    }

    // Cargar contenido para los enlaces de la barra lateral
    document.querySelectorAll(".list-group-item").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const file = link.getAttribute("data-file");
            loadContent(file);
        });
    });
});

//---------------------------------------------------------------------------------------------------------------------------

// MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN |
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
