// Gobble Dash: game state, loop, collisions and stage flow.
// One job: tie turkey, farmer, levels, render and audio together.

import { createInput } from "./input.js";
import { SoundBank } from "./audio.js";
import { makeStage, GROUND_Y, VIEW_W } from "./levels.js";
import { Turkey } from "./turkey.js";
import { Farmer } from "./farmer.js";
import {
  drawBackground,
  drawStageProps,
  drawKnife,
  drawHUD,
  drawTitleScreen,
  drawEndScreen,
  ovenIsOpen,
} from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = createInput(canvas);
const sound = new SoundBank();

class Game {
  constructor() {
    this.state = "title"; // title | play | end
    this.score = 0;
    this.best = 0;
    this.lives = 3;
    this.cornCount = 0;
    this.escaped = false;
    this.banner = "";
    this.bannerTimer = 0;
    this.knives = [];
    this.knifeRainTimer = 2;
    this.time = 0;
    this.camX = 0;
    this.stage = makeStage(0);
    this.turkey = new Turkey(140);
    this.farmer = new Farmer(40, this.stage);
    this.frozen = false;
  }

  startRun() {
    this.score = 0;
    this.lives = 3;
    this.cornCount = 0;
    this.escaped = false;
    this.loadStage(0);
    this.state = "play";
    sound.gobble();
  }

  loadStage(index) {
    this.stage = makeStage(index);
    this.turkey = new Turkey(140);
    this.farmer = new Farmer(30, this.stage);
    this.knives = [];
    this.knifeRainTimer = 2;
    this.banner = this.stage.name;
    this.bannerTimer = 1.6;
  }

  throwKnife(x, y, dir) {
    this.knives.push({ x, y, vx: dir * 430, vy: -40, angle: dir > 0 ? 0.2 : Math.PI - 0.2, thrown: true });
  }

  dropKnife() {
    const x = this.turkey.centerX + (Math.random() * 240 - 60);
    this.knives.push({ x, y: 30, vx: 0, vy: 60, angle: Math.PI / 2, thrown: false });
  }

  hurt(why) {
    if (this.turkey.invuln > 0) return;
    this.lives -= 1;
    this.turkey.invuln = 1.4;
    this.turkey.vx = this.farmer.face * 240;
    this.turkey.x += this.farmer.face * 26;
    sound.hit();
    if (this.lives <= 0) {
      this.escaped = false;
      this.state = "end";
      this.best = Math.max(this.best, this.score);
      sound.caught();
    } else {
      this.banner = why === "knife" ? "OUCH! A knife!" : why === "oven" ? "OUCH! Hot oven!" : "The farmer grabbed you!";
      this.bannerTimer = 1.1;
    }
  }

  update(dt) {
    this.time += dt;
    if (this.frozen) return;
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner = "";
    }

    if (this.state === "title") {
      if (input.takeStart()) this.startRun();
      return;
    }
    if (this.state === "end") {
      if (input.takeStart()) this.startRun();
      return;
    }

    this.turkey.update(dt, input, this.stage, sound);
    this.farmer.update(dt, this.turkey, this.stage, sound, (x, y, d) => this.throwKnife(x, y, d));

    // Score grows with distance survived.
    this.score += Math.round(Math.max(0, this.turkey.vx) * dt * 0.12);

    // Falling carving knives in the kitchen.
    if (this.stage.knifeRain > 0) {
      this.knifeRainTimer -= dt;
      if (this.knifeRainTimer <= 0) {
        this.knifeRainTimer = this.stage.knifeRain;
        this.dropKnife();
      }
    }
    for (const k of this.knives) {
      if (!k.thrown) k.vy += 900 * dt;
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.angle += dt * 6;
    }
    this.knives = this.knives.filter((k) => k.y < GROUND_Y + 20 && k.x > -60 && k.x < this.stage.length + 60);

