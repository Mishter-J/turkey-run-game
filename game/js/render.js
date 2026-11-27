// Drawing the world: backgrounds, props, hazards, HUD and screens.
// One job: everything the player sees except the turkey and the farmer.

import { GROUND_Y, VIEW_W, VIEW_H } from "./levels.js";

export function drawBackground(ctx, stage, camX, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (stage.index === 2) drawKitchenWall(ctx, camX);
  else drawOutdoorBackdrop(ctx, stage, camX, time);

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.groundTop;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
  if (stage.index === 2) {
    ctx.fillStyle = "rgba(90,50,20,0.35)";
    for (let i = 0; i < 12; i++) {
      const x = ((i * 96 - camX) % (VIEW_W + 96) + VIEW_W + 96) % (VIEW_W + 96) - 48;
      ctx.fillRect(x, GROUND_Y + 34, 44, 4);
    }
  }
}

function drawOutdoorBackdrop(ctx, stage, camX, time) {
  // Sun low over the fields.
  ctx.fillStyle = "#fff3b0";
  ctx.beginPath();
  ctx.arc(820 - camX * 0.05, 92, 42, 0, Math.PI * 2);
  ctx.fill();

  // Rolling hills (parallax).
  ctx.fillStyle = stage.index === 0 ? "#d97c2b" : "#8a4a5e";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    ctx.lineTo(x, GROUND_Y - 70 - Math.sin((x + camX * 0.3) * 0.008) * 26);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Barn silhouette on stage 2, farmhouse on stage 1.
  const bx = 300 - camX * 0.45;
  ctx.fillStyle = stage.index === 0 ? "#9c3b24" : "#6e2436";
  ctx.fillRect(bx, GROUND_Y - 190, 190, 120);
  ctx.beginPath();
  ctx.moveTo(bx - 14, GROUND_Y - 190);
  ctx.lineTo(bx + 95, GROUND_Y - 252);
  ctx.lineTo(bx + 204, GROUND_Y - 190);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffe9c4";
  ctx.fillRect(bx + 70, GROUND_Y - 140, 50, 70);

  // Autumn trees scrolling past.
  for (let i = 0; i < 8; i++) {
    const x = ((i * 420 - camX * 0.7) % 2600 + 2600) % 2600 - 120;
    if (x < -80 || x > VIEW_W + 80) continue;
    ctx.fillStyle = "#5b3a22";
    ctx.fillRect(x, GROUND_Y - 92, 12, 92);
    ctx.fillStyle = i % 2 ? "#e07b2a" : "#c0392b";
    ctx.beginPath();
    ctx.arc(x + 6, GROUND_Y - 118, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2a541";
    ctx.beginPath();
    ctx.arc(x - 18, GROUND_Y - 100, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Drifting leaves.
  ctx.fillStyle = "rgba(242,165,65,0.85)";
  for (let i = 0; i < 14; i++) {
    const lx = ((i * 173 + time * 30) % (VIEW_W + 40)) - 20;
    const ly = 60 + ((i * 67 + time * 18) % 320);
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6, 3, i, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawKitchenWall(ctx, camX) {
  // Tiled wall and hanging pans.
  ctx.fillStyle = "rgba(255,233,196,0.16)";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 12; col++) {
      const x = ((col * 92 - camX * 0.4) % (VIEW_W + 92) + VIEW_W + 92) % (VIEW_W + 92) - 46;
      ctx.fillRect(x, 60 + row * 72, 84, 62);
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = ((i * 480 - camX * 0.6) % 2200 + 2200) % 2200 - 60;
    if (x < -60 || x > VIEW_W + 60) continue;
    ctx.strokeStyle = "#2a1508";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 78);
    ctx.stroke();
    ctx.fillStyle = "#9aa5ad";
    ctx.beginPath();
    ctx.arc(x, 98, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6e7a82";
    ctx.beginPath();
    ctx.arc(x, 98, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  // Window with night sky.
  const wx = 640 - camX * 0.3;
  ctx.fillStyle = "#1d2a4a";
  ctx.fillRect(wx, 70, 130, 110);
  ctx.fillStyle = "#fff3b0";
  ctx.beginPath();
  ctx.arc(wx + 92, 102, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5b3a22";
  ctx.lineWidth = 6;
  ctx.strokeRect(wx, 70, 130, 110);
}

export function drawStageProps(ctx, stage, camX, time) {
  for (const m of stage.muds) {
    const x = m.x - camX;
    ctx.fillStyle = "#4a2c14";
    ctx.beginPath();
    ctx.ellipse(x + m.w / 2, GROUND_Y + 6, m.w / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const o of stage.obstacles) drawObstacle(ctx, o, camX);
  for (const h of stage.hides) drawHideSpot(ctx, stage, h, camX);
  for (const o of stage.ovens) drawOven(ctx, o, camX, time);
  drawExitGate(ctx, stage, camX, time);
  for (const p of stage.pickups) {
    if (!p.taken) drawPickup(ctx, p, camX, time);
  }
}

function drawObstacle(ctx, o, camX) {
  const x = o.x - camX;
  const top = GROUND_Y - o.h;
  if (o.type === "fence") {
    ctx.fillStyle = "#7a4a1e";
    ctx.fillRect(x, top + 8, o.w, 9);
    ctx.fillRect(x, top + 30, o.w, 9);
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 26, top, 9, o.h);
  } else if (o.type === "crate") {
    ctx.fillStyle = "#a8743f";
    ctx.fillRect(x, top, o.w, o.h);
    ctx.strokeStyle = "#6e4520";
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 3, top + 3, o.w - 6, o.h - 6);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + o.w, top + o.h);
    ctx.moveTo(x + o.w, top);
    ctx.lineTo(x, top + o.h);
    ctx.stroke();
  } else if (o.type === "barrel") {
    ctx.fillStyle = "#8a5a33";
    ctx.beginPath();
    ctx.ellipse(x + o.w / 2, top + o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a2c14";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 2, top + 14);
    ctx.lineTo(x + o.w - 2, top + 14);
    ctx.moveTo(x + 2, top + o.h - 14);
    ctx.lineTo(x + o.w - 2, top + o.h - 14);
    ctx.stroke();
  } else if (o.type === "counter") {
    ctx.fillStyle = "#7a4a1e";
    ctx.fillRect(x, top + 12, o.w, o.h - 12);
    ctx.fillStyle = "#e8d5b5";
    ctx.fillRect(x - 4, top, o.w + 8, 14);
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.arc(x + 30, top - 6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2a541";
    ctx.beginPath();
    ctx.arc(x + 86, top - 6, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHideSpot(ctx, stage, h, camX) {
  const x = h.x - camX;
  if (stage.index === 2) {
    // Open cabinet to duck into.
    ctx.fillStyle = "#5b3a22";
    ctx.fillRect(x, GROUND_Y - 92, h.w, 92);
    ctx.fillStyle = "#2a1508";
    ctx.fillRect(x + 10, GROUND_Y - 80, h.w - 20, 80);
    ctx.fillStyle = "#ffe9c4";
    ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HIDE", x + h.w / 2, GROUND_Y - 98);
    return;
  }
  // Haystack.
  ctx.fillStyle = "#e8c14e";
  ctx.beginPath();
  ctx.ellipse(x + h.w / 2, GROUND_Y - 26, h.w / 2, 34, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "#c99a2e";
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 14 + i * 20, GROUND_Y - 8);
    ctx.lineTo(x + 22 + i * 20, GROUND_Y - 44);
    ctx.stroke();
  }
  ctx.fillStyle = "#5b3a22";
  ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HIDE", x + h.w / 2, GROUND_Y - 66);
}

export function ovenIsOpen(oven, time) {
  return (time + oven.x * 0.01) % 4 < 1.6;
}

function drawOven(ctx, oven, camX, time) {
  const x = oven.x - camX;
  const open = ovenIsOpen(oven, time);
  ctx.fillStyle = "#3d3d44";
  ctx.fillRect(x, GROUND_Y - 96, 92, 96);
  ctx.fillStyle = "#23232a";
  ctx.fillRect(x + 10, GROUND_Y - 78, 72, 58);
  if (open) {
    const glow = ctx.createRadialGradient(x + 46, GROUND_Y - 50, 6, x + 46, GROUND_Y - 50, 60);
    glow.addColorStop(0, "#ffd23c");
    glow.addColorStop(0.5, "#f26430");
    glow.addColorStop(1, "rgba(242,100,48,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 14, GROUND_Y - 104, 120, 104);
    ctx.fillStyle = "#ffdf6b";
    for (let i = 0; i < 3; i++) {
      const fx = x + 24 + i * 20;
      const fh = 22 + Math.sin(time * 11 + i * 2) * 6;
      ctx.beginPath();
      ctx.moveTo(fx, GROUND_Y - 24);
      ctx.lineTo(fx + 7, GROUND_Y - 24 - fh);
      ctx.lineTo(fx + 14, GROUND_Y - 24);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = "#9aa5ad";
  ctx.fillRect(x + 8, GROUND_Y - 92, 76, 6);
  ctx.fillStyle = "#e63946";
  ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OVEN", x + 46, GROUND_Y - 106);
}

function drawExitGate(ctx, stage, camX, time) {
  const x = stage.exitX - camX;
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x, GROUND_Y - 130, 14, 130);
  ctx.fillRect(x + 86, GROUND_Y - 130, 14, 130);
  ctx.fillStyle = "#43a047";
  ctx.fillRect(x - 6, GROUND_Y - 146, 112, 22);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(stage.index === 2 ? "FREEDOM!" : "EXIT", x + 50, GROUND_Y - 130);
  ctx.fillStyle = "#ffd23c";
  const wave = Math.sin(time * 5) * 4;
  ctx.beginPath();
  ctx.moveTo(x + 100, GROUND_Y - 146);
  ctx.lineTo(x + 132, GROUND_Y - 138 + wave);
  ctx.lineTo(x + 100, GROUND_Y - 128);
  ctx.closePath();
  ctx.fill();
}

function drawPickup(ctx, p, camX, time) {
  const x = p.x - camX;
  const bob = Math.sin(time * 4 + p.x) * 3;
  const y = p.y + bob;
  if (p.kind === "corn") {
    ctx.fillStyle = "#ffd23c";
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7cb342";
    ctx.beginPath();
    ctx.ellipse(x - 6, y + 12, 5, 10, -0.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === "feather") {
    ctx.fillStyle = "#e8a13c";
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 18, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a3b12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 16);
    ctx.lineTo(x + 8, y - 16);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#d97c2b";
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff3e0";
    ctx.beginPath();
    ctx.arc(x, y - 3, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawKnife(ctx, knife, camX) {
  const x = knife.x - camX;
  const y = knife.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(knife.angle);
  ctx.fillStyle = "#cfd6dd";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(30, 4);
  ctx.lineTo(0, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(-12, 1, 12, 7);
  ctx.restore();
}

export function drawHUD(ctx, game) {
  ctx.fillStyle = "rgba(42,21,8,0.78)";
  ctx.fillRect(0, 0, VIEW_W, 58);
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffe9c4";
  ctx.font = "bold 21px 'Trebuchet MS', sans-serif";
  ctx.fillText("SCORE " + game.score, 16, 26);
  ctx.font = "bold 16px 'Trebuchet MS', sans-serif";
  ctx.fillText(game.stage.name, 16, 48);

  // Lives as feathers.
  ctx.font = "bold 17px 'Trebuchet MS', sans-serif";
  ctx.fillText("LIVES", 330, 26);
  for (let i = 0; i < game.lives; i++) {
    ctx.fillStyle = "#e8a13c";
    ctx.beginPath();
    ctx.ellipse(402 + i * 26, 20, 7, 13, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distance to the exit.
  const progress = Math.max(0, Math.min(1, game.turkey.centerX / game.stage.exitX));
  ctx.fillStyle = "#ffe9c4";
  ctx.font = "bold 15px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("DISTANCE TO FREEDOM", VIEW_W - 16, 22);
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(VIEW_W - 276, 30, 260, 13);
  ctx.fillStyle = "#7cb342";
  ctx.fillRect(VIEW_W - 276, 30, 260 * progress, 13);
  ctx.fillStyle = "#ffd23c";
  ctx.beginPath();
  ctx.arc(VIEW_W - 276 + 260 * progress, 36, 7, 0, Math.PI * 2);
  ctx.fill();

  if (game.farmer.state === "chase") {
    ctx.fillStyle = "#e63946";
    ctx.font = "bold 24px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPOTTED! RUN!", VIEW_W / 2, 92);
  } else if (game.turkey.hiding) {
    ctx.fillStyle = "#7cb342";
    ctx.font = "bold 22px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HIDDEN…", VIEW_W / 2, 92);
  }
  if (game.banner) {
    ctx.fillStyle = "rgba(42,21,8,0.82)";
    ctx.fillRect(VIEW_W / 2 - 260, 200, 520, 84);
    ctx.fillStyle = "#ffd23c";
    ctx.font = "bold 34px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(game.banner, VIEW_W / 2, 252);
  }
}

export function drawTitleScreen(ctx, game, time) {
  drawBackground(ctx, game.stage, 0, time);
  drawStageProps(ctx, game.stage, 0, time);
  game.turkey.draw(ctx, 0, time);
  game.farmer.draw(ctx, 0, time);

  ctx.fillStyle = "rgba(42,21,8,0.55)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd23c";
  ctx.font = "bold 72px 'Trebuchet MS', sans-serif";
  ctx.fillText("GOBBLE DASH", VIEW_W / 2, 150);
  ctx.fillStyle = "#ffe9c4";
  ctx.font = "bold 28px 'Trebuchet MS', sans-serif";
  ctx.fillText("The Great Thanksgiving Escape", VIEW_W / 2, 196);
  ctx.font = "20px 'Trebuchet MS', sans-serif";
  ctx.fillText("You are the turkey. Dinner is at six. Run!", VIEW_W / 2, 248);
  ctx.fillText("Outrun the farmer · jump fences · hide in hay", VIEW_W / 2, 282);
  ctx.fillText("Dodge the oven and the carving knives", VIEW_W / 2, 312);
  ctx.fillStyle = "#7cb342";
  ctx.font = "bold 30px 'Trebuchet MS', sans-serif";
  ctx.fillText("Press ENTER or click to escape", VIEW_W / 2, 386);
  ctx.fillStyle = "#ffe9c4";
  ctx.font = "17px 'Trebuchet MS', sans-serif";
  ctx.fillText("Arrows/WASD move · Down hides · Shift dashes · Best score: " + game.best, VIEW_W / 2, 428);
}

export function drawEndScreen(ctx, game, time) {
  drawBackground(ctx, game.stage, game.camX, time);
  drawStageProps(ctx, game.stage, game.camX, time);
  game.turkey.draw(ctx, game.camX, time);
  game.farmer.draw(ctx, game.camX, time);

  ctx.fillStyle = "rgba(42,21,8,0.62)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = "center";
  if (game.escaped) {
    ctx.fillStyle = "#7cb342";
    ctx.font = "bold 64px 'Trebuchet MS', sans-serif";
    ctx.fillText("YOU ESCAPED!", VIEW_W / 2, 170);
    ctx.fillStyle = "#ffe9c4";
    ctx.font = "bold 26px 'Trebuchet MS', sans-serif";
    ctx.fillText("The turkey lives to gobble another day.", VIEW_W / 2, 220);
  } else {
    ctx.fillStyle = "#e63946";
    ctx.font = "bold 64px 'Trebuchet MS', sans-serif";
    ctx.fillText("CAUGHT!", VIEW_W / 2, 170);
    ctx.fillStyle = "#ffe9c4";
    ctx.font = "bold 26px 'Trebuchet MS', sans-serif";
    ctx.fillText("The farmer got his Thanksgiving dinner…", VIEW_W / 2, 220);
  }
  ctx.font = "bold 24px 'Trebuchet MS', sans-serif";
  ctx.fillText("Score: " + game.score + "    Best: " + game.best, VIEW_W / 2, 286);
  ctx.fillText("Corn gathered: " + game.cornCount + "    Stage reached: " + game.stage.short, VIEW_W / 2, 326);
  ctx.fillStyle = "#ffd23c";
  ctx.font = "bold 30px 'Trebuchet MS', sans-serif";
  ctx.fillText("Press ENTER to run again", VIEW_W / 2, 402);
}
