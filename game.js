const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 30;
const rows = 20;
const cols = 20;

let score = 0;
let lives = 3;
let level = 1;
let powerMode = false;
let powerTimer = 0;
let powerInterval;
let gameOver = false;

const center = { x: 10, y: 10 };

let player = { x: 1, y: 1 };
let enemies = [];
let map = [];

// ================== TELA INICIAL ==================

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameUI").style.display = "block";

    resetGame();
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;

    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
    document.getElementById("level").innerText = level;
    document.getElementById("message").innerText = "";

    createMap();
}

// ================== MAPA ==================

function createMap() {
    map = [];
    enemies = [];

    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {

            if (y === 0 || y === rows-1 || x === 0 || x === cols-1) {
                row.push(1);
            } 
            else if ((x % 4 === 0 && y % 2 === 0)) {
                row.push(1);
            }
            else {
                row.push(2);
            }
        }
        map.push(row);
    }

    map[center.y][center.x] = 0;
    map[2][2] = 3;
    map[17][17] = 3;

    player.x = 1;
    player.y = 1;

    for (let i = 0; i < level + 2; i++) {
        enemies.push({
            x: center.x,
            y: center.y
        });
    }
}

// ================== DESENHO ==================

function drawMap() {
    ctx.font = "20px Arial";

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            if (map[y][x] === 1) {
                ctx.fillStyle = "blue";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }

            if (map[y][x] === 2) {
                ctx.fillText("🧾", x * tileSize + 5, y * tileSize + 22);
            }

            if (map[y][x] === 3) {
                ctx.fillText("💻", x * tileSize + 5, y * tileSize + 22);
            }
        }
    }

    ctx.fillStyle = "purple";
    ctx.fillRect(center.x * tileSize, center.y * tileSize, tileSize, tileSize);
}

function drawPlayer() {
    ctx.fillText("🏃‍♂️", player.x * tileSize + 5, player.y * tileSize + 22);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillText("🗄️", enemy.x * tileSize + 5, enemy.y * tileSize + 22);
    });
}

// ================== MOVIMENTO ==================

document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    let newX = player.x;
    let newY = player.y;

    if (e.key === "ArrowUp") newY--;
    if (e.key === "ArrowDown") newY++;
    if (e.key === "ArrowLeft") newX--;
    if (e.key === "ArrowRight") newX++;

    if (map[newY][newX] !== 1) {
        player.x = newX;
        player.y = newY;
        checkTile();
    }
});

function checkTile() {

    if (map[player.y][player.x] === 2) {
        score += 10;
        map[player.y][player.x] = 0;
    }

    if (map[player.y][player.x] === 3) {
        activatePowerMode();
        map[player.y][player.x] = 0;
    }

    document.getElementById("score").innerText = score;
    checkLevelComplete();
}

// ================== POWER MODE ==================

function activatePowerMode() {
    powerMode = true;
    powerTimer = 30;

    clearInterval(powerInterval);

    powerInterval = setInterval(() => {
        powerTimer--;
        document.getElementById("powerTimer").innerText =
            "Modo Especial: " + powerTimer;

        if (powerTimer <= 0) {
            powerMode = false;
            document.getElementById("powerTimer").innerText = "";
            clearInterval(powerInterval);
        }
    }, 1000);
}

// ================== INIMIGOS ==================

function moveEnemies() {

    enemies.forEach(enemy => {

        let directions = [
            {x: 0, y: -1},
            {x: 0, y: 1},
            {x: -1, y: 0},
            {x: 1, y: 0}
        ];

        let validMoves = directions.filter(d =>
            map[enemy.y + d.y][enemy.x + d.x] !== 1
        );

        if (validMoves.length > 0) {
            let move = validMoves[Math.floor(Math.random() * validMoves.length)];
            enemy.x += move.x;
            enemy.y += move.y;
        }

        if (enemy.x === player.x && enemy.y === player.y) {

            if (powerMode) {
                enemy.x = center.x;
                enemy.y = center.y;
                score += 100;
            } else {
                loseLife();
            }
        }
    });
}

function loseLife() {
    lives--;
    document.getElementById("lives").innerText = lives;

    player.x = 1;
    player.y = 1;

    if (lives <= 0) {
        endGame();
    }
}

// ================== RANKING LOCAL ==================

function saveScore(finalScore) {
    let ranking = JSON.parse(localStorage.getItem("arquivomanRanking")) || [];
    ranking.push(finalScore);
    ranking.sort((a, b) => b - a);
    ranking = ranking.slice(0, 5);

    localStorage.setItem("arquivomanRanking", JSON.stringify(ranking));
}

function loadRanking() {
    let ranking = JSON.parse(localStorage.getItem("arquivomanRanking")) || [];
    let list = document.getElementById("rankingList");
    list.innerHTML = "";

    ranking.forEach(score => {
        let li = document.createElement("li");
        li.innerText = score + " pontos";
        list.appendChild(li);
    });
}

function endGame() {
    gameOver = true;
    document.getElementById("message").innerText = "GAME OVER 💀";

    saveScore(score);
    loadRanking();

    setTimeout(() => {
        document.getElementById("gameUI").style.display = "none";
        document.getElementById("startScreen").style.display = "block";
    }, 2000);
}

// ================== NÍVEL ==================

function checkLevelComplete() {
    let remaining = 0;

    for (let row of map) {
        for (let tile of row) {
            if (tile === 2) remaining++;
        }
    }

    if (remaining === 0) {
        level++;
        document.getElementById("level").innerText = level;
        createMap();
    }
}

// ================== LOOP ==================

setInterval(() => {
    if (!gameOver) moveEnemies();
}, 400);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawMap();
        drawPlayer();
        drawEnemies();
    }

    requestAnimationFrame(gameLoop);
}

loadRanking();
gameLoop();

