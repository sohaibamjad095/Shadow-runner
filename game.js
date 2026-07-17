const jumpSound = new Audio("jump.mp3");
const hitSound = null;
let highScore = localStorage.getItem("highScore") || 0;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const isMobile = window.innerWidth <= 768;
let gameStarted = false;
let gameOver = false;
let paused = false;
let jumps = 0;
let score = 0;
let speed = isMobile ? 8 : 8;
let dashCooldown = 0;
let dashFrames = 0;
let gameStartTime = 0;
let touchleft = false;
let touchright = false;
ctx.textAlign = "left";
let restartButton = {
    x: 450,
    y: 290,
    width: 300,
    height: 70
};
const player = {
    x: 80,
    y: 360,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false
};

const gravity = 0.55;

let obstacles = [];
let fogOffset = 0;
let milestoneText = "";

function resetGame(){
    score = 0;
    speed = 8;
    obstacles = [];

    player.x = 80;
    player.y = 360;
    player.velocityY = 0;
    player.jumping = false;
milestoneText = "";
    gameOver = false;
}

document.addEventListener("keydown", e => {
    if(e.code === "Space"){
        if(!gameStarted){
            gameStarted = true;
            gameStartTime = Date.now();
            return;
        }

    if(gameStarted && !gameOver && jumps < 2){
    player.velocityY = -13;
    player.jumping = true;
    jumps++;

    jumpSound.currentTime = 0;
    jumpSound.play();
}
    }
});

canvas.addEventListener("click", function(e){
    if(!gameOver) return;

    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if(
        mouseX > restartButton.x &&
        mouseX < restartButton.x + restartButton.width &&
        mouseY > restartButton.y &&
        mouseY < restartButton.y + restartButton.height
    ){
        resetGame();
    }
});

function spawnObstacle(){

    if(!gameStarted || gameOver) return;

    const rand = Math.random();

    let obstacle;

    if(rand < 0.20){

        // Small spike
        obstacle = {
            x: canvas.width,
            y: 390,
            width: 20,
            height: 20,
            color:"#ef4444"
        };

    } else if(rand < 0.40){

        // Pillar
        obstacle = {
            x: canvas.width,
            y: 350,
            width: 25,
            height: 60,
            color:"#f97316"
        };

    } else if(rand < 0.60){

        // Wide block
        obstacle = {
            x: canvas.width,
            y: 375,
            width: 50,
            height: 35,
            color:"#a855f7"
        };

    } else if(rand < 0.80){

        // Thin tower
        obstacle = {
            x: canvas.width,
            y: 330,
            width: 15,
            height: 80,
            color:"#06b6d4"
        };

    } else if(rand < 0.90){

        // Flying obstacle
        obstacle = {
            x: canvas.width,
            y: 250,
            width: 30,
            height: 20,
            color:"#38bdf8",
            flying:true
        };

    } else if(rand < 0.95){

        // Large enemy
        obstacle = {
            x: canvas.width,
            y: 340,
            width: 50,
            height: 70,
            color:"#dc2626"
        };

    } else {

        // Long ground obstacle
        obstacle = {
            x: canvas.width,
            y: 385,
            width: 60,
            height: 25,
            color:"#eab308"
        };

    }

    obstacles.push(obstacle);
}
setInterval(spawnObstacle, 1000);

