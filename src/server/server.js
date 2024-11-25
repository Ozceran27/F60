const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("../db/database"); // Importa la conexión desde database.js
const app = express();
const port = 3000;

app.use(bodyParser.json());

//----------------------------------------------------------------------------------------------------------------------------

// MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN | MANEJO DEL LOGIN |
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Buscar el usuario en la base de datos
    db.query("SELECT * FROM clientes WHERE username = ?", [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        if (results.length > 0) {
            const user = results[0];

            // Comparar la contraseña ingresada con la cifrada en la base de datos
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Error al comparar contraseñas" });
                }

                if (isMatch) {
                    return res.json({ success: true, user });
                } else {
                    return res.json({ success: false, message: "Contraseña incorrecta" });
                }
            });
        } else {
            return res.json({ success: false, message: "Usuario no encontrado" });
        }
    });
});

//----------------------------------------------------------------------------------------------------------------------------

// RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | ENDPOINTS
// Ruta para obtener el nombre de la compañía
app.get("/getCompanyName", (req, res) => {
    const clienteId = req.query.cliente_id;

    const query = `
        SELECT CLIENTES.nombre_compania 
        FROM CLIENTES
        WHERE CLIENTES.cliente_id = ?
    `;

    db.query(query, [clienteId], (err, results) => {
        if (err) {
            console.error("Error al obtener datos del perfil:", err);
            return res.status(500).json({ success: false, message: "Error del servidor" });
        }
        res.json(results[0] || {});
    });
});
// Ruta para Obtener datos del perfil del cliente
app.get("/getProfileData", (req, res) => {
    const clienteId = req.query.cliente_id;

    const query = `
    SELECT 
        CLIENTES.cliente_id AS cliente_id, 
        CLIENTES.nombre_compania AS nombre_compania, 
        CLIENTES.nombre_titular, 
        CLIENTES.telefono, 
        CLIENTES.email, 
        CLIENTES.foto_perfil, 
        CLIENTES.foto_portada, 
        provincia.nombre AS provincia, 
        localidad.nombre AS localidad
    FROM CLIENTES
    LEFT JOIN provincia ON clientes.provincia_id = provincia.id
    LEFT JOIN localidad ON clientes.localidad_id = localidad.id
    WHERE CLIENTES.cliente_id = ?
`;

    db.query(query, [clienteId], (err, results) => {
        if (err) {
            console.error("Error al obtener datos del perfil:", err);
            return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ success: false, message: "Cliente no encontrado" });
        }
    });
});

//----------------------------------------------------------------------------------------------------------------------------

// VERIFICACIONES | VERIFICACIONES | VERIFICACIONES | VERIFICACIONES | VERIFICACIONES | VERIFICACIONES | VERIFICACIONES |
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
