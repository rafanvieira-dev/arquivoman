const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações base
const laneWidth = canvas.width / 3;
let gameStarted = false;
let score = 0;
let lives = 3;
let speed = 5;
let frameCount = 0;

let player = {
    lane: 1, // Começa na pista do meio
    y: 500,
    width: 44,
    height: 54,
    currentX: laneWidth + (laneWidth/2) - 22
};

let obstacles = [];
let items = [];
let powerMode = false;
let powerTimer = 0;

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameUI").style.display = "block";
    gameStarted = true;
    gameLoop();
}

// Movimentação por pistas
document.addEventListener("keydown", e => {
    if (!gameStarted) return;
    if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
    if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

function update() {
    // Suavizar o deslocamento lateral do jogador
    const targetX = player.lane * laneWidth + (laneWidth/2) - player.width/2;
    player.currentX += (targetX - player.currentX) * 0.25;

    // Aumento progressivo de dificuldade
    speed = 5 + (score / 1000);

    // Gerar obstáculos e itens
    frameCount++;
    if (frameCount % Math.max(25, 50 - Math.floor(score/500)) === 0) {
        const lane = Math.floor(Math.random() * 3);
        const xPos = lane * laneWidth + (laneWidth/2) - 20;
        
        if (Math.random() > 0.3) {
            obstacles.push({ x: xPos, y: -60, w: 40, h: 40 });
        } else {
            items.push({ x: xPos + 5, y: -60, w: 30, h: 30, type: Math.random() > 0.1 ? 'file' : 'disk' });
        }
    }

    // Lógica dos Obstáculos (Gaveteiros)
    obstacles.forEach((obs, i) => {
        obs.y += speed;
        // Colisão simples por caixa
        if (obs.y + obs.h > player.y && obs.y < player.y + player.height &&
            obs.x + obs.w > player.currentX && obs.x < player.currentX + player.width) {
            
            if (powerMode) {
                score += 50;
            } else {
                lives--;
                if (lives <= 0) {
                    alert("Game Over! Score: " + Math.floor(score));
                    location.reload();
                }
            }
            obstacles.splice(i, 1);
        }
        if (obs.y > canvas.height) obstacles.splice(i, 1);
    });

    // Lógica dos Itens
    items.forEach((item, i) => {
        item.y += speed;
        if (item.y + item.h > player.y && item.y < player.y + player.height &&
            item.x + item.w > player.currentX && item.x < player.currentX + player.width) {
            
            if (item.type === 'file') {
                score += 20;
            } else {
                powerMode = true;
                powerTimer = 240; // ~4 segundos a 60fps
            }
            items.splice(i, 1);
        }
        if (item.y > canvas.height) items.splice(i, 1);
    });

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    updateHUD();
}

function updateHUD() {
    const elScore = document.getElementById("score");
    const elLives = document.getElementById("lives");
    const elPower = document.getElementById("powerTimer");

    if (elScore) elScore.innerText = Math.floor(score);
    if (elLives) elLives.innerText = lives;
    if (elPower) elPower.innerText = powerMode ? "🔥 MODO FOCO" : "";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pistas e Linhas de Movimento
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 4;
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
    }

    // Desenhar Jogador
    ctx.fillStyle = powerMode ? "#00ff41" : "#00d4ff";
    ctx.fillRect(player.currentX, player.y, player.width, player.height);
    // Detalhe: Gravata ou Crachá
    ctx.fillStyle = "white";
    ctx.fillRect(player.currentX + player.width/2 - 5, player.y + 10, 10, 20);

    // Desenhar Obstáculos (Gaveteiros 32-bit)
    obstacles.forEach(obs => {
        ctx.fillStyle = "#444";
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.fillStyle = "#666";
        ctx.fillRect(obs.x + 4, obs.y + 6, 32, 10); // Gaveta superior
        ctx.fillRect(obs.x + 4, obs.y + 22, 32, 10); // Gaveta inferior
    });

    // Desenhar Itens
    items.forEach(item => {
        ctx.fillStyle = item.type === 'file' ? "#fff" : "#ff0";
        ctx.fillRect(item.x, item.y, item.w, item.h);
        if (item.type === 'disk') {
            ctx.fillStyle = "#000";
            ctx.fillRect(item.x + 5, item.y + 5, 20, 4);
        }
    });
}

function gameLoop() {
    if (!gameStarted) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
