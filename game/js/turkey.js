// The turkey: physics, hiding, and drawing.
// One job: everything about the player bird.

import { GROUND_Y } from "./levels.js";

const GRAVITY = 1900;
const RUN_SPEED = 265;
const DASH_SPEED = 400;
const JUMP_VELOCITY = 760;

export class Turkey {
  constructor(x) {
    this.x = x;
    this.y = GROUND_Y - 46;
    this.w = 54;
    this.h = 46;
    this.vx = 0;
    this.vy = 0;
    this.face = 1;
    this.grounded = true;
    this.flapsLeft = 1;
    this.ducking = false;
    this.hiding = false;
    this.hideTime = 0;
    this.invuln = 0;
    this.boost = 0;
    this.runPhase = 0;
    this.inMud = false;
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  update(dt, input, stage, sound) {
    this.invuln = Math.max(0, this.invuln - dt);
    this.boost = Math.max(0, this.boost - dt);
    this.ducking = input.duck && this.grounded;

    const inHideSpot = stage.hides.some(
      (h) => this.centerX > h.x && this.centerX < h.x + h.w
    );
    this.hiding = inHideSpot && this.ducking;
    this.hideTime = this.hiding ? this.hideTime + dt : 0;

    this.inMud = stage.muds.some(
      (m) => this.centerX > m.x && this.centerX < m.x + m.w && this.grounded
    );

    let speed = RUN_SPEED;
    if (input.dashing() && !this.ducking) speed = DASH_SPEED;
    if (this.boost > 0) speed += 90;
    if (this.inMud) speed *= 0.45;
    if (this.ducking) speed *= 0.35;

    this.vx = 0;
    if (input.left) {
      this.vx = -speed;
      this.face = -1;
    }
    if (input.right) {
      this.vx = speed;
      this.face = 1;
    }

    if (input.takeJump()) {
      if (this.grounded) {
        this.vy = -JUMP_VELOCITY;
        this.grounded = false;
        sound.jump();
      } else if (this.flapsLeft > 0) {
        this.vy = -JUMP_VELOCITY * 0.72;
        this.flapsLeft -= 1;
        sound.flap();
      }
    }

    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (Math.abs(this.vx) > 10 && this.grounded) this.runPhase += dt * 14;

    this.grounded = false;
    const floorY = GROUND_Y - this.h;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.grounded = true;
      this.flapsLeft = 1;
    }

    for (const o of stage.obstacles) {
      const top = GROUND_Y - o.h;
      const overlapX = this.x + this.w > o.x + 4 && this.x < o.x + o.w - 4;
      if (!overlapX) continue;
      if (this.y + this.h > top && this.y + this.h < top + 26 && this.vy >= 0) {
        this.y = top - this.h;
        this.vy = 0;
        this.grounded = true;
        this.flapsLeft = 1;
      } else if (this.y + this.h > top + 10) {
        if (this.vx > 0) this.x = o.x - this.w + 4;
        if (this.vx < 0) this.x = o.x + o.w - 4;
      }
    }

    this.x = Math.max(8, Math.min(stage.length - this.w - 8, this.x));
  }

  draw(ctx, camX, time) {
    const x = this.x - camX;
    const y = this.y;
    const blink = this.invuln > 0 && Math.floor(time * 14) % 2 === 0;
    ctx.save();
    if (blink) ctx.globalAlpha = 0.35;
    if (this.hiding) ctx.globalAlpha = 0.55;
    ctx.translate(x + this.w / 2, y + this.h / 2);
    ctx.scale(this.face * 1.18, 1.18);
    if (this.ducking) ctx.scale(1.08, 0.72);

    // Tail fan: autumn feathers behind the body.
    const fanColors = ["#b3541e", "#d97c2b", "#8a3b12", "#e8a13c", "#7a3410"];
    for (let i = 0; i < 5; i++) {
      const angle = -0.9 + i * 0.42 + Math.sin(time * 3 + i) * 0.03;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = fanColors[i];
      ctx.beginPath();
      ctx.ellipse(-22, -16, 9, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Body.
    ctx.fillStyle = "#8a5a33";
    ctx.beginPath();
    ctx.ellipse(0, 4, 26, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a8743f";
    ctx.beginPath();
    ctx.ellipse(3, 8, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing: flaps hard while airborne.
    const flap = this.grounded ? 0.15 : Math.sin(time * 26) * 0.7;
    ctx.save();
    ctx.rotate(-0.3 + flap);
    ctx.fillStyle = "#6e4520";
    ctx.beginPath();
    ctx.ellipse(-4, 2, 16, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head, beak, wattle, eye.
    ctx.fillStyle = "#c98d5a";
    ctx.beginPath();
    ctx.arc(22, -12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2a541";
    ctx.beginPath();
    ctx.moveTo(30, -14);
    ctx.lineTo(42, -10);
    ctx.lineTo(30, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.ellipse(28, -2, 4, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1d1208";
    ctx.beginPath();
    ctx.arc(25, -15, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Legs.
    ctx.strokeStyle = "#e08a2e";
    ctx.lineWidth = 3;
    const legSwing = this.grounded && Math.abs(this.vx) > 10 ? Math.sin(this.runPhase) * 7 : 0;
    ctx.beginPath();
    ctx.moveTo(-6, 20);
    ctx.lineTo(-6 + legSwing, 28);
    ctx.moveTo(8, 20);
    ctx.lineTo(8 - legSwing, 28);
    ctx.stroke();
    ctx.restore();
  }
}
