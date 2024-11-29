// Variable para almacenar los valores originales del perfil
let originalProfileData = {};

//---------------------------------------------------------------------------------------------------------------------------

// MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN |
//Inicio de sesión
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
//Cierre de sesión
document.addEventListener("DOMContentLoaded", () => {
    // Obtener el botón de cerrar sesión
    const logoutButton = document.getElementById("logout");

    // Evento al hacer clic en "Cerrar Sesión"
    logoutButton.addEventListener("click", () => {
        // Confirmación antes de cerrar sesión (opcional)
        const confirmLogout = confirm("¿Estás seguro de que quieres cerrar sesión?");
        if (confirmLogout) {
            // Eliminar datos de sesión del localStorage
            localStorage.removeItem("clienteId"); // Borra el ID del cliente
            localStorage.removeItem("otroDatoRelacionado"); // Borra otros datos si los usas

            // Redirigir a la página de inicio de sesión
            window.location.href = "login.html";
        }
    });
});

//---------------------------------------------------------------------------------------------------------------------------

// EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL | EDITAR PERFIL |
//Obtener los datos de perfil
function loadProfileData() {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) {
        console.error("Cliente ID no encontrado en localStorage.");
        return;
    }

    console.log("Obteniendo datos de perfil para clienteId:", clienteId);

    fetch(`http://localhost:3000/getProfileData?cliente_id=${clienteId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Datos de perfil recibidos:", data);

            if (data && data.cliente_id) {
                document.getElementById("nombre_compania").value = data.nombre_compania || "Nombre de la Compañía";
                document.getElementById("nombre_titular").value = data.nombre_titular || "";
                document.getElementById("telefono").value = data.telefono || "";
                document.getElementById("email").value = data.email || "";
                document.getElementById("provincia").value = data.provincia || "";
                document.getElementById("localidad").value = data.localidad || "";

                if (data.foto_perfil) {
                    document.getElementById("foto_perfil").src = data.foto_perfil;
                }
                if (data.foto_portada) {
                    document.getElementById("foto_portada").src = data.foto_portada;

                    // Almacenar datos originales para restaurar en caso de cancelar
                    originalProfileData = { ...data };
                }
            } else {
                console.error("Datos de perfil incompletos o no encontrados:", data);
            }
        })
        .catch((error) => {
            console.error("Error al obtener datos de perfil:", error);
        });
}
// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadProfileData();
    initEditProfileButtons();
});
function initEditProfileButtons() {
    const btnEditar = document.getElementById("btn-editar");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnCancelar = document.getElementById("btn-cancelar");
    const inputFields = document.querySelectorAll(".form-control");

    if (!btnEditar || !btnGuardar || !btnCancelar) {
        console.error("Uno o más botones de edición no están disponibles en el DOM");
        return;
    }

    // Habilitar edición
    function habilitarEdicion() {
        inputFields.forEach((field) => {
            field.disabled = false;
        });
        btnEditar.style.display = "none";
        btnGuardar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
    }

    // Deshabilitar edición
    function deshabilitarEdicion(guardar = false) {
        inputFields.forEach((field) => {
            if (!guardar) {
                // Restaurar valores desde originalProfileData
                const key = field.getAttribute("data-key");
                if (originalProfileData[key] !== undefined) {
                    field.value = originalProfileData[key];
                }
            }
            field.disabled = true;
        });
        btnEditar.style.display = "inline-block";
        btnGuardar.style.display = "none";
        btnCancelar.style.display = "none";
    }

    // Guardar datos
    function guardarDatos() {
        const updatedData = {};
        inputFields.forEach((field) => {
            const key = field.getAttribute("data-key");
            updatedData[key] = field.value;
            // Actualizar atributo value con el nuevo valor
            field.setAttribute("value", field.value);
        });

        // Añadir el cliente_id al objeto de datos
        const clienteId = localStorage.getItem("clienteId");
        updatedData.cliente_id = clienteId;

        // Enviar datos al servidor
        fetch("http://localhost:3000/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log("Datos actualizados correctamente");
                    deshabilitarEdicion(true);

                    // Actualizar los datos originales con los nuevos valores
                    originalProfileData = { ...updatedData };
                } else {
                    console.error("Error al actualizar datos:", data.message);
                }
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
            });
    }

    // Asignar eventos
    btnEditar.addEventListener("click", habilitarEdicion);
    btnCancelar.addEventListener("click", () => deshabilitarEdicion(false));
    btnGuardar.addEventListener("click", guardarDatos);
}

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
                    initEditProfileButtons();
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
