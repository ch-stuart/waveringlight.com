// Paul Kellet's 7-accumulator 1/f approximation
export function makePink(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleCount = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  // Warm up: slowest pole (0.99886) has τ ≈ 877 samples; run 5× that
  for (let index = 0; index < 4096; index++) {
    const whiteSample = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + whiteSample * 0.0555179;
    b1 = 0.99332 * b1 + whiteSample * 0.0750759;
    b2 = 0.969 * b2 + whiteSample * 0.153852;
    b3 = 0.8665 * b3 + whiteSample * 0.3104856;
    b4 = 0.55 * b4 + whiteSample * 0.5329522;
    b5 = -0.7616 * b5 - whiteSample * 0.016898;
    b6 = whiteSample * 0.115926;
  }
  for (let index = 0; index < sampleCount; index++) {
    const whiteSample = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + whiteSample * 0.0555179;
    b1 = 0.99332 * b1 + whiteSample * 0.0750759;
    b2 = 0.969 * b2 + whiteSample * 0.153852;
    b3 = 0.8665 * b3 + whiteSample * 0.3104856;
    b4 = 0.55 * b4 + whiteSample * 0.5329522;
    b5 = -0.7616 * b5 - whiteSample * 0.016898;
    data[index] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteSample * 0.5362) * 0.11;
    b6 = whiteSample * 0.115926;
  }
  return buffer;
}

export function makeWhite(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleCount = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index++) data[index] = Math.random() * 2 - 1;
  return buffer;
}

// Random walk (1/f² spectrum) with edge fading to prevent loop clicks
export function makeBrown(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleCount = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < sampleCount; index++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[index] = last * 3.5;
  }
  const fade = Math.min(441, Math.floor(sampleCount / 2));
  for (let index = 0; index < fade; index++) {
    const fadeRatio = index / fade;
    data[index] *= fadeRatio;
    data[sampleCount - 1 - index] *= fadeRatio;
  }
  return buffer;
}

// Equal-loudness-inspired tilt: blend white with a one-pole LP at ~625Hz
export function makeGrey(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleCount = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const lpCoeff = 0.9144; // exp(-2π · 625 / 44100)
  let lpState = 0;
  for (let index = 0; index < sampleCount; index++) {
    const whiteSample = Math.random() * 2 - 1;
    lpState = lpCoeff * lpState + (1 - lpCoeff) * whiteSample;
    data[index] = (whiteSample * 0.72 + lpState * 1.18) * 0.34;
  }
  return buffer;
}
