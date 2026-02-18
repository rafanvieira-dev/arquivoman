// =============================
// CONFIG
// =============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 30;

let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;

let gameStarted = false;

// =============================
// MAPA FIXO (TODAS LINHAS IGUAIS)
// =============================

let map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,2,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,1,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,2,2,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,2,1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1,2,1],
  [1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// =============================
// PLAYER
// =============================

let player = {
  x: 1,
  y: 1
};

// =============================
// INICIAR JOGO (usa seu botão)
// =============================

function startGame() {

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";

  gameStarted = true;
  gameOver = false;

  score = 0;
  lives = 3;
  level = 1;

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
}

// =============================
// DESENHAR MAPA (CORRIGIDO)
// =============================

function drawMap() {

  for (let row = 0; row < map.length; row++) {

    if (!map[row]) continue;

    for (let col = 0; col < map[row].length; col++) {

      if (map[row][col] === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }

      if (map[row][col] === 2) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
          col * tileSize + tileSize/2,
          row * tileSize + tileSize/2,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

// =============================
// PLAYER
// =============================

function drawPlayer() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(
    player.x * tileSize,
    player.y * tileSize,
    tileSize,
    tileSize
  );
}

// =============================
// MOVIMENTO
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

    if (map[newY][newX] === 2) {
      map[newY][newX] = 0;
      score += 10;
      updateHUD();
    }
  }
});

// =============================
// GAME LOOP
// =============================

function gameLoop() {

  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}
