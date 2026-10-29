// 音（BGM と効果音）。音源ファイルは使わず、ピコピコ音をその場で鳴らす。
// スマホは「最初にタップしたあと」でないと音が出ないので、init() はタップのときに呼ぶ。
const Sound = (() => {
  let ctx = null, master = null, on = true;
  try { on = localStorage.getItem(CONFIG.SAVE_PREFIX + 'sound') !== 'off'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = on ? 0.22 : 0;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function tone(freq, t, dur, type, vol, slideTo) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = vol || 0.3;
    s.connect(g); g.connect(master); s.start(t);
  }

  const SFX = {
    jump: t => tone(300, t, 0.15, 'square', 0.2, 700),
    coin: t => { tone(988, t, 0.07, 'square', 0.2); tone(1319, t + 0.07, 0.25, 'square', 0.2); },
    power: t => [60, 64, 67, 72, 76, 79].forEach((m, i) => tone(mtof(m + 12), t + i * 0.05, 0.1, 'square', 0.2)),
    bump: t => tone(150, t, 0.08, 'square', 0.25),
    brick: t => noise(t, 0.2, 0.35),
    stomp: t => { tone(220, t, 0.1, 'square', 0.3, 90); noise(t, 0.08, 0.2); },
    hurt: t => [72, 67, 64, 60].forEach((m, i) => tone(mtof(m), t + i * 0.06, 0.1, 'square', 0.22)),
    slip: t => tone(500, t, 0.3, 'sine', 0.25, 150),
    diamond: t => [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => tone(mtof(m), t + i * 0.04, 0.12, 'triangle', 0.25)),
    oneup: t => [76, 79, 88, 84, 86, 91].forEach((m, i) => tone(mtof(m), t + i * 0.09, 0.12, 'square', 0.2)),
    whip: t => { noise(t, 0.12, 0.4); tone(1200, t, 0.08, 'sawtooth', 0.15, 300); },
    throw: t => tone(600, t, 0.1, 'triangle', 0.15, 900),
    eat: t => { tone(400, t, 0.06, 'square', 0.2); tone(300, t + 0.08, 0.06, 'square', 0.2); },
    boss: t => { tone(110, t, 0.3, 'sawtooth', 0.3, 55); noise(t, 0.3, 0.3); },
    warn: t => { tone(880, t, 0.1, 'square', 0.2); tone(880, t + 0.15, 0.1, 'square', 0.2); },
    die: t => [71, 77, 77, 77, 76, 74, 72].forEach((m, i) => tone(mtof(m), t + i * 0.13, 0.12, 'square', 0.22)),
    goal: t => [67, 72, 76, 79, 84, 88, 91, 96].forEach((m, i) => tone(mtof(m), t + i * 0.08, 0.2, 'square', 0.22)),
    zubo: t => { tone(120, t, 0.35, 'sine', 0.5, 40); noise(t, 0.25, 0.3); },
    pass: t => [72, 76, 79, 84].forEach((m, i) => tone(mtof(m), t + i * 0.12, 0.3, 'triangle', 0.3)),
    fail: t => [67, 66, 65, 64].forEach((m, i) => tone(mtof(m), t + i * 0.18, 0.25, 'triangle', 0.3)),
    select: t => tone(880, t, 0.06, 'square', 0.15),
    record: t => [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => tone(mtof(m), t + i * 0.1, 0.18, 'square', 0.22)),
  };
  function play(name) { if (!ctx || !on || !SFX[name]) return; SFX[name](ctx.currentTime + 0.01); }

  // ---------- BGM（オリジナルの短いループ。0 は休み） ----------
  const SONGS = [
    { bpm: 132, // バナナ畑：明るい
      lead: [72, 76, 79, 76, 81, 79, 76, 0, 77, 81, 84, 81, 79, 0, 76, 0, 74, 77, 81, 77, 79, 76, 72, 0, 74, 76, 77, 79, 72, 0, 0, 0],
      bass: [48, 0, 55, 0, 48, 0, 55, 0, 53, 0, 60, 0, 53, 0, 60, 0, 50, 0, 57, 0, 48, 0, 55, 0, 43, 0, 50, 0, 48, 0, 43, 0] },
    { bpm: 116, // 森：少しミステリアス
      lead: [69, 72, 76, 72, 74, 76, 72, 69, 67, 71, 74, 71, 72, 74, 71, 67, 69, 72, 76, 81, 79, 76, 74, 72, 71, 72, 74, 76, 69, 0, 69, 0],
      bass: [45, 0, 52, 0, 45, 0, 52, 0, 43, 0, 50, 0, 43, 0, 50, 0, 41, 0, 48, 0, 41, 0, 48, 0, 40, 0, 47, 0, 45, 0, 40, 0] },
    { bpm: 150, // 夜の山：緊張感
      lead: [74, 0, 77, 74, 81, 0, 79, 77, 76, 0, 79, 76, 84, 0, 81, 79, 77, 79, 81, 77, 74, 76, 77, 74, 73, 74, 76, 73, 74, 0, 0, 0],
      bass: [38, 38, 50, 38, 38, 38, 50, 38, 36, 36, 48, 36, 36, 36, 48, 36, 34, 34, 46, 34, 34, 34, 46, 34, 33, 33, 45, 33, 38, 0, 38, 0] },
    { bpm: 180, // ダイヤモンド：キラキラ
      lead: [72, 76, 79, 84, 79, 76, 72, 76, 74, 77, 81, 86, 81, 77, 74, 77, 76, 79, 84, 88, 84, 79, 76, 79, 77, 81, 84, 89, 84, 81, 79, 84],
      bass: [48, 0, 48, 0, 48, 0, 48, 0, 50, 0, 50, 0, 50, 0, 50, 0, 52, 0, 52, 0, 52, 0, 52, 0, 53, 0, 53, 0, 55, 0, 55, 0] },
  ];
  let song = null, step = 0, nextTime = 0, timer = null, tempo = 1;
  function tick() {
    if (!ctx || !song) return;
    const stepDur = 60 / song.bpm / 2 / tempo;
    while (nextTime < ctx.currentTime + 0.15) {
      if (on) {
        const n = song.lead[step % song.lead.length], b = song.bass[step % song.bass.length];
        if (n) tone(mtof(n), nextTime, stepDur * 0.9, 'square', 0.1);
        if (b) tone(mtof(b), nextTime, stepDur * 0.9, 'triangle', 0.22);
      }
      step++; nextTime += stepDur;
    }
  }
  let current = -1;
  function bgm(i) {
    if (!ctx) return;
    if (i === current) return;
    current = i; song = SONGS[i] || null; step = 0; nextTime = ctx.currentTime + 0.05;
    if (!timer) timer = setInterval(tick, 30);
  }
  function stopBgm() { song = null; current = -1; }
  function setTempo(m) { tempo = m; }
  function toggle() {
    on = !on;
    try { localStorage.setItem(CONFIG.SAVE_PREFIX + 'sound', on ? 'on' : 'off'); } catch (e) {}
    if (master) master.gain.value = on ? 0.22 : 0;
    return on;
  }
  return { init, play, bgm, stopBgm, setTempo, toggle, isOn: () => on };
})();
