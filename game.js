const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20;

let score = 0;
let lives = 3;
let level = 1;
let gameStarted = false;

let powerMode = false;
let powerTimer = 0;
let totalFiles = 0;

let enemyMoveDelay = 10;
let enemyMoveCounter = 0;

// =============================
// MAPA CLÁSSICO PAC-MAN 28x31
// =============================

let originalMap = [

[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,3,1],
[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
[1,1,1,1,1,1,2,1,1,1,1,1,0,0,0,0,1,1,1,1,1,2,1,1,1,1,1,1],
[0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0],
[1,1,1,1,1,1,2,1,0,1,1,0,1,1,1,1,0,1,1,0,2,1,1,1,1,1,1,1],
[0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0],
[1,1,1,1,1,1,2,1,0,1,1,1,1,0,0,1,1,1,1,0,2,1,1,1,1,1,1,1],
[0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0],
[1,1,1,1,1,1,2,1,1,1,1,1,0,0,0,0,1,1,1,1,2,1,1,1,1,1,1,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
[1,3,2,2,1,1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,1,1,2,2,3,1],
[1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1,1],
[1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
[1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

];

let map = [];

function resetMap(){
  map = JSON.parse(JSON.stringify(originalMap));
  countFiles();
}

function countFiles(){
  totalFiles = 0;
  for(let r=0;r<map.length;r++){
    for(let c=0;c<map[r].length;c++){
      if(map[r][c]===2) totalFiles++;
    }
  }
}

let player = { x: 13, y: 17 };

let enemies = [
  { x: 13, y: 11, color: "red" },
  { x: 12, y: 11, color: "pink" },
  { x: 14, y: 11, color: "cyan" },
  { x: 13, y: 12, color: "orange" }
];

function updateHUD(){
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
  document.getElementById("level").innerText = level;
  document.getElementById("powerTimer").innerText =
    powerMode ? "Power: " + Math.ceil(powerTimer) : "";
}

function startGame(){
  document.getElementById("startScreen").style.display="none";
  document.getElementById("gameUI").style.display="block";
  resetMap();
  gameStarted=true;
  updateHUD();
  gameLoop();
}

document.addEventListener("keydown",e=>{
  if(!gameStarted) return;

  let newX=player.x;
  let newY=player.y;

  if(e.key==="ArrowUp") newY--;
  if(e.key==="ArrowDown") newY++;
  if(e.key==="ArrowLeft") newX--;
  if(e.key==="ArrowRight") newX++;

  if(newX<0) newX=map[0].length-1;
  if(newX>=map[0].length) newX=0;

  if(map[newY] && map[newY][newX]!==1){
    player.x=newX;
    player.y=newY;

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

    if(totalFiles<=0){
      level++;
      resetMap();
    }

    updateHUD();
  }
});

function moveEnemies(){
  enemyMoveCounter++;
  if(enemyMoveCounter<enemyMoveDelay) return;
  enemyMoveCounter=0;

  enemies.forEach(e=>{
    let dx=player.x-e.x;
    let dy=player.y-e.y;

    let moveX=dx!==0?dx/Math.abs(dx):0;
    let moveY=dy!==0?dy/Math.abs(dy):0;

    if(map[e.y] && map[e.y][e.x+moveX]!==1){
      e.x+=moveX;
    } else if(map[e.y+moveY] && map[e.y+moveY][e.x]!==1){
      e.y+=moveY;
    }

    if(e.x===player.x && e.y===player.y){
      if(powerMode){
        e.x=13; e.y=11;
        score+=100;
      } else {
        lives--;
        player.x=13; player.y=17;
        if(lives<=0){
          alert("Game Over");
          location.reload();
        }
      }
      updateHUD();
    }
  });
}

function updatePower(){
  if(powerMode){
    powerTimer-=1/60;
    if(powerTimer<=0){
      powerMode=false;
    }
  }
}

function drawMap(){
  for(let r=0;r<map.length;r++){
    for(let c=0;c<map[r].length;c++){
      if(map[r][c]===1){
        ctx.fillStyle="blue";
        ctx.fillRect(c*tileSize,r*tileSize,tileSize,tileSize);
      }
      if(map[r][c]===2){
        ctx.fillStyle="white";
        ctx.beginPath();
        ctx.arc(c*tileSize+10,r*tileSize+10,3,0,Math.PI*2);
        ctx.fill();
      }
      if(map[r][c]===3){
        ctx.fillStyle="cyan";
        ctx.beginPath();
        ctx.arc(c*tileSize+10,r*tileSize+10,6,0,Math.PI*2);
        ctx.fill();
      }
    }
  }
}

function drawPlayer(){
  ctx.fillStyle=powerMode?"yellow":"lime";
  ctx.fillRect(player.x*tileSize,player.y*tileSize,tileSize,tileSize);
}

function drawEnemies(){
  enemies.forEach(e=>{
    ctx.fillStyle=powerMode?"blue":e.color;
    ctx.fillRect(e.x*tileSize+3,e.y*tileSize+3,tileSize-6,tileSize-6);
  });
}

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
