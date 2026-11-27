// The farmer: chases, searches, and corners the turkey.
// One job: the hunter's brain and drawing.

import { GROUND_Y } from "./levels.js";

export class Farmer {
  constructor(x, stage) {
    this.x = x;
    this.y = GROUND_Y - 78;
    this.w = 46;
    this.h = 78;
    this.vx = 0;
    this.face = 1;
    this.state = "chase"; // chase | search | corner
    this.lastSeenX = x;
    this.searchTimer = 0;
    this.throwTimer = 2.2;
    this.walkPhase = 0;
    this.spottedNow = false;
    this.speed = stage.farmerSpeed;
    this.sight = stage.farmerSight;
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  canSee(turkey) {
    if (turkey.hiding) return false;
    return Math.abs(turkey.centerX - this.centerX) < this.sight;
  }

  update(dt, turkey, stage, sound, throwKnife) {
    const sees = this.canSee(turkey);
    this.spottedNow = sees && this.state !== "chase";
    if (sees) {
      if (this.state !== "chase") sound.spotted();
      this.state = "chase";
      this.lastSeenX = turkey.centerX;
    }

    let targetX = turkey.centerX;
    let speed = this.speed;

    if (this.state === "chase") {
      if (!sees) {
        this.state = "search";
        this.searchTimer = 2.4;
      }
      // Corner: a turkey that hides too long gets cut off from the exit.
      if (turkey.hideTime > 2.2) this.state = "corner";
    } else if (this.state === "search") {
      targetX = this.lastSeenX;
      speed = this.speed * 0.8;
      this.searchTimer -= dt;
      if (Math.abs(this.centerX - targetX) < 18) {
        this.face = Math.floor(this.searchTimer * 2) % 2 === 0 ? 1 : -1;
        speed = 0;
      }
      if (this.searchTimer <= 0) this.state = "corner";
    } else if (this.state === "corner") {
      // Head for a point between the turkey and the exit gate.
      targetX = Math.min(stage.exitX - 60, turkey.centerX + 320);
      speed = this.speed * 1.05;
      if (Math.abs(this.centerX - targetX) < 20 && !sees) {
        this.state = "search";
        this.lastSeenX = turkey.centerX;
        this.searchTimer = 1.6;
      }
    }

    const dx = targetX - this.centerX;
    if (Math.abs(dx) > 6 && speed > 0) {
      this.vx = Math.sign(dx) * speed;
      this.face = Math.sign(dx);
    } else {
      this.vx = 0;
    }
    this.x += this.vx * dt;
    if (Math.abs(this.vx) > 10) this.walkPhase += dt * 11;
    this.x = Math.max(8, Math.min(stage.length - this.w - 8, this.x));

    // In the kitchen the farmer flings carving knives while chasing.
    if (stage.farmerThrows && this.state === "chase") {
      this.throwTimer -= dt;
      if (this.throwTimer <= 0) {
        this.throwTimer = 2.8;
        throwKnife(this.centerX, this.y + 26, this.face);
        sound.knife();
      }
    }
  }

  touches(turkey) {
    return (
      Math.abs(this.centerX - turkey.centerX) < 44 &&
      turkey.y + turkey.h > this.y + 18
    );
  }

  draw(ctx, camX, time) {
    const x = this.x - camX;
    const y = this.y;
    ctx.save();
    ctx.translate(x + this.w / 2, y);
    ctx.scale(this.face, 1);

    // Legs in overalls, swinging as he runs.
    const swing = Math.abs(this.vx) > 10 ? Math.sin(this.walkPhase) * 9 : 0;
    ctx.fillStyle = "#33507a";
    ctx.fillRect(-13 + swing * 0.4, 48, 11, 30);
    ctx.fillRect(3 - swing * 0.4, 48, 11, 30);
    ctx.fillStyle = "#2a1508";
    ctx.fillRect(-15 + swing * 0.4, 74, 15, 5);
    ctx.fillRect(2 - swing * 0.4, 74, 15, 5);

    // Plaid shirt and overall bib.
    ctx.fillStyle = "#b3402e";
    ctx.fillRect(-16, 20, 32, 30);
    ctx.fillStyle = "#33507a";
    ctx.fillRect(-10, 30, 20, 20);
    ctx.fillStyle = "#f2c14e";
    ctx.fillRect(-10, 30, 4, 4);
    ctx.fillRect(6, 30, 4, 4);

    // Arms: one pumps, one grips the pitchfork.
    ctx.strokeStyle = "#b3402e";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-14, 24);
    ctx.lineTo(-22, 42 + swing * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, 24);
    ctx.lineTo(24, 38);
    ctx.stroke();

    // Pitchfork.
    ctx.strokeStyle = "#7a4a1e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(24, 14);
    ctx.lineTo(30, 62);
    ctx.stroke();
    ctx.strokeStyle = "#cfd6dd";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, 6);
    ctx.lineTo(23, 16);
    ctx.moveTo(24, 4);
    ctx.lineTo(25, 15);
    ctx.moveTo(30, 6);
    ctx.lineTo(27, 16);
    ctx.stroke();

    // Head, hat, determined face.
    ctx.fillStyle = "#f0b98a";
    ctx.beginPath();
    ctx.arc(0, 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9a441";
    ctx.fillRect(-16, -4, 32, 5);
    ctx.fillRect(-10, -14, 20, 11);
    ctx.fillStyle = "#1d1208";
    ctx.fillRect(3, 6, 3, 3);
    ctx.fillRect(3, 15, 8, 2);

    ctx.restore();

    // Alert marker: ! when chasing, ? when searching.
    if (this.state === "chase") {
      ctx.fillStyle = "#e63946";
      ctx.font = "bold 30px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", x + this.w / 2, y - 12 + Math.sin(time * 8) * 2);
    } else if (this.state === "search") {
      ctx.fillStyle = "#f2c14e";
      ctx.font = "bold 26px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("?", x + this.w / 2, y - 12);
    }
  }
}
