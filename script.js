// js/script.js

// --- Utilidades de Interfaz de Usuario (Modales) ---
function toggleAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

// Instancia global de la imagen para el limón de Tambogrande
const imgLimon = new Image();
imgLimon.src = 'imagenes/limon-persa-1-ud-0000000071789.png'; 

// --- Clases Lógicas del Videojuego ---

class CanastaCosechadora {
    constructor(canvasWidth, canvasHeight) {
        this.width = 90;
        this.height = 20;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 40;
        this.speed = 12;
        this.canvasWidth = canvasWidth;
    }

    draw(ctx) {
        // Canasta artesanal de mimbre típica del norte peruano
        ctx.fillStyle = '#d4a373';
        ctx.shadowColor = '#ffe3a8';
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordes decorativos rústicos
        ctx.fillStyle = '#aa7c11';
        ctx.fillRect(this.x, this.y, this.width, 4);
        ctx.shadowBlur = 0;
    }

    move(keys) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
            if (this.x < 0) this.x = 0;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
            if (this.x + this.width > this.canvasWidth) {
                this.x = this.canvasWidth - this.width;
            }
        }
    }
}

class ElementoHuerto {
    constructor(canvasWidth, nivel) {
        this.tipo = Math.random() < 0.65 ? 'limon' : 'espina';
        this.radius = this.tipo === 'limon' ? 14 : 11; 
        this.x = Math.random() * (canvasWidth - this.radius * 2) + this.radius;
        this.y = -20;
        
        // Escalado matemático de dificultad hasta el Nivel 4 (Rúbrica Criterio 1)
        let baseSpeed = this.tipo === 'limon' ? 3 : 4;
        let multiplicador = 1.0;
        if (nivel === 2) multiplicador = 1.6;
        if (nivel === 3) multiplicador = 2.2; 
        if (nivel === 4) multiplicador = 3.0; 
        
        this.speed = (Math.random() * 2 + baseSpeed) * multiplicador;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.tipo === 'limon') {
            // Dibuja tu imagen real si ya cargó en el navegador
            if (imgLimon.complete && imgLimon.naturalWidth !== 0) {
                ctx.drawImage(imgLimon, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            } else {
                ctx.fillStyle = '#aacc00'; 
                ctx.beginPath();
                ctx.ellipse(0, 0, this.radius, this.radius, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(this.radius, this.radius);
            ctx.lineTo(-this.radius, this.radius);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class MotorJuegoPiura {
    constructor() {
        this.canvas = document.getElementById('canvasJuego');
        this.ctx = this.canvas.getContext('2d');
        this.recolector = new CanastaCosechadora(this.canvas.width, this.canvas.height);
        this.elementos = [];
        this.score = 0;
        this.bateria = 100;
        this.nivel = 1;
        this.tiempoSegundos = 0;
        this.keys = {};
        this.running = false;
        
        this.spawnCounter = 0;
        this.spawnLimit = 22;

        this.initEventListeners();
        this.renderLeaderboard();
        this.startTimeCounter();
    }

    initEventListeners() {
        window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
        document.getElementById('btn-restart').addEventListener('click', () => { this.restartGame(); });
    }

    startTimeCounter() {
        setInterval(() => {
            if (this.running) {
                this.tiempoSegundos++;
                const timeHUD = document.getElementById('hud-time');
                if (timeHUD) timeHUD.textContent = `${this.tiempoSegundos}s`;
            }
        }, 1000);
    }

    restartGame() {
        this.recolector = new CanastaCosechadora(this.canvas.width, this.canvas.height);
        this.elementos = [];
        this.score = 0;
        this.bateria = 100;
        this.nivel = 1;
        this.tiempoSegundos = 0;
        this.running = true;

        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('hud-score').textContent = '00000';
        
        const lvlHUD = document.getElementById('hud-level');
        lvlHUD.textContent = 'NIVEL 1';
        lvlHUD.className = 'led-display alert-green';
        
        const hudLives = document.getElementById('hud-lives');
        hudLives.textContent = '100%';
        hudLives.className = 'led-display alert-green';

        this.loop();
    }

    detectarColision(basket, item) {
        return basket.x < item.x + item.radius &&
               basket.x + basket.width > item.x - item.radius &&
               basket.y < item.y + item.radius &&
               basket.y + basket.height > item.y - item.radius;
    }

    loop() {
        if (!this.running) return;
        this.updatePhysics();
        this.renderCanvas();
        requestAnimationFrame(() => this.loop());
    }

    updatePhysics() {
        this.recolector.move(this.keys);

        // --- CONTROL DE TRANSICIONES DE NIVEL (1 -> 2 -> 3 -> 4) ---
        if (this.score >= 100 && this.score < 200 && this.nivel === 1) {
            this.nivel = 2;
            const lvlHUD = document.getElementById('hud-level');
            if (lvlHUD) {
                lvlHUD.textContent = 'NIVEL 2';
                lvlHUD.className = 'led-display alert-yellow';
            }
            this.spawnLimit = 15;
        } else if (this.score >= 200 && this.score < 500 && this.nivel === 2) {
            this.nivel = 3;
            const lvlHUD = document.getElementById('hud-level');
            if (lvlHUD) {
                lvlHUD.textContent = 'NIVEL 3';
                lvlHUD.className = 'led-display alert-red';
            }
            this.spawnLimit = 10; 
            this.recolector.speed = 9; // El peso de los limones ralentiza la canasta
        } else if (this.score >= 500 && this.nivel === 3) {
            // ¡Nivel 4 Desbloqueado automáticamente a los 500 puntos!
            this.nivel = 4;
            const lvlHUD = document.getElementById('hud-level');
            if (lvlHUD) {
                lvlHUD.textContent = 'NIVEL 4 🔥';
                lvlHUD.className = 'led-display alert-red';
            }
            this.spawnLimit = 7; // Caída de elementos masiva e incesante
            this.recolector.speed = 11; // El agricultor aumenta su agilidad para el reto final
        }

        // --- GENERACIÓN DE NUEVOS ELEMENTOS (SPAWN) ---
        this.spawnCounter++;
        if (this.spawnCounter >= this.spawnLimit) {
            this.spawnCounter = 0;
            this.elementos.push(new ElementoHuerto(this.canvas.width, this.nivel));
        }

        // --- BUCLE DE FÍSICA, ACTUALIZACIÓN Y COLISIONES ---
        for (let i = this.elementos.length - 1; i >= 0; i--) {
            const item = this.elementos[i];
            item.update();

            // Detección analítica de colisión con la canasta
            if (this.detectarColision(this.recolector, item)) {
                if (item.tipo === 'limon') {
                    this.score += 10;
                    this.formatScoreDisplay();
                } else {
                    this.bateria -= 25;
                    this.updateBateriaUI();
                    if (this.bateria <= 0) {
                        this.terminateSession();
                    }
                }
                this.elementos.splice(i, 1);
                continue;
            }

            // Remoción automática de los objetos caídos para liberar memoria RAM
            if (item.y > this.canvas.height + 20) {
                this.elementos.splice(i, 1);
            }
        }
    }

    formatScoreDisplay() {
        document.getElementById('hud-score').textContent = String(this.score).padStart(5, '0');
    }

    updateBateriaUI() {
        const hudLives = document.getElementById('hud-lives');
        hudLives.textContent = `${this.bateria}%`;
        if (this.bateria <= 50 && this.bateria > 25) {
            hudLives.className = 'led-display';
        } else if (this.bateria <= 25) {
            hudLives.className = 'led-display alert-red';
        }
    }

   renderCanvas() {
        // 1. Limpiar el lienzo
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 2. Definir el color del cielo piurano según el nivel
        let gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (this.nivel === 1 || this.nivel === 2) {
            gradient.addColorStop(0, '#1d3557'); // Cielo azul del norte al amanecer
            gradient.addColorStop(1, '#132a13'); // Conexión con el verde del huerto
        } else if (this.nivel === 3) {
            gradient.addColorStop(0, '#1b4332'); // Atardecer denso en el huerto
            gradient.addColorStop(1, '#081c15');
        } else {
            gradient.addColorStop(0, '#3a473e'); // Nivel 4: Tormenta gris (Fenómeno El Niño)
            gradient.addColorStop(1, '#151a16');
        }
        
        // Pintar el fondo del cielo
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 3. ELEMENTO CULTURAL: El Sol Radiante Norteño (Solo Niveles 1, 2 y 3)
        if (this.nivel < 4) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 183, 3, 0.25)'; // Amarillo sol traslúcido
            this.ctx.shadowColor = '#ffb703';
            this.ctx.shadowBlur = 30;
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width - 80, 80, 50, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 4. ELEMENTO CULTURAL: Siluetas de Algarrobos en el Fondo (Para dar contexto regional)
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(8, 28, 21, 0.4)'; // Silueta oscura distante
        
        // Árbol Izquierdo (Tronco retorcido típico del algarrobo)
        this.ctx.beginPath();
        this.ctx.moveTo(80, this.canvas.height - 20);
        this.ctx.quadraticCurveTo(90, this.canvas.height - 100, 110, this.canvas.height - 140);
        this.ctx.lineTo(125, this.canvas.height - 140);
        this.ctx.quadraticCurveTo(100, this.canvas.height - 100, 100, this.canvas.height - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Follaje del algarrobo (Hojas en masa redonda traslúcida)
        this.ctx.beginPath();
        this.ctx.arc(115, this.canvas.height - 160, 45, 0, Math.PI * 2);
        this.ctx.arc(80, this.canvas.height - 180, 40, 0, Math.PI * 2);
        this.ctx.arc(150, this.canvas.height - 170, 35, 0, Math.PI * 2);
        this.ctx.fill();

        // Árbol Derecho Distante
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 120, this.canvas.height - 20);
        this.ctx.lineTo(this.canvas.width - 110, this.canvas.height - 110);
        this.ctx.lineTo(this.canvas.width - 95, this.canvas.height - 110);
        this.ctx.lineTo(this.canvas.width - 100, this.canvas.height - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 105, this.canvas.height - 130, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 5. Hojitas verdes flotando en el aire (Dinámica del viento norteño)
        this.ctx.fillStyle = 'rgba(116, 198, 157, 0.15)';
        for (let i = 0; i < 25; i++) {
            const leafX = (Math.sin(i * 7543) + 1) / 2 * this.canvas.width;
            const leafY = (Math.cos(i * 3124) + 1) / 2 * this.canvas.height;
            this.ctx.fillRect(leafX, leafY, 3, 2);
        }

        // 6. EFECTO CLIMÁTICO DEL NIVEL 4 (Lluvia de El Niño)
        if (this.nivel === 4) {
            this.ctx.fillStyle = 'rgba(173, 216, 230, 0.4)';
            for (let i = 0; i < 40; i++) {
                const rainX = (Math.sin(i * 4321) + 1) / 2 * this.canvas.width;
                const rainY = ((Math.cos(i * 1234) + 1) / 2 * this.canvas.height + this.tiempoSegundos * 20) % this.canvas.height;
                this.ctx.fillRect(rainX, rainY, 1.5, 10); 
            }
        }

        // 7. --- DIBUJO DEL SUELO PIURANO (Tierra y Gras) ---
        // Suelo firme de color marrón arcilla / arenoso típico de Tambogrande
        this.ctx.fillStyle = '#5c4033';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);

        // Capa superior de césped / maleza verde del huerto
        this.ctx.fillStyle = '#386f52';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 5);

        // Pequeñas briznas de gras triangulares
        this.ctx.fillStyle = '#40916c';
        for (let i = 0; i < this.canvas.width; i += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.canvas.height - 20);
            this.ctx.lineTo(i + 5, this.canvas.height - 28); 
            this.ctx.lineTo(i + 10, this.canvas.height - 20);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // 8. Pintar los objetos interactivos (Canasta artesanal y limones reales) al frente de todo
        this.recolector.draw(this.ctx);
        this.elementos.forEach(el => el.draw(this.ctx));
    }

    terminateSession() {
        this.running = false;
        document.getElementById('final-score-val').textContent = this.score;
        document.getElementById('final-level-val').textContent = this.nivel;
        document.getElementById('game-over-overlay').classList.remove('hidden');

        const sessionEl = document.getElementById('session-info');
        if (sessionEl) {
            this.despacharPuntajeAlServidor();
        }
    }

    despacharPuntajeAlServidor() {
        const sessionEl = document.getElementById('session-info');
        if (!sessionEl) return;
        
        const username = sessionEl.getAttribute('data-username');

        fetch('php/guardar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_jugador: username,
                puntaje_total: this.score,
                tiempo_segundos: this.tiempoSegundos,
                nivel_alcanzado: this.nivel
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error de comunicación asíncrona.');
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') this.renderLeaderboard();
        })
        .catch(err => console.error('Fallo de persistencia:', err));
    }

    renderLeaderboard() {
        fetch('php/leaderboard.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('ranking-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Sin records de jornadas laborales</td></tr>';
                return;
            }

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color: var(--color-neon-cyan);">#${index + 1}</td>
                    <td>${row.nombre_jugador}</td>
                    <td style="font-weight:bold; color: #39ff14;">${row.puntaje_total} pts</td>
                    <td>Lvl ${row.nivel_alcanzado}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error cargando ranking:', err));
    }
}

window.addEventListener('load', () => {
    const motor = new MotorJuegoPiura();
    motor.restartGame();
});
