// Variable para almacenar los valores originales del perfil
let originalProfileData = {};
let canchaAEliminarId = null;

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

// FUNCIONES GENERALES | FUNCIONES GENERALES | FUNCIONES GENERALES | FUNCIONES GENERALES | FUNCIONES GENERALES | FUNCIONES GENERALES |
// Obtener Provincias
function loadProvincias(selectedProvinciaId) {
    fetch("http://localhost:3000/getProvincias")
        .then((response) => response.json())
        .then((provincias) => {
            const provinciaSelect = document.getElementById("provincia");
            provinciaSelect.innerHTML = ""; // Limpiar opciones anteriores

            provincias.forEach((provincia) => {
                const option = document.createElement("option");
                option.value = provincia.id;
                option.textContent = provincia.nombre;
                if (provincia.id === selectedProvinciaId) {
                    option.selected = true;
                }
                provinciaSelect.appendChild(option);
            });
        })
        .catch((error) => console.error("Error al cargar provincias:", error));
}
// Obtener Localidades
function loadLocalidades(provinciaId, selectedLocalidadId) {
    fetch(`http://localhost:3000/getLocalidades?provincia_id=${provinciaId}`)
        .then((response) => response.json())
        .then((localidades) => {
            const localidadSelect = document.getElementById("localidad");
            localidadSelect.innerHTML = ""; // Limpiar opciones anteriores

            localidades.forEach((localidad) => {
                const option = document.createElement("option");
                option.value = localidad.id;
                option.textContent = localidad.nombre;

                // Compara ambos valores como números
                if (parseInt(localidad.id) === parseInt(selectedLocalidadId)) {
                    option.selected = true;
                }

                localidadSelect.appendChild(option);
            });
        })
        .catch((error) => console.error("Error al cargar localidades:", error));
}
// Obtener los datos de perfil
function loadProfileData() {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) {
        console.error("Cliente ID no encontrado en localStorage.");
        return;
    }
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
                document.getElementById("nombre_compania").textContent = data.nombre_compania || "";
                document.getElementById("nombre_titular").value = data.nombre_titular || "";
                document.getElementById("telefono").value = data.telefono || "";
                document.getElementById("email").value = data.email || "";
                // Cargar provincias y seleccionar la del cliente
                loadProvincias(data.provincia_id);
                if (data.localidad_id) {
                    loadLocalidades(data.provincia_id, parseInt(data.localidad_id));
                }
                if (data.foto_perfil) {
                    document.getElementById("foto_perfil").src = data.foto_perfil;
                }
                if (data.foto_portada) {
                    document.getElementById("foto_portada").src = data.foto_portada;
                    // Almacenar datos originales para restaurar en caso de cancelar
                    originalProfileData = { ...data };
                }
                // Habilitar localidad si hay una provincia seleccionada
                if (selectedProvinciaId) {
                    loadLocalidades(selectedProvinciaId, null);
                }
            } else {
                console.error("Datos de perfil incompletos o no encontrados:", data);
            }
        })
        .catch((error) => {
            console.error("Error al obtener datos de perfil:", error);
        });
}
// Manejo de botones en perfil
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
        // Carga de Provincias y Localidades
        document.getElementById("provincia").addEventListener("change", (event) => {
            const provinciaId = event.target.value;
            loadLocalidades(provinciaId, null);
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
        const updatedData = {
            nombre_titular: document.getElementById("nombre_titular").value,
            telefono: document.getElementById("telefono").value,
            email: document.getElementById("email").value,
            provincia_id: document.getElementById("provincia").value,
            localidad_id: document.getElementById("localidad").value,
        };

        const clienteId = localStorage.getItem("clienteId");
        updatedData.cliente_id = clienteId;

        fetch("http://localhost:3000/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log("Datos actualizados correctamente");
                } else {
                    console.error("Error al actualizar datos:", data.message);
                }
            })
            .catch((error) => console.error("Error al guardar datos:", error));
        btnEditar.style.display = "inline-block";
        btnGuardar.style.display = "none";
        btnCancelar.style.display = "none";
    }
    // Asignar eventos
    btnEditar.addEventListener("click", habilitarEdicion);
    btnCancelar.addEventListener("click", () => deshabilitarEdicion(false));
    btnGuardar.addEventListener("click", guardarDatos);
}

