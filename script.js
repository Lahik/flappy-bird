
//! board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//! bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdsLoaded = false;
let birdRotation = 0;

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

//! bird animation
let birdFrames = [];
let currentBirdFrame = 0;
let birdFrameInterval = 0;

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

    // Load all bird frames and then start the game
    let loadedFrames = 0;
    for (let i = 1; i <= 5; i++) {
        let frame = new Image();
        frame.src = `bird_images/flappybird${i}.png`;
        frame.onload = function() {
            loadedFrames++;
            if (loadedFrames === 5) {
                birdsLoaded = true;
                context.drawImage(birdFrames[0], bird.x, bird.y, bird.width, bird.height);
            }
        };
        birdFrames.push(frame);
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    document.addEventListener("keydown", jump);
    document.addEventListener("touchstart", jump);
}

function renderGraphics() {
    requestAnimationFrame(renderGraphics);

    if(gameOver) {
        context.fillStyle = "red";
        context.font = "45px Courier New";
        context.fillText("Game Over", boardWidth/2 - 100, boardHeight/2);
        context.fillText("Score: " + Math.floor(score), boardWidth/2 - 100, boardHeight/2 + 50);
        return;
    }
    
    context.clearRect(0, 0, boardWidth, boardHeight);
    
    // Cycle through bird frames
    birdFrameInterval++;
    if (birdFrameInterval % 5 === 0) { // adjust speed of flapping
        currentBirdFrame = (currentBirdFrame + 1) % birdFrames.length;
    }

    // Update bird rotation based on velocity
    if (birdVelocityY > 0) {
        // Falling: rotate clockwise
        birdRotation = Math.min(birdRotation + 0.1, Math.PI / 2); // Limit rotation to 90 degrees max
    } else if (birdVelocityY < 0) {
        // Jumping: rotate anti-clockwise
        birdRotation = Math.max(birdRotation - 0.1, -Math.PI / 4); // Limit rotation to -45 degrees max
    }

    // Save the context state before rotating
    context.save();
    
    // Set the rotation origin to the bird's center
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(birdRotation);
    
    // Draw current bird frame (adjust for rotation)
    context.drawImage(birdFrames[currentBirdFrame], -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Restore the context state after rotation
    context.restore();

    //! bird
    birdVelocityY += gravity;
    bird.y += birdVelocityY;
    bird.y = Math.max(bird.y + birdVelocityY, 0); // Prevent bird from going off the top of the screen

    //! pipes 
    for(let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += ((boardWidth > 600) && (pipe.x > 500) ? -15 : pipeVelocityX); // Increase speed for larger screens
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
    if(e.type === "touchstart" || e.code == "Space" || e.code == "ArrowUp") {
        birdVelocityY = -6;

        jumpSound.currentTime = 0; // rewind to start if already playing
        jumpSound.play();

        if (!gameStarted && birdsLoaded) {
            setTimeout(() => {
                gameSound.play();
            }, 100);
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