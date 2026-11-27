// Keyboard and mouse input for Gobble Dash.
// One job: turn raw browser events into a small state object the game reads.

export function createInput(canvas) {
  const state = {
    left: false,
    right: false,
    duck: false,
    dash: false,
    jumpQueued: false,
    startQueued: false,
    mouseDown: false,
    mouseX: 480,
  };

  function onKey(down) {
    return (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) {
        event.preventDefault();
      }
      if (key === "arrowleft" || key === "a") state.left = down;
      if (key === "arrowright" || key === "d") state.right = down;
      if (key === "arrowdown" || key === "s") state.duck = down;
      if (key === "shift") state.dash = down;
      if (down && (key === "arrowup" || key === "w" || key === " ")) {
        state.jumpQueued = true;
      }
      if (down && key === "enter") state.startQueued = true;
    };
  }

  window.addEventListener("keydown", onKey(true));
  window.addEventListener("keyup", onKey(false));

  canvas.addEventListener("mousedown", (event) => {
    state.mouseDown = true;
    state.jumpQueued = true;
    state.startQueued = true;
    updateMouseX(event);
  });
  window.addEventListener("mouseup", () => {
    state.mouseDown = false;
  });
  canvas.addEventListener("mousemove", updateMouseX);

  function updateMouseX(event) {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  }

  state.takeJump = () => {
    const queued = state.jumpQueued;
    state.jumpQueued = false;
    return queued;
  };
  state.takeStart = () => {
    const queued = state.startQueued;
    state.startQueued = false;
    return queued;
  };
  state.dashing = () => state.dash || state.mouseDown;

  return state;
}
