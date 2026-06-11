<?php
// php/guardar.php
require_once '../conexion.php';
header('Content-Type: application/json');

$datos_entrada = json_decode(file_get_contents('php://input'), true);

if (
    !isset($datos_entrada['nombre_jugador']) || 
    !isset($datos_entrada['puntaje_total']) || 
    !isset($datos_entrada['tiempo_segundos']) || 
    !isset($datos_entrada['nivel_alcanzado'])
) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros del esquema unificado de datos.']);
    exit;
}

$nombre = htmlspecialchars(trim($datos_entrada['nombre_jugador']));
$puntaje = intval($datos_entrada['puntaje_total']);
$tiempo = intval($datos_entrada['tiempo_segundos']);
$nivel = intval($datos_entrada['nivel_alcanzado']);

try {
    // Criterio 2: Sentencia preparada contra inyección SQL maliciosa
    $stmt = $pdo->prepare("INSERT INTO tabla_records (nombre_jugador, puntaje_total, tiempo_segundos, nivel_alcanzado) 
                           VALUES (:nombre, :puntaje, :tiempo, :nivel)");
    $stmt->execute([
        'nombre'  => $nombre,
        'puntaje' => $puntaje,
        'tiempo'  => $tiempo,
        'nivel'   => $nivel
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Récord piurano guardado correctamente.']);
} catch (PDOException $e) {
    error_log("Error guardando datos: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Inconsistencia en el esquema del servidor relacional.']);
}
?>
