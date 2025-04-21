<?php
// Configuración de la base de datos
$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "app_peliculas_online";

// Crear conexión
$conexion = new mysqli($host, $usuario, $password, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Establecer charset
$conexion->set_charset("utf8");

// Función para depuración
function debug_to_console($data) {
    $output = $data;
    if (is_array($output)) {
        $output = implode(',', $output);
    }
    echo "<script>console.log('Debug: " . $output . "');</script>";
}
?>