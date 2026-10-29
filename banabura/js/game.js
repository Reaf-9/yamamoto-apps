// ゲームの中身（主人公・敵・アイテム・当たり判定・ゴール・満足度）
const Game = (() => {
  const C = CONFIG, T = C.TILE;
  const SOLID = new Set(['#', 'd', 'X', 'B', '?', 'Q', 'U', 'R', 'D']);
  let W = null;

  // ---------------- 世界をつくる ----------------
  function newWorld(stageIndex, run) {
    const lv = Stages.get(stageIndex);
    const st = C.STAGES[stageIndex];
    W = {
      stage: stageIndex, st, map: lv.map, cols: lv.w, rows: lv.rows, goalX: lv.goalX * T,
      ents: [], lifts: [], signs: [], parts: [], pops: [], bumps: [],
      camX: 0, time: st.time, frame: 0, stageCoins: 0, whipHits: 0,
      bossActive: false, bossDefeated: false, state: 'play', goal: null, shake: 0,
      warned: {}, run, signId: null,
    };
    const [w, h] = C.SIZES[0];
    W.player = {
      x: lv.start.x * T + (T - w) / 2, y: (lv.start.y + 1) * T - h, w, h, vx: 0, vy: 0, face: 1,
      level: 0, diamond: 0, invuln: 0, slip: 0, slipCool: 0, onGround: false, prevBottom: 0,
      dead: false, deadT: 0, expr: 'normal', exprT: 0, coyote: 0, jumpBuf: 0, on: null, anim: 0,
    };
    for (const e of lv.ents) spawn(e);
    return W;
  }

  const bottomOf = ty => (ty + 1) * T;
  function mk(type, x, y, w, h, o) {
    return Object.assign({ type, x, y, w, h, vx: 0, vy: 0, alive: true, active: false, t: 0, onGround: false, face: -1, enemy: false }, o);
  }
  function spawn(d) {
    const x = d.x * T;
    switch (d.type) {
      case 'sign': W.signs.push({ x: x + 2, y: bottomOf(d.y) - 16, id: d.id }); break;
      case 'lift': W.lifts.push({ x, y: d.y * T, w: d.w * T, h: 6, x0: x, y0: d.y * T, axis: d.axis, range: d.range * T, speed: d.speed, dir: 1, dx: 0, dy: 0 }); break;
      case 'banana': W.ents.push(mk('banana', x + 2, bottomOf(d.y) - 14, 12, 14, { placed: true, bob: Math.random() * 6 })); break;
      case 'kuri': W.ents.push(mk('kuri', x + 1, bottomOf(d.y) - 14, 14, 14, { enemy: true, speed: 0.5 })); break;
      case 'roll': W.ents.push(mk('roll', x + 1, bottomOf(d.y) - 14, 14, 14, { enemy: true, speed: 1.3, rot: 0 })); break;
      case 'nume': W.ents.push(mk('nume', x, bottomOf(d.y) - 10, 16, 10, { enemy: true, speed: 0.3 })); break;
      case 'vib': W.ents.push(mk('vib', x + 1, bottomOf(d.y) - 16, 14, 16, { enemy: true, hopT: 40 + Math.random() * 60 })); break;
      case 'squirrel': W.ents.push(mk('squirrel', x + 1, bottomOf(d.y) - 14, 14, 14, { enemy: true, throwT: 60 + Math.random() * 60, anim: 0 })); break;
      case 'queen': W.ents.push(mk('queen', x, bottomOf(d.y) - 30, 18, 30, { enemy: true, hp: 3, inv: 0, minX: d.minX * T, maxX: d.maxX * T, state: 'wait', walkDir: -1, next: 90, whipFace: -1 })); break;
    }
  }

  // ---------------- 地形 ----------------
  function tile(tx, ty) {
    if (tx < 0 || tx >= W.cols) return 'X';
    if (ty >= W.rows) return '.';
    if (ty < 0) { const t = W.map[0][tx]; return SOLID.has(t) ? t : '.'; }
    return W.map[ty][tx];
  }
  const solid = (tx, ty) => SOLID.has(tile(tx, ty));

  function moveX(b) {
    b.x += b.vx; b.hitWall = 0;
    const top = Math.floor(b.y / T), bot = Math.floor((b.y + b.h - 0.01) / T);
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w - 0.01) / T);
      for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { b.x = tx * T - b.w; b.vx = 0; b.hitWall = 1; break; }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x / T);
      for (let ty = top; ty <= bot; ty++) if (solid(tx, ty)) { b.x = (tx + 1) * T; b.vx = 0; b.hitWall = -1; break; }
    }
  }
  function moveY(b) {
    const prevBottom = b.y + b.h;
    b.y += b.vy; b.onGround = false; b.headHit = null;
    const l = Math.floor(b.x / T), r = Math.floor((b.x + b.w - 0.01) / T);
    if (b.vy >= 0) {
      const ty = Math.floor((b.y + b.h) / T);
      for (let tx = l; tx <= r; tx++) {
        const t = tile(tx, ty);
        if (SOLID.has(t) || (t === '=' && prevBottom <= ty * T + 0.5)) { b.y = ty * T - b.h; b.vy = 0; b.onGround = true; break; }
      }
    } else {
      const ty = Math.floor(b.y / T), cx = b.x + b.w / 2;
      let best = null, bd = 1e9;
      for (let tx = l; tx <= r; tx++) if (solid(tx, ty)) { const d = Math.abs((tx + 0.5) * T - cx); if (d < bd) { bd = d; best = tx; } }
      if (best !== null) { b.y = (ty + 1) * T; b.vy = 0; b.headHit = { tx: best, ty }; }
    }
  }
  const touch = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const onScreen = (e, m = 0) => e.x + e.w > W.camX - m && e.x < W.camX + C.VIEW_W + m;

  // ---------------- 演出 ----------------
  function pop(text, x, y, color, size) { W.pops.push({ text, x, y, t: 0, color: color || '#fff', size: size || 9 }); }
  function burst(x, y, n, colors, speed = 2, grav = 0.12, size = 2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random());
      W.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 30 + Math.random() * 20, color: colors[i % colors.length], size, grav });
    }
  }

  // ---------------- 主人公 ----------------
  function setLevel(p, lv) {
    const [w, h] = C.SIZES[lv];
    const bottom = p.y + p.h, cx = p.x + p.w / 2;
    p.level = lv; p.w = w; p.h = h; p.y = bottom - h; p.x = cx - w / 2;
  }
  function face(p, ex, frames) { p.expr = ex; p.exprT = frames || 40; }
  function addCoin(n, x, y) {
    W.stageCoins += n; W.run.coins += n;
    Sound.play('coin');
    if (W.run.coins >= C.COINS_FOR_1UP) {
      W.run.coins -= C.COINS_FOR_1UP; W.run.lives++;
      Sound.play('oneup'); pop('1UP!', x, y - 10, '#7CFF6B', 11);
    }
  }
  function startDiamond(p) {
    p.diamond = C.DIAMOND_FRAMES;
    Sound.play('diamond'); Sound.bgm(3);
    pop('ダイヤモンドバナナ！', p.x + p.w / 2, p.y - 6, '#BFEFFF', 11);
    burst(p.x + p.w / 2, p.y + p.h / 2, 24, ['#fff', '#BFEFFF', '#FFF59D'], 2.5);
  }
  function collectBanana(p, e) {
    e.alive = false;
    face(p, 'genki');
    if (p.level < 5) {
      setLevel(p, p.level + 1);
      Sound.play('power');
      if (p.level === 5) startDiamond(p);
      else pop(p.level <= 3 ? 'おおきくなった！' : 'ツヤツヤ！', p.x + p.w / 2, p.y - 6, '#FFE066');
    } else startDiamond(p);
  }
  function hurt(p) {
    if (p.dead || p.diamond > 0 || p.invuln > 0 || W.state !== 'play') return false;
    if (p.level === 0) { die(p); return true; }
    setLevel(p, p.level - 1);
    p.invuln = C.HURT_INVULN; face(p, 'hurt', 50);
    Sound.play('hurt');
    pop('しぼんだ…', p.x + p.w / 2, p.y - 6, '#FF9A9A');
    return true;
  }
  function die(p, why) {
    if (p.dead) return;
    p.dead = true; p.deadT = 0; p.vy = -5; p.vx = 0; face(p, 'hurt', 9999);
    Sound.stopBgm(); Sound.play('die');
    if (why === 'time') pop('タイムオーバー', p.x + p.w / 2, p.y - 10, '#FF6B6B', 12);
  }

  function updatePlayer(p) {
    const I = Input.state;
    if (p.dead) {
      p.deadT++;
      if (p.deadT > 30) { p.vy = Math.min(p.vy + 0.25, 7); p.y += p.vy; }
      if (p.deadT > 150) W.state = 'miss';
      return;
    }
    // リフトに乗っていたら一緒に動く
    if (p.on) { p.x += p.on.dx; p.y += p.on.dy; p.on = null; }

    const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    const slip = p.slip > 0;
    const max = I.b ? C.RUN_MAX : C.WALK_MAX;
    let acc = slip ? C.ACCEL * 0.35 : C.ACCEL;
    if (!p.onGround) acc *= 0.8;
    const fr = slip ? 0.02 : C.FRICTION;
    if (dir) {
      if (Math.sign(p.vx) === -dir) acc *= slip ? 1 : 2.2;
      const before = Math.abs(p.vx);
      p.vx += dir * acc;
      // B を離したときは少しずつ減速、それ以外は上限で止める
      if (Math.abs(p.vx) > max) p.vx = Math.sign(p.vx) * (before > max ? Math.max(max, before - fr * 0.5) : max);
      p.face = dir;
    } else if (p.onGround) {
      p.vx = Math.abs(p.vx) <= fr ? 0 : p.vx - Math.sign(p.vx) * fr;
    }
    // ジャンプ（押すのが少し早くても、足場から少し出ていても跳べる）
    if (Input.consumeA()) p.jumpBuf = 7;
    if (p.onGround) p.coyote = 6;
    if (p.jumpBuf > 0 && p.coyote > 0) {
      p.vy = -(C.JUMP_V + Math.abs(p.vx) * 0.25) * (slip ? 0.8 : 1);
      p.jumpBuf = 0; p.coyote = 0; p.onGround = false;
      Sound.play('jump');
    }
    p.jumpBuf--; p.coyote--;
    const g = I.a && p.vy < 0 ? C.GRAVITY_HOLD : C.GRAVITY;
    p.vy = Math.min(p.vy + g, C.MAX_FALL);

    moveX(p);
    p.prevBottom = p.y + p.h;
    moveY(p);
    if (p.headHit) bonk(p.headHit.tx, p.headHit.ty, p);
    // リフトの上に着地
    if (p.vy >= 0) {
      for (const L of W.lifts) {
        if (p.x + p.w > L.x && p.x < L.x + L.w && p.prevBottom <= L.y + Math.abs(L.dy) + 1.5 && p.y + p.h >= L.y) {
          p.y = L.y - p.h; p.vy = 0; p.onGround = true; p.on = L; break;
        }
      }
    }
    // BKコイン
    const l = Math.floor(p.x / T), r = Math.floor((p.x + p.w - 0.01) / T), t = Math.floor(p.y / T), b = Math.floor((p.y + p.h - 0.01) / T);
    for (let ty = t; ty <= b; ty++) for (let tx = l; tx <= r; tx++) {
      if (ty >= 0 && ty < W.rows && W.map[ty][tx] === 'o') {
        W.map[ty][tx] = '.'; addCoin(1, tx * T + 8, ty * T);
        burst(tx * T + 8, ty * T + 8, 5, ['#FFD54F', '#fff'], 1.2, 0.05, 1.5);
      }
    }
    // 画面の左端より戻れない
    if (p.x < W.camX) { p.x = W.camX; if (p.vx < 0) p.vx = 0; }
    // 穴に落ちた
    if (p.y > W.rows * T + 8) { die(p); p.deadT = 40; p.vy = 0; }

    if (p.invuln > 0) p.invuln--;
    if (p.slip > 0) { p.slip--; if (W.frame % 6 === 0) W.parts.push({ x: p.x + Math.random() * p.w, y: p.y + p.h, vx: 0, vy: 0.3, life: 25, color: '#8EE07A', size: 2, grav: 0.05 }); }
    if (p.slipCool > 0) p.slipCool--;
    if (p.diamond > 0) {
      p.diamond--;
      if (W.frame % 3 === 0) W.parts.push({ x: p.x + Math.random() * p.w, y: p.y + Math.random() * p.h, vx: (Math.random() - 0.5) * 0.6, vy: -0.4, life: 24, color: ['#fff', '#BFEFFF', '#FFF59D'][W.frame % 3], size: 2, grav: 0, star: true });
      if (p.diamond === 0) { Sound.bgm(W.st.bgm); pop('ダイヤモンドが切れた', p.x + p.w / 2, p.y - 6, '#BFEFFF'); }
    }
    if (p.exprT > 0 && --p.exprT === 0) p.expr = 'normal';
    p.anim += Math.abs(p.vx) * 0.15;

    // ゴール（横穴）に入った
    if (p.x + p.w > W.goalX + 2) startGoal(p);
  }

  // ブロックを下から叩いた
  function bonk(tx, ty, p) {
    const t = tile(tx, ty);
    if (t === '?') {
      W.map[ty][tx] = 'U'; W.bumps.push({ tx, ty, t: 0 });
      addCoin(1, tx * T + 8, ty * T);
      W.parts.push({ x: tx * T + 8, y: ty * T - 4, vx: 0, vy: -4, life: 22, coin: true, grav: 0.3 });
    } else if (t === 'Q') {
      W.map[ty][tx] = 'U'; W.bumps.push({ tx, ty, t: 0 });
      W.ents.push(mk('banana', tx * T + 2, ty * T + 2, 12, 14, { rising: 16, dir: p.face || 1 }));
      Sound.play('bump');
    } else if (t === 'B') {
      if (p.level >= 1) {
        W.map[ty][tx] = '.';
        Sound.play('brick');
        for (let i = 0; i < 4; i++) W.parts.push({ x: tx * T + 4 + (i % 2) * 8, y: ty * T + 4 + (i >> 1) * 8, vx: (i % 2 ? 1 : -1) * 1.2, vy: -3 - (i >> 1), life: 60, color: '#C8642A', size: 5, grav: 0.25 });
      } else { W.bumps.push({ tx, ty, t: 0 }); Sound.play('bump'); }
    } else Sound.play('bump');
    // 叩いたブロックの上にいた敵はやっつける
    for (const e of W.ents) {
      if (e.enemy && e.alive && e.type !== 'queen' && Math.abs(e.y + e.h - ty * T) < 3 && e.x + e.w > tx * T && e.x < tx * T + T) killEnemy(e, 'flip');
      if (e.type === 'banana' && e.alive && !e.placed && Math.abs(e.y + e.h - ty * T) < 3 && e.x + e.w > tx * T && e.x < tx * T + T) { e.vy = -3; }
    }
  }

  // ---------------- 敵 ----------------
  function killEnemy(e, how) {
    e.alive = false; e.dying = how; e.dieT = 0;
    if (how === 'flip' || how === 'diamond') { e.vy = -3.5; e.vx = (Math.random() - 0.5) * 2; }
    Sound.play('stomp');
    burst(e.x + e.w / 2, e.y + e.h / 2, 6, ['#fff', '#FFE066'], 1.5);
  }
  function walk(e, speed) {
    e.vx = e.face * speed;
    e.vy = Math.min(e.vy + C.GRAVITY, C.MAX_FALL);
    moveX(e); if (e.hitWall) e.face *= -1;
    moveY(e);
  }
  function hitQueen(e, p) {
    if (e.inv > 0) return;
    e.hp--; e.inv = 70;
    Sound.play('stomp');
    burst(e.x + e.w / 2, e.y, 10, ['#fff', '#FF6B9A'], 2);
    if (e.hp <= 0) {
      e.alive = false; e.dying = 'flip'; e.dieT = 0; e.vy = -4;
      W.bossDefeated = true;
      for (let y = 0; y < W.rows; y++) for (let x = 0; x < W.cols; x++) if (W.map[y][x] === 'D') {
        W.map[y][x] = '.'; burst(x * T + 8, y * T + 8, 3, ['#B48CFF', '#fff'], 1.5);
      }
      Sound.play('power');
      pop('女王様を倒した！道が開いた', e.x + e.w / 2, e.y - 10, '#FFB3D1', 11);
      if (!p || p.diamond <= 0) Sound.bgm(W.st.bgm);
    } else pop(`あと${e.hp}回！`, e.x + e.w / 2, e.y - 8, '#FFB3D1');
  }

  function updateEnemy(e, p) {
    if (!e.alive) {
      e.dieT++;
      if (e.dying === 'stomp') { if (e.dieT > 30) e.remove = true; }
      else { e.vy += 0.25; e.y += e.vy; e.x += e.vx; if (e.y > W.rows * T + 40) e.remove = true; }
      return;
    }
    if (!e.active) { if (e.x < W.camX + C.VIEW_W + 24) e.active = true; else return; }
    e.t++;
    switch (e.type) {
      case 'kuri': case 'nume': walk(e, e.speed); break;
      case 'roll': walk(e, e.speed); e.rot += e.vx / 7; break;
      case 'vib': {
        e.vy = Math.min(e.vy + C.GRAVITY, C.MAX_FALL);
        moveX(e); if (e.hitWall) e.vx *= -1;
        moveY(e);
        if (e.onGround) {
          e.vx *= 0.8;
          if (--e.hopT <= 0) {
            e.vy = -(2.5 + Math.random() * 2.5);
            const toward = Math.random() < 0.6 ? Math.sign(p.x - e.x) || 1 : (Math.random() < 0.5 ? -1 : 1);
            e.vx = toward * (0.6 + Math.random() * 0.8);
            e.hopT = 30 + Math.random() * 70;
          }
        }
        break;
      }
      case 'squirrel': {
        e.vy = Math.min(e.vy + C.GRAVITY, C.MAX_FALL);
        const ban = W.ents.find(o => o.type === 'banana' && o.alive && !o.rising && Math.abs(o.x - e.x) < 72 && Math.abs(o.y + o.h - (e.y + e.h)) < 20);
        if (ban) {
          e.face = Math.sign(ban.x - e.x) || 1; e.vx = e.face * 0.9; moveX(e);
          if (touch(e, ban)) { ban.alive = false; Sound.play('eat'); pop('パクッ！バナナ取られた', e.x + e.w / 2, e.y - 6, '#FFCC80'); }
        } else {
          e.vx = 0;
          e.face = p.x < e.x ? -1 : 1;
          if (--e.throwT <= 0 && onScreen(e) && Math.abs(p.x - e.x) < 220) {
            const vx = Math.max(-2.2, Math.min(2.2, (p.x - e.x) / 42));
            W.ents.push(mk('acorn', e.x + 4, e.y, 6, 7, { enemy: true, stompable: false, vx, vy: -3.2, active: true, proj: true }));
            Sound.play('throw'); e.throwT = 100 + Math.random() * 60; e.anim = 15;
          }
        }
        if (e.anim > 0) e.anim--;
        moveY(e);
        break;
      }
      case 'acorn': {
        e.vy += 0.15; e.x += e.vx; e.y += e.vy;
        if (solid(Math.floor((e.x + 3) / T), Math.floor((e.y + 4) / T)) || e.y > W.rows * T) e.remove = true;
        break;
      }
      case 'queen': updateQueen(e, p); break;
    }
    if (e.y > W.rows * T + 8 && e.type !== 'acorn') e.remove = true;
  }

  function updateQueen(e, p) {
    if (!W.bossActive) {
      if (p.x > e.minX - 16) { W.bossActive = true; e.state = 'walk'; e.t = 0; Sound.play('boss'); pop('女王様があらわれた！', e.x + e.w / 2, e.y - 12, '#FF6B9A', 11); }
      else return;
    }
    if (e.inv > 0) e.inv--;
    e.vy = Math.min(e.vy + C.GRAVITY, C.MAX_FALL);
    if (e.state === 'walk') {
      e.face = p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1;
      e.vx = e.walkDir * 0.7; moveX(e);
      if (e.x < e.minX) { e.x = e.minX; e.walkDir = 1; }
      if (e.x + e.w > e.maxX) { e.x = e.maxX - e.w; e.walkDir = -1; }
      if (Math.random() < 0.012) e.walkDir *= -1;
      if (e.onGround && Math.random() < 0.006) e.vy = -4.2;
      if (e.t > e.next) { e.state = 'ready'; e.t = 0; e.whipFace = e.face; }
    } else if (e.state === 'ready') {
      if (e.t >= 36) { e.state = 'whip'; e.t = 0; Sound.play('whip'); }
    } else if (e.state === 'whip') {
      if (e.t >= 4 && e.t <= 18 && !p.dead) {
        const box = whipBox(e);
        if (touch(p, box) && hurt(p)) { W.whipHits++; pop('ピシッ！満足度 -5', p.x + p.w / 2, p.y - 8, '#FF6B9A', 10); }
      }
      if (e.t >= 22) { e.state = 'cool'; e.t = 0; }
    } else if (e.state === 'cool') {
      if (e.t >= 40) { e.state = 'walk'; e.t = 0; e.next = 70 + Math.random() * 70; }
    }
    moveY(e);
  }
  function whipBox(e) { return { x: e.whipFace > 0 ? e.x + e.w : e.x - 46, y: e.y + 8, w: 46, h: 9 }; }

  function interact(p) {
    if (p.dead) return;
    for (const e of W.ents) {
      if (!e.alive) continue;
      if (e.type === 'banana') { if (!e.rising && touch(p, e)) collectBanana(p, e); continue; }
      if (!e.active || !e.enemy || !touch(p, e)) continue;
      if (p.diamond > 0) { if (e.type === 'queen') hitQueen(e, p); else killEnemy(e, 'diamond'); continue; }
      if (e.stompable !== false && p.vy > 0 && p.prevBottom <= e.y + 6) {
        if (e.type === 'queen') hitQueen(e, p); else killEnemy(e, 'stomp');
        p.y = e.y - p.h; p.vy = -(Input.state.a ? C.JUMP_V : C.STOMP_BOUNCE);
        continue;
      }
      if (e.type === 'nume') {
        if (p.slipCool <= 0) {
          p.slip = C.SLIP_FRAMES; p.slipCool = 60; Sound.play('slip');
          pop('ヌルッ！足が滑る', p.x + p.w / 2, p.y - 6, '#8EE07A');
          p.vx = (p.x < e.x ? -1 : 1) * 1.8;
        }
        continue;
      }
      if (e.type === 'acorn') { if (hurt(p)) e.remove = true; continue; }
      hurt(p);
    }
  }

  // ---------------- ゴール ----------------
  function startGoal(p) {
    if (W.state !== 'play') return;
    const dash = Math.abs(p.vx) >= 2.2;
    W.state = 'goal';
    W.goal = { t: 0, dash, diamond: p.diamond > 0, speed: Math.max(1.6, Math.abs(p.vx)), angle: 0, alpha: 1 };
    Sound.stopBgm();
    Sound.play(dash ? 'zubo' : 'goal');
    if (dash) W.shake = 14;
    p.invuln = 0;
  }
  function updateGoal() {
    const p = W.player, g = W.goal;
    g.t++;
    g.angle = Math.min(Math.PI / 2, g.angle + 0.14);
    p.x += g.speed;
    const cy = (Stages.GROUND - 1) * T; // 横穴の真ん中
    const cur = p.y + p.h / 2;
    p.y += (cy - cur) * 0.2;
    if (p.x > W.goalX + 20) g.alpha = Math.max(0, g.alpha - 0.05);
    if (g.t === 8) {
      burst(W.goalX, cy, g.dash ? 40 : 18, ['#FFE066', '#fff', '#FF9AC1'], g.dash ? 3.5 : 2);
      pop(g.dash ? 'ズボッ！！' : 'ズポッ', W.goalX - 8, cy - 26, '#FFE066', g.dash ? 18 : 13);
    }
    if (g.t === 24 && g.dash) Sound.play('goal');
    if (g.t >= 110) W.state = 'cleared';
  }
  function score() {
    const S = C.SCORE, p = W.player, g = W.goal;
    const items = [
      [`バナナ成長（${p.level}本）`, S.BY_LEVEL[p.level]],
      ['残り時間ボーナス', Math.round(S.TIME_MAX * W.time / W.st.time)],
      [`BKコイン（${W.stageCoins}枚）`, Math.min(S.COIN_MAX, Math.floor(W.stageCoins / S.COIN_PER))],
    ];
    if (g.diamond) items.push(['ダイヤモンドでゴール', S.DIAMOND]);
    if (g.dash) items.push(['Bダッシュで突入', S.DASH]);
    if (W.whipHits) items.push([`女王様の鞭 ×${W.whipHits}`, S.WHIP * W.whipHits]);
    const total = Math.max(0, items.reduce((a, b) => a + b[1], 0));
    const pass = total >= W.st.pass;
    const rank = pass ? C.RANKS.find(r => total >= r[0])[1] : C.RANK_FAIL;
    return { items, total, pass, rank, pass_line: W.st.pass };
  }

  // ---------------- 1フレーム進める ----------------
  function step() {
    W.frame++;
    const p = W.player;
    // リフト
    for (const L of W.lifts) {
      const px = L.x, py = L.y;
      if (L.axis === 'x') { L.x += L.speed * L.dir; if (L.x > L.x0 + L.range) { L.x = L.x0 + L.range; L.dir = -1; } if (L.x < L.x0) { L.x = L.x0; L.dir = 1; } }
      else { L.y -= L.speed * L.dir; if (L.y < L.y0 - L.range) { L.y = L.y0 - L.range; L.dir = -1; } if (L.y > L.y0) { L.y = L.y0; L.dir = 1; } }
      L.dx = L.x - px; L.dy = L.y - py;
    }
    if (W.state === 'play') {
      updatePlayer(p);
      // 時間
      if (!p.dead && W.state === 'play') {
        W.time -= 1 / 60;
        const sec = Math.ceil(W.time);
        if (sec === 30 && !W.warned[30]) { W.warned[30] = 1; Sound.play('warn'); Sound.setTempo(1.25); pop('いそげ！', p.x + p.w / 2, p.y - 10, '#FF6B6B', 12); }
        if (W.time <= 0) { W.time = 0; die(p, 'time'); }
      }
    } else if (W.state === 'goal') updateGoal();

    // バナナ（アイテム）
    for (const e of W.ents) {
      if (e.type !== 'banana' || !e.alive) continue;
      if (e.rising) { e.y -= 1; if (--e.rising === 0) { e.y = Math.round(e.y); } continue; }
      if (e.placed) { e.bob += 0.08; continue; }
      e.vx = e.dir * 0.7; e.vy = Math.min(e.vy + C.GRAVITY, C.MAX_FALL);
      moveX(e); if (e.hitWall) e.dir *= -1;
      moveY(e);
      if (e.y > W.rows * T) e.remove = true;
    }
    if (W.state === 'play' || W.state === 'goal') for (const e of W.ents) if (e.type !== 'banana') updateEnemy(e, p);
    if (W.state === 'play') interact(p);
    W.ents = W.ents.filter(e => !e.remove && !(e.type === 'banana' && !e.alive));

    // カメラ
    if (W.state === 'play' && !p.dead) {
      const target = p.x - C.VIEW_W * 0.4;
      W.camX = Math.max(W.camX, Math.min(target, W.cols * T - C.VIEW_W));
      W.camX = Math.max(0, W.camX);
    }
    // 看板
    const s = W.signs.find(s => Math.abs(s.x + 6 - (p.x + p.w / 2)) < 40);
    W.signId = s ? s.id : null;

    // 演出
    for (const b of W.bumps) b.t++;
    W.bumps = W.bumps.filter(b => b.t < 10);
    for (const q of W.parts) { q.x += q.vx; q.y += q.vy; q.vy += q.grav; q.life--; }
    W.parts = W.parts.filter(q => q.life > 0);
    for (const q of W.pops) q.t++;
    W.pops = W.pops.filter(q => q.t < 70);
    if (W.shake > 0) W.shake--;
  }

  return { newWorld, step, score, get world() { return W; }, whipBox, SOLID };
})();
