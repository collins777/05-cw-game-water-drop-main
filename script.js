// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timer; // Will store our timer interval for countdown
let timeLeft = 30; // Initial time for the game

// Winning and losing messages
const winMessages = [
  "Amazing! You brought clean water to a whole village!",
  "You did it! Every drop counts!",
  "Incredible! You're a water hero!",
  "Fantastic! You made a real difference!",
];
const loseMessages = [
  "Try again! Every drop helps.",
  "Don't give up! Clean water is worth it.",
  "Almost there! Give it another shot.",
  "Keep going! The world needs water heroes.",
];

// Difficulty settings
const difficultySettings = {
  easy: { dropInterval: 1200, dropDuration: 5 },
  normal: { dropInterval: 1000, dropDuration: 4 },
  hard: { dropInterval: 700, dropDuration: 2.7 },
};
let currentDifficulty = "normal";

// Difficulty button logic
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Set active class
    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    // Set difficulty
    currentDifficulty = btn.getAttribute("data-mode");
    // If game is running, reset to apply new speed
    if (gameRunning) {
      resetGame();
      startGame();
    }
  });
});
// Set default active
document
  .querySelector('.difficulty-btn[data-mode="normal"]')
  .classList.add("active");

// Create or select a message display element
let messageDiv = document.getElementById("end-message");
if (!messageDiv) {
  messageDiv = document.createElement("div");
  messageDiv.id = "end-message";
  messageDiv.style.position = "absolute";
  messageDiv.style.top = "50%";
  messageDiv.style.left = "50%";
  messageDiv.style.transform = "translate(-50%, -50%)";
  messageDiv.style.background = "rgba(255,255,255,0.95)";
  messageDiv.style.padding = "32px";
  messageDiv.style.borderRadius = "12px";
  messageDiv.style.fontSize = "2rem";
  messageDiv.style.textAlign = "center";
  messageDiv.style.zIndex = "1000";
  messageDiv.style.display = "none";
  document.body.appendChild(messageDiv);
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Add event listener for reset button
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeLeft = 30;
  document.getElementById("time").textContent = timeLeft;

  // Hide end message if visible
  messageDiv.style.display = "none";
  // Reset score
  document.getElementById("score").textContent = "0";

  // Start the countdown timer
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops at interval based on difficulty
  dropMaker = setInterval(
    createDrop,
    difficultySettings[currentDifficulty].dropInterval
  );
}

function resetGame() {
  // Stop intervals
  clearInterval(dropMaker);
  clearInterval(timer);
  gameRunning = false;

  // Remove all drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach((drop) => drop.remove());

  // Reset score and timer
  document.getElementById("score").textContent = "0";
  timeLeft = 30;
  document.getElementById("time").textContent = timeLeft;

  // Hide end message
  messageDiv.style.display = "none";
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timer);

  // Remove remaining drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach((drop) => drop.remove());

  // Get score
  const score = parseInt(document.getElementById("score").textContent, 10);

  // Pick message
  let message;
  if (score >= 20) {
    message = winMessages[Math.floor(Math.random() * winMessages.length)];
    // Confetti animation for win
    if (window.confetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  } else {
    message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
  }

  // Show message
  messageDiv.textContent = message;
  messageDiv.style.display = "block";

  // Optionally reset score and timer for next game
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Decide if this is a bad (green) drop: 20% chance
  const isBadDrop = Math.random() < 0.2;
  drop.className = isBadDrop ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for duration based on difficulty
  drop.style.animationDuration = `${difficultySettings[currentDifficulty].dropDuration}s`;

  // If it's a good drop, use the image
  if (!isBadDrop) {
    drop.style.background = "none";
    drop.style.border = "none";
    drop.style.boxShadow = "none";
    const img = document.createElement("img");
    img.src = "img/water-can-transparent.png";
    img.alt = "Water Can";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none"; // So the div gets the click
    drop.appendChild(img);
  }

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Drop click logic
  drop.addEventListener("click", () => {
    const scoreSpan = document.getElementById("score");
    let score = parseInt(scoreSpan.textContent, 10);
    if (isBadDrop) {
      score = Math.max(0, score - 1); // Prevent negative score
    } else {
      score += 1;
    }
    scoreSpan.textContent = score;
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