    // Hazards and pickups.
    for (const k of this.knives) {
      if (Math.abs(k.x - this.turkey.centerX) < 30 && Math.abs(k.y - (this.turkey.y + 22)) < 30) {
        k.y = GROUND_Y + 100;
        this.hurt("knife");
      }
    }
    for (const o of this.stage.ovens) {
      if (ovenIsOpen(o, this.time) && this.turkey.centerX > o.x - 6 && this.turkey.centerX < o.x + 98 && this.turkey.grounded) {
        this.hurt("oven");
      }
    }
    if (this.farmer.touches(this.turkey)) this.hurt("farmer");

    for (const p of this.stage.pickups) {
      if (p.taken) continue;
      if (Math.abs(p.x - this.turkey.centerX) < 36 && Math.abs(p.y - (this.turkey.y + 22)) < 44) {
        p.taken = true;
        sound.pickup();
        if (p.kind === "corn") {
          this.score += 50;
          this.cornCount += 1;
        } else if (p.kind === "feather") {
          this.score += 100;
          this.lives = Math.min(5, this.lives + 1);
          this.banner = "Golden feather! +1 life";
          this.bannerTimer = 1.1;
        } else {
          this.score += 75;
          this.turkey.boost = 2.2;
          this.banner = "Pumpkin pie boost!";
          this.bannerTimer = 1.1;
        }
      }
    }

    // Reaching the gate clears the stage.
    if (this.turkey.centerX >= this.stage.exitX + 40) {
      this.score += 250;
      if (this.stage.index >= 2) {
        this.escaped = true;
        this.state = "end";
        this.best = Math.max(this.best, this.score);
        sound.escaped();
      } else {
        sound.stageClear();
        this.loadStage(this.stage.index + 1);
      }
    }

    this.camX = Math.max(0, Math.min(this.stage.length - VIEW_W, this.turkey.centerX - 340));
  }

  draw() {
    if (this.state === "title") {
      drawTitleScreen(ctx, this, this.time);
      return;
    }
    if (this.state === "end") {
      drawEndScreen(ctx, this, this.time);
      return;
    }
    drawBackground(ctx, this.stage, this.camX, this.time);
    drawStageProps(ctx, this.stage, this.camX, this.time);
    for (const k of this.knives) drawKnife(ctx, k, this.camX);
    this.farmer.draw(ctx, this.camX, this.time);
    this.turkey.draw(ctx, this.camX, this.time);
    drawHUD(ctx, this);
  }
}

const game = new Game();
window.__game = game;

// Screenshot staging: ?shot=cover|title|kitchen|end poses a real scene.
function stageShot(name) {
  game.frozen = true;
  if (name === "title") {
    game.state = "title";
    game.turkey.x = 470;
    game.farmer.x = 300;
    game.time = 3;
  } else if (name === "kitchen") {
    game.state = "play";
    game.stage = makeStage(2);
    game.score = 1240;
    game.lives = 3;
    game.turkey = new Turkey(1180);
    game.turkey.y = GROUND_Y - 165;
    game.turkey.vy = 40;
    game.turkey.grounded = false;
    game.farmer = new Farmer(860, game.stage);
    game.farmer.state = "chase";
    game.knives = [{ x: 1300, y: 290, vx: 0, vy: 200, angle: 2.2, thrown: false }];
    game.camX = 780;
    game.time = 2.2;
    game.banner = "";
  } else if (name === "end") {
    game.state = "end";
    game.escaped = true;
    game.score = 1875;
    game.best = 1875;
    game.cornCount = 14;
    game.stage = makeStage(2);
    game.turkey = new Turkey(3050);
    game.farmer = new Farmer(2850, game.stage);
    game.camX = game.stage.length - VIEW_W;
    game.time = 5;
  } else {
    // cover: mid-chase in the farmyard, turkey leaping a fence.
    game.state = "play";
    game.stage = makeStage(0);
    game.score = 460;
    game.lives = 3;
    game.turkey = new Turkey(680);
    game.turkey.y = GROUND_Y - 135;
    game.turkey.vx = 300;
    game.turkey.grounded = false;
    game.farmer = new Farmer(470, game.stage);
    game.farmer.state = "chase";
    game.farmer.vx = 240;
    game.camX = 380;
    game.time = 2.4;
    game.banner = "";
  }
  game.draw();
}

const shot = new URLSearchParams(window.location.search).get("shot");
if (shot) stageShot(shot);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
