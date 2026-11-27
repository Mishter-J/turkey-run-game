// Stage layouts for Gobble Dash: farmyard, barn, kitchen.
// One job: describe each stage's world so the game logic stays generic.

export const GROUND_Y = 470;
export const VIEW_W = 960;
export const VIEW_H = 540;

function fence(x) {
  return { x, w: 70, h: 64, type: "fence" };
}
function crate(x) {
  return { x, w: 58, h: 58, type: "crate" };
}
function barrel(x) {
  return { x, w: 46, h: 66, type: "barrel" };
}
function counter(x) {
  return { x, w: 120, h: 84, type: "counter" };
}
function corn(x, y) {
  return { x, y: y || GROUND_Y - 34, taken: false, kind: "corn" };
}
function feather(x, y) {
  return { x, y: y || GROUND_Y - 90, taken: false, kind: "feather" };
}
function pie(x, y) {
  return { x, y: y || GROUND_Y - 34, taken: false, kind: "pie" };
}

export const STAGES = [
  {
    name: "Stage 1 · Farmyard Dawn",
    short: "Farmyard",
    length: 2600,
    farmerSpeed: 238,
    farmerSight: 360,
    skyTop: "#f6a24b",
    skyBottom: "#ffe3a3",
    ground: "#8a5a2b",
    groundTop: "#c98d45",
    obstacles: [fence(560), fence(1050), crate(1500), fence(1950)],
    hides: [{ x: 820, w: 110 }, { x: 1720, w: 110 }, { x: 2250, w: 110 }],
    muds: [],
    ovens: [],
    knifeRain: 0,
    farmerThrows: false,
    pickups: [corn(420), corn(640, GROUND_Y - 110), corn(980), corn(1240), feather(1560), corn(1830), corn(2100), corn(2380)],
  },
  {
    name: "Stage 2 · Barn at Dusk",
    short: "Barn",
    length: 3000,
    farmerSpeed: 262,
    farmerSight: 400,
    skyTop: "#7a3b69",
    skyBottom: "#f0913c",
    ground: "#6e4520",
    groundTop: "#a06a32",
    obstacles: [crate(520), fence(920), barrel(1330), fence(1750), crate(2180), fence(2560)],
    hides: [{ x: 720, w: 110 }, { x: 1520, w: 110 }, { x: 2350, w: 110 }],
    muds: [{ x: 1120, w: 150 }, { x: 1980, w: 150 }],
    ovens: [],
    knifeRain: 0,
    farmerThrows: false,
    pickups: [corn(400), corn(700), pie(1010), corn(1420), corn(1640, GROUND_Y - 110), feather(2050), corn(2320), corn(2700)],
  },
  {
    name: "Stage 3 · The Kitchen",
    short: "Kitchen",
    length: 3200,
    farmerSpeed: 284,
    farmerSight: 440,
    skyTop: "#4a2c1a",
    skyBottom: "#8a5a33",
    ground: "#5b3a22",
    groundTop: "#d9b380",
    obstacles: [counter(620), counter(1280), counter(2050), counter(2620)],
    hides: [{ x: 950, w: 120 }, { x: 1720, w: 120 }, { x: 2380, w: 120 }],
    muds: [],
    ovens: [{ x: 1020 }, { x: 1880 }, { x: 2760 }],
    knifeRain: 2.6,
    farmerThrows: true,
    pickups: [corn(420), corn(780, GROUND_Y - 130), corn(1180), pie(1560), corn(1980), feather(2240), corn(2520), corn(2920)],
  },
];

export function makeStage(index) {
  const base = STAGES[index];
  return {
    ...base,
    index,
    exitX: base.length - 160,
    obstacles: base.obstacles.map((o) => ({ ...o })),
    hides: base.hides.map((h) => ({ ...h })),
    muds: base.muds.map((m) => ({ ...m })),
    ovens: base.ovens.map((o) => ({ ...o, cycle: 0 })),
    pickups: base.pickups.map((p) => ({ ...p })),
  };
}
