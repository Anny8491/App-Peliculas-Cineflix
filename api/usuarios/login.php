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
if (!isset($data->email) || !isset($data->password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email y contraseña son requeridos"
    ]);
    exit;
}

$email = trim($data->email);
$password = trim($data->password);

// Validaciones básicas
if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email y contraseña son requeridos"
    ]);
    exit;
}

try {
    // Buscar usuario por email
    $sql = "SELECT id, nombre, email, password FROM usuarios WHERE email = ?";
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param("s", $email);
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Email o contraseña incorrectos"
        ]);
        exit;
    }
    
    $usuario = $resultado->fetch_assoc();
    
    // Verificar contraseña
    if (password_verify($password, $usuario['password'])) {
        // Eliminar la contraseña del objeto de usuario antes de enviarlo
        unset($usuario['password']);
        
        echo json_encode([
            "success" => true,
            "message" => "Inicio de sesión exitoso",
            "usuario" => $usuario
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Email o contraseña incorrectos"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
?>