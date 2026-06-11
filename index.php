# videojuego
<?php
// index.php
session_start();
require_once 'conexion.php';

$feedback = "";
$status = "";

// Sistema simple de sesión simulando login de pilotos locales para cumplir la persistencia nominal
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['accion_acceso'])) {
        $usuario = trim($_POST['username']);
        if (!empty($usuario)) {
            $_SESSION['username'] = htmlspecialchars($usuario);
            header("Location: index.php");
            exit;
        }
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cosechador de Limón de Tambogrande - Identidad Piurana</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="navbar">
        <div class="logo">COSECHADOR DE LIMÓN - TAMBOGRANDE</div>
        <div class="user-control">
            <?php if (isset($_SESSION['username'])):?>
                <span id="session-info" data-username="<?php echo $_SESSION['username'];?>">
                    Agricultor Activo: <strong><?php echo $_SESSION['username'];?></strong>
                </span>
                <a href="index.php?logout=1" class="btn btn-danger">Salir</a>
            <?php else:?>
                <button onclick="toggleAuthModal()" class="btn btn-neon">Registrar Agricultor</button>
            <?php endif;?>
        </div>
    </header>

    <main class="viewport-main">
        <div class="layout-grid">
            <section class="screen-canvas-wrapper">
                <canvas id="canvasJuego" width="800" height="500"></canvas>
                <div id="game-over-overlay" class="game-overlay hidden">
                    <div class="overlay-modal">
                        <h2 id="overlay-title">FIN DE LA COSECHA</h2>
                        <p>Puntaje Total: <span id="final-score-val">0</span> limones</p>
                        <p>Nivel Alcanzado: <span id="final-level-val">1</span></p>
                        <button id="btn-restart" class="btn btn-neon">Nueva Jornada</button>
                    </div>
                </div>
            </section>

            <aside class="dashboard-sidebar">
                <div class="hud-widget">
                    <h3>NIVEL DE CAMPO</h3>
                    <div id="hud-level" class="led-display alert-green">NIVEL 1</div>
                    <h3>LIMONES COSECHADOS</h3>
                    <div id="hud-score" class="led-display">00000</div>
                    <h3>INTEGRIDAD (ENERGÍA)</h3>
                    <div id="hud-lives" class="led-display alert-green">100%</div>
                    <h3>TIEMPO DE TRABAJO</h3>
                    <div id="hud-time" class="led-display">0s</div>
                </div>

                <div class="leaderboard-widget">
                    <h3>TOP 10 HISTÓRICO - PIURA</h3>
                    <table class="grid-table">
                        <thead>
                            <tr>
                                <th>Rango</th>
                                <th>Piloto/Cosechador</th>
                                <th>Puntaje</th>
                                <th>Nivel</th>
                            </tr>
                        </thead>
                        <tbody id="ranking-body"></tbody>
                    </table>
                </div>
            </aside>
        </div>
    </main>

    <div id="auth-modal" class="modal-wrapper hidden">
        <div class="card-3d-container">
            <div class="card-3d-inner">
                <div class="card-face">
                    <span class="modal-close" onclick="toggleAuthModal()">&times;</span>
                    <h2>Registro de Cosechador</h2>
                    <form action="index.php" method="POST" class="auth-form-body">
                        <div class="input-field">
                            <label>Nombre del Cosechador (Rúbrica)</label>
                            <input type="text" name="username" required placeholder="Ej. Juan Pérez">
                        </div>
                        <button type="submit" name="accion_acceso" class="btn btn-neon btn-full">Ingresar al Campo</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>
