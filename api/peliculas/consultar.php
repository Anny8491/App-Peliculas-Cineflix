<?php
// Permitir solicitudes de cualquier origen (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), responder con éxito
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../../db/conexion.php';

try {
    // Consultar todas las películas
    $sql = "SELECT * FROM peliculas ORDER BY id DESC";
    $resultado = $conexion->query($sql);
    
    if (!$resultado) {
        throw new Exception("Error en la consulta: " . $conexion->error);
    }
    
    $peliculas = array();
    
    while ($fila = $resultado->fetch_assoc()) {
        $peliculas[] = $fila;
    }
    
    echo json_encode($peliculas);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>