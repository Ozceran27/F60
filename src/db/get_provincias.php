<?php
include('database.js');
$sql = "SELECT id, nombre FROM provincia";
$result = $conn->query($sql);

$provincias = [];
while ($row = $result->fetch_assoc()) {
    $provincias[] = $row;
}

echo json_encode($provincias);
$conn->close();
?>
