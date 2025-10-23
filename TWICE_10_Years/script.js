const canvas = document.getElementById("spriteCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("play-btn");
const overlay = document.getElementById("overlay");

// Tamaño para sprites normales
const frameWidth = 393;
const frameHeight = 750;
const canvasHeight = 877;
const totalFrames = 37;
const frameTime = 75;

// Tamaño específico para card_enter.png
const cardEnterFrameWidth = 393;  // cambiado a 393
const cardEnterTotalFrames = 14;

let state = "intro"; // intro → ready → reveal → overlay → reset
let currentSprite = null;

// === LISTA COMPLETA DE SPRITES ===
const allSprites = [
  "nayeon_cake.png",
  "jeongyeon_cake.png",
  "momo_cake.png",
  "sana_cake.png",
  "jihyo_cake.png",
  "mina_cake.png",
  "dahyun_cake.png",
  "chaeyoung_cake.png",
  "tzuyu_cake.png",
  "nayeon_flower.png",
  "jeongyeon_flower.png",
  "momo_flower.png",
  "sana_flower.png",
  "jihyo_flower.png",
  "mina_flower.png",
  "dahyun_flower.png",
  "chaeyoung_flower.png",
  "tzuyu_flower.png",
  "card_group.png"
];

// === FILTRO AUTOMÁTICO DE SPRITES VÁLIDOS ===
const spriteList = allSprites.filter(name =>
  name.endsWith("_cake.png") ||
  name.endsWith("_flower.png") ||
  name.endsWith("_group.png")
);

// === DIBUJAR UN FRAME ===
function drawFrame(image, frame) {
  ctx.clearRect(0, 0, frameWidth, canvasHeight);
  const yOffset = (canvasHeight - frameHeight) / 2;

  if (image.src.includes("card_enter.png")) {
    // Con frameWidth = cardEnterFrameWidth = 393, xOffset = 0
    ctx.drawImage(
      image,
      frame * cardEnterFrameWidth, 0,
      frameWidth, frameHeight,
      0, yOffset,
      frameWidth, frameHeight
    );
  } else {
    ctx.drawImage(
      image,
      frame * frameWidth, 0,
      frameWidth, frameHeight,
      0, yOffset,
      frameWidth, frameHeight
    );
  }
}

// === ANIMAR UN SPRITE ===
function playSprite(path, keepLastFrame = false, onComplete) {
  const img = new Image();
  img.src = `img/${path}`;
  let frame = 0;

  img.onload = () => {
    const interval = setInterval(() => {
      drawFrame(img, frame);
      frame++;

      if (path === "card_enter.png") {
        if (frame >= cardEnterTotalFrames) {
          clearInterval(interval);
          if (keepLastFrame) drawFrame(img, cardEnterTotalFrames - 1);
          if (onComplete) onComplete();
        }
      } else {
        if (frame >= totalFrames) {
          clearInterval(interval);
          if (keepLastFrame) drawFrame(img, totalFrames - 1);
          if (onComplete) onComplete();
        }
      }
    }, frameTime);
  };
}

// === MOSTRAR EL OVERLAY ===
function showOverlay(baseName, onComplete) {
  const overlayPath = `img/overlay_${baseName}`;
  overlay.src = overlayPath;
  overlay.style.opacity = "0";

  overlay.onload = () => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    });
  };
}

// === ETAPA 1: ANIMACIÓN DE ENTRADA ===
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

// === ETAPA 2: TAP TO REVEAL ===
function startReveal() {
  if (state !== "ready") return;
  state = "reveal";
  button.textContent = "Draw again";  // CAMBIO INMEDIATO DEL TEXTO AL CLICKAR
  overlay.style.opacity = "0";
  ctx.clearRect(0, 0, frameWidth, canvasHeight);
  button.disabled = true;

  currentSprite = spriteList[Math.floor(Math.random() * spriteList.length)];

  playSprite(currentSprite, true, () => {
    state = "overlay";
    showOverlay(currentSprite, () => {
      button.disabled = false;
    });
  });
}

// === ETAPA 3: REINICIAR TODO ===
function restartAll() {
  if (state !== "overlay") return;
  state = "reset";
  playIntro();
}

// === EVENTOS DEL BOTÓN ===
button.addEventListener("click", () => {
  if (state === "ready") startReveal();
  else if (state === "overlay") {
    button.textContent = "Tap to reveal";
    restartAll();
  }
});

// === INICIO AUTOMÁTICO ===
window.addEventListener("load", () => {
  playIntro();
});