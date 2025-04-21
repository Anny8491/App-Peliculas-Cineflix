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
if (!isset($data->nombre) || !isset($data->email) || !isset($data->password)) {
    echo json_encode([
        "success" => false,
        "message" => "Nombre, email y contraseña son requeridos"
    ]);
    exit;
}

$nombre = trim($data->nombre);
$email = trim($data->email);
$password = trim($data->password);

// Validaciones básicas
if (empty($nombre) || empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Email inválido"
    ]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "La contraseña debe tener al menos 6 caracteres"
    ]);
    exit;
}

try {
    // Verificar si el email ya existe
    $sql_check = "SELECT id FROM usuarios WHERE email = ?";
    $stmt_check = $conexion->prepare($sql_check);
    
    if (!$stmt_check) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }
    
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows > 0) {
        echo json_encode([
            "success" => false,
            "message" => "El email ya está registrado"
        ]);
        exit;
    }
    
    // Hashear la contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar usuario
    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("sss", $nombre, $email, $password_hash);
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $id = $conexion->insert_id;
    
    echo json_encode([
        "success" => true,
        "message" => "Usuario creado correctamente",
        "id" => $id
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>