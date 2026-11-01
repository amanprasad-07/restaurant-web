let ctx: AudioContext | null = null;

/** Call from a click handler once: browsers only allow audio after a user gesture. */
export function enableAudio() {
  if (typeof window === "undefined") return;
  ctx ??= new AudioContext();
  void ctx.resume();
}

/** Short two-tone "new ticket" beep. Silent if audio was never enabled. */
export function playBeep() {
  if (!ctx || ctx.state !== "running") return;
  const t0 = ctx.currentTime;
  [880, 1175].forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + i * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.16 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.16 + 0.14);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(t0 + i * 0.16);
    osc.stop(t0 + i * 0.16 + 0.15);
  });
}
