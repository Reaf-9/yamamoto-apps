// ステージの地図。ここを書き換えればコースを作り直せる。
// 1マス = 16px。縦は 14 マス（0〜13 行）。地面の上の面は 12 行目、立っている物は 11 行目。
//
// 地形の記号
//   #  地面（上の面）   d  土          X  かたいブロック   B  レンガ
//   ?  BKコインのブロック   Q  バナナのブロック（見た目は ? と同じ）
//   =  乗れる足場（下からすり抜けられる）   o  BKコイン
//   R  ゴールの岩壁   G  ゴールの横穴   D  女王様を倒すと消える柵
const Stages = (() => {
  const ROWS = 14, GROUND = 12;

  function builder(width) {
    const g = Array.from({ length: ROWS }, () => Array(width).fill('.'));
    const ents = [];
    let start = { x: 3, y: GROUND - 1 }, goalX = width - 8;
    const api = {
      set(x, y, ch) { if (x >= 0 && x < width && y >= 0 && y < ROWS) g[y][x] = ch; return api; },
      ground(x0, x1, top = GROUND) {
        for (let x = x0; x <= x1; x++) for (let y = 0; y < ROWS; y++) g[y][x] = y < top ? (g[y][x] === '#' || g[y][x] === 'd' ? '.' : g[y][x]) : (y === top ? '#' : 'd');
        return api;
      },
      pit(x0, x1) { for (let x = x0; x <= x1; x++) for (let y = 0; y < ROWS; y++) g[y][x] = '.'; return api; },
      row(x, y, str) { [...str].forEach((c, i) => { if (c !== ' ') api.set(x + i, y, c); }); return api; },
      plat(x, y, len) { for (let i = 0; i < len; i++) api.set(x + i, y, '='); return api; },
      coins(x, y, n) { for (let i = 0; i < n; i++) api.set(x + i, y, 'o'); return api; },
      stairs(x, h, dir) { // dir = 1 上り / -1 下り
        for (let i = 0; i < h; i++) { const height = dir > 0 ? i + 1 : h - i; for (let k = 0; k < height; k++) api.set(x + i, GROUND - 1 - k, 'X'); }
        return api;
      },
      e(type, x, y = GROUND - 1, opts = {}) { ents.push(Object.assign({ type, x, y }, opts)); return api; },
      sign(x, id, y = GROUND - 1) { return api.e('sign', x, y, { id }); },
      lift(x, y, w, axis, range, speed = 0.5) { return api.e('lift', x, y, { w, axis, range, speed }); },
      start(x, y = GROUND - 1) { start = { x, y }; return api; },
      goal(x) { // ここから右端までが岩壁。地面のすぐ上 2 マスが横穴
        goalX = x;
        for (let cx = x; cx < width; cx++) {
          for (let y = 0; y < GROUND - 2; y++) g[y][cx] = 'R';
          g[GROUND - 2][cx] = 'G'; g[GROUND - 1][cx] = 'G';
        }
        return api;
      },
      build() { return { w: width, rows: ROWS, map: g, ents, start, goalX }; },
    };
    return api;
  }

  // ---------------- 1面「バナナ畑」（難易度：低）----------------
  function stage1() {
    const b = builder(172);
    b.ground(0, 171).start(3);
    b.sign(6, 0).sign(12, 1).sign(17, 2);
    b.row(19, 8, '?BQB?').set(21, 4, '?');
    b.coins(26, 9, 4);
    b.e('kuri', 31);
    b.sign(34, 3);
    b.pit(38, 39);
    b.set(44, 8, 'Q');
    b.e('kuri', 46);
    b.row(48, 8, '?B?B').set(50, 4, 'Q');
    b.e('kuri', 55);
    b.coins(56, 9, 3);
    b.stairs(62, 4, 1).pit(66, 68).stairs(69, 4, -1);
    b.coins(66, 6, 3);
    b.e('banana', 78);
    b.e('kuri', 84).e('kuri', 86).e('kuri', 96);
    b.row(98, 8, 'BBQBB').coins(98, 5, 5);
    b.pit(108, 110);
    b.e('kuri', 116).e('kuri', 122);
    b.coins(126, 9, 2).coins(128, 8, 2).coins(130, 9, 2);
    b.row(136, 8, '?B?');
    b.e('kuri', 140);
    b.sign(146, 4);
    b.set(152, 8, 'Q');
    b.goal(160);
    return b.build();
  }

  // ---------------- 2面「森」（難易度：中）----------------
  function stage2() {
    const b = builder(206);
    b.ground(0, 29).start(3);
    b.sign(6, 6);
    b.plat(10, 8, 4).e('squirrel', 11, 7);
    b.e('kuri', 18);
    b.row(22, 8, '?Q?');
    b.pit(30, 34).lift(30, 9, 3, 'x', 2);
    b.ground(35, 62);
    b.sign(37, 5);
    b.e('nume', 42);
    b.plat(45, 8, 5).plat(48, 5, 4).e('squirrel', 49, 4).e('banana', 46, 7);
    b.e('kuri', 55).e('kuri', 57);
    b.row(58, 8, 'BQB');
    b.pit(63, 68).lift(63, 9, 3, 'x', 3);
    b.ground(69, 100);
    b.plat(72, 8, 4).e('squirrel', 73, 7);
    b.row(78, 8, '?Q?').coins(78, 5, 3);
    b.e('nume', 84).e('kuri', 88).e('nume', 95);
    b.stairs(97, 3, 1);
    b.pit(101, 103);
    b.ground(104, 142).stairs(104, 3, -1);
    b.row(110, 8, 'BQB').set(111, 4, '?');
    b.plat(118, 7, 5).e('squirrel', 120, 6).coins(118, 4, 5);
    b.e('nume', 126).e('kuri', 130).e('kuri', 133).e('kuri', 136);
    b.pit(143, 148).lift(143, 9, 3, 'x', 3, 0.6);
    b.ground(149, 205);
    b.e('nume', 156);
    b.plat(160, 8, 4).e('squirrel', 161, 7);
    b.e('kuri', 168).e('kuri', 170);
    b.row(176, 8, '?B?').coins(180, 9, 3);
    b.set(186, 8, 'Q');
    b.goal(192);
    return b.build();
  }

  // ---------------- 3面「夜の山」（難易度：高）----------------
  function stage3() {
    const b = builder(236);
    b.ground(0, 22).start(3);
    b.sign(7, 7);
    b.e('vib', 15);
    b.row(18, 8, '?Q?');
    b.pit(23, 25);
    b.ground(26, 46);
    b.e('vib', 33).e('roll', 40).e('nume', 44);
    b.pit(47, 51).lift(48, 10, 2, 'y', 3, 0.4);
    b.ground(52, 82, 9);
    b.row(58, 5, 'BQB');
    b.e('vib', 60, 8).plat(64, 5, 4).e('squirrel', 65, 4);
    b.e('roll', 70, 8).e('nume', 76, 8);
    b.pit(83, 86);
    b.ground(87, 122);
    b.e('vib', 92).row(95, 8, '?B?').set(96, 4, 'Q');
    b.e('vib', 99).e('roll', 106).e('roll', 112).e('roll', 118);
    b.pit(123, 127).lift(123, 9, 3, 'x', 3, 0.6);
    b.ground(128, 162);
    b.e('nume', 134).plat(138, 7, 5).e('squirrel', 140, 6);
    b.set(144, 8, 'Q');
    b.e('vib', 146).plat(150, 6, 3).e('banana', 151, 5);
    b.e('roll', 152).e('roll', 158);
    b.pit(163, 166);
    b.ground(167, 235);
    b.sign(170, 8);
    b.set(180, 8, 'Q');
    b.e('queen', 195, GROUND - 1, { minX: 176, maxX: 201 });
    for (let y = 0; y < GROUND; y++) b.set(202, y, 'D');
    b.set(206, 8, 'Q').set(209, 8, 'Q');
    b.coins(212, 9, 4);
    b.goal(220);
    return b.build();
  }

  const LIST = [stage1, stage2, stage3];
  return { get: i => LIST[i](), ROWS, GROUND, count: LIST.length };
})();
