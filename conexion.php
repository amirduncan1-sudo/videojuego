
<?php
// conexion.php
$servidor = 'localhost';
$base_datos = 'juego_piurano_db'; // Cambiada a la base de datos oficial
$usuario = 'root';
$contrasena = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$servidor;dbname=$base_datos;charset=$charset";
$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $usuario, $contrasena, $opciones);
} catch (PDOException $e) {
    error_log("Error en conexión: " . $e->getMessage());
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => 'Incapacidad de conectar la base de datos del proyecto.']);
    exit;
}
?>
