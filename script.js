const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const currentScoreEl = document.getElementById('currentScore');
const finalScoreEl = document.getElementById('finalScore');
const highScoreEl = document.getElementById('highScoreDisplay');
const restartBtn = document.getElementById('restartBtn');

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const BASE_SPEED = 6;
const MAX_SPEED = 15;
const SPEED_INCREMENT = 0.001;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let frames = 0;
let score = 0;
let highScore = localStorage.getItem('neonDinoHighScore') || 0;
let gameSpeed = BASE_SPEED;
let obstacles = [];
let particles = [];

// Resize handling
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Input Handling ---
let keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'START') {
    startGame();
  }
  if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'GAMEOVER') {
    resetGame();
  }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);
window.addEventListener('touchstart', () => {
  if (gameState === 'START') startGame();
  else if (gameState === 'PLAYING') player.jump();
  else if (gameState === 'GAMEOVER') resetGame();
});

// --- Classes ---

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = 100;
    this.y = canvas.height - 150 - this.height;
    this.dy = 0;
    this.grounded = true;
    this.jumpTimer = 0;

    // Sprite Load
    this.sprite = new Image();
    this.sprite.src = 'assets/run.png';
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // No glow in light mode, just the sprite or fallback

    if (this.sprite.complete && this.sprite.naturalHeight !== 0) {
      ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }

  update() {
    // Jump Logic
    if (gameState === 'PLAYING') {
      if ((keys['Space'] || keys['ArrowUp']) && this.grounded) {
        this.jump();
      }
    }

    this.dy += GRAVITY;
    this.y += this.dy;

    // Ground Collision
    const groundLevel = canvas.height - 150;
    if (this.y + this.height > groundLevel) {
      this.y = groundLevel - this.height;
      this.dy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
  }

  jump() {
    if (!this.grounded) return;
    this.dy = JUMP_FORCE;
    this.grounded = false;
    // Dust particles color - grey
    createParticles(this.x + this.width / 2, this.y + this.height, 5, '#888');
  }
}

class Obstacle {
  constructor() {
    this.width = 40 + Math.random() * 30;
    this.height = 40 + Math.random() * 50;
    this.x = canvas.width + this.width;
    this.y = canvas.height - 150 - this.height;
    this.color = '#ff4757'; // Reddish/Coral for visibility
    this.markedForDeletion = false;
  }

  draw() {
    ctx.save();
    ctx.fillStyle = this.color;

    // Simple shape, no glow
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // border
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    this.x -= gameSpeed;
    if (this.x + this.width < 0) this.markedForDeletion = true;
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * -2 - 1;
    this.color = color;
    this.life = 1.0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 0.02;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

// --- Game Logic ---

const player = new Player();

function createParticles(x, y, amount, color) {
  for (let i = 0; i < amount; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function spawnObstacles() {
  if (frames % Math.floor(1000 / gameSpeed * 1.5) === 0) {
    if (Math.random() < 0.5) {
      obstacles.push(new Obstacle());
    }
  }
  if (obstacles.length > 0) {
    let lastObstacle = obstacles[obstacles.length - 1];
    if (canvas.width - lastObstacle.x < 300) return;
  }
  if (Math.random() < 0.02) {
    obstacles.push(new Obstacle());
  }
}

function checkCollisions() {
  for (let obs of obstacles) {
    // AABB Collision (slightly more forgiving for sprite)
    const padding = 10;
    if (
      player.x + padding < obs.x + obs.width &&
      player.x + player.width - padding > obs.x &&
      player.y + padding < obs.y + obs.height &&
      player.y + player.height - padding > obs.y
    ) {
      gameOver();
    }
  }
}

function startGame() {
  gameState = 'PLAYING';
  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  gameSpeed = BASE_SPEED;
  score = 0;
  obstacles = [];
  particles = [];
  player.y = canvas.height - 150 - player.height;
  animate();
}

function resetGame() {
  startGame();
}

function gameOver() {
  gameState = 'GAMEOVER';
  gameOverScreen.classList.add('active');
  finalScoreEl.textContent = Math.floor(score);

  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem('neonDinoHighScore', highScore);
  }
  highScoreEl.textContent = highScore;

  createParticles(player.x + player.width / 2, player.y + player.height / 2, 50, '#2f3542'); // Explosion dark grey
}

function drawGround() {
  ctx.strokeStyle = '#2f3542'; // Dark Grey Ground
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 150);
  ctx.lineTo(canvas.width, canvas.height - 150);
  ctx.stroke();
}

function animate() {
  if (gameState !== 'PLAYING' && gameState !== 'GAMEOVER') return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();

  if (gameState === 'PLAYING') {
    frames++;
    score += 0.1;
    gameSpeed = Math.min(gameSpeed + SPEED_INCREMENT, MAX_SPEED);

    spawnObstacles();
    player.update();
    checkCollisions();
  }

  player.draw();

  obstacles.forEach((obs, index) => {
    obs.update();
    obs.draw();
    if (obs.markedForDeletion) obstacles.splice(index, 1);
  });

  particles.forEach((part, index) => {
    part.update();
    part.draw();
    if (part.life <= 0) particles.splice(index, 1);
  });

  currentScoreEl.textContent = Math.floor(score);

  if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
    if (gameState === 'PLAYING') requestAnimationFrame(animate);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGround();
      obstacles.forEach(o => o.draw());
      player.draw();
      particles.forEach((part, index) => {
        part.update();
        part.draw();
        if (part.life <= 0) particles.splice(index, 1);
      });
      if (particles.length > 0) requestAnimationFrame(animate);
    }
  }
}

drawGround();
player.draw();

restartBtn.addEventListener('click', resetGame);