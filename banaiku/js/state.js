// 保存・日付まわり。データはこの端末の localStorage にだけ保存する。
const STORE_KEY = 'banana_game_v1';

const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { console.warn('load failed', e); return null; }
  },
  save(st) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); return true; }
    catch (e) { console.warn('save failed', e); return false; }
  },
  export(st) { return JSON.stringify(st, null, 2); },
  // 読み込みは中身を軽く検証してから受け入れる
  parseImport(text) {
    const obj = JSON.parse(text);
    if (!obj || obj.v !== 1 || !obj.player || !obj.gen) throw new Error('バナナ育成ゲームのセーブデータではありません');
    return obj;
  },
};

const Days = {
  keyOf(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  today(st) {
    const d = new Date();
    const off = (st && st.player && st.player.debugDayOffset) || 0;
    if (off) d.setDate(d.getDate() + off);
    return Days.keyOf(d);
  },
  diff(a, b) { // b - a （日）
    const [y1, m1, d1] = a.split('-').map(Number);
    const [y2, m2, d2] = b.split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  },
  add(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return Days.keyOf(new Date(y, m - 1, d + n));
  },
  pretty(key) { const [y, m, d] = key.split('-'); return `${y}/${Number(m)}/${Number(d)}`; },
};

function newGen(name, today) {
  return {
    name, startDate: today, days: 1,
    banana: 0, stage: 0, lineage: null,
    teaseDays: 0, teasedToday: false, playsToday: 0, eventToday: false,
    hammockStops: 0,
    ripe: 0, rotten: false, recoverLogins: 0,
    stats: { plays: 0, teaseTotal: 0, teaseSuccess: 0, self: 0, itemUses: 0, events: 0, decayDays: 0, maxBanana: 0, longestTease: 0 },
    coffinDate: null, pendingCoffin: false,
  };
}

function newState(name) {
  const st = {
    v: 1,
    player: {
      bk: 0, items: {}, fashionOwned: [], fashionEquipped: { head: null, face: null, neck: null, hand: null, bg: null },
      dex: { seen: {}, entries: [] },
      generation: 1, totalLogins: 0, loginStreak: 0, lastDate: null,
      debugDayOffset: 0, log: [],
      testMode: false, testNoLimit: false, versionTaps: 0,
    },
    gen: null,
  };
  st.gen = newGen(name, Days.today(st));
  return st;
}
