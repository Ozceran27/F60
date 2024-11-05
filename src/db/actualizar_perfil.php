<?php
session_start();
include('database.js'); // Asegúrate de incluir tu archivo de conexión

// Obtiene los datos del formulario
$nombre = $_POST['nombre'];
$cvu = $_POST['cvu'];
$provincia_id = $_POST['provincia_id'];
$localidad_id = $_POST['localidad_id'];
$contrasena = $_POST['contrasena'];
$cliente_id = $_SESSION['cliente_id']; // Usando el ID de cliente de la sesión

// Manejo de la imagen de perfil
$foto_perfil = null;
if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] == UPLOAD_ERR_OK) {
    $foto_perfil = 'uploads/' . basename($_FILES['foto_perfil']['name']);
    move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $foto_perfil);
}

// Consulta de actualización
$sql = "UPDATE clientes SET nombre = ?, cvu = ?, provincia_id = ?, localidad_id = ?, foto_perfil = ?, contrasena = ? WHERE cliente_id = ?";
$stmt = $conn->prepare($sql);
$hashed_password = password_hash($contrasena, PASSWORD_DEFAULT); // Encriptar la contraseña
$stmt->bind_param("ssisssi", $nombre, $cvu, $provincia_id, $localidad_id, $foto_perfil, $hashed_password, $cliente_id);

if ($stmt->execute()) {
    echo "Perfil actualizado correctamente.";
} else {
    echo "Error al actualizar el perfil.";
}

$stmt->close();
$conn->close();
?>
