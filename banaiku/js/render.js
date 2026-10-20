// キャラ描画（v0.4：E「ちび」ベース。体は小さく、顔は低い位置。目は8種から選べる）
// 座標は 200×240 の箱。目の中心 (88,117)(112,117)、口 (100,133)。
// 系統の小物とオシャレは旧座標（目が y=92）で描いてあるので、translate(10 30) scale(0.9) で載せる。
const Chara = (() => {
  const BODY = ['#F7D154', '#F2CC4A', '#C9A24F', '#8E6A3B', '#2B2522'];
  const EDGE = ['#B98A1E', '#A97E1C', '#7F6230', '#4F3A20', '#111'];
  const INK = '#333';
  const L = 88, R = 112, EY = 117;

  function spots(ripe) {
    if (ripe === 0 || ripe === 4) return '';
    const s1 = '<ellipse cx="80" cy="160" rx="5" ry="3" fill="#8B5A2B" opacity=".7"/><ellipse cx="118" cy="100" rx="4" ry="2.5" fill="#8B5A2B" opacity=".7"/><ellipse cx="96" cy="185" rx="3.5" ry="2.5" fill="#8B5A2B" opacity=".7"/>';
    const s2 = s1 + '<ellipse cx="112" cy="165" rx="9" ry="6" fill="#6B4423" opacity=".75"/><ellipse cx="84" cy="90" rx="7" ry="5" fill="#6B4423" opacity=".7"/>';
    const s3 = s2 + '<ellipse cx="90" cy="150" rx="12" ry="8" fill="#4A2E14" opacity=".7"/><ellipse cx="110" cy="195" rx="9" ry="5" fill="#4A2E14" opacity=".7"/>';
    return [null, s1, s2, s3][ripe];
  }

  // ---- 目の8種（開いているとき）。dx は視線のずれ ----
  const EYES = {
    // E1 点目（ちび）
    E1: (ex, dx) => ex === 'genki' ? happy() : `<circle cx="${L + dx}" cy="${EY}" r="2.7" fill="${INK}"/><circle cx="${R + dx}" cy="${EY}" r="2.7" fill="${INK}"/>`,
    // E2 リアル目（Aの目を小さく）
    E2: (ex, dx) => [L, R].map(x => `<ellipse cx="${x}" cy="${EY}" rx="5" ry="6.5" fill="#fff" stroke="${INK}" stroke-width="1.3"/><circle cx="${x + dx}" cy="${EY + 1}" r="3" fill="#5A3B1A"/><circle cx="${x + dx}" cy="${EY + 1}" r="1.5" fill="#111"/><circle cx="${x + dx - 1.3}" cy="${EY - 1}" r="1" fill="#fff"/>`).join('') + (ex === 'genki' ? lowerLids() : ''),
    // E3 つやつや大目（Bの目）
    E3: (ex, dx) => ex === 'genki' ? happy(3) : [L, R].map(x => `<ellipse cx="${x}" cy="${EY}" rx="7" ry="8.5" fill="#fff"/><circle cx="${x + dx}" cy="${EY + 1.5}" r="4.8" fill="#2E7D32"/><circle cx="${x + dx}" cy="${EY + 1.5}" r="2.8" fill="#111"/><circle cx="${x + dx - 2.5}" cy="${EY - 2}" r="2" fill="#fff"/><circle cx="${x + dx + 1.5}" cy="${EY + 3.5}" r="1" fill="#fff"/>`).join(''),
    // E4 黒い楕円（Dの目）
    E4: (ex, dx) => ex === 'genki' ? happy(3) : [L, R].map(x => `<ellipse cx="${x + dx}" cy="${EY}" rx="4.2" ry="5.8" fill="#222"/><circle cx="${x + dx - 1.5}" cy="${EY - 2}" r="1.6" fill="#fff"/>`).join(''),
    // E5 線目（Cの脱力感）
    E5: (ex, dx) => ex === 'genki' ? happy() : `<path d="M${L - 4 + dx} ${EY} h8 M${R - 4 + dx} ${EY} h8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    // E6 たれ目（半目）
    E6: (ex, dx) => ex === 'genki' ? happy() : [L, R].map(x => `<ellipse cx="${x}" cy="${EY}" rx="5" ry="6" fill="#fff" stroke="${INK}" stroke-width="1.3"/><circle cx="${x + dx}" cy="${EY + 2}" r="2.2" fill="#111"/><path d="M${x - 5.5} ${EY - 1} a5.5 6 0 0 1 11 0z" fill="__BODY__"/><path d="M${x - 5.5} ${EY - 1} q5.5 -5 11 0" fill="none" stroke="${INK}" stroke-width="1.6"/>`).join(''),
    // E7 離れた点目（ちいかわ最小）
    E7: (ex, dx) => ex === 'genki' ? `<path d="M${L - 8} ${EY + 1} q4 -5 8 0 M${R} ${EY + 1} q4 -5 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>` : `<circle cx="${L - 4 + dx}" cy="${EY}" r="2.1" fill="${INK}"/><circle cx="${R + 4 + dx}" cy="${EY}" r="2.1" fill="${INK}"/>`,
    // E8 キョロ目（白目が大きく黒目が小さい・シュール）
    E8: (ex, dx) => [L, R].map(x => `<ellipse cx="${x}" cy="${EY}" rx="8" ry="5.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/><circle cx="${x + dx + 2}" cy="${EY}" r="2.2" fill="#111"/>`).join('') + (ex === 'genki' ? lowerLids() : ''),
  };
  function happy(w) { return `<path d="M${L - 5} ${EY + 1} q5 -6 10 0 M${R - 5} ${EY + 1} q5 -6 10 0" fill="none" stroke="${INK}" stroke-width="${w || 2.4}" stroke-linecap="round"/>`; }
  function lowerLids() { return `<path d="M${L - 5} ${EY + 4} q5 3 10 0 M${R - 5} ${EY + 4} q5 3 10 0" fill="none" stroke="${INK}" stroke-width="1.4"/>`; }
  const closed = () => `<path d="M${L - 5} ${EY} q5 4 10 0 M${R - 5} ${EY} q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  const xeyes = () => `<path d="M${L - 4} ${EY - 4} l8 8 M${L + 4} ${EY - 4} l-8 8 M${R - 4} ${EY - 4} l8 8 M${R + 4} ${EY - 4} l-8 8" stroke="#ddd" stroke-width="2.2"/>`;

  function mouth(style, ex) {
    if (ex === 'sleep') return `<ellipse cx="100" cy="134" rx="2.4" ry="3" fill="${INK}"/>`;
    if (ex === 'genki') return `<path d="M92 131 q8 8 16 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (ex === 'shonbori') return `<path d="M93 136 q7 -6 14 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (ex === 'sowasowa' || ex === 'guttari') return `<path d="M92 134 q4 -3 8 0 q4 3 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (ex === 'kusari') return `<path d="M92 134 q4 -3 8 0 q4 3 8 0" fill="none" stroke="#999" stroke-width="2.2" stroke-linecap="round"/>`;
    switch (style) {
      case 'E5': case 'E7': case 'E1': return `<path d="M93 132 q3.5 4 7 0 q3.5 4 7 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`; // ω
      case 'E3': case 'E4': return `<path d="M95 132 q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
      default: return `<path d="M97 133 h6" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
  }

  function face(style, ex, tease, bodyColor) {
    const dx = ex === 'sowasowa' ? (tease % 2 ? 3 : -3) : 0;
    let eyes;
    if (ex === 'sleep') eyes = closed();
    else if (ex === 'kusari') eyes = xeyes();
    else eyes = (EYES[style] || EYES.E1)(ex, dx).replace(/__BODY__/g, bodyColor);
    let over = '';
    if (ex === 'guttari') over = `<path d="M${L - 6} ${EY - 7} h12 v5 h-12z M${R - 6} ${EY - 7} h12 v5 h-12z" fill="${bodyColor}"/><path d="M${L - 6} ${EY - 2} h12 M${R - 6} ${EY - 2} h12" stroke="${INK}" stroke-width="1.8"/><g fill="${INK}"><circle cx="138" cy="92" r="1.6"/><circle cx="145" cy="85" r="2"/><circle cx="153" cy="77" r="2.5"/></g>`;
    if (ex === 'shonbori') over = `<path d="M${L - 6} ${EY - 7} l12 -3 M${R + 6} ${EY - 7} l-12 -3" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><path d="M${R + 6} ${EY + 8} q2.5 7 0 10 q-2.5 -3 0 -10z" fill="#6EC1FF"/>`;
    if (ex === 'sowasowa') {
      const drops = Math.min(3, Math.ceil(tease / 2));
      for (let i = 0; i < drops; i++) over += `<path class="sweat" d="M${132 + i * 6} ${96 - i * 6} q3.5 7 0 9 q-3.5 -2 0 -9z" fill="#6EC1FF"/>`;
      if (tease >= 5) over += `<path d="M58 112 l-6 -3 M58 119 l-7 0 M58 126 l-6 3 M142 112 l6 -3 M142 119 l7 0 M142 126 l6 3" stroke="${INK}" stroke-width="1.5"/>`;
    }
    if (ex === 'kusari') over = `<g class="flies" fill="${INK}"><circle cx="60" cy="80" r="2"/><circle cx="140" cy="70" r="2"/><circle cx="150" cy="100" r="2"/></g><path d="M60 80 q6 -6 10 -2 M140 70 q-6 -6 -10 -2 M150 100 q6 -4 8 2" fill="none" stroke="${INK}" stroke-width="1"/>`;
    if (ex === 'sleep') over = `<g class="zzz" font-family="sans-serif" font-weight="900" fill="#fff" stroke="#5A6B8A" stroke-width="1"><text x="148" y="112" font-size="18">z</text><text x="164" y="92" font-size="24">z</text><text x="184" y="68" font-size="30">z</text></g>`;
    const blush = (ex === 'genki' || ex === 'normal' || ex === 'sleep') ? `<ellipse cx="77" cy="129" rx="4.5" ry="2.8" fill="#F7A0A0" opacity=".7"/><ellipse cx="123" cy="129" rx="4.5" ry="2.8" fill="#F7A0A0" opacity=".7"/>` : '';
    return `<g class="eyes${ex === 'kusari' || ex === 'sleep' ? ' noblink' : ''}">${eyes}</g>${blush}${mouth(style, ex)}${over}`;
  }

  const ACC = {
    inu: {
      1: { back: '<path d="M78 52 q-20 10 -14 40 q8 2 14 -6z" fill="#B5742B"/><path d="M122 52 q20 10 14 40 q-8 2 -14 -6z" fill="#B5742B"/>' },
      2: { back: '<path d="M78 52 q-20 10 -14 40 q8 2 14 -6z" fill="#B5742B"/><path d="M122 52 q20 10 14 40 q-8 2 -14 -6z" fill="#B5742B"/>',
           front: '<path d="M72 138 q28 14 56 0" fill="none" stroke="#D33" stroke-width="5"/><circle cx="100" cy="150" r="4" fill="#FFD54A"/><g transform="translate(152 158) rotate(-30)"><rect x="-12" y="-3" width="24" height="6" fill="#fff" stroke="#999"/><circle cx="-12" cy="-3" r="3.5" fill="#fff" stroke="#999"/><circle cx="-12" cy="3" r="3.5" fill="#fff" stroke="#999"/><circle cx="12" cy="-3" r="3.5" fill="#fff" stroke="#999"/><circle cx="12" cy="3" r="3.5" fill="#fff" stroke="#999"/></g>' },
    },
    amaenbo: {
      1: { front: '<ellipse cx="76" cy="108" rx="7" ry="4" fill="#F58A8A"/><ellipse cx="124" cy="108" rx="7" ry="4" fill="#F58A8A"/><circle cx="100" cy="128" r="5" fill="#fff" stroke="#E88" stroke-width="2"/><circle cx="100" cy="128" r="2" fill="#E88"/>' },
      2: { front: '<path d="M70 130 L130 190 M130 130 L70 190" stroke="#7FA6D9" stroke-width="7" stroke-linecap="round"/><rect x="78" y="150" width="44" height="26" rx="6" fill="#7FA6D9"/><ellipse cx="76" cy="108" rx="7" ry="4" fill="#F58A8A"/><ellipse cx="124" cy="108" rx="7" ry="4" fill="#F58A8A"/>' },
    },
    neko: {
      1: { back: '<path d="M76 58 l-6 -26 l22 14z" fill="#E9A4A4" stroke="#333" stroke-width="1.5"/><path d="M124 58 l6 -26 l-22 14z" fill="#E9A4A4" stroke="#333" stroke-width="1.5"/>',
           front: '<path d="M70 110 h-14 M70 116 h-14 M130 110 h14 M130 116 h14" stroke="#333" stroke-width="1.2"/>' },
      2: { back: '<path d="M76 58 l-6 -26 l22 14z" fill="#E9A4A4" stroke="#333" stroke-width="1.5"/><path d="M124 58 l6 -26 l-22 14z" fill="#E9A4A4" stroke="#333" stroke-width="1.5"/><path d="M122 200 q40 -10 30 -50" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round"/>',
           front: '<path d="M70 110 h-14 M70 116 h-14 M130 110 h14 M130 116 h14" stroke="#333" stroke-width="1.2"/><g transform="translate(150 125)"><circle r="8" fill="#F7D154" stroke="#333" stroke-width="1.5"/><text y="4" text-anchor="middle" font-size="9" fill="#333">福</text></g>' },
    },
    rollcabbage: {
      1: { front: '<path d="M68 120 q32 -25 64 0 q-10 50 -32 70 q-22 -20 -32 -70z" fill="#9BCB6E" opacity=".9" stroke="#5F8F3E" stroke-width="1.5"/><path d="M80 140 q20 10 40 0 M85 165 q15 8 30 0" fill="none" stroke="#5F8F3E" stroke-width="1.2"/>' },
      2: { back: '<ellipse cx="100" cy="212" rx="60" ry="14" fill="#C0392B"/><rect x="40" y="196" width="120" height="16" fill="#C0392B"/><path d="M60 40 q5 -10 0 -20 M100 30 q5 -10 0 -20 M140 40 q5 -10 0 -20" fill="none" stroke="#bbb" stroke-width="3" opacity=".8"/>',
           front: '<path d="M68 120 q32 -25 64 0 q-10 50 -32 70 q-22 -20 -32 -70z" fill="#9BCB6E" opacity=".9" stroke="#5F8F3E" stroke-width="1.5"/><path d="M80 140 q20 10 40 0 M85 165 q15 8 30 0" fill="none" stroke="#5F8F3E" stroke-width="1.2"/>' },
    },
    kojirase: {
      1: { front: '<path d="M78 70 q10 -30 40 -20 q-5 20 -5 45 l-8 0 q-2 -25 -27 -25z" fill="#2E2E2E"/>' },
      2: { front: '<path d="M78 70 q10 -30 40 -20 q-5 20 -5 45 l-8 0 q-2 -25 -27 -25z" fill="#2E2E2E"/><path d="M72 95 q0 -45 56 -40" fill="none" stroke="#444" stroke-width="5"/><rect x="64" y="86" width="12" height="20" rx="5" fill="#444"/><rect x="124" y="86" width="12" height="20" rx="5" fill="#444"/>' },
    },
    nikushoku: {
      1: { front: '<path d="M92 117 l3 7 l3 -7 M102 117 l3 7 l3 -7" fill="#fff" stroke="#333" stroke-width="1"/><path d="M80 84 l16 4 M120 84 l-16 4" stroke="#333" stroke-width="2.5"/>' },
      2: { front: '<path d="M92 117 l3 7 l3 -7 M102 117 l3 7 l3 -7" fill="#fff" stroke="#333" stroke-width="1"/><path d="M80 84 l16 4 M120 84 l-16 4" stroke="#333" stroke-width="2.5"/><g transform="translate(152 158) rotate(-35)"><ellipse rx="16" ry="10" fill="#B5553C"/><rect x="14" y="-2.5" width="16" height="5" fill="#eee"/><circle cx="30" cy="-3" r="3" fill="#eee"/><circle cx="30" cy="3" r="3" fill="#eee"/></g>' },
    },
    oresama: {
      1: { back: '<path d="M72 130 l-20 70 h96 l-20 -70z" fill="#8E2A3C"/>', front: '<path d="M80 80 l16 6 M120 80 l-16 6" stroke="#333" stroke-width="3"/>' },
      2: { back: '<path d="M72 130 l-20 70 h96 l-20 -70z" fill="#8E2A3C"/>',
           front: '<path d="M80 80 l16 6 M120 80 l-16 6" stroke="#333" stroke-width="3"/><path d="M78 48 l6 -22 l10 14 l6 -20 l6 20 l10 -14 l6 22z" fill="#F1C40F" stroke="#B7950B" stroke-width="1.5"/><circle cx="100" cy="36" r="3" fill="#E74C3C"/><path d="M150 160 v-50" stroke="#B7950B" stroke-width="4"/><circle cx="150" cy="106" r="6" fill="#F1C40F" stroke="#B7950B"/>' },
    },
    ouji: {
      1: { front: '<path d="M82 50 l4 -14 l8 8 l6 -16 l6 16 l8 -8 l4 14z" fill="#E8E8F0" stroke="#999" stroke-width="1.5"/><circle cx="100" cy="40" r="2.5" fill="#6EC1FF"/>' },
      2: { back: '<path d="M72 130 l-24 72 h104 l-24 -72z" fill="#F4F6FB" stroke="#C9D2E3"/><path d="M60 60 q-30 20 -20 60" fill="none" stroke="#fff" stroke-width="8"/>',
           front: '<path d="M82 50 l4 -14 l8 8 l6 -16 l6 16 l8 -8 l4 14z" fill="#E8E8F0" stroke="#999" stroke-width="1.5"/><circle cx="100" cy="40" r="2.5" fill="#6EC1FF"/><g transform="translate(150 150)"><path d="M0 0 v24" stroke="#4E8F3A" stroke-width="2"/><circle r="6" fill="#E74C3C"/><circle cx="-3" cy="-2" r="3" fill="#F1948A"/></g>' },
    },
    soushoku: {
      1: { front: '<path d="M100 30 q-10 -20 -4 -28 M100 30 q10 -18 2 -30 M100 30 q0 -14 8 -20" fill="none" stroke="#5FAE4A" stroke-width="3" stroke-linecap="round"/>' },
      2: { front: '<path d="M100 30 q-10 -20 -4 -28 M100 30 q10 -18 2 -30" fill="none" stroke="#5FAE4A" stroke-width="3" stroke-linecap="round"/><path d="M84 112 q16 40 32 0 q-6 36 -16 44 q-10 -8 -16 -44z" fill="#fff" stroke="#ccc"/><path d="M152 150 v60" stroke="#8B5A2B" stroke-width="4"/><path d="M152 150 q-8 -12 2 -18" fill="none" stroke="#8B5A2B" stroke-width="4"/>' },
    },
    iyashi: {
      1: { front: '<g transform="translate(150 160)"><path d="M-10 -6 h20 v10 q0 8 -10 8 q-10 0 -10 -8z" fill="#fff" stroke="#999"/><path d="M10 -2 q8 2 0 8" fill="none" stroke="#999" stroke-width="2"/><path d="M-4 -12 q2 -5 0 -9 M2 -12 q2 -5 0 -9" fill="none" stroke="#bbb" stroke-width="1.5"/></g>' },
      2: { back: '<rect x="50" y="202" width="100" height="14" rx="7" fill="#C97B63"/>', front: '<g transform="translate(150 160)"><path d="M-10 -6 h20 v10 q0 8 -10 8 q-10 0 -10 -8z" fill="#fff" stroke="#999"/><path d="M10 -2 q8 2 0 8" fill="none" stroke="#999" stroke-width="2"/></g><ellipse cx="78" cy="108" rx="5" ry="3" fill="#F58A8A" opacity=".6"/><ellipse cx="122" cy="108" rx="5" ry="3" fill="#F58A8A" opacity=".6"/>' },
    },
    secret: {
      1: { front: '<path d="M90 40 L75 120 L100 205 L125 120 L110 40z" fill="#BFEFFF" opacity=".55" stroke="#fff" stroke-width="1.5"/><path d="M75 120 h50 M90 40 l10 80 l10 -80 M100 120 v85" stroke="#fff" stroke-width="1.2" opacity=".9"/>' },
      2: { back: '<g fill="#fff"><path d="M40 60 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/><path d="M160 50 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z"/><path d="M165 150 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g>',
           front: '<path d="M90 40 L70 110 L100 210 L130 110 L110 40z" fill="#BFEFFF" opacity=".6" stroke="#fff" stroke-width="1.5"/><path d="M70 110 h60 M90 40 l10 70 l10 -70 M100 110 v100 M80 75 h40" stroke="#fff" stroke-width="1.2" opacity=".9"/>' },
    },
  };

  const FASH_SVG = {
    strawhat: '<ellipse cx="100" cy="42" rx="40" ry="8" fill="#E8C872" stroke="#B9953A"/><path d="M78 42 q0 -26 22 -26 q22 0 22 26z" fill="#E8C872" stroke="#B9953A"/><rect x="78" y="34" width="44" height="5" fill="#C0392B"/>',
    crown: '<path d="M78 48 l6 -22 l10 14 l6 -20 l6 20 l10 -14 l6 22z" fill="#F1C40F" stroke="#B7950B" stroke-width="1.5"/><circle cx="100" cy="36" r="3" fill="#E74C3C"/>',
    hachimaki: '<path d="M70 60 q30 -10 60 0" fill="none" stroke="#fff" stroke-width="8"/><path d="M70 60 q30 -10 60 0" fill="none" stroke="#C0392B" stroke-width="2"/><path d="M130 60 l16 -8 l-4 12 l12 2" fill="none" stroke="#fff" stroke-width="4"/>',
    sunglass: '<rect x="78" y="84" width="20" height="14" rx="4" fill="#222"/><rect x="102" y="84" width="20" height="14" rx="4" fill="#222"/><path d="M98 90 h4 M70 88 h8 M122 88 h8" stroke="#222" stroke-width="2"/>',
    mustache: '<path d="M88 112 q6 -6 12 0 q6 -6 12 0 q-6 4 -12 2 q-6 2 -12 -2z" fill="#4A3020"/>',
    glasses: '<circle cx="88" cy="92" r="11" fill="none" stroke="#8B5A2B" stroke-width="2"/><circle cx="112" cy="92" r="11" fill="none" stroke="#8B5A2B" stroke-width="2"/><path d="M99 92 h2 M70 90 h7 M123 90 h7" stroke="#8B5A2B" stroke-width="2"/>',
    bowtie: '<path d="M100 142 l-14 -7 v14z M100 142 l14 -7 v14z" fill="#C0392B"/><circle cx="100" cy="142" r="3" fill="#8E1B1B"/>',
    chain: '<path d="M72 136 q28 30 56 0" fill="none" stroke="#F1C40F" stroke-width="4" stroke-dasharray="4 2"/><circle cx="100" cy="156" r="5" fill="#F1C40F" stroke="#B7950B"/>',
    bib: '<path d="M78 138 q22 10 44 0 v28 q-22 12 -44 0z" fill="#fff" stroke="#9CC"/><circle cx="100" cy="155" r="4" fill="#F7D154"/>',
    bouquet: '<g transform="translate(152 158)"><path d="M0 0 v22" stroke="#4E8F3A" stroke-width="2"/><circle cx="-7" cy="-4" r="5" fill="#E74C3C"/><circle cx="6" cy="-6" r="5" fill="#F1C40F"/><circle cx="0" cy="3" r="5" fill="#F39CC3"/><path d="M-8 10 h16 l-8 14z" fill="#9BD3F2"/></g>',
    dumbbell: '<g transform="translate(152 158) rotate(-20)"><rect x="-16" y="-2" width="32" height="4" fill="#555"/><rect x="-20" y="-7" width="7" height="14" fill="#333"/><rect x="13" y="-7" width="7" height="14" fill="#333"/></g>',
    uchiwa: '<g transform="translate(154 150)"><path d="M0 8 v18" stroke="#8B5A2B" stroke-width="3"/><ellipse rx="12" ry="14" fill="#fff" stroke="#C0392B" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" fill="#C0392B">祭</text></g>',
  };


  function pickExpr(g) {
    if (g.rotten) return 'kusari';
    if (g.ripe >= 3) return 'guttari';
    if (g.ripe >= 1) return 'shonbori';
    if (g.teaseDays > 0) return 'sowasowa';
    if (g.playsToday > 0) return 'genki';
    return 'normal';
  }

  // o: { lineage, stage, ripe, expr, teaseDays, fashion, face, size, bgOff, cls }
  function svg(o) {
    const ripe = o.ripe || 0, stage = o.stage || 0, lin = o.lineage, expr = o.expr || 'normal';
    const style = o.face || (lin && DATA.LIN_FACE && DATA.LIN_FACE[lin]) || DATA.FACE_STYLE || 'E1';
    const acc = (lin && stage > 0 && ACC[lin] && ACC[lin][stage]) || {};
    const f = o.fashion || {};
    const bg = o.bgOff ? '' : '<rect width="200" height="240" fill="#FFF7D6"/>';
    const bodyColor = BODY[ripe];
    const body = `
      <rect x="95" y="54" width="10" height="16" rx="3" fill="#7B5A2B"/>
      <path d="M100 66 C 66 76, 56 134, 73 180 C 83 203, 117 203, 127 180 C 144 134, 134 76, 100 66 Z" fill="${bodyColor}" stroke="${EDGE[ripe]}" stroke-width="2.2"/>
      <path d="M92 80 C 76 100, 74 150, 84 185" fill="none" stroke="${EDGE[ripe]}" stroke-width="1.2" opacity=".45"/>
      ${spots(ripe)}`;
    const limbs = `
      <ellipse cx="67" cy="150" rx="8" ry="6" fill="${bodyColor}" stroke="${EDGE[ripe]}" stroke-width="1.8"/>
      <ellipse cx="133" cy="150" rx="8" ry="6" fill="${bodyColor}" stroke="${EDGE[ripe]}" stroke-width="1.8"/>
      <ellipse cx="87" cy="203" rx="10" ry="5" fill="${BODY[Math.min(ripe + 1, 3)]}" stroke="${EDGE[ripe]}" stroke-width="1.8"/>
      <ellipse cx="113" cy="203" rx="10" ry="5" fill="${BODY[Math.min(ripe + 1, 3)]}" stroke="${EDGE[ripe]}" stroke-width="1.8"/>`;
    const fash = ['head', 'face', 'neck', 'hand'].map(s => (f[s] && FASH_SVG[f[s]]) || '').join('');
    const wrap = inner => inner ? `<g transform="translate(10 30) scale(0.9)">${inner}</g>` : '';
    const size = o.size || 200;
    const sleeping = expr === 'sleep';
    const mood = expr === 'kusari' ? 'still' : expr === 'guttari' || sleeping ? 'slow' : expr === 'sowasowa' ? 'jitter' : 'breathe';
    const pose = sleeping ? ' transform="translate(50 0) rotate(-80 100 200)"' : '';
    return `<svg viewBox="0 0 200 240" width="${size}" height="${size * 1.2}" xmlns="http://www.w3.org/2000/svg" class="chara ${o.cls || ''}${sleeping ? ' sleeping' : ''}">
      ${bg}${sleeping ? '<ellipse cx="100" cy="212" rx="60" ry="7" fill="rgba(0,0,0,.12)"/>' : '<ellipse cx="100" cy="208" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>'}
      <g class="pet ${mood}"${pose}>${wrap(acc.back || '')}${limbs}${body}${face(style, expr, o.teaseDays || 0, bodyColor)}${wrap(acc.front || '')}${wrap(fash)}</g>
    </svg>`;
  }

  function coffinSVG(o) {
    return `<svg viewBox="0 0 240 240" width="240" height="240" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 40 L180 40 L200 110 L180 220 L60 220 L40 110z" fill="#5C3A21" stroke="#2E1B0E" stroke-width="4"/>
      <path d="M72 52 L168 52 L184 110 L168 208 L72 208 L56 110z" fill="#7B5234"/>
      <g transform="translate(20 10) scale(0.9)">${svg({ lineage: o.lineage, stage: 2, ripe: 0, expr: 'sleep', fashion: o.fashion, face: o.face, size: 200, bgOff: true, cls: 'nomove' }).replace(/<svg[^>]*>|<\/svg>/g, '').replace(/ transform="translate\(50 0\) rotate\(-80 100 200\)"/, '').replace(/<g class="zzz".*?<\/g>/, '')}</g>
      <g transform="translate(40 190)"><circle r="7" fill="#fff"/><circle cx="12" cy="-6" r="7" fill="#F39CC3"/><circle cx="-10" cy="-8" r="7" fill="#F1C40F"/><path d="M0 7 v30 M12 1 v36 M-10 -1 v38" stroke="#4E8F3A" stroke-width="2"/></g>
      <g transform="translate(200 190)"><circle r="7" fill="#fff"/><circle cx="-12" cy="-6" r="7" fill="#F39CC3"/><circle cx="10" cy="-8" r="7" fill="#9BD3F2"/><path d="M0 7 v30 M-12 1 v36 M10 -1 v38" stroke="#4E8F3A" stroke-width="2"/></g>
    </svg>`;
  }

  const ITEM_ICON = {
    hachimitsu: '<rect x="12" y="14" width="24" height="26" rx="6" fill="#F5B82E" stroke="#B37B12" stroke-width="2"/><rect x="14" y="8" width="20" height="8" rx="2" fill="#8B5A2B"/><path d="M16 24 q8 -4 16 0 M16 31 q8 -4 16 0" stroke="#B37B12" stroke-width="2" fill="none"/>',
    whip: '<path d="M14 40 h20 l-2 -8 h-16z" fill="#F7E1C3" stroke="#C9A77A" stroke-width="2"/><path d="M16 32 c-4 -6 2 -10 6 -8 c2 -8 10 -8 12 -2 c6 -2 8 6 2 10z" fill="#fff" stroke="#DDD" stroke-width="2"/><circle cx="24" cy="18" r="2.5" fill="#E74C3C"/>',
    kinako: '<path d="M12 18 h24 l-3 22 h-18z" fill="#E0B97A" stroke="#A8824C" stroke-width="2"/><rect x="14" y="10" width="20" height="8" rx="2" fill="#C99A5B"/><text x="24" y="33" text-anchor="middle" font-size="9" font-weight="700" fill="#6B4A1E">粉</text>',
    choco: '<rect x="10" y="12" width="28" height="24" rx="4" fill="#6B3E1E" stroke="#3E2210" stroke-width="2"/><path d="M19 12 v24 M29 12 v24 M10 24 h28" stroke="#3E2210" stroke-width="2"/><path d="M10 16 q14 -8 28 0" fill="#F7D154"/>',
    freezer: '<path d="M24 8 v32 M10 16 l28 16 M38 16 l-28 16 M24 8 l-4 5 M24 8 l4 5 M24 40 l-4 -5 M24 40 l4 -5" stroke="#4FB3E8" stroke-width="3" stroke-linecap="round"/>',
    hammock: '<path d="M8 16 q16 22 32 0" fill="none" stroke="#C97B63" stroke-width="3"/><path d="M8 16 v-6 M40 16 v-6" stroke="#8B5A2B" stroke-width="3"/><path d="M12 20 q12 14 24 0" fill="#F2B01E" opacity=".8"/>',
    kinpaku: '<rect x="10" y="10" width="28" height="28" rx="3" fill="#F1C40F" stroke="#B7950B" stroke-width="2"/><path d="M14 30 l6 -6 l4 4 l8 -10" fill="none" stroke="#fff" stroke-width="2"/><circle cx="32" cy="16" r="2" fill="#fff"/>',
  };
  const itemIcon = id => `<svg viewBox="0 0 48 48" width="40" height="40" class="iicon">${ITEM_ICON[id] || ''}</svg>`;

  const FACE_STYLES = [
    ['E1', '点目', 'ちび案そのまま。点の目とωの口'],
    ['E2', 'リアル目', 'A案の「妙にリアルな目」を小さく載せる'],
    ['E3', 'つやつや大目', 'B案の大きな目。王道のかわいさ'],
    ['E4', '黒い楕円', 'D案のステッカー風の目'],
    ['E5', '線目', 'C案の脱力感。「ー ー」'],
    ['E6', 'たれ目', '半目で眠そう。ゆるい'],
    ['E7', '離れた点目', '目を離して口を小さく。ちいかわ寄り'],
    ['E8', 'キョロ目', '白目が大きく黒目が小さい。シュール'],
  ];

  return { svg, coffinSVG, pickExpr, itemIcon, FACE_STYLES, BODY };
})();

