const CANVAS_WIDTH = 393;
const CANVAS_HEIGHT = 877;
const FRAME_WIDTH = 393;
const FRAME_HEIGHT = 750;
const TOTAL_FRAMES = 37;
const FRAME_TIME = 75;
const CARD_ENTER_FRAME_WIDTH = 393;
const CARD_ENTER_TOTAL_FRAMES = 14;
const CONFETTI_FRAME_WIDTH = 400;
const CONFETTI_FRAME_HEIGHT = 400;
const CONFETTI_TOTAL_FRAMES = 21;
const CONFETTI_FRAME_TIME = 60;
const CONFETTI_MARGIN = 100;
const canvas = document.getElementById("spriteCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("play-btn");
const overlay = document.getElementById("overlay");

let state = "intro";
let currentSprite = null;
let overlayShown = false;

const allSprites = [
  "nayeon_cake.png", "jeongyeon_cake.png", "momo_cake.png", "sana_cake.png", "jihyo_cake.png",
  "mina_cake.png", "dahyun_cake.png", "chaeyoung_cake.png", "tzuyu_cake.png",
  "nayeon_flower.png", "jeongyeon_flower.png", "momo_flower.png", "sana_flower.png",
  "jihyo_flower.png", "mina_flower.png", "dahyun_flower.png", "chaeyoung_flower.png",
  "tzuyu_flower.png", "card_group.png"
];
const spriteList = allSprites.filter(name =>
  name.endsWith("_cake.png") || name.endsWith("_flower.png") || name.endsWith("_group.png")
);

const confettiLeftCanvas = createConfettiCanvas();
const confettiRightCanvas = createConfettiCanvas();
const confettiLeftCtx = confettiLeftCanvas.getContext("2d");
const confettiRightCtx = confettiRightCanvas.getContext("2d");

let confettiLeftInterval, confettiRightInterval;

function createConfettiCanvas() {
  const c = document.createElement("canvas");
  c.width = CONFETTI_FRAME_WIDTH;
  c.height = CONFETTI_FRAME_HEIGHT;
  c.style.position = "fixed";
  c.style.bottom = "0";
  c.style.pointerEvents = "none";
  c.style.zIndex = "1000";
  document.body.appendChild(c);
  return c;
}

function positionConfettiCanvases() {
  const rect = canvas.getBoundingClientRect();
  confettiLeftCanvas.style.left = `${rect.left - CONFETTI_MARGIN}px`;
  confettiRightCanvas.style.left = `${rect.right - CONFETTI_FRAME_WIDTH + CONFETTI_MARGIN}px`;
}

function drawFrame(ctx, img, frame, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, frame * width, 0, width, height, 0, 0, width, height);
}

function drawMainFrame(img, frame) {
  ctx.clearRect(0, 0, FRAME_WIDTH, CANVAS_HEIGHT);
  const yOffset = (CANVAS_HEIGHT - FRAME_HEIGHT) / 2;
  const frameWidth = img.src.includes("card_enter.png") ? CARD_ENTER_FRAME_WIDTH : FRAME_WIDTH;
  ctx.drawImage(img, frame * frameWidth, 0, frameWidth, FRAME_HEIGHT, 0, yOffset, frameWidth, FRAME_HEIGHT);
}

function playSprite(path, keepLastFrame = false, onComplete) {
  const img = new Image();
  img.src = `img/${path}`;
  let frame = 0;
  overlayShown = false;

  img.onload = () => {
    const interval = setInterval(() => {
      drawMainFrame(img, frame);

      const lastFrame = path === "card_enter.png" ? CARD_ENTER_TOTAL_FRAMES - 1 : TOTAL_FRAMES - 1;

      if (!overlayShown && frame >= lastFrame - 18 && path !== "card_enter.png") {
        overlayShown = true;
        showOverlay(path);
      }

      frame++;

      if ((path === "card_enter.png" && frame >= CARD_ENTER_TOTAL_FRAMES) ||
          (path !== "card_enter.png" && frame >= TOTAL_FRAMES)) {
        clearInterval(interval);
        if (keepLastFrame) drawMainFrame(img, lastFrame);
        if (onComplete) onComplete();
      }
    }, FRAME_TIME);
  };
}

function showOverlay(baseName, onComplete) {
  overlay.src = `img/overlay_${baseName}`;
  overlay.style.opacity = "0";

  overlay.onload = () => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      if (onComplete) setTimeout(onComplete, 500);
    });
  };
}

function playConfetti() {
  const confettiLeftImg = new Image();
  const confettiRightImg = new Image();
  confettiLeftImg.src = "img/confetti_left.png";
  confettiRightImg.src = "img/confetti_right.png";

  let frame = 0;

  Promise.all([
    new Promise(res => confettiLeftImg.onload = res),
    new Promise(res => confettiRightImg.onload = res)
  ]).then(() => {
    clearInterval(confettiLeftInterval);
    clearInterval(confettiRightInterval);

    confettiLeftInterval = setInterval(() => {
      drawFrame(confettiLeftCtx, confettiLeftImg, frame, CONFETTI_FRAME_WIDTH, CONFETTI_FRAME_HEIGHT);
    }, CONFETTI_FRAME_TIME);

    confettiRightInterval = setInterval(() => {
      drawFrame(confettiRightCtx, confettiRightImg, frame, CONFETTI_FRAME_WIDTH, CONFETTI_FRAME_HEIGHT);
    }, CONFETTI_FRAME_TIME);

    let confettiFrame = 0;
    const confettiAnimInterval = setInterval(() => {
      confettiFrame++;
      if (confettiFrame >= CONFETTI_TOTAL_FRAMES) {
        clearInterval(confettiLeftInterval);
        clearInterval(confettiRightInterval);
        clearInterval(confettiAnimInterval);
        confettiLeftCtx.clearRect(0, 0, CONFETTI_FRAME_WIDTH, CONFETTI_FRAME_HEIGHT);
        confettiRightCtx.clearRect(0, 0, CONFETTI_FRAME_WIDTH, CONFETTI_FRAME_HEIGHT);
      } else {
        frame = confettiFrame;
      }
    }, CONFETTI_FRAME_TIME);
  });
}

function playIntro() {
  state = "intro";
  overlay.style.opacity = "0";
  button.disabled = true;
  playSprite("card_enter.png", true, () => {
    state = "ready";
    button.disabled = false;
    button.textContent = "Tap to reveal";
  });
}

function startReveal() {
  if (state !== "ready") return;

  state = "reveal";
  button.textContent = "Draw again";
  overlay.style.opacity = "0";
  button.disabled = true;

  currentSprite = spriteList[Math.floor(Math.random() * spriteList.length)];

  playConfetti();

  playSprite(currentSprite, true, () => {
    state = "overlay";
    button.disabled = false;
  });
}

function restartAll() {
  if (state !== "overlay") return;
  state = "reset";
  playIntro();
}

// Eventos

button.addEventListener("click", () => {
  if (state === "ready") startReveal();
  else if (state === "overlay") {
    button.textContent = "Tap to reveal";
    restartAll();
  }
});

window.addEventListener("load", () => {
  positionConfettiCanvases();
  playIntro();
});

window.addEventListener("resize", positionConfettiCanvases);