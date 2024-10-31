const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("../db/database"); // Importa la conexión desde database.js
const app = express();
const port = 3000;

app.use(bodyParser.json());

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

// RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | RUTAS | ENDPOINTS

// Ruta para obtener el nombre de la compañía
app.get("/getCompanyName", (req, res) => {
    const clienteId = req.query.user_id; // Asegúrate de enviar el ID del cliente en la query

    const query = `
        SELECT CLIENTES.nombre_compania 
        FROM CLIENTES
        WHERE CLIENTES.user_id = ?
    `;

    db.query(query, [clienteId], (err, results) => {
        if (err) {
            console.error("Error al obtener datos del perfil:", err);
            return res.status(500).json({ success: false, message: "Error del servidor" });
        }
        res.json(results[0] || {}); // Enviar un objeto vacío si no hay resultados
    });
});
// Ruta para obtener los datos del perfil del cliente
app.get("/getProfileData", (req, res) => {
    const clienteId = req.query.id; // Asegúrate de enviar el ID del cliente en la query

    const query = `
        SELECT clientes.id AS cliente_id, clientes.username, companias.nombre_compania, companias.cuenta_bancaria, 
               companias.telefono, companias.email_contacto, companias.cantidad_canchas, niveles.descripcion AS nivel
        FROM clientes 
        JOIN companias ON clientes.id = companias.cliente_id
        JOIN niveles ON companias.nivel_id = niveles.id
        WHERE clientes.id = ?
    `;

    db.query(query, [clienteId], (err, results) => {
        if (err) {
            console.error("Error al obtener datos del perfil:", err);
            return res.status(500).json({ success: false, message: "Error del servidor" });
        }
        res.json(results[0]);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
