<?php
include('database.js');
$provincia_id = $_GET['provincia_id'];

$sql = "SELECT id, nombre FROM localidad WHERE provincia_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $provincia_id);
$stmt->execute();
$result = $stmt->get_result();

$localidades = [];
while ($row = $result->fetch_assoc()) {
    $localidades[] = $row;
}

echo json_encode($localidades);
$stmt->close();
$conn->close();
?>
