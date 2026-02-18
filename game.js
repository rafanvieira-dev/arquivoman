// =============================
// CONFIG
// =============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 30;
const rows = 20;
const cols = 20;

let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let gameStarted = false;

let powerMode = false;
let powerTimer = 0;
let totalFiles = 0;

// =============================
// GERAR MAPA 20x20
// =============================

let map = [];

function generateMap() {

  map = [];
  totalFiles = 0;

  for (let row = 0; row < rows; row++) {

    let line = [];

    for (let col = 0; col < cols; col++) {

      if (
        row === 0 || col === 0 ||
        row === rows - 1 || col === cols - 1
      ) {
        line.push(1); // parede
      } else {
        line.push(2); // arquivo
        totalFiles++;
      }
    }

    map.push(line);
  }

  // especiais (computadores)
  map[1][1] = 3;
  map[1][cols - 2] = 3;
  map[rows - 2][1] = 3;
  map[rows - 2][cols - 2] = 3;
}

// =============================
// PLAYER
// =============================

let player = { x: 1, y: 1 };

// =============================
// INIMIGOS
// =============================

let enemies = [];

function spawnEnemies() {
  enemies = [
    { x: 10, y: 10 },
    { x: 11, y: 10 },
    { x: 10, y: 11 }
  ];
}

// =============================
// START GAME
// =============================

function startGame() {

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";

  score = 0;
  lives = 3;
  level = 1;
  gameOver = false;
  gameStarted = true;

  generateMap();
  spawnEnemies();
  updateHUD();
  gameLoop();
}

// =============================
// HUD
// =============================

function updateHUD() {
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
  document.getElementById("level").innerText = level;

  document.getElementById("powerTimer").innerText =
    powerMode ? "💻 " + powerTimer.toFixed(1) : "";
}

// =============================
// DESENHAR MAPA
// =============================

function drawMap() {

  for (let row = 0; row < map.length; row++) {

    for (let col = 0; col < map[row].length; col++) {

      let tile = map[row][col];

      if (tile === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (tile === 2) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
          col * tileSize + tileSize/2,
          row * tileSize + tileSize/2,
          4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      if (tile === 3) {
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(
          col * tileSize + tileSize/2,
          row * tileSize + tileSize/2,
          8,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

// =============================
// DESENHAR PLAYER
// =============================

function drawPlayer() {
  ctx.fillStyle = powerMode ? "yellow" : "orange";
  ctx.fillRect(
    player.x * tileSize,
    player.y * tileSize,
    tileSize,
    tileSize
  );
}

// =============================
// DESENHAR INIMIGOS
// =============================

function drawEnemies() {

  enemies.forEach(enemy => {

    ctx.fillStyle = powerMode ? "blue" : "red";

    ctx.fillRect(
      enemy.x * tileSize + 5,
      enemy.y * tileSize + 5,
      tileSize - 10,
      tileSize - 10
    );
  });
}

// =============================
// MOVIMENTO PLAYER
// =============================

document.addEventListener("keydown", (e) => {

  if (!gameStarted || gameOver) return;

  let newX = player.x;
  let newY = player.y;

  if (e.key === "ArrowUp") newY--;
  if (e.key === "ArrowDown") newY++;
  if (e.key === "ArrowLeft") newX--;
  if (e.key === "ArrowRight") newX++;

  if (map[newY] && map[newY][newX] !== 1) {

    player.x = newX;
    player.y = newY;

    let tile = map[newY][newX];

    if (tile === 2) {
      map[newY][newX] = 0;
      score += 10;
      totalFiles--;
    }

    if (tile === 3) {
      map[newY][newX] = 0;
      activatePower();
    }

    if (totalFiles <= 0) {
      nextLevel();
    }

    updateHUD();
  }
});

// =============================
// INIMIGOS
// =============================

function moveEnemies() {

  enemies.forEach(enemy => {

    let dirs = [
      {x:1,y:0},
      {x:-1,y:0},
      {x:0,y:1},
      {x:0,y:-1}
    ];

    let dir = dirs[Math.floor(Math.random()*4)];

    let newX = enemy.x + dir.x;
    let newY = enemy.y + dir.y;

    if (map[newY] && map[newY][newX] !== 1) {
      enemy.x = newX;
      enemy.y = newY;
    }

    if (enemy.x === player.x && enemy.y === player.y) {

      if (powerMode) {
        enemy.x = 10;
        enemy.y = 10;
        score += 100;
      } else {
        loseLife();
      }
    }
  });
}

// =============================
// POWER MODE
// =============================

function activatePower() {
  powerMode = true;
  powerTimer = 30;
}

function updatePower() {

  if (powerMode) {
    powerTimer -= 1/60;

    if (powerTimer <= 0) {
      powerMode = false;
      powerTimer = 0;
    }
  }
}

// =============================
// VIDAS
// =============================

function loseLife() {

  lives--;

  if (lives <= 0) {
    alert("Game Over!");
    document.location.reload();
  }

  player.x = 1;
  player.y = 1;

  updateHUD();
}

// =============================
// PRÓXIMO LEVEL
// =============================

function nextLevel() {

  level++;

  generateMap();
  spawnEnemies();

  player.x = 1;
  player.y = 1;

  updateHUD();
}

// =============================
// LOOP
// =============================

function gameLoop() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPlayer();
  drawEnemies();

  moveEnemies();
  updatePower();
  updateHUD();

  requestAnimationFrame(gameLoop);
}
