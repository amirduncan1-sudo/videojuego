<?php
// php/leaderboard.php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    // Consulta estructurada adaptada a la tabla oficial del manual
    $sql = "SELECT nombre_jugador, MAX(puntaje_total) AS puntaje_total, MAX(nivel_alcanzado) AS nivel_alcanzado 
            FROM tabla_records 
            GROUP BY nombre_jugador 
            ORDER BY puntaje_total DESC 
            LIMIT 10";

    $stmt = $pdo->query($sql);
    $lista = $stmt->fetchAll();

    echo json_encode($lista);
} catch (PDOException $e) {
    error_log("Fallo cargando records: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Incapacidad de extraer datos históricos de clasificación.']);
}
?>
