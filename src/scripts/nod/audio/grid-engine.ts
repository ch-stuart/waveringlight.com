import { makeWhite, makeGrey, makePink, makeBrown } from "./noise-gen.js";

// Audio graph:
// src[0..3] → gains[0..3] ─┐
//                            ├→ hp → lp → master → destination
//                           ─┘
// Noise order: 0=white 1=grey 2=pink 3=brown (top→bottom on Y axis)

export class GridEngine {
  private ctx: AudioContext;
  private gains: GainNode[];
  private hp: BiquadFilterNode;
  private lp: BiquadFilterNode;
  private master: GainNode;

  private streamDest: MediaStreamAudioDestinationNode;
  private sources: AudioBufferSourceNode[] = [];
  private cachedBuffers: AudioBuffer[] = [];

  private targetGains = [1, 0, 0, 0];
  private currentGains = [1, 0, 0, 0];
  private targetHP = 20;
  private currentHP = 20;
  private targetLP = 22050;
  private currentLP = 22050;

  private rafId = 0;
  private startupFrame = 0;
  private readonly STARTUP_FRAMES = 3;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    this.gains = Array.from({ length: 4 }, () => this.ctx.createGain());

    this.hp = this.ctx.createBiquadFilter();
    this.hp.type = "highpass";
    this.hp.frequency.value = 20;
    this.hp.Q.value = 0.707;

    this.lp = this.ctx.createBiquadFilter();
    this.lp.type = "lowpass";
    this.lp.frequency.value = 22050;
    this.lp.Q.value = 0.707;

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    // Route through MediaStreamDestinationNode so the <audio> element can play
    // the output — this promotes the iOS audio session to "playback" category,
    // which bypasses the ringer/mute switch.
    this.streamDest = this.ctx.createMediaStreamDestination();

    for (const gain of this.gains) gain.connect(this.hp);
    this.hp.connect(this.lp);
    this.lp.connect(this.master);
    this.master.connect(this.streamDest);
  }

  get stream(): MediaStream {
    return this.streamDest.stream;
  }

  // Must be called from a user-gesture handler so ctx.resume() is permitted
  async start(normalizedX: number, normalizedY: number) {
    await this.ctx.resume();

    if (this.cachedBuffers.length === 0) {
      this.cachedBuffers = [
        makeWhite(this.ctx, 5),
        makeGrey(this.ctx, 5),
        makePink(this.ctx, 5),
        makeBrown(this.ctx, 5),
      ];
    }

    this.sources = this.cachedBuffers.map((buffer, index) => {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.gains[index]);
      source.start();
      return source;
    });

    // Snap parameters to current position, then fade master in from silence
    this.setPosition(normalizedX, normalizedY);
    for (let index = 0; index < 4; index++) {
      this.currentGains[index] = this.targetGains[index];
      this.gains[index].gain.value = this.currentGains[index];
    }
    this.currentHP = this.targetHP;
    this.currentLP = this.targetLP;
    this.hp.frequency.value = this.currentHP;
    this.lp.frequency.value = this.currentLP;

    this.master.gain.value = 0;
    this.startupFrame = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources = [];
    this.ctx.suspend();
  }

  setPosition(normalizedX: number, normalizedY: number) {
    const yBiased = Math.pow(normalizedY, 0.65);
    const centers = [0, 1 / 3, 2 / 3, 1];
    for (let index = 0; index < 4; index++) {
      this.targetGains[index] = Math.max(0, 1 - Math.abs(yBiased - centers[index]) * 3);
    }
    this.targetHP = normalizedX < 0.2 ? this.logInterp(150, 20, normalizedX / 0.2) : 20;
    this.targetLP =
      normalizedX > 0.2 ? this.logInterp(22050, 350, (normalizedX - 0.2) / 0.8) : 22050;
  }

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.startupFrame < this.STARTUP_FRAMES) {
      this.master.gain.value = ++this.startupFrame / this.STARTUP_FRAMES;
    }

    const alpha = 0.08;
    for (let index = 0; index < 4; index++) {
      this.currentGains[index] += (this.targetGains[index] - this.currentGains[index]) * alpha;
      this.gains[index].gain.value = this.currentGains[index];
    }
    this.currentHP += (this.targetHP - this.currentHP) * alpha;
    this.currentLP += (this.targetLP - this.currentLP) * alpha;
    this.hp.frequency.value = this.currentHP;
    this.lp.frequency.value = this.currentLP;
  };

  private logInterp(from: number, to: number, progress: number): number {
    return Math.exp(Math.log(from) * (1 - progress) + Math.log(to) * progress);
  }
}
