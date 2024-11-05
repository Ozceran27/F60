<?php
session_start();
include('database.js'); // Asegúrate de tener la conexión a la base de datos

$cliente_id = $_SESSION['cliente_id']; // ID del cliente almacenado en la sesión

$sql = "SELECT nombre AS nombre_compania, cvu, provincia_id, localidad_id, foto_perfil FROM clientes WHERE cliente_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();

$cliente = $result->fetch_assoc();

echo json_encode($cliente);

$stmt->close();
$conn->close();
?>
