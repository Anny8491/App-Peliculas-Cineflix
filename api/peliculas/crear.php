<?php
// Permitir solicitudes de cualquier origen (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), responder con éxito
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../../db/conexion.php';

// Verificar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit;
}

// Obtener y decodificar los datos JSON
$json = file_get_contents("php://input");
$data = json_decode($json);

// Verificar que se recibieron datos válidos
if (!$json || json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false,
        "message" => "Datos JSON inválidos: " . json_last_error_msg()
    ]);
    exit;
}

// Verificar que se proporcionaron todos los datos necesarios
if (!isset($data->titulo) || !isset($data->descripcion) || !isset($data->url_imagen)) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

$titulo = trim($data->titulo);
$descripcion = trim($data->descripcion);
$url_imagen = trim($data->url_imagen);
$precio = isset($data->precio) ? floatval($data->precio) : 9.99;
$anio = isset($data->anio) ? intval($data->anio) : 2023;
$calificacion = isset($data->calificacion) ? floatval($data->calificacion) : 8.5;
$duracion = isset($data->duracion) ? intval($data->duracion) : 120;

// Validaciones básicas
if (empty($titulo) || empty($descripcion) || empty($url_imagen)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

try {
    // Insertar película
    $sql = "INSERT INTO peliculas (titulo, descripcion, url_imagen, precio, anio, calificacion, duracion) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("sssdidd", $titulo, $descripcion, $url_imagen, $precio, $anio, $calificacion, $duracion);
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $id = $conexion->insert_id;
    
    echo json_encode([
        "success" => true,
        "message" => "Película creada correctamente",
        "id" => $id
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>