// ---------------------------------------------------------------- Scene（全画面の背景）
// viewBox は縦長スマホ基準（390×844）。preserveAspectRatio=slice で画面いっぱいに敷く。
const Scene = (() => {
  function timeOf(hour) {
    if (hour >= 19 || hour < 5) return 'night';
    if (hour < 10) return 'morning';
    if (hour >= 17) return 'evening';
    return 'day';
  }
  const SKY = { morning: ['#FFE3C4', '#CFE9FF'], day: ['#8ED1FF', '#DDF2FF'], evening: ['#FFB27A', '#FFE0B8'], night: ['#1B2140', '#36406E'] };
  const GRASS = { morning: ['#8FD17A', '#6DBB5E'], day: ['#8CD46F', '#63B84E'], evening: ['#A7C464', '#7FA64C'], night: ['#2F5B4A', '#244A3C'] };

  function outdoor(t) {
    const [s1, s2] = SKY[t], [g1, g2] = GRASS[t];
    const night = t === 'night';
    const stars = night ? '<g fill="#fff"><circle cx="40" cy="60" r="1.6"/><circle cx="110" cy="30" r="1.2"/><circle cx="300" cy="50" r="1.5"/><circle cx="350" cy="110" r="1"/><circle cx="200" cy="80" r="1.3"/><circle cx="250" cy="140" r="1"/></g><circle cx="320" cy="90" r="22" fill="#FFF1B8"/><circle cx="330" cy="82" r="19" fill="' + s1 + '"/>'
      : '<circle cx="250" cy="62" r="20" fill="' + (t === 'evening' ? '#FF8A5B' : '#FFE27A') + '" opacity=".95"/><g fill="#fff" opacity=".9"><ellipse cx="200" cy="150" rx="46" ry="16"/><ellipse cx="180" cy="140" rx="26" ry="18"/><ellipse cx="225" cy="138" rx="24" ry="16"/><ellipse cx="270" cy="220" rx="36" ry="12"/><ellipse cx="285" cy="212" rx="20" ry="14"/></g>';
    return `
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
      <rect width="390" height="844" fill="url(#sky)"/>${stars}
      <ellipse cx="60" cy="300" rx="150" ry="70" fill="${g2}"/><ellipse cx="360" cy="290" rx="140" ry="60" fill="${g2}"/>
      <rect y="300" width="390" height="544" fill="${g1}"/>
      <ellipse cx="195" cy="300" rx="260" ry="40" fill="${g1}"/>
      <path d="M330 300 C 300 360, 160 380, 150 440 C 140 500, 300 540, 250 620 C 210 690, 60 720, 40 844 L 130 844 C 150 740, 300 700, 320 620 C 345 540, 200 500, 220 450 C 240 400, 360 370, 390 320 L 390 300 Z" fill="${night ? '#6E6A58' : '#E3CFA2'}"/>
      <path d="M330 300 C 300 360, 160 380, 150 440 C 140 500, 300 540, 250 620 C 210 690, 60 720, 40 844" fill="none" stroke="${night ? '#5A5648' : '#D2B98A'}" stroke-width="3" opacity=".6"/>
      <!-- 木 -->
      <rect x="30" y="140" width="56" height="190" rx="10" fill="${night ? '#6B4E66' : '#C98A9A'}"/>
      <ellipse cx="58" cy="130" rx="95" ry="70" fill="${night ? '#7A3B4F' : '#E2626D'}"/><ellipse cx="20" cy="110" rx="60" ry="50" fill="${night ? '#8A4558' : '#EE7A82'}"/>
      <ellipse cx="58" cy="335" rx="70" ry="14" fill="rgba(0,0,0,.12)"/>
      <!-- 茂み -->
      <ellipse cx="20" cy="470" rx="70" ry="48" fill="${night ? '#1F4A38' : '#3F9B5C'}"/><ellipse cx="380" cy="420" rx="60" ry="40" fill="${night ? '#1F4A38' : '#3F9B5C'}"/>
      <ellipse cx="370" cy="760" rx="90" ry="60" fill="${night ? '#1F4A38' : '#45A862'}"/><ellipse cx="10" cy="790" rx="80" ry="50" fill="${night ? '#1F4A38' : '#45A862'}"/>
      <!-- 丸太 -->
      <g transform="translate(290 560)"><rect x="-60" y="-14" width="110" height="34" rx="8" fill="${night ? '#5C4330' : '#B98556'}"/><ellipse cx="50" cy="3" rx="14" ry="17" fill="${night ? '#8A6A4A' : '#E9C79A'}"/><circle cx="50" cy="3" r="6" fill="none" stroke="${night ? '#5C4330' : '#B98556'}" stroke-width="2"/><path d="M-40 -2 h60 M-30 10 h50" stroke="${night ? '#4A3626' : '#9E6E42'}" stroke-width="2"/></g>
      <!-- きのこ・花 -->
      ${[[40, 400, '#E25D3F'], [350, 500, '#F08A3C'], [330, 700, '#E25D3F'], [80, 650, '#F08A3C']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><rect x="-5" y="-4" width="10" height="14" rx="3" fill="#F6EBD3"/><ellipse rx="14" ry="9" fill="${c}"/><circle cx="-5" cy="-3" r="2.5" fill="#fff"/><circle cx="5" cy="-1" r="2" fill="#fff"/></g>`).join('')}
      ${[[120, 380], [200, 760], [300, 650], [150, 520], [60, 560]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="5" fill="#FFE27A"/><circle r="2" fill="#F08A3C"/></g>`).join('')}
      ${night ? '<rect width="390" height="844" fill="#101830" opacity=".25"/>' : ''}`;
  }

  // 家の中（既定）。窓の外と照明が時間帯で変わる
  function room(t) {
    const night = t === 'night', evening = t === 'evening', morning = t === 'morning';
    const wall = night ? '#343B3B' : evening ? '#F3DFC7' : morning ? '#F6ECDD' : '#F8F2E7';
    const wall2 = night ? '#293231' : evening ? '#E4C7A5' : morning ? '#E7D7BF' : '#E8DDCB';
    const floor = night ? '#51453A' : '#D8B58B';
    const floor2 = night ? '#443A32' : '#BE976D';
    const sky = night ? '#26384A' : evening ? '#E8AD89' : morning ? '#EDD7B2' : '#BED9DC';
    const outside = night ? '<g fill="#fff"><circle cx="86" cy="96" r="1.4"/><circle cx="120" cy="80" r="1"/><circle cx="140" cy="110" r="1.2"/></g><circle cx="132" cy="92" r="12" fill="#FFF1B8"/><circle cx="137" cy="88" r="10" fill="' + sky + '"/>'
      : '<circle cx="128" cy="92" r="13" fill="#FFE27A"/><ellipse cx="96" cy="118" rx="22" ry="8" fill="#fff" opacity=".9"/><ellipse cx="86" cy="113" rx="12" ry="8" fill="#fff" opacity=".9"/>';
    const lamp = night ? '<ellipse cx="330" cy="420" rx="126" ry="146" fill="#FFE9A8" opacity=".18"/>' : '';
    return `
      <rect width="390" height="844" fill="${wall}"/>
      <rect y="0" width="390" height="30" fill="${wall2}"/>
      <!-- 巾木と小さな壁掛け額：既存のパス内で描画 -->
      <path d="M0 470 h390 M224 274 h36 v42 h-36z" fill="none" stroke="${wall2}" stroke-width="10" stroke-linejoin="round"/>
      <rect y="470" width="390" height="374" fill="${floor}"/>
      <!-- 朝・昼は最初の床パスを窓からの淡い四角形の光にする -->
      ${[0, 1, 2, 3, 4, 5].map(i => i === 0 && (morning || t === 'day')
        ? `<path d="M64 176 L174 176 L284 530 L118 530 Z" fill="#FFF6CF" opacity="${morning ? '.16' : '.22'}"/>`
        : `<path d="M0 ${520 + i * 56} h390" stroke="${floor2}" stroke-width="1" opacity=".35"/>`).join('')}
      <!-- 窓 -->
      <rect x="54" y="60" width="130" height="110" rx="12" fill="${sky}"/>${outside}
      <rect x="54" y="60" width="130" height="110" rx="12" fill="none" stroke="${night ? '#6D7267' : '#B59A77'}" stroke-width="10"/>
      <path d="M119 60 v110 M54 115 h130" stroke="${night ? '#6D7267' : '#B59A77'}" stroke-width="6"/>
      <rect x="40" y="52" width="24" height="130" rx="5" fill="${night ? '#6B5A7A' : '#F2C4B0'}" opacity=".95"/><rect x="174" y="52" width="24" height="130" rx="5" fill="${night ? '#6B5A7A' : '#F2C4B0'}" opacity=".95"/>
      <!-- 棚 -->
      <rect x="250" y="150" width="110" height="10" rx="3" fill="${night ? '#78614B' : '#B28C63'}"/>
      <g transform="translate(272 150)"><rect x="-10" y="-14" width="20" height="14" rx="3" fill="#B98469"/><path d="M0 -14 q-10 -16 -4 -26 M0 -14 q10 -16 2 -28 M0 -14 q0 -12 10 -18" fill="none" stroke="#6E8B59" stroke-width="3" stroke-linecap="round"/></g>
      <rect x="300" y="122" width="26" height="28" rx="3" fill="#F8F1E3" stroke="${night ? '#8D8A73' : '#B59A77'}" stroke-width="3"/><circle cx="313" cy="134" r="6" fill="#F7D154"/>
      <rect x="336" y="130" width="16" height="20" rx="2" fill="#8D9C84"/><rect x="340" y="134" width="8" height="2" fill="#fff"/>
      <!-- ランプ -->
      <rect x="326" y="300" width="8" height="150" fill="${night ? '#8D8A73' : '#947855'}"/><path d="M300 300 h60 l-10 -50 h-40z" fill="${night ? '#FFE9A8' : '#FFF1D5'}" stroke="${night ? '#E8D28A' : '#D8C5A4'}" stroke-width="3"/><ellipse cx="330" cy="452" rx="26" ry="6" fill="${night ? '#8D8A73' : '#947855'}"/>${lamp}
      <!-- ラグ -->
      <ellipse cx="195" cy="600" rx="145" ry="58" fill="${night ? '#6C4A5A' : '#F2B8A6'}"/><ellipse cx="195" cy="600" rx="133" ry="49" fill="${night ? '#7E5A6A' : '#F8CDBF'}"/>
      <!-- クッションとバナナボウル -->
      <g transform="translate(70 690)"><ellipse rx="44" ry="22" fill="${night ? '#5A6A8A' : '#7FA6D9'}"/><ellipse cx="-2" cy="-6" rx="34" ry="14" fill="${night ? '#6A7A9A' : '#9BBCE6'}"/></g>
      <g transform="translate(330 700)"><ellipse rx="34" ry="12" fill="#B98469"/><path d="M-20 -4 q10 -18 24 -10 M-6 -8 q10 -16 24 -8" fill="none" stroke="#F7D154" stroke-width="7" stroke-linecap="round"/></g>
      ${night ? '<rect width="390" height="844" fill="#182729" opacity=".12"/>' : ''}`;
  }
  function engawa(t) {
    const night = t === 'night';
    return `
      <rect width="390" height="844" fill="${night ? '#2B3348' : '#DDEBC8'}"/>
      <rect y="0" width="390" height="420" fill="${night ? '#1C2238' : '#BFE0A8'}"/>
      <circle cx="240" cy="110" r="30" fill="${night ? '#FFF1B8' : '#FFE27A'}"/>
      <ellipse cx="80" cy="420" rx="120" ry="40" fill="${night ? '#24453A' : '#7FBF6A'}"/><ellipse cx="330" cy="430" rx="110" ry="36" fill="${night ? '#24453A' : '#7FBF6A'}"/>
      <g transform="translate(40 150)"><rect x="0" y="0" width="80" height="240" fill="${night ? '#E9E2C8' : '#FFF9E6'}" opacity=".9"/><path d="M0 60 h80 M0 120 h80 M0 180 h80 M40 0 v240" stroke="#8B6A46" stroke-width="3"/></g>
      <rect y="440" width="390" height="404" fill="${night ? '#5A3F2E' : '#C97B63'}"/>
      <path d="M0 480 h390 M0 530 h390 M0 580 h390 M0 630 h390 M0 680 h390 M0 730 h390 M0 780 h390" stroke="${night ? '#4A3325' : '#A85E48'}" stroke-width="2"/>
      <g transform="translate(320 520)"><rect x="-22" y="-10" width="44" height="30" rx="6" fill="#fff" stroke="#999"/><path d="M-8 -14 q2 -8 0 -14 M4 -14 q2 -8 0 -14" stroke="#bbb" stroke-width="2" fill="none"/></g>
      <g transform="translate(60 640)"><ellipse rx="40" ry="18" fill="#7A9E6B"/><ellipse cx="-2" cy="-4" rx="30" ry="12" fill="#8FB57E"/></g>`;
  }
  function nightcity() {
    return `
      <defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1530"/><stop offset="1" stop-color="#2A2F63"/></linearGradient></defs>
      <rect width="390" height="844" fill="url(#csky)"/>
      <g fill="#fff"><circle cx="30" cy="40" r="1.5"/><circle cx="90" cy="90" r="1"/><circle cx="200" cy="30" r="1.4"/><circle cx="280" cy="120" r="1"/><circle cx="350" cy="60" r="1.6"/><circle cx="150" cy="150" r="1"/></g>
      <circle cx="240" cy="150" r="26" fill="#FFF1B8"/>
      ${[[0, 300, 60, 260], [70, 240, 50, 320], [130, 320, 70, 240], [210, 260, 46, 300], [265, 340, 60, 220], [335, 220, 55, 340]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1B2550"/>` + Array.from({ length: 6 }, (_, i) => `<rect x="${x + 8 + (i % 2) * (w / 2)}" y="${y + 20 + Math.floor(i / 2) * 40}" width="10" height="12" fill="#FFE08A" opacity="${(i * 7) % 3 ? 1 : .3}"/>`).join('')).join('')}
      <rect y="560" width="390" height="284" fill="#2E2A3C"/>
      <path d="M0 600 h390" stroke="#4A4560" stroke-width="2"/>
      <g fill="#FFD54A" opacity=".9"><rect x="60" y="690" width="40" height="6" rx="3"/><rect x="170" y="690" width="40" height="6" rx="3"/><rect x="280" y="690" width="40" height="6" rx="3"/></g>
      <g transform="translate(340 540)"><rect x="-4" y="0" width="8" height="90" fill="#555"/><ellipse cx="0" cy="0" rx="26" ry="10" fill="#FFF1B8" opacity=".9"/><path d="M-60 90 L 60 90 L 26 0 L -26 0 Z" fill="#FFF1B8" opacity=".12"/></g>`;
  }
  function beach(t) {
    const night = t === 'night';
    return `
      <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#1B2140' : '#7CCBFF'}"/><stop offset="1" stop-color="${night ? '#3A4C7A' : '#DDF4FF'}"/></linearGradient></defs>
      <rect width="390" height="844" fill="url(#bsky)"/>
      <circle cx="230" cy="130" r="34" fill="${night ? '#FFF1B8' : '#FFD54A'}"/>
      <rect y="360" width="390" height="170" fill="${night ? '#24436B' : '#3FA7D6'}"/>
      <path d="M0 400 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 v20 H0z" fill="${night ? '#2E5484' : '#5CBBE6'}"/>
      <path d="M0 520 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0 v324 H0z" fill="${night ? '#8E8468' : '#F3E2B0'}"/>
      <path d="M0 540 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="#fff" stroke-width="6" opacity=".8"/>
      <g transform="translate(330 540)"><path d="M0 0 q-10 -120 30 -180" fill="none" stroke="#9A6B3C" stroke-width="12" stroke-linecap="round"/><g transform="translate(30 -180)"><path d="M0 0 q-50 -10 -80 30 M0 0 q50 -14 70 30 M0 0 q-10 -50 30 -60 M0 0 q-40 -40 -70 -20 M0 0 q30 -45 60 -20" fill="none" stroke="#3E9A4F" stroke-width="14" stroke-linecap="round"/></g></g>
      <g transform="translate(60 700)"><ellipse rx="18" ry="12" fill="#F7B6C2"/><path d="M-14 0 q14 -16 28 0" fill="none" stroke="#E68FA0" stroke-width="2"/></g>
      <g transform="translate(120 780)"><path d="M-16 0 l32 0 l-16 -18z" fill="#F9D56E"/><circle cx="0" cy="-20" r="4" fill="#E25D3F"/></g>`;
  }
  function svg(bgId, hour) {
    const t = timeOf(hour == null ? new Date().getHours() : hour);
    const body = bgId === 'engawa' ? engawa(t) : bgId === 'night' ? nightcity() : bgId === 'beach' ? beach(t) : bgId === 'outdoor' ? outdoor(t) : room(t);
    return `<svg class="scenebg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }
  return { svg, timeOf };
})();

