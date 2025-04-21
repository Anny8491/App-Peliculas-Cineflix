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

// Verificar que se proporcionó un ID
if (!isset($data->id) || !is_numeric($data->id)) {
    echo json_encode([
        "success" => false,
        "message" => "ID no proporcionado o inválido"
    ]);
    exit;
}

$id = (int)$data->id;

try {
    // Eliminar usuario
    $sql = "DELETE FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("i", $id);
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    // Verificar si se eliminó alguna fila
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Usuario eliminado correctamente"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el usuario con el ID proporcionado"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>