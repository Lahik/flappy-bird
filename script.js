
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

    context.fillStyle = "green";
    context.fillRect(bird.x, bird.y, bird.width, bird.height);

    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    requestAnimationFrame(renderGraphics);
    setInterval(placePipes, 1500); 
    document.addEventListener("keydown", jump);
}

function renderGraphics() {
    requestAnimationFrame(renderGraphics);

    if(gameOver) return;
    
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

        if(detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }
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
    }
}

function detectCollision(bird, pipe) {
    return bird.y + bird.height > boardHeight // checks if the bird is on the ground
            || 
           (bird.x < pipe.x + pipe.width && // checks the left position of bird is less than the right position of the pipe 
           bird.x + bird.width > pipe.x && // checks the right position of the bird is greater than the left position of the pipe

           bird.y < pipe.y + pipe.height && // checks the top position of the bird is less than the bottom position of the pipe
           bird.y + bird.height > pipe.y) // checks the bottom position of the bird is greater than the top position of the pipe
}