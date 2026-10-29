// 描画（背景・地形・キャラ・敵・画面上部の表示）
const Render = (() => {
  const C = CONFIG, T = C.TILE;
  const FONT = '"DotGothic16", "Hiragino Maru Gothic ProN", sans-serif';
  let cv, ctx, k = 1;

  function init(canvas) { cv = canvas; ctx = cv.getContext('2d'); resize(); }
  function resize() {
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    k = cv.height / C.VIEW_H; // 高さ基準。横幅（VIEW_W）は画面の比率に合わせて main.js が決める
  }

  const THEME = [
    { sky: ['#6EC3FF', '#DDF3FF'], far: '#A6DE8E', near: '#74C25E', grass: '#5DBB3F', grassD: '#3E8E2A', dirt: '#B9773D', dirtD: '#8E5527', plat: '#C08A4E', platD: '#8A5A2B', rock: '#9C8B7A', rockD: '#6E5F52' },
    { sky: ['#2D6A55', '#A8DDB9'], far: '#3D7A5C', near: '#285640', grass: '#4E9A3A', grassD: '#2F6B25', dirt: '#7A5233', dirtD: '#5A3A22', plat: '#6BAA3C', platD: '#3F7524', rock: '#7D7468', rockD: '#555047' },
    { sky: ['#0B0D2A', '#3B2C5E'], far: '#2A2350', near: '#191435', grass: '#6A7BA0', grassD: '#3F4A6A', dirt: '#4A3F5E', dirtD: '#342B45', plat: '#8E86A8', platD: '#5C5578', rock: '#4E4868', rockD: '#332E48' },
  ];
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------------- 背景 ----------------
  function repeat(off, period, fn) {
    const start = Math.floor(off / period) - 1;
    for (let i = start; i < start + Math.ceil(C.VIEW_W / period) + 3; i++) fn(i * period - off, i);
  }
  function background(W) {
    const th = THEME[W.stage], cam = W.camX;
    const g = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
    g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    if (W.stage === 0) {
      ctx.fillStyle = '#FFF3B0'; circle(C.VIEW_W - 60, 40, 16); ctx.fillStyle = 'rgba(255,243,176,.35)'; circle(C.VIEW_W - 60, 40, 24);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      repeat(cam * 0.15, 160, (x, i) => { const y = 30 + hash(i) * 40; ellipse(x + 40, y, 22, 8); ellipse(x + 55, y - 6, 14, 9); ellipse(x + 28, y - 3, 10, 7); });
      ctx.fillStyle = th.far;
      repeat(cam * 0.3, 140, (x, i) => { ellipse(x + 70, 190, 90, 60 + hash(i + 3) * 30); });
      repeat(cam * 0.55, 120, (x, i) => { if (hash(i + 9) > 0.45) palm(x + 60, 192, 40 + hash(i) * 20); });
    } else if (W.stage === 1) {
      ctx.fillStyle = 'rgba(255,255,220,.12)';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 90, 0); ctx.lineTo(100 + i * 90, 0); ctx.lineTo(40 + i * 90, 225); ctx.lineTo(10 + i * 90, 225); ctx.fill(); }
      ctx.fillStyle = th.far;
      repeat(cam * 0.25, 70, (x, i) => { const h = 90 + hash(i) * 50; tri(x + 35, 200 - h, 34, h); });
      ctx.fillStyle = th.near;
      repeat(cam * 0.5, 110, (x, i) => { ctx.fillRect(x + 50, 40, 12, 170); ellipse(x + 56, 50, 40, 26 + hash(i) * 10); ellipse(x + 30, 70, 24, 16); ellipse(x + 84, 66, 26, 18); });
    } else {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 80; i++) { const SW = C.VIEW_W, x = (hash(i) * 900 - cam * 0.05) % SW; const tw = (Math.sin(W.frame * 0.05 + i) + 1) / 2; ctx.globalAlpha = 0.3 + tw * 0.7; ctx.fillRect((x + SW) % SW, hash(i + 50) * 120, 1.5, 1.5); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFF1B8'; circle(C.VIEW_W - 80, 46, 18); ctx.fillStyle = THEME[2].sky[0]; circle(C.VIEW_W - 72, 40, 15);
      ctx.fillStyle = th.far;
      repeat(cam * 0.2, 150, (x, i) => tri(x + 75, 70 + hash(i) * 40, 90, 160));
      ctx.fillStyle = th.near;
      repeat(cam * 0.45, 100, (x, i) => tri(x + 50, 110 + hash(i + 4) * 40, 60, 120));
    }
  }
  function palm(x, base, h) {
    ctx.strokeStyle = '#8B6B3D'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x - 6, base - h / 2, x + 2, base - h); ctx.stroke();
    ctx.fillStyle = '#4FAE4A';
    for (const a of [-2.6, -1.9, -1.2, -0.5, 0.2]) { ctx.beginPath(); ctx.ellipse(x + 2 + Math.cos(a) * 12, base - h + Math.sin(a) * 6 + 4, 14, 4, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#FFD84D'; ellipse(x + 6, base - h + 8, 3, 5); ellipse(x - 1, base - h + 9, 3, 5);
  }

  // ---------------- 地形 ----------------
  function tiles(W) {
    const th = THEME[W.stage];
    const c0 = Math.floor(W.camX / T), c1 = c0 + Math.ceil(C.VIEW_W / T) + 1;
    const goalCol = Math.floor(W.goalX / T);
    for (let ty = 0; ty < W.rows; ty++) for (let tx = c0; tx <= c1 && tx < W.cols; tx++) {
      const ch = W.map[ty][tx];
      if (ch === '.') continue;
      const bump = W.bumps.find(b => b.tx === tx && b.ty === ty);
      const x = tx * T - W.camX, y = ty * T - (bump ? Math.sin(bump.t / 10 * Math.PI) * 5 : 0);
      drawTile(ch, x, y, tx, ty, th, W, goalCol);
    }
  }
  function bevel(x, y, base, light, dark) {
    ctx.fillStyle = base; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = light; ctx.fillRect(x, y, T, 2); ctx.fillRect(x, y, 2, T);
    ctx.fillStyle = dark; ctx.fillRect(x, y + T - 2, T, 2); ctx.fillRect(x + T - 2, y, 2, T);
  }
  function drawTile(ch, x, y, tx, ty, th, W, goalCol) {
    switch (ch) {
      case '#':
        ctx.fillStyle = th.dirt; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = th.grass; ctx.fillRect(x, y, T, 5);
        ctx.fillStyle = th.grassD; ctx.fillRect(x, y + 5, T, 1);
        ctx.fillRect(x + 3, y + 5, 2, 2); ctx.fillRect(x + 10, y + 5, 2, 3);
        break;
      case 'd':
        ctx.fillStyle = th.dirt; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = th.dirtD; ctx.fillRect(x + 3 + hash(tx * 7 + ty) * 8, y + 4 + hash(tx + ty * 5) * 8, 2, 2);
        break;
      case 'X': bevel(x, y, '#A2968B', '#CFC6BC', '#6B6058'); ctx.fillStyle = '#6B6058'; ctx.fillRect(x + 5, y + 5, 2, 2); ctx.fillRect(x + 9, y + 9, 2, 2); break;
      case 'B':
        ctx.fillStyle = '#C8642A'; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#7A3512'; ctx.fillRect(x, y + 7, T, 1); ctx.fillRect(x, y + 15, T, 1); ctx.fillRect(x + 7, y, 1, 7); ctx.fillRect(x + 3, y + 8, 1, 7); ctx.fillRect(x + 12, y + 8, 1, 7);
        ctx.fillStyle = '#E4864A'; ctx.fillRect(x, y, T, 1);
        break;
      case '?': case 'Q': {
        const sh = (Math.sin(W.frame * 0.12 + tx) + 1) / 2;
        bevel(x, y, sh > 0.7 ? '#FFD45E' : '#F5B82E', '#FFE9A6', '#B9801A');
        ctx.fillStyle = '#7A4A0E'; text('?', x + 8.5, y + 12.5, 11, 'center');
        ctx.fillStyle = '#fff'; text('?', x + 8, y + 12, 11, 'center');
        break;
      }
      case 'U': bevel(x, y, '#9C6B3C', '#B98656', '#6A4524'); break;
      case '=':
        ctx.fillStyle = th.plat; ctx.fillRect(x, y, T, 5);
        ctx.fillStyle = th.platD; ctx.fillRect(x, y + 5, T, 2);
        if (W.stage === 1) { ctx.fillStyle = '#7CC24B'; ellipse(x + 4, y + 1, 5, 3); ellipse(x + 12, y + 2, 5, 3); }
        break;
      case 'o': {
        const wdt = Math.abs(Math.cos(W.frame * 0.08 + tx * 0.7)) * 5 + 1;
        ctx.fillStyle = '#B7860B'; ellipse(x + 8, y + 8, wdt + 1, 7);
        ctx.fillStyle = '#FFD54F'; ellipse(x + 8, y + 8, wdt, 6);
        if (wdt > 4) { ctx.fillStyle = '#B7860B'; text('BK', x + 8, y + 10.5, 6, 'center'); }
        break;
      }
      case 'R':
        ctx.fillStyle = th.rock; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = th.rockD;
        if (hash(tx * 3 + ty * 11) > 0.5) ctx.fillRect(x + 2, y + 4, 6, 2);
        if (hash(tx * 13 + ty * 7) > 0.6) ctx.fillRect(x + 8, y + 10, 5, 2);
        if (tx === goalCol) { ctx.fillStyle = th.rockD; ctx.fillRect(x, y, 2, T); }
        break;
      case 'G': {
        const g = ctx.createLinearGradient(x, 0, x + T, 0);
        const depth = tx - goalCol;
        g.addColorStop(0, depth === 0 ? '#3A1E10' : '#1A0D06'); g.addColorStop(1, '#100804');
        ctx.fillStyle = g; ctx.fillRect(x, y, T, T);
        break;
      }
      case 'D':
        ctx.fillStyle = 'rgba(60,20,80,.5)'; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#B48CFF'; ctx.fillRect(x + 3, y, 3, T); ctx.fillRect(x + 10, y, 3, T);
        ctx.fillStyle = '#E3D2FF'; ctx.fillRect(x + 1, y + 6, 14, 2);
        break;
    }
  }
  // ゴールの横穴の飾り
  function goalDeco(W) {
    const x = W.goalX - W.camX, top = (Stages.GROUND - 2) * T;
    if (x < -40 || x > C.VIEW_W + 40) return;
    const pulse = (Math.sin(W.frame * 0.1) + 1) / 2;
    ctx.strokeStyle = `rgba(255,150,200,${0.4 + pulse * 0.5})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x + 1, top + 16, 5, 18, 0, 0, Math.PI * 2); ctx.stroke();
    // 看板
    ctx.fillStyle = '#8B5A2B'; ctx.fillRect(x - 3, top - 26, 2, 24);
    ctx.fillStyle = '#FFE066'; roundRect(x - 26, top - 34, 40, 14, 3); ctx.fill();
    ctx.fillStyle = '#7A4A0E'; text('GOAL →', x - 6, top - 23.5, 8, 'center');
  }

  // ---------------- 主人公 ----------------
  function player(W) {
    const p = W.player;
    if (!p.dead && p.invuln > 0 && Math.floor(p.invuln / 4) % 2) return;
    const img = Chara.image(p.level, p.expr, p.diamond > 0);
    const H = p.h * 176 / 150, Wd = H * Chara.ASPECT;
    const cx = p.x + p.w / 2 - W.camX, cy = p.y + p.h / 2;
    ctx.save();
    if (W.goal) ctx.globalAlpha = W.goal.alpha;
    ctx.translate(cx, cy);
    if (W.goal) ctx.rotate(W.goal.angle);
    if (p.dead) ctx.rotate(p.deadT > 30 ? Math.PI : 0);
    if (p.diamond > 0) {
      const a = 0.35 + Math.sin(W.frame * 0.3) * 0.15;
      ctx.fillStyle = `rgba(190,240,255,${a})`; ctx.beginPath(); ctx.ellipse(0, 0, Wd * 0.8, H * 0.65, 0, 0, Math.PI * 2); ctx.fill();
    }
    const bob = p.onGround && Math.abs(p.vx) > 0.2 && !W.goal ? Math.abs(Math.sin(p.anim)) * 1.5 : 0;
    const sq = !p.onGround && !W.goal && !p.dead ? 1.06 : 1;
    ctx.scale((p.face < 0 && !W.goal ? -1 : 1) / sq, sq);
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, -Wd / 2, p.h / 2 - H + H * 2 / 176 - bob, Wd, H);
    else { ctx.fillStyle = '#F7D154'; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
    ctx.restore();
    if (p.slip > 0 && !W.goal) { ctx.fillStyle = 'rgba(142,224,122,.8)'; ellipse(cx, p.y + p.h, p.w * 0.7, 2); }
  }

  // ---------------- 敵・アイテム ----------------
  function ents(W) {
    for (const L of W.lifts) {
      const x = L.x - W.camX; if (x > C.VIEW_W || x + L.w < 0) continue;
      ctx.fillStyle = '#6B4A2B'; ctx.fillRect(x, L.y, L.w, L.h);
      ctx.fillStyle = '#C9965B'; ctx.fillRect(x, L.y, L.w, 3);
      ctx.fillStyle = '#6B4A2B'; for (let i = 6; i < L.w; i += 8) ctx.fillRect(x + i, L.y, 1, 3);
    }
    for (const s of W.signs) {
      const x = s.x - W.camX; if (x < -20 || x > C.VIEW_W + 20) continue;
      ctx.fillStyle = '#8B5A2B'; ctx.fillRect(x + 5, s.y + 6, 3, 10);
      ctx.fillStyle = '#D9A066'; roundRect(x - 1, s.y - 2, 15, 10, 2); ctx.fill();
      ctx.fillStyle = '#7A4A0E'; text('!', x + 6.5, s.y + 6, 8, 'center');
    }
    for (const e of W.ents) {
      const x = e.x - W.camX;
      if (x < -60 || x > C.VIEW_W + 60) continue;
      ctx.save();
      ctx.translate(Math.round(x + e.w / 2), e.y + e.h);
      DRAW[e.type] && DRAW[e.type](e, W);
      ctx.restore();
      if (e.type === 'queen' && e.alive && e.state === 'whip') whip(e, W);
    }
  }
  function dying(e) {
    if (e.alive) return false;
    if (e.dying === 'stomp') { ctx.scale(1, 0.35); return false; }
    ctx.translate(0, -e.h / 2); ctx.rotate(Math.PI); ctx.translate(0, e.h / 2);
    return false;
  }
  function eyes(xs, y, look, angry) {
    for (const ex of xs) {
      ctx.fillStyle = '#fff'; ellipse(ex, y, 2.2, 2.6);
      ctx.fillStyle = '#111'; ellipse(ex + look, y + 0.5, 1.1, 1.5);
    }
    if (angry) { ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xs[0] - 2.5, y - 4); ctx.lineTo(xs[0] + 1.5, y - 2.5); ctx.moveTo(xs[1] + 2.5, y - 4); ctx.lineTo(xs[1] - 1.5, y - 2.5); ctx.stroke(); }
  }
  function chestnut(e, step) {
    ctx.fillStyle = '#3B2414'; ellipse(-4 + step, -1.5, 3, 2); ellipse(4 - step, -1.5, 3, 2);
    ctx.fillStyle = '#8B4A1F'; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.quadraticCurveTo(-8, -11, 0, -14.5); ctx.quadraticCurveTo(8, -11, 7, -4); ctx.quadraticCurveTo(0, -1, -7, -4); ctx.fill();
    ctx.fillStyle = '#E3B07A'; ellipse(0, -4, 6.5, 2.3);
    ctx.fillStyle = '#B86A35'; ellipse(-3, -10, 1.5, 2.5);
  }
  const DRAW = {
    banana(e, W) {
      const bob = e.placed ? Math.sin(e.bob) * 2 : 0;
      ctx.translate(0, -7 + bob);
      if (e.placed) { ctx.fillStyle = `rgba(255,240,150,${0.25 + Math.sin(W.frame * 0.15) * 0.15})`; circle(0, 0, 10); }
      ctx.fillStyle = '#FFE14D'; ctx.strokeStyle = '#B98A1E'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-3, -7); ctx.quadraticCurveTo(-8, 3, 4, 7); ctx.quadraticCurveTo(-2, 1, 1, -7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6B4A1E'; ctx.fillRect(-2.5, -8.5, 3, 2); ctx.fillRect(3, 6, 2, 2);
    },
    kuri(e, W) { dying(e); if (e.face > 0) ctx.scale(-1, 1); const st = e.alive ? Math.floor(e.t / 8) % 2 : 0; chestnut(e, st); eyes([-2.6, 2.6], -8, -0.6, true); },
    roll(e, W) {
      if (e.alive) { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(-e.face * (9 + i * 2), -4 - i * 4); ctx.lineTo(-e.face * (14 + i * 2), -4 - i * 4); } ctx.stroke(); }
      dying(e);
      ctx.translate(0, -7); ctx.rotate(e.rot || 0); ctx.translate(0, 7);
      chestnut(e, 0); eyes([-2.6, 2.6], -8, 0, true);
    },
    nume(e, W) {
      dying(e);
      const w = Math.sin(e.t * 0.15) * 1.2;
      ctx.fillStyle = 'rgba(110,210,80,.88)';
      ctx.beginPath(); ctx.moveTo(-8 - w, 0); ctx.quadraticCurveTo(-8, -11 + w, 0, -11 - w); ctx.quadraticCurveTo(8, -11 + w, 8 + w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(220,255,200,.7)'; ellipse(-3, -7, 2, 1.2);
      ctx.fillStyle = 'rgba(110,210,80,.8)'; ellipse(5, 1 + (e.t % 30) / 10, 1.2, 1.6);
      eyes([-2.5, 2.5], -5, e.face * 0.6, false);
    },
    vib(e, W) {
      dying(e);
      if (e.alive) ctx.translate((W.frame % 2 ? 1 : -1) * 0.8, 0);
      ctx.fillStyle = '#FFF1DC'; roundRect(-4, -9, 8, 9, 3); ctx.fill();
      ctx.fillStyle = '#FF6FAE'; ctx.beginPath(); ctx.ellipse(0, -9, 8, 7, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff'; circle(-3.5, -12, 1.5); circle(2.5, -14, 1.8); circle(5, -10.5, 1.2);
      ctx.fillStyle = '#111'; circle(-1.6, -5, 0.9); circle(1.6, -5, 0.9);
      if (e.alive) {
        ctx.strokeStyle = '#FF6FAE'; ctx.lineWidth = 1; ctx.beginPath();
        for (const s of [-1, 1]) { ctx.moveTo(s * 10, -12); ctx.lineTo(s * 12, -10); ctx.moveTo(s * 10, -7); ctx.lineTo(s * 12.5, -7); ctx.moveTo(s * 10, -2); ctx.lineTo(s * 12, -4); }
        ctx.stroke();
      }
    },
    squirrel(e, W) {
      dying(e);
      if (e.face > 0) ctx.scale(-1, 1);
      ctx.fillStyle = '#E0974A'; ctx.beginPath(); ctx.ellipse(5, -9, 4.5, 7, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F2B56B'; ctx.beginPath(); ctx.ellipse(6, -12, 2.5, 4, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#C8752E'; ellipse(-1, -5, 5, 5);
      ctx.fillStyle = '#FFE6C2'; ellipse(-2, -4, 2.5, 3);
      ctx.fillStyle = '#C8752E'; circle(-3, -11, 3.6); ctx.beginPath(); ctx.moveTo(-2, -15.5); ctx.lineTo(0, -12.5); ctx.lineTo(-3.5, -13); ctx.fill();
      ctx.fillStyle = '#111'; circle(-4.4, -11.5, 0.9);
      ctx.fillStyle = '#5A3315'; circle(-6.4, -10.5, 0.7);
      if (e.anim > 0) { ctx.fillStyle = '#8B5A2B'; ellipse(-6, -13, 1.6, 2); }
    },
    acorn(e, W) {
      ctx.translate(0, -3.5); ctx.rotate(W.frame * 0.3);
      ctx.fillStyle = '#A0662E'; ellipse(0, 1, 3, 3.3);
      ctx.fillStyle = '#5E3A17'; ctx.fillRect(-3.3, -3, 6.6, 2.5); ctx.fillRect(-0.5, -4.5, 1, 1.5);
    },
    queen(e, W) {
      if (!W.bossActive && e.alive) { /* まだ控えている */ }
      if (e.alive && e.inv > 0 && Math.floor(e.inv / 4) % 2) ctx.globalAlpha = 0.4;
      dying(e);
      const f = e.state === 'ready' || e.state === 'whip' ? e.whipFace : e.face;
      ctx.scale(f, 1);
      // ブーツと脚
      ctx.fillStyle = '#111'; ctx.fillRect(-5, -8, 3, 8); ctx.fillRect(2, -8, 3, 8); ctx.fillRect(-6, -2, 4, 2); ctx.fillRect(2, -2, 5, 2);
      ctx.fillStyle = '#2A2A2A'; ctx.fillRect(-4, -12, 2, 4); ctx.fillRect(2, -12, 2, 4);
      // 体（黒い衣装・赤い縁取り）
      ctx.fillStyle = '#1B1B1B'; ctx.beginPath(); ctx.moveTo(-6, -11); ctx.lineTo(6, -11); ctx.lineTo(4, -22); ctx.lineTo(-4, -22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#C2185B'; ctx.fillRect(-6, -12, 12, 1.5); ctx.fillRect(-1, -22, 2, 10);
      // マント
      ctx.fillStyle = '#7A0E2E'; ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(-9, -10); ctx.lineTo(-5, -11); ctx.closePath(); ctx.fill();
      // 腕
      ctx.fillStyle = '#F5C9A8';
      const raise = e.state === 'ready';
      ctx.fillRect(-6, -21, 2, 7);
      if (raise) ctx.fillRect(4, -28, 2, 7); else ctx.fillRect(4, -21, 2, 7);
      // 頭
      ctx.fillStyle = '#F5C9A8'; circle(0, -25.5, 4.2);
      ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(0, -26.5, 4.6, Math.PI, 0); ctx.fill(); ctx.fillRect(-5, -27, 2.5, 8);
      ctx.fillStyle = '#C2185B'; ctx.fillRect(-2, -27, 6.5, 2.2);
      ctx.fillStyle = '#fff'; ctx.fillRect(2, -26.6, 1.4, 1.2);
      ctx.fillStyle = '#D81B60'; ctx.fillRect(1, -23.3, 2.2, 1);
      // 王冠
      ctx.fillStyle = '#F1C40F'; ctx.beginPath(); ctx.moveTo(-3.5, -30); ctx.lineTo(-3, -33.5); ctx.lineTo(-1, -31.5); ctx.lineTo(0, -34.5); ctx.lineTo(1, -31.5); ctx.lineTo(3, -33.5); ctx.lineTo(3.5, -30); ctx.closePath(); ctx.fill();
      // 鞭（構え）
      ctx.strokeStyle = '#3B2414'; ctx.lineWidth = 1.2; ctx.beginPath();
      if (raise) { ctx.moveTo(5, -28); ctx.quadraticCurveTo(-4, -40, -12, -30); ctx.quadraticCurveTo(-16, -24, -10, -20); }
      else if (e.state !== 'whip') { ctx.moveTo(5, -15); ctx.quadraticCurveTo(10, -6, 6, -3); ctx.quadraticCurveTo(3, 0, 8, 0); }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (raise && e.alive) { ctx.scale(f, 1); ctx.fillStyle = '#FF3B6B'; text('!', 0, -40, 12, 'center'); }
    },
  };
  function whip(e, W) {
    const b = Game.whipBox(e);
    const sx = (e.whipFace > 0 ? e.x + e.w : e.x) - W.camX, sy = e.y + 10;
    const len = Math.min(1, e.t / 6) * 46;
    ctx.strokeStyle = '#3B2414'; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + e.whipFace * len * 0.5, sy - 6, sx + e.whipFace * len, sy + 3); ctx.stroke();
    if (e.t >= 5 && e.t <= 12) { ctx.fillStyle = '#FFF59D'; star(sx + e.whipFace * len, sy + 3, 5); }
  }

  // ---------------- 演出 ----------------
  function effects(W) {
    for (const q of W.parts) {
      const x = q.x - W.camX;
      if (q.coin) { ctx.fillStyle = '#FFD54F'; ellipse(x, q.y, Math.abs(Math.cos(q.life * 0.4)) * 4 + 1, 6); continue; }
      ctx.globalAlpha = Math.min(1, q.life / 15);
      ctx.fillStyle = q.color;
      if (q.star) star(x, q.y, q.size + 0.5); else ctx.fillRect(x - q.size / 2, q.y - q.size / 2, q.size, q.size);
    }
    ctx.globalAlpha = 1;
    for (const q of W.pops) {
      const x = q.x - W.camX, y = q.y - q.t * 0.5;
      ctx.globalAlpha = Math.min(1, (70 - q.t) / 20);
      outlined(q.text, x, y, q.size, q.color, 'center');
    }
    ctx.globalAlpha = 1;
  }

  // ---------------- 画面上部の表示 ----------------
  function hud(W) {
    const p = W.player, narrow = C.VIEW_W < 380;
    const L0 = C.SAFE_L || 0, L = L0 - (narrow ? 50 : 0); // 横幅が狭い（iPad など）ときは面の名前を省いて左に詰める
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0, 0, C.VIEW_W, 17);
    outlined(narrow ? `${W.stage + 1}.` : `${W.stage + 1}. ${W.st.name}`, L0 + 6, 12, 9, '#fff', 'left');
    // バナナの段階（5本）
    const bx = L + 78;
    for (let i = 0; i < 5; i++) miniBanana(bx + i * 11, 9, i < p.level, p.diamond > 0, W.frame + i * 5);
    if (p.diamond > 0) { ctx.fillStyle = '#BFEFFF'; ctx.fillRect(bx - 4, 15, 54 * p.diamond / C.DIAMOND_FRAMES, 1.5); }
    // BKコイン
    ctx.fillStyle = '#FFD54F'; ellipse(L + 146, 8.5, 4, 5); ctx.fillStyle = '#B7860B'; text('BK', L + 146, 10.5, 4.5, 'center');
    outlined(`×${String(W.run.coins).padStart(2, '0')}`, L + 153, 12, 9, '#fff', 'left');
    // 残機
    miniBanana(L + 190, 9, true, false, 0);
    outlined(`×${W.run.lives}`, L + 196, 12, 9, '#fff', 'left');
    // 時間
    const sec = Math.ceil(W.time);
    const low = sec <= 30 && W.state === 'play';
    if (!(low && Math.floor(W.frame / 15) % 2)) outlined(`TIME ${String(sec).padStart(3, '0')}`, L + 228, 12, 9, low ? '#FF6B6B' : '#fff', 'left');
    // 状態
    if (p.slip > 0) outlined('ヌルヌル中…', L0 + 6, 28, 8, '#8EE07A', 'left');
    // 女王様の体力
    const q = W.ents.find(e => e.type === 'queen' && e.alive);
    if (q && W.bossActive) {
      outlined('女王様', C.VIEW_W / 2, 30, 8, '#FFB3D1', 'right');
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < q.hp ? '#FF4F8B' : 'rgba(255,255,255,.3)'; heart(C.VIEW_W / 2 + 8 + i * 10, 26, 3.4); }
    }
    // 看板の説明
    if (W.signId !== null && W.state === 'play') {
      const msg = C.SIGNS[W.signId];
      ctx.font = `9px ${FONT}`;
      const w = ctx.measureText(msg).width + 16;
      ctx.fillStyle = 'rgba(255,248,225,.95)'; roundRect(C.VIEW_W / 2 - w / 2, 36, w, 18, 5); ctx.fill();
      ctx.strokeStyle = '#B98A1E'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#5A3B1A'; text(msg, C.VIEW_W / 2, 48.5, 9, 'center');
    }
  }
  function miniBanana(x, y, on, dia, f) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = dia ? (Math.floor(f / 6) % 2 ? '#BFEFFF' : '#fff') : on ? '#FFE14D' : 'rgba(255,255,255,.25)';
    ctx.beginPath(); ctx.moveTo(-2, -5); ctx.quadraticCurveTo(-6, 2, 3, 5); ctx.quadraticCurveTo(-2, 1, 0.5, -5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------------- 小物 ----------------
  function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function ellipse(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); ctx.fill(); }
  function tri(cx, top, half, h) { ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx + half, top + h); ctx.lineTo(cx - half, top + h); ctx.closePath(); ctx.fill(); }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function star(x, y, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  function heart(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s); ctx.bezierCurveTo(x - s * 2, y - s * 0.4, x - s * 0.8, y - s * 1.6, x, y - s * 0.5); ctx.bezierCurveTo(x + s * 0.8, y - s * 1.6, x + s * 2, y - s * 0.4, x, y + s); ctx.fill(); }
  function text(s, x, y, size, align) { ctx.font = `${size}px ${FONT}`; ctx.textAlign = align || 'left'; ctx.fillText(s, x, y); }
  function outlined(s, x, y, size, color, align) {
    ctx.font = `${size}px ${FONT}`; ctx.textAlign = align || 'left';
    ctx.lineWidth = Math.max(2, size / 4); ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineJoin = 'round';
    ctx.strokeText(s, x, y); ctx.fillStyle = color; ctx.fillText(s, x, y);
  }

  // ---------------- 1枚描く ----------------
  function frame(W) {
    if (!ctx) return;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = true;
    background(W);
    ctx.save();
    if (W.shake > 0) ctx.translate((Math.random() - 0.5) * W.shake * 0.5, (Math.random() - 0.5) * W.shake * 0.5);
    tiles(W);
    goalDeco(W);
    ents(W);
    player(W);
    effects(W);
    ctx.restore();
    hud(W);
  }
  // 何も遊んでいないとき（タイトルなど）の背景
  function idle(stage, t) {
    if (!ctx) return;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    background({ stage, camX: t * 0.6, frame: t });
    ctx.fillStyle = THEME[stage].grass; ctx.fillRect(0, 192, C.VIEW_W, 5);
    ctx.fillStyle = THEME[stage].dirt; ctx.fillRect(0, 197, C.VIEW_W, 30);
  }
  return { init, resize, frame, idle };
})();