function update(){
    if(dashCooldown > 0){
    dashCooldown--;
}

if(dashFrames > 0){
    dashFrames--;
}
        if(score > highScore){
    highScore = score;
    localStorage.setItem("highScore", highScore);
}
  if(score === 100){
    milestoneText = "GOOD START!";
}
if(score === 500){
    obstacles.push({
        x: canvas.width,
        y: 300,
        width: 120,
        height: 120,
        color: "#dc2626"
    });
}

if(score === 300){
    milestoneText = "SURVIVOR!";
}

if(score === 500){
    milestoneText = "LEGEND!";
}

if(score === 1000){
    milestoneText = "SHADOW MASTER!";
}

fogOffset += speed * 0.25;

    if(!gameStarted || gameOver) return;

    player.velocityY += gravity;
    player.y += player.velocityY;

    if(player.y >= 360){
        player.y = 360;
        player.jumping = false;
        jumps = 0;
    }

    if(score < 200){
        speed += 0.001;
    } else if(score < 500){
        speed += 0.003;
    } else {
        speed += 0.005;
    }

    for(let i = obstacles.length - 1; i >= 0; i--){

    obstacles[i].x -= speed + (dashFrames > 0 ? 12 : 0);

    const o = obstacles[i];

    if(o.flying){
        o.y += Math.sin(Date.now() * 0.005) * 1.5;
    }

    if(
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ){
            if(hitSound){
                // hit sound disabled
            }
            gameOver = true;   
        }

        if(o.x + o.width < 0){
            obstacles.splice(i,1);
        }
}
score++;
}

function drawBackground(){

    const grad = ctx.createLinearGradient(0,0,0,500);
    grad.addColorStop(0,"#020617");
    grad.addColorStop(1,"#0f172a");

    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // stars
    for(let i=0;i<120;i++){

    const alpha =
    0.4 + Math.sin(Date.now()*0.002 + i)*0.6;

    ctx.fillStyle =
    `rgba(255,255,255,${alpha})`;

    ctx.fillRect(
        (i*137)%1200,
        (i*71)%250,
        2,
        2
    );
}

    // mountains
    ctx.fillStyle = "#1e293b";

    ctx.beginPath();
    ctx.moveTo(0,410);
    ctx.lineTo(180,220);
    ctx.lineTo(350,410);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250,410);
    ctx.lineTo(500,180);
    ctx.lineTo(720,410);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(600,410);
    ctx.lineTo(850,240);
    ctx.lineTo(1000,410);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.04)";

for(let i=0;i<8;i++){

    ctx.fillRect(
        ((i*250)-fogOffset)%1400,
        280,
        220,
        35
    );
}

    // ground
    ctx.fillStyle = "#334155";
    ctx.fillRect(0,410,900,90);
}

