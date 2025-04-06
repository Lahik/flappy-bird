
//! board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//! bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;

//! pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let pipeGap = boardHeight/4;

let topPipeImg;
let bottomPipeImg;

//! physics
let pipeVelocityX = -2;
let birdVelocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameStarted = false;

//! game audio
let gameSound = new Audio("audio/bgm_mario.mp3");
let jumpSound = new Audio("audio/sfx_wing.wav");
let pointSound = new Audio("audio/sfx_point.wav");
let dieSound = new Audio("audio/sfx_die.wav");
let hitSound = new Audio("audio/sfx_hit.wav");

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    document.addEventListener("keydown", jump);
}

function renderGraphics() {
    requestAnimationFrame(renderGraphics);

    if(gameOver) {
        context.fillStyle = "red";
        context.font = "45px Courier New";
        context.fillText("Game Over", boardWidth/2 - 100, boardHeight/2);
        context.fillText("Score: " + Math.floor(score), boardWidth/2 - 100, boardHeight/2 + 50);
        return;
    };
    
    context.clearRect(0, 0, boardWidth, boardHeight);

    //! bird
    birdVelocityY += gravity;
    bird.y += birdVelocityY;
    bird.y = Math.max(bird.y + birdVelocityY, 0); // Prevent bird from going off the top of the screen
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //! pipes 
    for(let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += pipeVelocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if(!pipe.passed && pipe.x + pipe.width < bird.x) {
            score += .5;
            pipe.passed = true;
            pointSound.play();
        }
        
        if(detectCollision(bird, pipe)) {
            gameSound.pause();
            gameOver = true;
        }
    }
    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);

    context.fillStyle = "white";
    context.font = "45px Sans-serif";
    context.fillText(score, 5, 45);
}

function placePipes() {
    if(gameOver) return;
    let randomPipeY = pipeY - pipeHeight/4 - Math.random() * (pipeHeight / 2);

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    
    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + pipeGap,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);
    pipeArray.push(bottomPipe);
} 

function jump(e) {
    if(e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        birdVelocityY = -6;

        jumpSound.currentTime = 0; // rewind to start if already playing
        jumpSound.play();

        if (!gameStarted) {
            gameSound.play();
            gameStarted = true;
            requestAnimationFrame(renderGraphics);
            setInterval(placePipes, 1500);
        }
        
        if(gameOver) {
            gameSound.currentTime = 0; // rewind to start if already playing
            gameSound.play();
            gameOver = false;
            bird.y = boardHeight/2 - 100;
            birdVelocityY = 0;
            score = 0;
            pipeArray = [];
        }
    }
}

function detectCollision(bird, pipe) {
    isBirdFalled = bird.y + bird.height > boardHeight;
    isBirdHitPipe = bird.x < pipe.x + pipe.width && // checks the left position of bird is less than the right position of the pipe 
                    bird.x + bird.width > pipe.x && // checks the right position of the bird is greater than the left position of the pipe

                    bird.y < pipe.y + pipe.height && // checks the top position of the bird is less than the bottom position of the pipe
                    bird.y + bird.height > pipe.y // checks the bottom position of the bird is greater than the top position of the pipe

    if(isBirdFalled) {
        dieSound.play();
    }else if(isBirdHitPipe) {
        hitSound.play();
    }

    return isBirdFalled || isBirdHitPipe; 
}