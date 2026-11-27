// WebAudio sound effects for Gobble Dash. No audio files: every sound is
// a short oscillator phrase made in code.

export class SoundBank {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  tone(freq, seconds, type, volume, slideTo) {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + seconds);
    }
    gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  }

  gobble() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.tone(320 - i * 30, 0.07, "sawtooth", 0.05, 180), i * 70);
    }
  }

  jump() {
    this.tone(300, 0.16, "square", 0.06, 640);
  }

  flap() {
    this.tone(520, 0.1, "triangle", 0.07, 300);
  }

  pickup() {
    this.tone(880, 0.09, "sine", 0.09);
    setTimeout(() => this.tone(1320, 0.12, "sine", 0.09), 80);
  }

  hit() {
    this.tone(200, 0.25, "sawtooth", 0.1, 70);
  }

  spotted() {
    this.tone(740, 0.1, "square", 0.08);
    setTimeout(() => this.tone(740, 0.1, "square", 0.08), 130);
  }

  knife() {
    this.tone(1600, 0.12, "sawtooth", 0.04, 500);
  }

  stageClear() {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.16, "triangle", 0.09), i * 110)
    );
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.22, "sawtooth", 0.08), i * 160)
    );
  }

  escaped() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.18, "triangle", 0.09), i * 120)
    );
  }
}