function drawPlayer(){

    const grad = ctx.createRadialGradient(
        player.x + 20,
        player.y + 20,
        5,
        player.x + 20,
        player.y + 20,
        25
    );

    grad.addColorStop(0,"#86efac");
    grad.addColorStop(1,"#16a34a");

    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(
        player.x + 20,
        player.y + 20,
        20,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawObstacles(){

    for(const o of obstacles){

        ctx.fillStyle = o.color;

        ctx.fillRect(
            o.x,
            o.y,
            o.width,
            o.height
        );
    }
}

function drawHUD(){

if(isMobile){

    ctx.fillStyle = "rgba(255,255,255,0.15)";

    ctx.fillRect(20, 420, 180, 60);
    ctx.fillRect(700, 420, 180, 60);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";

    ctx.fillText("JUMP", 75, 458);
    ctx.fillText("DASH", 755, 458);

}
  ctx.fillText(
    `Best: ${Math.floor(highScore/10)}`,
    50,
    90
);
ctx.fillStyle = "#38bdf8";
ctx.font = "20px Arial";

ctx.fillText(
    dashCooldown <= 0 ? "DASH READY" : "DASH RECHARGING",
    50,
    130
);
    ctx.textAlign = "left";

    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";

    ctx.fillText(
        `Score: ${Math.floor(score/10)}`,
        50,
        50
    );
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 30px Arial";

    ctx.fillText(
        milestoneText,
        350,
        50
    );
    ctx.fillStyle = "#64748b";
ctx.font = "18px Arial";

if(!isMobile && Date.now() - gameStartTime < 4000){

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "SPACE: Jump • SHIFT: Dash • P: Pause",
        canvas.width / 2,
        100
    );

    ctx.textAlign = "left";
}
}

function drawStartScreen(){

    drawBackground();

    ctx.textAlign = "center";

    ctx.fillStyle = `rgba(255,255,255,${
0.5 + Math.sin(Date.now()*0.002)*0.5
})`;
    ctx.font = "bold 95px Arial";
    ctx.fillText(
        "SHADOW RUNNER",
        canvas.width/2,
        180
    );

    ctx.fillStyle = "#94a3b8";
    ctx.font = "30px Arial";
    ctx.fillText(
        "Run. Jump. Survive.",
        canvas.width/2,
        225
    );

    const pulse = Math.sin(Date.now()*0.005)*10;

    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 50px Arial";
    ctx.shadowColor = "#22c55e";
ctx.shadowBlur = 0
    ctx.fillText(
    isMobile ? "TAP TO START" : "PRESS SPACE TO START",
    canvas.width/2,
    340 + pulse
);
    ctx.fillStyle = "#64748b";
ctx.font = "18px Arial";}

function drawGameOver(){

    drawBackground();
    drawPlayer();
    drawObstacles();

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillStyle = "#111827";
ctx.beginPath();
ctx.arc(player.x + 20, player.y + 12, 12, 0, Math.PI * 2);
ctx.fill();

ctx.fillRect(player.x + 10, player.y + 20, 20, 20);

    ctx.textAlign = "center";

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 42px Arial";
    ctx.fillText(
        "YOU WERE CONSUMED BY THE SHADOWS",
        canvas.width/2,
        180
    );

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(
        `Final Score: ${Math.floor(score/10)}`,
        canvas.width/2,
        240
    );

    const playerGrad = ctx.createLinearGradient(
    player.x,
    player.y,
    player.x,
    player.y + player.height
);

playerGrad.addColorStop(0,"#4ade80");
playerGrad.addColorStop(1,"#16a34a");

ctx.fillStyle = playerGrad;
ctx.font = "bold 34px Arial";

ctx.fillStyle = "#22c55e";

ctx.fillRect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height
);

ctx.fillStyle = "white";
ctx.font = "bold 32px Arial";

ctx.fillText(
    "RESTART",
    canvas.width/2,
    335
);
ctx.fillStyle = "#22c55e";

ctx.fillRect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height
);

ctx.fillStyle = "white";
ctx.font = "bold 28px Arial";

ctx.fillText(
    "RESTART",
    restartButton.x + 150,
    restartButton.y + 40
);
}

function drawGame(){

    drawBackground();
    drawPlayer();
    drawObstacles();
    // drawCoins();
    drawHUD();
}

function loop(){

    if(paused){
        drawGame();

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width/2, 250);

        requestAnimationFrame(loop);
        return;
    }

    if(!gameStarted){
        drawStartScreen();
        requestAnimationFrame(loop);
        return;
    }

    if(gameOver){
        drawGameOver();
        requestAnimationFrame(loop);
        return;
    }

    update();
    drawGame();

    requestAnimationFrame(loop);
}

canvas.addEventListener("touchstart", e => {

    if(!gameStarted){
        gameStarted = true;
        gameStartTime = Date.now();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    if(touchX < canvas.width / 2){

        if(jumps < 2){
            player.velocityY = -13;
            player.jumping = true;
            jumps++;
        }

    } else {

        if(dashCooldown <= 0){
            dashFrames = 15;
            dashCooldown = 180;
        }

    }

});
document.addEventListener("keydown", e => {
    if(e.code === "ShiftLeft" && dashCooldown <= 0){
        dashFrames = 15;
        dashCooldown = 180;
    }
});

document.addEventListener("keydown", e => {
    if(e.code === "KeyP" && gameStarted && !gameOver){
        paused = !paused;
    }
});

canvas.addEventListener("touchstart", function(e){

    if(!gameOver) return;

    const rect = canvas.getBoundingClientRect();

    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    if(
        touchX > restartButton.x &&
        touchX < restartButton.x + restartButton.width &&
        touchY > restartButton.y &&
        touchY < restartButton.y + restartButton.height
    ){
        resetGame();
    }

});

loop();