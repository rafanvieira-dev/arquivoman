// =============================
// CONFIG
// =============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 30;

let score = 0;
let lives = 3;
let level = 1;
let gameStarted = false;

let powerMode = false;
let powerTimer = 0;
let totalFiles = 0;

let enemyMoveDelay = 20;
let enemyMoveCounter = 0;

// =============================
// MAPA LABIRINTO 20x20
// 0 = vazio
// 1 = parede
// 2 = arquivo
// 3 = especial
// =============================

let map = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,3,1],
[1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,2,1],
[1,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,1],
[1,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1],
[1,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
[1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,2,1],
[1,2,2,2,1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,1],
[1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1],
[0,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,0], // <- túnel lateral
[1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,2,1,1,1],
[1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1],
[1,3,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,3,1],
[1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// contar arquivos
function countFiles(){
  totalFiles = 0;
  for(let r=0;r<map.length;r++){
    for(let c=0;c<map[r].length;c++){
      if(map[r][c] === 2) totalFiles++;
    }
  }
}
countFiles();

// =============================
// PLAYER começa no centro
// =============================

let player = { x: 9, y: 9 };

// =============================
// INIMIGOS
// =============================

let enemies = [
  { x: 9, y: 10, color: "red" },
  { x: 10, y: 10, color: "pink" },
  { x: 8, y: 10, color: "cyan" },
  { x: 11, y: 10, color: "orange" }
];

// =============================
// START
// =============================

function startGame(){
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameUI").style.display = "block";
  gameStarted = true;
  gameLoop();
}

// =============================
// DESENHAR
// =============================

function drawMap(){
  for(let r=0;r<map.length;r++){
    for(let c=0;c<map[r].length;c++){

      let tile = map[r][c];

      if(tile===1){
        ctx.fillStyle="blue";
        ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
      }

      if(tile===2){
        ctx.fillStyle="white";
        ctx.beginPath();
        ctx.arc(c*tileSize+15,r*tileSize+15,4,0,Math.PI*2);
        ctx.fill();
      }

      if(tile===3){
        ctx.fillStyle="cyan";
        ctx.beginPath();
        ctx.arc(c*tileSize+15,r*tileSize+15,8,0,Math.PI*2);
        ctx.fill();
      }
    }
  }
}

function drawPlayer(){
  ctx.fillStyle = powerMode ? "yellow" : "lime";
  ctx.fillRect(player.x*tileSize,player.y*tileSize,tileSize,tileSize);
}

function drawEnemies(){
  enemies.forEach(e=>{
    ctx.fillStyle = powerMode ? "blue" : e.color;
    ctx.fillRect(e.x*tileSize+5,e.y*tileSize+5,tileSize-10,tileSize-10);
  });
}

// =============================
// MOVIMENTO PLAYER + TÚNEL
// =============================

document.addEventListener("keydown",e=>{

  let newX = player.x;
  let newY = player.y;

  if(e.key==="ArrowUp") newY--;
  if(e.key==="ArrowDown") newY++;
  if(e.key==="ArrowLeft") newX--;
  if(e.key==="ArrowRight") newX++;

  // túnel lateral
  if(newX < 0) newX = map[0].length - 1;
  if(newX >= map[0].length) newX = 0;

  if(map[newY] && map[newY][newX] !== 1){

    player.x = newX;
    player.y = newY;

    if(map[newY][newX]===2){
      map[newY][newX]=0;
      score+=10;
      totalFiles--;
    }

    if(map[newY][newX]===3){
      map[newY][newX]=0;
      powerMode=true;
      powerTimer=15;
    }
  }
});

// =============================
// INIMIGOS LENTOS
// =============================

function moveEnemies(){

  enemyMoveCounter++;
  if(enemyMoveCounter < enemyMoveDelay) return;
  enemyMoveCounter = 0;

  enemies.forEach(e=>{

    let dirs = [
      {x:1,y:0},
      {x:-1,y:0},
      {x:0,y:1},
      {x:0,y:-1}
    ];

    let dir = dirs[Math.floor(Math.random()*4)];
    let newX = e.x + dir.x;
    let newY = e.y + dir.y;

    if(map[newY] && map[newY][newX] !== 1){
      e.x = newX;
      e.y = newY;
    }

    if(e.x===player.x && e.y===player.y){

      if(powerMode){
        e.x=9; e.y=10;
        score+=100;
      } else {
        lives--;
        player.x=9; player.y=9;
      }
    }
  });
}

// =============================
// POWER TIMER
// =============================

function updatePower(){
  if(powerMode){
    powerTimer -= 1/60;
    if(powerTimer<=0){
      powerMode=false;
    }
  }
}

// =============================
// LOOP
// =============================

function gameLoop(){
  if(!gameStarted) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawMap();
  drawPlayer();
  drawEnemies();

  moveEnemies();
  updatePower();

  requestAnimationFrame(gameLoop);
}
