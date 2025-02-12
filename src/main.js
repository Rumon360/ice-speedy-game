import platform from "/platform.png";
import hills from "/hills.png";
import background from "/background.png";
import platformSmallTall from "/platformSmallTall.png";
// sprite sheets
import spriteRunLeft from "/spriteRunLeft.png";
import spriteRunRight from "/spriteRunRight.png";
import spriteStandLeft from "/spriteStandLeft.png";
import spriteStandRight from "/spriteStandRight.png";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 1;

class GameObject {
  constructor({ x, y, image }) {
    this.position = { x, y };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class Player {
  constructor() {
    this.position = { x: 100, y: 100 };
    this.velocity = { x: 0, y: 0 };
    this.width = 66;
    this.height = 150;
    this.speed = 10;
    this.jumpStrength = -20;
    this.image = createImage(spriteStandRight);
    this.frames = 0;
    this.sprites = {
      stand: {
        left: createImage(spriteStandLeft),
        right: createImage(spriteStandRight),
        cropwidth: 177,
        width: 66,
      },
      run: {
        left: createImage(spriteRunLeft),
        right: createImage(spriteRunRight),
        cropwidth: 341,
        width: 127.875,
      },
    };
    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = this.sprites.stand.cropwidth;
  }

  draw() {
    ctx.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (
      this.currentSprite === this.sprites.stand.right ||
      this.currentSprite === this.sprites.stand.left
    ) {
      if (this.frames > 59) {
        this.frames = 0;
      }
    } else if (
      this.currentSprite === this.sprites.run.right ||
      this.currentSprite === this.sprites.run.left
    ) {
      if (this.frames > 29) {
        this.frames = 0;
      }
    }

    // Handle velocity and gravity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height <= canvas.height) {
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    // Call draw to render the current sprite
    this.draw();
  }
}

class Platform extends GameObject {}

class GenericObject extends GameObject {}

function createImage(imageSrc) {
  const image = new Image();
  image.src = imageSrc;
  return image;
}

const platformImage = createImage(platform);
const backgroundImage = createImage(background);
const hillsImage = createImage(hills);
const platformSmallTallImage = createImage(platformSmallTall);

let player = new Player();
let platforms = [];
let genericObjects = [];

const keys = {
  right: { pressed: false },
  left: { pressed: false },
};

let scrollOffset = 0;

function init() {
  player = new Player();
  platforms = [
    new Platform({
      x:
        platformImage.width * 4 +
        300 -
        2 +
        platformImage.width -
        platformSmallTallImage.width,
      y: 270,
      image: platformSmallTallImage,
    }),
    new Platform({ x: -1, y: 460, image: platformImage }),
    new Platform({ x: platformImage.width - 3, y: 460, image: platformImage }),
    new Platform({
      x: platformImage.width * 2 + 200,
      y: 460,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 3 + 500,
      y: 460,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 4 + 300 - 2,
      y: 460,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 5 + 750,
      y: 460,
      image: platformImage,
    }),
  ];

  genericObjects = [
    new GenericObject({ x: -1, y: -1, image: backgroundImage }),
    new GenericObject({ x: -1, y: -1, image: hillsImage }),
  ];

  scrollOffset = 0;
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background and hills
  genericObjects.forEach((object) => object.draw());

  // Draw platforms
  platforms.forEach((platform) => platform.draw());

  // Update player
  player.update();

  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => (platform.position.x -= player.speed));
      genericObjects.forEach(
        (object) => (object.position.x -= player.speed * 0.66)
      );
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed;
      platforms.forEach((platform) => (platform.position.x += player.speed));
      genericObjects.forEach(
        (object) => (object.position.x += player.speed * 0.66)
      );
    }
  }

  // Collision detection
  platforms.forEach((platform) => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0;
    }
  });

  // Win condition
  if (scrollOffset > platformImage.width * 5 + 500) {
    document.getElementById("modal").classList.add("show");
  }

  // Lose condition
  if (player.position.y + player.height > canvas.height) {
    init();
  }
}

init();
animate();

window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      if (player.velocity.y === 0) {
        player.velocity.y += player.jumpStrength;
      }
      break;
    case "d":
      keys.right.pressed = true;
      player.currentSprite = player.sprites.run.right;
      player.currentCropWidth = player.sprites.run.cropwidth;
      player.width = player.sprites.run.width;
      break;
    case "a":
      keys.left.pressed = true;
      player.currentSprite = player.sprites.run.left;
      player.currentCropWidth = player.sprites.run.cropwidth;
      player.width = player.sprites.run.width;
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "d":
      keys.right.pressed = false;
      player.currentSprite = player.sprites.stand.right;
      player.currentCropWidth = player.sprites.stand.cropwidth;
      player.width = player.sprites.stand.width;
      break;
    case "a":
      keys.left.pressed = false;
      player.currentSprite = player.sprites.stand.left;
      player.currentCropWidth = player.sprites.stand.cropwidth;
      player.width = player.sprites.stand.width;
      break;
  }
});

document.getElementById("try-again-btn").addEventListener("click", function () {
  document.getElementById("modal").classList.remove("show");
  init();
});
