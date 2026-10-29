// 主人公のバナナキャラ
// バナイク（バナナ育成ゲーム/app/js/render.js の Chara, v0.6.1）の描き方をそのまま移植。
//   デフォルト … ノーマルのバナナ（点目 E1）
//   ダイヤモンド … シークレット系統・最終進化（ダイヤモンドの殻＋キラキラ、リアル目 E2）
// バナイク側のキャラを描き直したら、ここの body / face / DIAMOND を同じ内容に差し替える。
const Chara = (() => {
  const BODY = '#F7D154', EDGE = '#B98A1E', FOOT = '#F2CC4A', INK = '#333';
  const L = 88, R = 112, EY = 117;

  const EYES = {
    E1: ex => ex === 'genki' ? happy() : ex === 'hurt' ? xeyes()
      : `<circle cx="${L}" cy="${EY}" r="2.7" fill="${INK}"/><circle cx="${R}" cy="${EY}" r="2.7" fill="${INK}"/>`,
    E2: ex => ex === 'genki' ? happy(3) : ex === 'hurt' ? xeyes()
      : [L, R].map(x => `<ellipse cx="${x}" cy="${EY}" rx="5" ry="6.5" fill="#fff" stroke="${INK}" stroke-width="1.3"/><circle cx="${x}" cy="${EY + 1}" r="3" fill="#5A3B1A"/><circle cx="${x}" cy="${EY + 1}" r="1.5" fill="#111"/><circle cx="${x - 1.3}" cy="${EY - 1}" r="1" fill="#fff"/>`).join(''),
  };
  function happy(w) { return `<path d="M${L - 5} ${EY + 1} q5 -6 10 0 M${R - 5} ${EY + 1} q5 -6 10 0" fill="none" stroke="${INK}" stroke-width="${w || 2.4}" stroke-linecap="round"/>`; }
  function xeyes() { return `<path d="M${L - 4} ${EY - 4} l8 8 M${L + 4} ${EY - 4} l-8 8 M${R - 4} ${EY - 4} l8 8 M${R + 4} ${EY - 4} l-8 8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`; }
  function mouth(ex) {
    if (ex === 'genki') return `<path d="M92 131 q8 8 16 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (ex === 'hurt') return `<path d="M93 136 q7 -6 14 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    return `<path d="M93 132 q3.5 4 7 0 q3.5 4 7 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`; // ω
  }
  const blush = `<ellipse cx="77" cy="129" rx="4.5" ry="2.8" fill="#F7A0A0" opacity=".7"/><ellipse cx="123" cy="129" rx="4.5" ry="2.8" fill="#F7A0A0" opacity=".7"/>`;

  const body = `
    <ellipse cx="67" cy="150" rx="8" ry="6" fill="${BODY}" stroke="${EDGE}" stroke-width="1.8"/>
    <ellipse cx="133" cy="150" rx="8" ry="6" fill="${BODY}" stroke="${EDGE}" stroke-width="1.8"/>
    <ellipse cx="87" cy="203" rx="10" ry="5" fill="${FOOT}" stroke="${EDGE}" stroke-width="1.8"/>
    <ellipse cx="113" cy="203" rx="10" ry="5" fill="${FOOT}" stroke="${EDGE}" stroke-width="1.8"/>
    <rect x="95" y="54" width="10" height="16" rx="3" fill="#7B5A2B"/>
    <path d="M100 66 C 66 76, 56 134, 73 180 C 83 203, 117 203, 127 180 C 144 134, 134 76, 100 66 Z" fill="${BODY}" stroke="${EDGE}" stroke-width="2.2"/>
    <path d="M92 80 C 76 100, 74 150, 84 185" fill="none" stroke="${EDGE}" stroke-width="1.2" opacity=".45"/>`;

  // バナイクの旧座標のパーツは translate(10 30) scale(0.9) で載せる
  const wrap = inner => `<g transform="translate(10 30) scale(0.9)">${inner}</g>`;
  const DIAMOND = {
    back: '<g fill="#fff"><path d="M40 60 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/><path d="M160 50 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/><path d="M165 150 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g>',
    front: '<path d="M90 40 L70 110 L100 210 L130 110 L110 40z" fill="#BFEFFF" opacity=".6" stroke="#fff" stroke-width="1.5"/><path d="M70 110 h60 M90 40 l10 70 l10 -70 M100 110 v100 M80 75 h40" stroke="#fff" stroke-width="1.2" opacity=".9"/>',
  };
  const CROWN = '<path d="M78 48 l6 -22 l10 14 l6 -20 l6 20 l10 -14 l6 22z" fill="#F1C40F" stroke="#B7950B" stroke-width="1.5"/><circle cx="100" cy="36" r="3" fill="#E74C3C"/>';
  // 4本目：ツヤ（白いハイライト）／5本目：ツヤ＋水玉模様＋王冠
  const GLOSS = '<path d="M86 92 C 79 115, 79 148, 87 174" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/><circle cx="116" cy="92" r="3" fill="#fff" opacity=".8"/>';
  const DOTS = '<g fill="#F39CC3" opacity=".85"><circle cx="112" cy="160" r="4"/><circle cx="96" cy="176" r="3.5"/><circle cx="120" cy="140" r="3"/><circle cx="84" cy="150" r="3"/></g>';

  function svg(deco, expr, diamond) {
    const face = `${(diamond ? EYES.E2 : EYES.E1)(expr)}${expr === 'hurt' ? '' : blush}${mouth(expr)}`;
    let extra = '';
    if (!diamond && deco >= 1) extra += GLOSS;
    if (!diamond && deco >= 2) extra += DOTS + wrap(CROWN);
    const inner = diamond ? `${wrap(DIAMOND.back)}${body}${face}${wrap(DIAMOND.front)}` : `${body}${face}${extra}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="52 34 96 176" width="192" height="352">${inner}</svg>`;
  }

  const cache = {};
  const EXPRS = ['normal', 'genki', 'hurt'];
  function load() {
    const jobs = [];
    const add = (key, s) => {
      const img = new Image();
      jobs.push(new Promise(res => { img.onload = res; img.onerror = res; }));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
      cache[key] = img;
    };
    for (const ex of EXPRS) {
      for (let d = 0; d <= 2; d++) add(`n${d}_${ex}`, svg(d, ex, false));
      add(`d_${ex}`, svg(0, ex, true));
    }
    return Promise.all(jobs);
  }
  // level: 0〜5（取ったバナナの数）
  function image(level, expr, diamond) {
    const ex = EXPRS.includes(expr) ? expr : 'normal';
    if (diamond) return cache[`d_${ex}`];
    const deco = level >= 5 ? 2 : level >= 4 ? 1 : 0;
    return cache[`n${deco}_${ex}`];
  }
  // 横幅 / 高さ（描画時の比率）
  const ASPECT = 96 / 176;
  return { load, image, svg, ASPECT };
})();
