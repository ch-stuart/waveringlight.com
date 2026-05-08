import { GridEngine } from "./audio/grid-engine.js";

const DOT_SIZE = 35;
const EDGE_PAD = 5;
const BOTTOM_PAD = 15;
// Dynamic island: top 10px + height 24px = bottom at 34px, plus 10px clearance
const TOP_PAD = 34 + 10;
const DRAG_THRESHOLD_SQ = 6 * 6;

function getBounds(width: number, height: number) {
  return {
    minX: EDGE_PAD,
    maxX: width - DOT_SIZE - EDGE_PAD,
    minY: TOP_PAD,
    maxY: height - DOT_SIZE - BOTTOM_PAD,
  };
}

export function mount(
  dot: HTMLElement,
  container: HTMLElement,
  initialEvent: PointerEvent,
  ctx: AudioContext,
  playingClass: string,
) {
  const engine = new GridEngine(ctx);
  const audioEl = document.getElementById("audio-output") as HTMLAudioElement;
  audioEl.srcObject = engine.stream;
  let isPlaying = false;
  let pos = { x: 0.75, y: 0.75 };
  let downClient: { x: number; y: number } | null = null;
  let isDragging = false;
  let downOnDot = false;
  let dragTracked = false;

  function updateDot() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const { minX, maxX, minY, maxY } = getBounds(width, height);
    const dotX = minX + pos.x * (maxX - minX);
    const dotY = minY + pos.y * (maxY - minY);
    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
  }

  function normalize(clientX: number, clientY: number) {
    const rect = container.getBoundingClientRect();
    const { minX, maxX, minY, maxY } = getBounds(rect.width, rect.height);
    const clampedX = Math.max(minX, Math.min(maxX, clientX - rect.left - DOT_SIZE / 2));
    const clampedY = Math.max(minY, Math.min(maxY, clientY - rect.top - DOT_SIZE / 2));
    return {
      x: (clampedX - minX) / (maxX - minX),
      y: (clampedY - minY) / (maxY - minY),
    };
  }

  function togglePlay() {
    if (isPlaying) {
      engine.stop();
      audioEl.pause();
      isPlaying = false;
      window.umami?.track("noise-stop");
    } else {
      engine.start(pos.x, pos.y);
      audioEl.play().catch(() => {});
      isPlaying = true;
      window.umami?.track("noise-play");
    }
    dot.classList.toggle(playingClass, isPlaying);
    container.setAttribute("aria-pressed", String(isPlaying));
  }

  container.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    container.setPointerCapture(event.pointerId);
    downClient = { x: event.clientX, y: event.clientY };
    isDragging = false;
    dragTracked = false;
    const dotRect = dot.getBoundingClientRect();
    const pad = 12;
    downOnDot =
      event.clientX >= dotRect.left - pad &&
      event.clientX <= dotRect.right + pad &&
      event.clientY >= dotRect.top - pad &&
      event.clientY <= dotRect.bottom + pad;
  });

  container.addEventListener("pointermove", (event) => {
    if (!downClient || !downOnDot) return;
    const deltaX = event.clientX - downClient.x;
    const deltaY = event.clientY - downClient.y;
    if (!isDragging && deltaX * deltaX + deltaY * deltaY < DRAG_THRESHOLD_SQ) return;
    if (!dragTracked) {
      dragTracked = true;
      window.umami?.track("noise-drag");
    }
    isDragging = true;
    pos = normalize(event.clientX, event.clientY);
    updateDot();
    if (isPlaying) engine.setPosition(pos.x, pos.y);
  });

  container.addEventListener("pointerup", () => {
    if (!downClient) return;
    downClient = null;
    if (!isDragging) togglePlay();
    isDragging = false;
    downOnDot = false;
  });

  container.addEventListener("pointercancel", () => {
    downClient = null;
    isDragging = false;
    downOnDot = false;
  });

  container.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      togglePlay();
    }
  });

  window.addEventListener("resize", updateDot);

  downClient = { x: initialEvent.clientX, y: initialEvent.clientY };
  updateDot();
}