// ---------------------------------------------------------------- UI
const UI = (() => {
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let panel = null;       // null | 'shop' | 'dex' | 'log' | 'settings' | 'howto'
  let titleStep = 'title'; // 初回起動：'title' → 'name'
  let shopTab = 'item';
  const C = DATA.CURRENCY;

  const I = {
    banana: '<svg viewBox="0 0 24 24"><path d="M5 4c-1 6 2 13 9 15 4 1 6-1 7-3-7 1-12-4-13-12z" fill="currentColor"/><path d="M5 4l1-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>',
    dice: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="8.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.7" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.7" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.7" fill="currentColor"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l1 13H4z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9h16v2a3 3 0 01-6 0 3 3 0 01-4 0 3 3 0 01-6 0zM5 13v8h14v-8"/><path d="M10 21v-5h4v5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="7" stroke-width="4" stroke-dasharray="3.2 2.3"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#F1C40F" stroke="#B7950B" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="#7A5F00">B</text></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9-9A5 5 0 0112 7a5 5 0 019 5c-2 4.4-9 9-9 9z" fill="currentColor"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 0 2 1 3 2 3 0-4 2-7 5-9 0 4 4 6 4 11 0 5-3 9-7 9z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 .6-5.3 4.6L18.5 21 12 17l-6.5 4 1.8-6.8L2 9.6 9 9z" fill="currentColor"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 0 2 1 3 2 3 0-4 2-7 5-9 0 4 4 6 4 11 0 5-3 9-7 9z" fill="currentColor"/></svg>',
  };

  function speech(st) {
    const g = st.gen, p = st.player;
    const pick = a => a[(p.totalLogins + g.playsToday + g.teaseDays) % a.length];
    if (g.rotten) return '…………';
    if (g.ripe >= 3) return 'ぐったり……';
    if (g.ripe >= 1) return 'さみしかった……';
    if (g.teaseDays >= 6) return 'もう……むり……';
    if (g.teaseDays >= 3) return 'まだ……？';
    if (g.teaseDays > 0) return 'そわそわ';
    if (g.stage === 2) return 'ぼく、りっぱになった？';
    if (g.playsToday >= DATA.PLAYS_PER_DAY) return pick(['きょうはまんぞく！', 'またあした！']);
    if (g.playsToday > 0) return pick(['もっとあそぼ！', 'たのしい！']);
    return pick(['きょうもきてくれた！', 'あそぼ！', 'なにする？']);
  }
  const TAP_LINES = ['わっ', 'くすぐったい', 'なに？', 'えへへ', 'バナナだよ', 'もっと！'];

  // ---- キャラの振る舞い（歩く・止まる・昼寝・夜は寝る） ----
  const Pet = { x: 50, facing: 1, timer: null, napping: false, walking: false, awakeUntil: 0, wakeTimer: null };
  function isNight() { const h = new Date().getHours(); return h >= 22 || h < 6; }
  function exprFor(st) {
    const base = Chara.pickExpr(st.gen);
    if ((base === 'normal' || base === 'genki') && (Pet.napping || (isNight() && Date.now() > Pet.awakeUntil))) return 'sleep';
    return base;
  }
  function petInner(st) {
    const g = st.gen, p = st.player;
    const ex = exprFor(st);
    return `${ex === 'sleep' ? '' : `<div class="bubble" id="bubble">${esc(speech(st))}</div>`}
      ${Chara.svg({ lineage: g.lineage, stage: g.stage, ripe: g.ripe, expr: ex, teaseDays: g.teaseDays, fashion: p.fashionEquipped, bgOff: true, size: 150 })}`;
  }
  function petRefresh(st) {
    const layer = $('#petlayer'); if (!layer) return;
    layer.innerHTML = petInner(st);
  }
  function petStart(st) {
    clearTimeout(Pet.timer);
    const layer = $('#petlayer'); if (!layer) return;
    Pet.walking = false; layer.classList.remove('walk');
    Pet.timer = setTimeout(() => petStep(st), 1200 + Math.random() * 3000);
  }
  function petStep(st) {
    const layer = $('#petlayer'); if (!layer) return;
    if (exprFor(st) === 'sleep') { Pet.timer = setTimeout(() => petStep(st), 4000); return; }
    const r = Math.random();
    if (r < 0.10) { // 昼寝
      Pet.napping = true; petRefresh(st);
      Pet.timer = setTimeout(() => { Pet.napping = false; petRefresh(st); petStart(st); }, 12000 + Math.random() * 15000);
      return;
    }
    if (r < 0.25) { // 向きを変えるだけ
      Pet.facing = -Pet.facing; layer.classList.toggle('flip', Pet.facing < 0);
      Pet.timer = setTimeout(() => petStep(st), 1500 + Math.random() * 2500);
      return;
    }
    const target = 22 + Math.random() * 56;
    const dist = Math.abs(target - Pet.x);
    Pet.facing = target > Pet.x ? 1 : -1; layer.classList.toggle('flip', Pet.facing < 0);
    const ms = Math.max(600, dist * 70);
    layer.classList.add('walk'); Pet.walking = true;
    layer.style.transition = `left ${ms}ms linear`;
    layer.style.left = target + '%'; Pet.x = target;
    Pet.timer = setTimeout(() => { layer.classList.remove('walk'); Pet.walking = false; Pet.timer = setTimeout(() => petStep(st), 1500 + Math.random() * 4000); }, ms + 30);
  }

  function hearts(ripe, rotten) {
    const n = rotten ? 0 : 5 - ripe;
    return `<div class="hearts">${[0, 1, 2, 3, 4].map(i => `<i class="${i < n ? 'on' : ''}">${I.heart}</i>`).join('')}</div>`;
  }

  // ---- ホーム（全画面シーン＋HUD） ----
  function home(st) {
    const g = st.gen, p = st.player;
    const next = g.stage < 2 ? DATA.THRESH[g.stage] : null;
    const floor = Game.stageFloor(g.stage);
    const pct = next ? Math.max(0, Math.min(100, Math.round(((g.banana - floor) / (next - floor)) * 100))) : 100;
    const nolimit = Game.noLimit(st);
    const canPlay = nolimit || (!g.teasedToday && g.playsToday < DATA.PLAYS_PER_DAY);
    const canTease = !g.rotten && g.teaseDays < DATA.TEASE_MAX && (nolimit || (g.playsToday === 0 && !g.teasedToday));
    const canEvent = !g.rotten && (nolimit || !g.eventToday);
    const hasItems = Object.values(p.items).some(n => n > 0);
    const form = Game.formName(g);
    const lin = g.lineage ? DATA.LIN[g.lineage] : null;
    const playsLeft = Math.max(0, DATA.PLAYS_PER_DAY - g.playsToday);
    const stageName = ['ノーマル', '第1進化', '最終進化'][g.stage];
    const todayDone = (g.playsToday >= DATA.PLAYS_PER_DAY ? 1 : 0) + (g.eventToday ? 1 : 0) + 1;
    return `
      <div class="scene" id="stage">
        ${Scene.svg(p.fashionEquipped.bg)}
        <div class="petlayer ${Pet.facing < 0 ? 'flip' : ''}" id="petlayer" style="left:${Pet.x}%">
          ${petInner(st)}
        </div>
      </div>
      <div class="hud">
        <div class="hud-tl">
          <div class="lvl"><b>${esc(g.name)}バナナ</b><span>${lin ? `${esc(form)}・${esc(lin.name)}` : 'まだ進化前'}</span><span>${g.days}日目・${p.loginStreak}日連続</span></div>
          <div class="growth">
            <div class="track">
              <span class="node ${g.stage >= 0 ? 'done' : ''}" title="進化前">🍌</span>
              <div class="seg"><i style="width:${g.stage >= 1 ? 100 : Math.round(g.banana / DATA.THRESH[0] * 100)}%"></i></div>
              <span class="node ${g.stage >= 1 ? 'done' : ''}">1</span>
              <div class="seg"><i style="width:${g.stage >= 2 ? 100 : g.stage === 1 ? Math.round((g.banana - DATA.THRESH[0]) / (DATA.THRESH[1] - DATA.THRESH[0]) * 100) : 0}%"></i></div>
              <span class="node ${g.stage >= 2 ? 'done' : ''}">★</span>
            </div>
            <div class="growthtxt"><b>${Game.fmt(g.banana)}🍌</b><span>${g.stage === 0 ? `あと${Game.fmt(DATA.THRESH[0] - g.banana)}で第1進化` : g.stage === 1 ? `あと${Game.fmt(DATA.THRESH[1] - g.banana)}で最終進化` : '最終進化・明日お迎え'}</span></div>
          </div>
          ${(g.teaseDays > 0 || g.hammockStops || g.ripe > 0 || g.rotten) ? `<div class="sub">${g.teaseDays > 0 ? `<span class="tease">${I.fire}焦らし${g.teaseDays}日目</span>` : ''}${g.hammockStops ? `<span class="stagepill">ハンモック×${g.hammockStops}</span>` : ''}${g.rotten ? `<span class="stagepill bad">腐り中 ${g.recoverLogins}/${DATA.ROT_RECOVER_LOGINS}</span>` : g.ripe > 0 ? `<span class="stagepill">${['', '少し熟れてる', '熟れてる', 'かなり熟れてる'][g.ripe]}</span>` : ''}</div>` : ''}
        </div>
        <div class="hud-tr">
          <button class="abtn primary" data-act="play" ${canPlay ? '' : 'disabled'}><i>${I.banana}</i><span>${g.teaseDays > 0 && !g.teasedToday ? '判定' : nolimit ? '∞' : playsLeft}</span><small>プレイ</small></button>
          <button class="abtn" data-act="tease" ${canTease ? '' : 'disabled'}><i>${I.hourglass}</i><small>焦らす</small></button>
          <button class="abtn" data-act="event" ${canEvent ? '' : 'disabled'}><i>${I.dice}</i><small>イベント</small></button>
          <button class="abtn" data-act="items" ${hasItems && canPlay ? '' : 'disabled'}><i>${I.bag}</i><small>アイテム</small></button>
        </div>
        <div class="hud-bl">
          <div class="wallet">${I.coin}<b>${p.bk}</b></div>
        </div>
        <button class="today" data-act="panel" data-panel="log">
          <i class="${g.playsToday >= DATA.PLAYS_PER_DAY ? 'done' : ''}">${I.banana}</i><span>${g.playsToday}/${DATA.PLAYS_PER_DAY}</span>
          <i class="${g.eventToday ? 'done' : ''}">${I.dice}</i><span>${g.eventToday ? 1 : 0}/1</span>
          <em>きょう ${todayDone}/3</em>
        </button>
        <button class="menubtn" data-act="menu">${I.menu}</button>
      </div>`;
  }

  // ---- パネルの中身（シーンの上にかぶさる） ----
  function shop(st) {
    const p = st.player, g = st.gen;
    const fav = g.lineage ? DATA.LIN[g.lineage].fav : null;
    const items = `<div class="grid2">${DATA.ITEMS.map(it => `
      <div class="pcard">
        <div class="pico">${Chara.itemIcon(it.id)}${p.items[it.id] ? `<b class="badge">×${p.items[it.id]}</b>` : ''}</div>
        <div class="pname">${esc(it.name)}${fav === it.id ? ` <em class="fav">${I.star}得意</em>` : ''}</div>
        <div class="pdesc">${esc(it.desc)}</div>
        <button class="buy" data-act="buyItem" data-id="${it.id}" ${p.bk < it.price ? 'disabled' : ''}>${I.coin}${it.price}</button>
      </div>`).join('')}</div>`;
    const fashion = DATA.FASHION_SLOTS.map(slot => `
      <h3 class="slottitle">${slot.name}${p.fashionEquipped[slot.id] ? `<button class="link" data-act="unequip" data-slot="${slot.id}">はずす</button>` : ''}</h3>
      <div class="grid3">${DATA.FASHION.filter(f => f.slot === slot.id).map(f => {
        const owned = p.fashionOwned.includes(f.id), on = p.fashionEquipped[slot.id] === f.id;
        const prev = slot.id === 'bg' ? `<div class="bgprev">${Scene.svg(f.id, 13)}</div>`
          : Chara.svg({ lineage: g.lineage, stage: g.stage, expr: 'genki', size: 64, bgOff: true, fashion: { [slot.id]: f.id }, cls: 'nomove' });
        return `<div class="pcard ${on ? 'on' : ''}">
          <div class="pico">${prev}${on ? `<b class="badge on">${I.check}</b>` : ''}</div>
          <div class="pname">${esc(f.name)}</div>
          ${owned ? (on ? '<span class="equipped">装備中</span>' : `<button class="buy ghost" data-act="equip" data-slot="${slot.id}" data-id="${f.id}">装備</button>`)
            : `<button class="buy" data-act="buyFashion" data-id="${f.id}" ${p.bk < f.price ? 'disabled' : ''}>${I.coin}${f.price}</button>`}
        </div>`; }).join('')}</div>`).join('');
    return `
      <div class="seg"><button class="${shopTab === 'item' ? 'on' : ''}" data-shop="item">アイテム</button><button class="${shopTab === 'fashion' ? 'on' : ''}" data-shop="fashion">オシャレ</button></div>
      <p class="hint">${shopTab === 'item' ? 'プレイ1回につき1個。得意系統だと効果アップ。' : '見た目だけ。手に入れたものは次の世代にも引き継ぐ。背景を変えると部屋ごと変わる。'}</p>
      ${shopTab === 'item' ? items : fashion}`;
  }

  function dex(st) {
    const p = st.player;
    const slots = [];
    for (const l of DATA.LINEAGES) for (const s of [1, 2]) slots.push({ l, s });
    const got = Object.keys(p.dex.seen).length;
    return `
      <div class="card dexhead">
        <div><h2>図鑑</h2><p class="dim">全部そろえるのがゴール</p></div>
        <div class="ring" style="--p:${Math.round(got / slots.length * 100)}"><b>${got}</b><small>/${slots.length}</small></div>
      </div>
      <div class="grid3">
        ${slots.map(({ l, s }) => {
          const seen = p.dex.seen[`${l.id}_${s}`];
          const name = s === 1 ? l.s1 : l.s2;
          if (l.secret && !seen) return `<div class="pcard locked secret"><div class="pico"><span class="q">${I.sparkle}</span></div><div class="pname">？？？</div></div>`;
          if (!seen) return `<div class="pcard locked"><div class="pico">${Chara.svg({ lineage: l.id, stage: s, size: 64, bgOff: true, cls: 'silhouette nomove' })}</div><div class="pname">？？？</div><div class="pdesc">${esc(l.name)}・${s === 1 ? '第1' : '最終'}</div></div>`;
          return `<div class="pcard ${l.secret ? 'secret' : ''}"><div class="pico">${Chara.svg({ lineage: l.id, stage: s, size: 64, bgOff: true, cls: 'nomove' })}</div><div class="pname">${esc(name)}</div><div class="pdesc">${esc(l.name)}</div></div>`;
        }).join('')}
      </div>
      <h3>歴代のバナナ <small>${p.dex.entries.length}世代</small></h3>
      <div class="list">
        ${p.dex.entries.slice().reverse().map(e => `<div class="row">
          <div class="rico">${Chara.svg({ lineage: e.lineage, stage: 2, size: 44, bgOff: true, cls: 'nomove' })}</div>
          <div class="rbody"><b>第${e.gen}世代 ${esc(e.name)}バナナ</b><small>${esc(e.form)}・${e.days}日・最高${Game.fmt(e.maxBanana)}🍌・焦らし最長${e.longestTease}日・セルフ${e.self}回</small></div>
        </div>`).join('') || '<p class="dim">まだいません。最終進化の翌日に、ここに残ります。</p>'}
      </div>`;
  }

  function logPanel(st) {
    const g = st.gen, p = st.player;
    const t = g.teaseDays > 0 ? DATA.TEASE[g.teaseDays] : null;
    return `
      <div class="card tasks">
        <h3>きょうのやること <small>${g.days}日目・${p.loginStreak}日連続</small></h3>
        <ul>
          <li class="done"><i>${I.check}</i>ログイン<span>+${DATA.LOGIN_BANANA}🍌 +${DATA.LOGIN_BK}${C}</span></li>
          ${g.teaseDays > 0 ? `<li class="hot"><i>${I.flame}</i>焦らし ${g.teaseDays}日目${g.teasedToday ? '（きょうは我慢）' : '・判定待ち'}<span>成功 +${t[0]}〜${t[1]} ／ セルフ ${Math.round(t[2] * 100)}%</span></li>` : ''}
          <li class="${g.playsToday >= DATA.PLAYS_PER_DAY ? 'done' : ''}"><i>${g.playsToday >= DATA.PLAYS_PER_DAY ? I.check : ''}</i>プレイ<span>${g.playsToday}/${DATA.PLAYS_PER_DAY}</span></li>
          <li class="${g.eventToday ? 'done' : ''}"><i>${g.eventToday ? I.check : ''}</i>イベントプレイ<span>${g.eventToday ? 1 : 0}/1</span></li>
        </ul>
      </div>
      <div class="card log">
        <h3>きろく</h3>
        <ul>${p.log.slice(0, 20).map(l => `<li><span>${esc(Days.pretty(l.d).slice(5))}</span>${esc(l.t)}</li>`).join('') || '<li class="dim">まだありません</li>'}</ul>
      </div>`;
  }

  function settings(st) {
    const p = st.player;
    return `
      <div class="card">
        <h3>ホーム画面に追加</h3>
        <ol class="steps"><li>Safari の下の「共有」ボタン</li><li>「ホーム画面に追加」</li><li>追加したアイコンから開く</li></ol>
        <p class="dim">ブラウザのままだと、7日ほど開かないとデータが消えることがあります。</p>
      </div>
      <div class="card">
        <h3>バックアップ</h3>
        <p class="dim">データはこのスマホの中だけ。ときどき書き出してメモに残してください。</p>
        <div class="two"><button class="btn" data-act="export">書き出す</button>${/claude\.(ai|site)$/.test(location.hostname) ? '' : '<button class="btn" data-act="download">ファイル保存</button>'}</div>
        <textarea id="backupBox" rows="3" placeholder="書き出したデータを貼り付けて「読み込む」"></textarea>
        <button class="btn ghost" data-act="import">読み込む（今のデータを置き換え）</button>
      </div>
      <div class="card">
        <h3>データ</h3>
        <p class="dim">第${p.generation}世代／合計ログイン ${p.totalLogins}回／保存先：この端末</p>
        <button class="btn danger" data-act="reset">はじめから（全データ消去）</button>
      </div>
      <p class="version" data-act="version">${DATA.GAME_NAME} v0.6${p.testMode ? '・テストモード' : ''}</p>
      ${p.testMode ? `<div class="card test"><h3>テストモード</h3>
        <p class="dim">1日の制限（プレイ2回・焦らし1回・イベント1回）を外し、日付を進められます。画面下のバーで操作。</p>
        <button class="btn ghost" data-act="testOff">テストモードを終了</button></div>` : ''}`;
  }

  function howto() {
    return `
      <div class="card howto">
        <h3>${DATA.GAME_NAME} のあそびかた</h3>
        <p>あなただけの「〇〇バナナ」を育てて、何に進化するかを楽しむゲーム。1世代は約1週間。毎日ちょっとだけ開けば大丈夫。</p>
      </div>
      <div class="card howto"><h3>1日の流れ</h3>
        <ol><li>開く → ログインボーナス（+1🍌 +10BK）</li><li>「プレイ」を2回（ミニゲームでボーナス）か、「焦らす」で我慢</li><li>「イベント」で運だめし（1日1回）</li><li>数分で終わり。また明日</li></ol>
        <p class="dim">日付は0時に切り替わります。</p></div>
      <div class="card howto"><h3>🍌 バナナ（成長）</h3>
        <p>8で第1進化、16で最終進化。増えるのはプレイ・ログイン・イベント。減るのは放置とイベント失敗だけ。今の進化段階より下には戻りません。</p></div>
      <div class="card howto"><h3>焦らす</h3>
        <p>その日はプレイせずに我慢。翌日の1回目のプレイで判定。長く焦らすほど成功の量は増えるけど「セルフバナナ」（+0.5で終わり）の確率も上がる。1〜3日は得、4〜5日はトントン、6日からはギャンブル。<b>7日焦らして成功（5%）するとシークレットに。</b></p></div>
      <div class="card howto"><h3>イベント</h3>
        <p>「〇〇でプレイしますか？」の候補2つから1つを選ぶ。場所によって安全・ふつう・ハイリスク。大成功で+10、大失敗で−8。</p></div>
      <div class="card howto"><h3>BK とショップ</h3>
        <p>BK はログインとプレイで貯まる通貨。アイテム（プレイに使うと効果アップ。得意系統ならさらに）と、オシャレ（見た目だけ。次の世代に引き継ぐ）を買える。背景を買うと部屋が変わる。</p></div>
      <div class="card howto"><h3>系統と進化</h3>
        <p>8になった時点の育て方で10の系統から決まる。毎日プレイ→犬系、焦らし多め→猫系、アイテム多用→肉食系、イベント多め→俺様系、オシャレ多め→王子様系、放置多め→草食系、偏りなし→癒し系……。狙えるけど確定はしない。系統で顔つきも変わる。</p></div>
      <div class="card howto"><h3>放置すると</h3>
        <p>来ない日が続くとバナナが減り、色が熟れていく。7日で腐り。3日連続で開けば復活（その間は獲得半分）。</p></div>
      <div class="card howto"><h3>お迎えと図鑑</h3>
        <p>最終進化の翌日、棺桶バナナのお迎え。図鑑に登録（+100BK）して次の世代へ。図鑑は全22枠。全部そろえるのがゴール。</p></div>
      <div class="card howto"><h3>大事なこと</h3>
        <p>データはこのスマホの中だけ。Safari のままだと消えることがあるので、<b>ホーム画面に追加</b>して使ってね。設定からバックアップもできます。</p></div>`;
  }
  const PANELS = { shop: ['ショップ', I.shop], dex: ['図鑑', I.book], log: ['きょうのやること', I.list], howto: ['あそびかた', I.sparkle], settings: ['設定', I.gear] };
  function panelHtml(st) {
    if (!panel) return '';
    const [title] = PANELS[panel];
    const body = panel === 'shop' ? shop(st) : panel === 'dex' ? dex(st) : panel === 'log' ? logPanel(st) : panel === 'howto' ? howto() : settings(st);
    return `<div class="panel" id="panel">
      <div class="panelhead"><h2>${title}</h2><div class="wallet small">${I.coin}<b>${st.player.bk}</b></div><button class="iconbtn" data-act="closePanel">${I.close}</button></div>
      <div class="panelbody">${body}</div>
    </div>`;
  }
  function menuSheet(st) {
    sheet(`<div class="menugrid five">${Object.entries(PANELS).map(([id, [nm, ic]]) => `<button class="mitem" data-act="panel" data-panel="${id}"><i>${ic}</i><b>${nm}</b></button>`).join('')}</div>`);
  }

  function logoSVG(size) {
    return `<svg class="logo" viewBox="0 0 320 120" width="${size || 300}" height="${(size || 300) * 120 / 320}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1A0"/><stop offset="1" stop-color="#E9B43F"/></linearGradient></defs>
      <g transform="rotate(-3 160 60)">
        <text x="160" y="86" text-anchor="middle" font-family="'Hiragino Maru Gothic ProN','Hiragino Sans',sans-serif" font-size="76" font-weight="900" stroke="#665038" stroke-width="10" stroke-linejoin="round" fill="#665038">バナイク</text>
        <text x="160" y="86" text-anchor="middle" font-family="'Hiragino Maru Gothic ProN','Hiragino Sans',sans-serif" font-size="76" font-weight="900" fill="url(#lg)">バナイク</text>
        <text x="160" y="110" text-anchor="middle" font-family="'Hiragino Maru Gothic ProN','Hiragino Sans',sans-serif" font-size="17" font-weight="800" fill="#665038" letter-spacing="3">バナナの育成ゲーム</text>
      </g>
      <g transform="translate(286 26) rotate(20)"><path d="M-10 0 C -12 10, -4 18, 8 16 C 2 12, -2 6, -2 -2 Z" fill="#E9B43F" stroke="#665038" stroke-width="2.5" stroke-linejoin="round"/></g>
      <g transform="translate(30 30) rotate(-30)"><path d="M-10 0 C -12 10, -4 18, 8 16 C 2 12, -2 6, -2 -2 Z" fill="#E9B43F" stroke="#665038" stroke-width="2.5" stroke-linejoin="round"/></g>
    </svg>`;
  }
  function titleScreen() {
    const floats = Array.from({ length: 9 }, (_, i) => `<i class="fb" style="left:${8 + i * 10.5}%;animation-delay:${(i * 0.7) % 4}s;animation-duration:${6 + (i % 3) * 2}s;font-size:${18 + (i % 3) * 8}px">🍌</i>`).join('');
    return `
      <div class="screen title">
        <div class="floats">${floats}</div>
        <div class="titlebox">
          ${logoSVG(300)}
          <div class="titlechar">${Chara.svg({ stage: 0, ripe: 0, expr: 'genki', bgOff: true, size: 170, face: 'E1' })}</div>
          <p class="tagline">あなただけの〇〇バナナを育てて、<br>何に進化するか見届けよう。</p>
          <button class="btn primary big start" data-act="startName">はじめる</button>
          <p class="dim small">1世代は約1週間。毎日ちょっとだけ。</p>
        </div>
      </div>`;
  }
  function nameScreen(st, mode) {
    const title = mode === 'first' ? 'あなただけのバナナに<br>名前をつけよう' : '次の世代のバナナに<br>名前をつけよう';
    return `
      <div class="screen center">
        <div class="hero">${Chara.svg({ stage: 0, ripe: 0, expr: 'genki', size: 180, bgOff: true })}</div>
        <h2>${title}</h2>
        <p class="dim">〇〇バナナ の「〇〇」を入れてください</p>
        <form id="nameForm" class="namebox">
          <div class="namein"><input id="nameInput" maxlength="8" placeholder="〇〇" autocomplete="off" required><span>バナナ</span></div>
          <button class="btn primary big" type="submit">はじめる</button>
        </form>
      </div>`;
  }

  function coffinScreen(st) {
    const rec = Game.coffinRecord(st);
    return `
      <div class="screen center coffin">
        ${Chara.coffinSVG({ lineage: st.gen.lineage, fashion: st.player.fashionEquipped })}
        <h2>棺桶バナナのお迎え</h2>
        <p><b>${esc(rec.name)}バナナ</b>（${esc(rec.form)}）は、<br>${rec.days}日の生涯を終えました。</p>
        <div class="record"><div><small>最高</small><b>${Game.fmt(rec.maxBanana)}</b></div><div><small>焦らし最長</small><b>${rec.longestTease}日</b></div><div><small>セルフ</small><b>${rec.self}回</b></div></div>
        <p class="dim">図鑑に登録すると +${DATA.DEX_BK}${C}。オシャレと${C}は次の世代へ。</p>
        <form id="coffinForm" class="namebox">
          <div class="namein"><input id="nameInput" maxlength="8" placeholder="次の〇〇" autocomplete="off" required><span>バナナ</span></div>
          <button class="btn primary big" type="submit">見送って、次の世代へ</button>
        </form>
      </div>`;
  }

  function testBar(st) {
    if (!st || !st.player.testMode) return '';
    return `<div class="testbar">
      <span>TEST</span>
      <button data-act="dbgDay" data-n="1">+1日</button>
      <button data-act="dbgDay" data-n="7">+7日</button>
      <button data-act="dbgBanana">🍌+5</button>
      <button data-act="dbgBK">${C}+100</button>
      <button data-act="testData">データ</button>
    </div>`;
  }

  function render(st) {
    const app = $('#app');
    document.body.classList.remove('coffinbg');
    if (!st) { app.innerHTML = titleStep === 'name' ? nameScreen(null, 'first') : titleScreen(); return; }
    document.body.classList.toggle('coffinbg', !!st.gen.pendingCoffin);
    if (st.gen.pendingCoffin) { app.innerHTML = coffinScreen(st) + testBar(st); return; }
    // パネルを開いたままの再描画ではスクロール位置を保つ
    const prevScroll = $('#panel .panelbody') ? $('#panel .panelbody').scrollTop : 0;
    app.innerHTML = home(st) + panelHtml(st) + testBar(st);
    if (prevScroll && $('#panel .panelbody')) $('#panel .panelbody').scrollTop = prevScroll;
    petStart(st);
  }

  function tapReact(st) {
    const stage = $('#stage'); if (!stage) return;
    if (exprFor(st) === 'sleep') { // 起こす。60秒は起きている
      Pet.napping = false; Pet.awakeUntil = Date.now() + 60000;
      clearTimeout(Pet.wakeTimer); Pet.wakeTimer = setTimeout(() => { petRefresh(st); }, 60500);
      petRefresh(st); petStart(st);
      const b0 = $('#bubble'); if (b0) b0.textContent = 'ふぁ……おはよ';
      const svg0 = stage.querySelector('svg.chara'); if (svg0) { svg0.classList.add('hop'); }
      return;
    }
    const svg = stage.querySelector('svg.chara');
    if (svg) { svg.classList.remove('hop'); void svg.offsetWidth; svg.classList.add('hop'); }
    const b = $('#bubble'); if (b) { b.textContent = TAP_LINES[Math.floor(Math.random() * TAP_LINES.length)]; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    const h = document.createElement('i'); h.className = 'floatheart'; h.innerHTML = I.heart;
    h.style.left = (40 + Math.random() * 20) + '%'; stage.appendChild(h); setTimeout(() => h.remove(), 1200);
  }

  function itemSheet(st) {
    const p = st.player, g = st.gen;
    const fav = g.lineage ? DATA.LIN[g.lineage].fav : null;
    const owned = DATA.ITEMS.filter(it => p.items[it.id] > 0);
    sheet(`<h3>アイテムを使ってプレイ</h3><p class="dim">プレイ1回につき1個。${g.teaseDays > 0 ? 'いまは焦らし明けの判定プレイです。' : ''}</p>
      <div class="list">${owned.map(it => {
        const freezerNg = it.id === 'freezer' && (g.teaseDays === 0 || g.teaseDays >= DATA.TEASE_MAX);
        return `<button class="row ${freezerNg ? 'off' : ''}" data-act="playWith" data-id="${it.id}" ${freezerNg ? 'disabled' : ''}>
          <div class="rico">${Chara.itemIcon(it.id)}</div>
          <div class="rbody"><b>${esc(it.name)} <small>×${p.items[it.id]}</small>${fav === it.id ? ` <em class="fav">${I.star}得意</em>` : ''}</b><small>${esc(it.desc)}${freezerNg ? '（いまは使えない）' : ''}</small></div>
          <i class="chev">${I.chev}</i></button>`; }).join('')}</div>`);
  }
  function sheet(html) {
    const el = document.createElement('div');
    el.className = 'overlay sheetwrap';
    el.innerHTML = `<div class="sheet"><div class="grab"></div>${html}<button class="btn ghost close">とじる</button></div>`;
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('.close') || e.target.closest('[data-act]')) el.remove(); });
    document.body.appendChild(el);
  }

  // ---- プレイのミニゲーム（3種からランダム）。結果の bonus を onDone(bonus) で返す ----
  function playGame(st, itemId, onDone) {
    const g = st.gen, p = st.player;
    const judging = g.teaseDays > 0;
    const it = itemId ? DATA.ITEM[itemId] : null;
    const kind = DATA.PLAY_GAMES[Math.floor(Math.random() * DATA.PLAY_GAMES.length)];
    const el = document.createElement('div');
    el.className = 'overlay';
    const charHtml = Chara.svg({ lineage: g.lineage, stage: g.stage, ripe: g.ripe, expr: 'genki', fashion: p.fashionEquipped, bgOff: true, size: 120 });
    const title = judging ? `焦らし${g.teaseDays}日目の判定プレイ` : 'プレイ';
    const sub = (it ? `${esc(it.name)}を使う。` : '') + { timing: 'マーカーがまんなかに来たら「とめる」', roulette: 'ルーレットを「とめる」。オレンジでピッタリ', tap: `${DATA.TAP_GAME.seconds}秒でたくさんタップ！` }[kind];
    let body = '';
    if (kind === 'timing') body = `<div class="tbar"><div class="zone good"></div><div class="zone perfect"></div><i class="marker"></i></div><div class="verdict" id="verdict">&nbsp;</div><button class="btn primary big stop">とめる！</button>`;
    else if (kind === 'roulette') body = `<div class="wheelwrap"><i class="pointer"></i>${wheelSVG()}</div><div class="verdict" id="verdict">&nbsp;</div><button class="btn primary big stop">とめる！</button>`;
    else body = `<div class="tapcount"><b id="tapn">0</b><small>回</small></div><div class="tbar plain"><i class="fill" id="tapfill"></i></div><div class="verdict" id="verdict">&nbsp;</div><button class="btn primary big tapbtn">タップ！</button>`;
    el.innerHTML = `<div class="modal game"><h2>${title}</h2><p class="dim">${sub}</p><div class="gamechar">${charHtml}</div>${body}</div>`;
    document.body.appendChild(el);
    const v = el.querySelector('#verdict');
    const finish = grade => {
      const bonus = DATA.PLAY_BONUS[grade];
      v.textContent = grade === 'perfect' ? `ピッタリ！ +${Game.fmt(bonus)}` : grade === 'good' ? `いいね +${Game.fmt(bonus)}` : 'ずれた……';
      v.className = 'verdict ' + grade;
      setTimeout(() => {
        if (!judging) { el.remove(); onDone(bonus); return; }
        el.querySelector('.modal').innerHTML = `<h2>判定中……</h2><p class="dim">${g.teaseDays}日焦らした結果は</p>
          <div class="gamechar shake">${Chara.svg({ lineage: g.lineage, stage: g.stage, ripe: g.ripe, expr: 'sowasowa', teaseDays: g.teaseDays, fashion: p.fashionEquipped, bgOff: true, size: 120 })}</div>
          <div class="dots"><i></i><i></i><i></i></div>`;
        setTimeout(() => { el.remove(); onDone(bonus); }, 1800);
      }, 900);
    };

    if (kind === 'timing') {
      const marker = el.querySelector('.marker');
      const speed = 2.4 + Math.random() * 0.8;
      let pos = 0, raf = 0, t0 = performance.now(), stopped = false;
      const loop = now => { pos = (Math.sin((now - t0) / 1000 * speed) + 1) / 2; marker.style.left = (pos * 100) + '%'; if (!stopped) raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      el.querySelector('.stop').onclick = () => {
        if (stopped) return; stopped = true; cancelAnimationFrame(raf);
        el.querySelector('.stop').disabled = true;
        const d = Math.abs(pos - 0.5);
        finish(d < 0.07 ? 'perfect' : d < 0.2 ? 'good' : 'miss');
      };
    } else if (kind === 'roulette') {
      // 12区画：オレンジ(perfect)3・黄(good)5・グレー(miss)4。針は上。
      const wheel = el.querySelector('svg.wheel');
      let angle = Math.random() * 360, vel = 9 + Math.random() * 3, stopping = false, raf = 0;
      const loop = () => {
        angle = (angle + vel) % 360; wheel.style.transform = `rotate(${angle}deg)`;
        if (stopping) { vel *= 0.965; if (vel < 0.15) { cancelAnimationFrame(raf); const idx = Math.floor(((360 - angle % 360) % 360) / 30); finish(WHEEL[idx]); return; } }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      el.querySelector('.stop').onclick = () => { if (stopping) return; stopping = true; el.querySelector('.stop').disabled = true; };
    } else {
      let n = 0, started = false, done = false; const btn = el.querySelector('.tapbtn'); const fill = el.querySelector('#tapfill'); const num = el.querySelector('#tapn');
      const T = DATA.TAP_GAME.seconds * 1000; let t0 = 0, raf = 0;
      const loop = now => { const r = Math.min(1, (now - t0) / T); fill.style.width = (100 - r * 100) + '%'; if (r < 1) raf = requestAnimationFrame(loop); else { done = true; btn.disabled = true; finish(n >= DATA.TAP_GAME.perfect ? 'perfect' : n >= DATA.TAP_GAME.good ? 'good' : 'miss'); } };
      btn.addEventListener('pointerdown', e => { e.preventDefault(); if (done) return; if (!started) { started = true; t0 = performance.now(); raf = requestAnimationFrame(loop); } n++; num.textContent = n; btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); });
    }
  }
  const WHEEL = ['perfect', 'good', 'miss', 'good', 'miss', 'perfect', 'good', 'miss', 'good', 'perfect', 'good', 'miss'];
  function wheelSVG() {
    const col = { perfect: '#FF9F1C', good: '#FFE27A', miss: '#E9E1CC' };
    let segs = '';
    for (let i = 0; i < 12; i++) {
      const a0 = (i * 30 - 90) * Math.PI / 180, a1 = ((i + 1) * 30 - 90) * Math.PI / 180;
      const x0 = 100 + 92 * Math.cos(a0), y0 = 100 + 92 * Math.sin(a0), x1 = 100 + 92 * Math.cos(a1), y1 = 100 + 92 * Math.sin(a1);
      segs += `<path d="M100 100 L${x0.toFixed(1)} ${y0.toFixed(1)} A92 92 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}z" fill="${col[WHEEL[i]]}" stroke="#fff" stroke-width="2"/>`;
    }
    return `<svg class="wheel" viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="96" fill="#fff" stroke="#7B4A12" stroke-width="4"/>${segs}<circle cx="100" cy="100" r="14" fill="#7B4A12"/><text x="100" y="105" text-anchor="middle" font-size="12" fill="#fff">🍌</text></svg>`;
  }

  // ---- 今日のイベント：候補2つから選ぶ ----
  function eventSheet(st) {
    const evs = Game.todayEvents(st);
    sheet(`<h3>きょうのイベント</h3><p class="dim">どちらでプレイする？ 大きく増えるか、減るか。</p>
      <div class="evgrid">${evs.map(e => `<button class="evcard risk-${e.risk}" data-act="eventGo" data-id="${e.id}">
        <span class="evicon">${e.icon}</span><b>${esc(e.place)}で<br>プレイしますか？</b><small>${esc(e.desc)}</small><em>${esc(DATA.RISK[e.risk].label)}</em></button>`).join('')}</div>`);
  }
  // ---- イベントのドキドキ演出 → onDone() ----
  function eventSuspense(st, eventId, onDone) {
    const e = DATA.EV[eventId], g = st.gen, p = st.player;
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<div class="modal game"><div class="evbig">${e.icon}</div><h2>${esc(e.place)}で……</h2>
      <div class="gamechar shake">${Chara.svg({ lineage: g.lineage, stage: g.stage, ripe: g.ripe, expr: 'sowasowa', teaseDays: 3, fashion: p.fashionEquipped, bgOff: true, size: 120 })}</div>
      <div class="dots"><i></i><i></i><i></i></div></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); onDone(); }, 2000);
  }

  // ---- モーダルと演出 ----
  const queue = [];
  let showing = false;
  function enqueue(ev) { queue.push(ev); pump(); }
  function pump() {
    if (showing || !queue.length) return;
    const ev = queue.shift();
    showing = true;
    const done = () => { showing = false; pump(); };
    if (ev.type === 'secret') return secretFx(ev, done);
    if (ev.type === 'evolve') return evolveFx(ev, done);
    if (ev.type === 'login') return modal(`<div class="mico">${I.sparkle}</div><h2>おかえり！</h2><ul class="lines">${ev.msgs.map(m => `<li>${esc(m)}</li>`).join('')}</ul>`, done, 'うん');
    if (ev.type === 'result') {
      const r = ev.res;
      let head = '';
      if (r.type === 'play') head = `<div class="bignum ${r.judge === 'self' ? 'meh' : ''}">+${Game.fmt(r.total)}<small>🍌</small></div><h2>${r.judge === 'self' ? 'セルフバナナ……' : r.judge === 'success' ? '焦らし成功！' : 'プレイ！'}</h2>`;
      else if (r.type === 'tease') head = `<div class="flames">${Array.from({ length: r.days }, () => `<i>${I.flame}</i>`).join('')}</div><h2>焦らし ${r.days}日目</h2>`;
      else if (r.type === 'event') head = `<div class="evbig">${r.icon || ''}</div><div class="bignum ${r.delta < 0 ? 'bad' : ''}">${r.delta >= 0 ? '+' : ''}${Game.fmt(r.delta)}<small>🍌</small></div><h2>${esc(r.outcome)}！</h2>`;
      return modal(`${head}<ul class="lines">${r.lines.map(m => `<li>${esc(m)}</li>`).join('')}</ul>`, done);
    }
    done();
  }
  function modal(html, onClose, label) {
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<div class="modal">${html}<button class="btn primary big close">${label || 'OK'}</button></div>`;
    el.querySelector('.close').onclick = () => { el.remove(); onClose && onClose(); };
    document.body.appendChild(el);
  }
  function evolveFx(ev, done) {
    const el = document.createElement('div');
    el.className = 'overlay evolvefx';
    el.innerHTML = `<div class="evo">
      <div class="glow"></div>
      <div class="evochar">${Chara.svg({ lineage: ev.lineage, stage: ev.stage, expr: 'genki', size: 220, bgOff: true })}</div>
      <p class="evolabel">${ev.stage === 1 ? '第1進化（2段階のうち1つ目）' : '最終進化（2段階のうち2つ目）'}</p>
      <h2>${esc(ev.form)}</h2>
      <p class="evohint">${esc(DATA.LIN[ev.lineage].name)}：${esc(DATA.LIN[ev.lineage].hint)}</p>
      ${ev.stage === 2 ? '<p class="evohint">明日、棺桶バナナのお迎えがあります</p>' : `<p class="evohint">次は${DATA.THRESH[1]}🍌で最終進化。系統はこのまま</p>`}
      <button class="btn primary big close">やったね！</button></div>`;
    document.body.appendChild(el);
    confetti(el, 40);
    el.querySelector('.close').onclick = () => { el.remove(); done(); };
  }
  function ask(msg, okLabel, danger) {
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.className = 'overlay';
      el.innerHTML = `<div class="modal"><p class="askmsg">${esc(msg).replace(/\n/g, '<br>')}</p>
        <div class="two"><button class="btn ghost no">やめる</button><button class="btn ${danger ? 'danger' : 'primary'} yes">${esc(okLabel || 'OK')}</button></div></div>`;
      el.querySelector('.no').onclick = () => { el.remove(); resolve(false); };
      el.querySelector('.yes').onclick = () => { el.remove(); resolve(true); };
      document.body.appendChild(el);
    });
  }
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 1800);
  }
  function secretFx(ev, done) {
    const el = document.createElement('div');
    el.className = 'overlay dark secretfx';
    el.innerHTML = `
      <div class="fxstage">
        <div class="shaker">${Chara.svg({ stage: ev.stage, ripe: 0, expr: 'sowasowa', teaseDays: 7, size: 220, bgOff: true, cls: 'nomove' })}</div>
        <svg class="cracks" viewBox="0 0 200 240" width="220" height="264"><path d="M100 60 l-8 30 l12 25 l-10 30 l14 28" fill="none" stroke="#fff" stroke-width="2"/><path d="M92 90 l-20 8 M104 115 l22 -6 M96 145 l-18 12 M110 173 l20 10" fill="none" stroke="#fff" stroke-width="1.5"/></svg>
        <div class="flashwhite"></div>
        <div class="diamond">${Chara.svg({ lineage: 'secret', stage: Math.max(1, ev.stage), ripe: 0, expr: 'genki', size: 220, bgOff: true, cls: 'nomove' })}</div>
        <div class="banner">SECRET</div>
        <p class="caption">${esc(ev.stage === 0 ? '第1進化でダイヤモンドバナナが確定！' : ev.form + ' に変身！')}</p>
        <button class="btn primary big close">やった！</button>
      </div>`;
    document.body.appendChild(el);
    const t = ms => new Promise(r => setTimeout(r, ms));
    (async () => {
      await t(500); el.classList.add('s-shake');
      await t(1300); el.classList.add('s-crack');
      await t(1100); el.classList.add('s-flash'); fanfare();
      await t(350); el.classList.add('s-reveal'); confetti(el, 70);
      await t(900); el.classList.add('s-banner');
    })();
    el.querySelector('.close').onclick = () => { el.remove(); done(); };
  }
  function confetti(root, n) {
    const colors = ['#F1C40F', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#fff'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 1.2) + 's';
      c.style.animationDuration = (2 + Math.random() * 2) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      root.appendChild(c);
    }
  }
  function fanfare() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      notes.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.16);
        g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + i * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.16 + 0.3);
        o.connect(g).connect(ac.destination);
        o.start(ac.currentTime + i * 0.16); o.stop(ac.currentTime + i * 0.16 + 0.32);
      });
    } catch (e) { /* 音が出なくてもゲームは続く */ }
  }

  return {
    render, enqueue, toast, modal, ask, sheet, itemSheet, menuSheet, tapReact, Pet, playGame, eventSheet, eventSuspense,
    get panel() { return panel; }, set panel(v) { panel = v; },
    get titleStep() { return titleStep; }, set titleStep(v) { titleStep = v; },
    get shopTab() { return shopTab; }, set shopTab(v) { shopTab = v; },
  };
})();
