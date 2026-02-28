// Configurações Globais
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste do tamanho do Canvas
canvas.width = 360;
canvas.height = 600;

const laneWidth = canvas.width / 3;
let gameStarted = false;
let score = 0;
let lives = 3;
let speed = 4;
let frameCount = 0;

// Objetos do Jogo
let player = {
    lane: 1, // Pista Central
    x: 0, 
    y: canvas.height - 100,
    width: 50,
    height: 60
};

let obstacles = [];

// Iniciar o Jogo
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameUI").style.display = "block";
    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

// Controle de Teclado
document.addEventListener("keydown", (e) => {
    if (!gameStarted) return;
    if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
    if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

// Lógica de Atualização
function update() {
    // Calcula posição X baseada na pista (lane)
    let targetX = (player.lane * laneWidth) + (laneWidth / 2) - (player.width / 2);
    player.x += (targetX - player.x) * 0.2; // Suaviza movimento lateral

    // Aumenta velocidade gradualmente
    speed = 4 + (score / 100);

    // Gerar Obstáculos (Gaveteiros)
    frameCount++;
    if (frameCount % 60 === 0) {
        let lane = Math.floor(Math.random() * 3);
        obstacles.push({
            x: (lane * laneWidth) + (laneWidth / 2) - 20,
            y: -50,
            w: 40,
            h: 40
        });
    }

    // Mover e Checar Colisão
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.y += speed;

        // Colisão com Jogador
        if (o.y + o.h > player.y && o.y < player.y + player.height &&
            o.x + o.w > player.x && o.x < player.x + player.width) {
            lives--;
            obstacles.splice(i, 1);
            if (lives <= 0) {
                alert("Game Over! Processos acumulados: " + score);
                location.reload();
            }
        } 
        // Saiu da tela (Ponto marcado)
        else if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }

    // Atualizar interface (HUD) com segurança
    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    if (scoreEl) scoreEl.innerText = score;
    if (livesEl) livesEl.innerText = lives;
}

// Desenho
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar Linhas das Pistas
    ctx.strokeStyle = "#222";
    ctx.setLineDash([10, 10]);
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Desenhar Jogador (O Arquivista)
    ctx.fillStyle = "#00ff41";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Pequeno detalhe no boneco (olhos)
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x + 10, player.y + 15, 8, 8);
    ctx.fillRect(player.x + 32, player.y + 15, 8, 8);

    // Desenhar Obstáculos (Gaveteiros de Aço)
    ctx.fillStyle = "#555";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = "#333";
        ctx.fillRect(o.x + 5, o.y + 5, 30, 8); // Puxador da gaveta
        ctx.fillRect(o.x + 5, o.y + 20, 30, 8);
        ctx.fillStyle = "#555";
    });
}

function gameLoop() {
    if (!gameStarted) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