// CRUD - CANCHAS |
// Cargar canchas
function getCanchas() {
    const canchaContainer = document.getElementById("cancha-container");
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) {
        console.error("Cliente ID no encontrado en localStorage.");
        return;
    }
    if (canchaContainer) {
        canchaContainer.innerHTML = "<p>Cargando canchas...</p>";
        fetch(`http://localhost:3000/ObtenerCanchas?cliente_id=${clienteId}`)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                return response.json();
            })
            .then((canchas) => {
                canchaContainer.innerHTML = ""; // Limpiar contenedor

                if (!canchas || canchas.length === 0) {
                    canchaContainer.innerHTML = "<p>No se encontraron canchas.</p>";
                    return;
                }
                // Renderizar cada cancha
                canchas.forEach((cancha) => {
                    const card = document.createElement("div");
                    card.className = "d-flex col justify-content-center";
                    card.innerHTML = `
                        <div class="card">
                            <div class="card-header bg-dark text-white">
                                <h3> ${cancha.nombre} </h3>
                                <p> (${cancha.tipo_cancha}) </p>
                            </div>
                            <div class="card-body">
                                <p><strong>Capacidad:</strong> ${cancha.capacidad}</p>
                                <p><strong>Precio:</strong> $${cancha.precio}</p>
                                <p><strong>Techada:</strong> ${cancha.techada ? "Sí" : "No"}</p>
                                <p><strong>Estado:</strong> ${cancha.estado_campo}</p>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                            <button id="btn-eliminar-cancha" data-cancha-id="${
                                cancha.cancha_id
                            }" class="btn btn-danger btn-sm">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                            <button id="btn-editar-cancha" data-cancha-id="${
                                cancha.cancha_id
                            }" class="btn btn-success btn-sm">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            </div>
                        </div>
                    `;
                    canchaContainer.appendChild(card);
                });
                // Agregar eventos a los botones de eliminar
                agregarEventosEliminar();
            })
            .catch((err) => {
                console.error("Error al cargar las canchas:", err.message);
                canchaContainer.innerHTML =
                    "<p>Ocurrió un error al cargar las canchas. Intente nuevamente más tarde.</p>";
            });
    } else {
        console.error("Contenedor de canchas no encontrado en el DOM.");
    }
}
// Crear canchas
function createCanchas() {
    const btnNuevaCancha = document.getElementById("btn-nueva-cancha");
    const crearCanchaModal = new bootstrap.Modal(document.getElementById("crearCanchaModal"));
    const crearCanchaForm = document.getElementById("crearCanchaForm");
    const camposFormulario = crearCanchaForm.querySelectorAll("input, select, textarea");

    if (btnNuevaCancha && crearCanchaForm) {
        // Mostrar el modal y resetear campos
        btnNuevaCancha.addEventListener("click", () => {
            crearCanchaForm.reset();
            camposFormulario.forEach((campo) => {
                campo.disabled = false;
            });
            document.activeElement.blur();
            crearCanchaModal.show();
        });
        // Manejo del envío del formulario
        crearCanchaForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const clienteId = localStorage.getItem("clienteId");
            if (!clienteId) {
                alert("Error: Cliente no identificado.");
                return;
            }
            const nuevaCancha = {
                cliente_id: clienteId,
                nombre: document.getElementById("nombreCancha").value,
                tipo_cancha: document.getElementById("tipoCancha").value,
                capacidad: document.getElementById("capacidadCancha").value,
                precio: document.getElementById("precioCancha").value,
                techada: document.getElementById("techadaCancha").value === "true",
                estado_campo: document.getElementById("estadoCampo").value,
            };
            fetch("http://localhost:3000/createCanchas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaCancha),
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Error al crear la cancha.");
                    return response.json();
                })
                .then((data) => {
                    if (data.success) {
                        crearCanchaModal.hide();
                        getCanchas();
                    } else {
                        alert("Error: No se pudo crear la cancha.");
                    }
                })
                .catch((err) => console.error("Error al crear la cancha:", err));
        });
    }
}
// Eliminar cancha
function eliminarCancha() {
    fetch(`http://localhost:3000/deleteCancha/${canchaAEliminarId}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) throw new Error("Error al eliminar la cancha.");
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById("modalConfirmacion"));
                modal.hide();
                alert("Cancha eliminada con éxito.");
                getCanchas();
            } else {
                alert("Error: No se pudo eliminar la cancha.");
            }
        })
        .catch((err) => console.error("Error al eliminar la cancha:", err));
}
// Agregar eventos a los botones de eliminar
function agregarEventosEliminar() {
    const botonesEliminar = document.querySelectorAll("#btn-eliminar-cancha");
    const modalConfirmacion = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
    const btnConfirmarEliminacion = document.getElementById("btnConfirmarEliminacion");

    botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", () => {
            // Obtener el ID de la cancha a eliminar
            canchaAEliminarId = boton.dataset.canchaId;
            // Mostrar el modal de confirmación
            modalConfirmacion.show();
        });
    });
    // Evento para el botón "Cancelar" en el modal
    document.querySelector("#modalConfirmacion .btn-secondary").addEventListener("click", () => {
        // Cerrar el modal
        modalConfirmacion.hide();
    });
    // Evento para el botón "Confirmar" en el modal
    btnConfirmarEliminacion.addEventListener("click", () => {
        if (canchaAEliminarId) {
            eliminarCancha(canchaAEliminarId);
        }
        modalConfirmacion.hide();
        getCanchas();
    });
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
                if (file.includes("mis_canchas.html")) {
                    getCanchas();
                    createCanchas();
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

// DARK/LIGHT MODE | DARK/LIGHT MODE | DARK/LIGHT MODE | DARK/LIGHT MODE | DARK/LIGHT MODE | DARK/LIGHT MODE | DARK/LIGHT MODE |
document.addEventListener("DOMContentLoaded", () => {
    const switchElement = document.getElementById("darkModeSwitch");
    const bodyElement = document.body;
    const headerElement = document.querySelector("header");
    const navElement = document.querySelector("nav");
    const mainContentElement = document.getElementById("main-content");
    const buttons = document.querySelectorAll("button");

    // Función para alternar los temas
    const toggleTheme = () => {
        if (switchElement.checked) {
            // Activar modo claro
            bodyElement.classList.remove("dark-mode");
            bodyElement.classList.add("light-mode");

            headerElement.classList.add("light-mode");
            navElement.classList.add("light-mode");
            mainContentElement.classList.add("light-mode");
            buttons.forEach((button) => button.classList.add("light-mode"));

            localStorage.setItem("theme", "light");
        } else {
            // Activar modo oscuro
            bodyElement.classList.remove("light-mode");
            bodyElement.classList.add("dark-mode");

            headerElement.classList.remove("light-mode");
            navElement.classList.remove("light-mode");
            mainContentElement.classList.remove("light-mode");
            buttons.forEach((button) => button.classList.remove("light-mode"));

            localStorage.setItem("theme", "dark");
        }
    };

    // Escuchar cambios en el switch
    switchElement.addEventListener("change", toggleTheme);

    // Configurar el tema inicial según localStorage
    // Configurar el tema inicial según localStorage
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        switchElement.checked = true;
        bodyElement.classList.add("light-mode");

        headerElement.classList.add("light-mode");
        navElement.classList.add("light-mode");
        mainContentElement.classList.add("light-mode");
        buttons.forEach((button) => button.classList.add("light-mode"));
    } else {
        // Predeterminado: modo oscuro si no hay tema almacenado
        switchElement.checked = false;
        bodyElement.classList.add("dark-mode");

        headerElement.classList.remove("light-mode");
        navElement.classList.remove("light-mode");
        mainContentElement.classList.remove("light-mode");
        buttons.forEach((button) => button.classList.remove("light-mode"));

        localStorage.setItem("theme", "dark"); // Guardar por defecto
    }
});
