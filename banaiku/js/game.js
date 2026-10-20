// ゲームのルール本体。画面のことは知らない（render.js が担当）。
// 各アクションは { ok, msg, events } を返す。events は演出キュー（進化・シークレット・結果）。
const Game = (() => {
  const rnd = () => Math.random();
  const randInt = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const fmt = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  // テストモード：1日の制限（プレイ2回・焦らし1回・イベント1回）を外す
  function noLimit(st) { return !!(st.player.testMode && st.player.testNoLimit); }

  function stageFloor(stage) { return stage === 2 ? DATA.THRESH[1] : stage === 1 ? DATA.THRESH[0] : 0; }

  function log(st, text) {
    st.player.log.unshift({ d: Days.today(st), t: text });
    if (st.player.log.length > 40) st.player.log.length = 40;
  }

  function markSeen(st, lineage, stage) {
    if (lineage && stage > 0) st.player.dex.seen[`${lineage}_${stage}`] = true;
  }

  function formName(g) {
    if (g.stage === 0 || !g.lineage) return 'ノーマル';
    const l = DATA.LIN[g.lineage];
    return g.stage === 1 ? l.s1 : l.s2;
  }

  // ---- 系統の抽選（ノーマル期間中の行動をスコア化。1位60%・2位25%・残り15%）----
  function lottery(st) {
    const g = st.gen, p = st.player, s = g.stats;
    const equipped = Object.values(p.fashionEquipped).filter(Boolean).length;
    const raw = {
      inu: s.plays,
      amaenbo: p.loginStreak,
      neko: s.teaseTotal,
      rollcabbage: s.teaseSuccess * 2,
      kojirase: s.self * 2,
      nikushoku: s.itemUses,
      oresama: s.events,
      ouji: equipped * 2,
      soushoku: s.decayDays,
    };
    const vals = Object.values(raw);
    raw.iyashi = vals.reduce((a, b) => a + b, 0) / vals.length * 1.2; // 偏りがないときだけ上に来る
    const sorted = Object.entries(raw).sort((a, b) => b[1] - a[1] || rnd() - 0.5);
    const r = rnd();
    if (r < 0.60) return sorted[0][0];
    if (r < 0.85) return sorted[1][0];
    const rest = sorted.slice(2);
    return rest[Math.floor(rnd() * rest.length)][0];
  }

  function checkEvolution(st, events) {
    const g = st.gen;
    while (g.stage < 2 && g.banana >= DATA.THRESH[g.stage]) {
      g.stage++;
      if (g.stage === 1 && !g.lineage) g.lineage = lottery(st);
      markSeen(st, g.lineage, g.stage);
      events.push({ type: 'evolve', stage: g.stage, lineage: g.lineage, form: formName(g) });
      log(st, `${formName(g)} に進化！`);
      if (g.stage === 2) g.coffinDate = Days.add(Days.today(st), 1);
    }
  }

  function gain(st, amount) {
    const g = st.gen;
    g.banana = Math.round((g.banana + amount) * 10) / 10;
    if (g.banana > g.stats.maxBanana) g.stats.maxBanana = g.banana;
  }
  function lose(st, amount) {
    const g = st.gen;
    g.banana = Math.max(stageFloor(g.stage), Math.round((g.banana - amount) * 10) / 10);
  }

  // ---- 日付の切り替わり（0:00）。アプリを開いたとき・復帰したときに呼ぶ ----
  function rollover(st) {
    const events = [];
    const today = Days.today(st);
    const p = st.player, g = st.gen;
    if (p.lastDate === today) return events;
    const diff = p.lastDate ? Days.diff(p.lastDate, today) : 1;
    if (diff < 0) { p.lastDate = today; return events; } // 時計が戻った場合は何もしない

    if (g.coffinDate && Days.diff(g.coffinDate, today) >= 0) g.pendingCoffin = true;

    const missed = diff - 1;
    const msgs = [];
    if (!g.pendingCoffin) {
      if (missed > 0) {
        let dec = 0, stopped = 0;
        for (let k = 1; k <= missed; k++) {
          if (g.hammockStops > 0) { g.hammockStops--; stopped++; continue; }
          dec += k === 1 ? 1 : k <= 3 ? 2 : 3;
          g.stats.decayDays++;
        }
        const before = g.banana;
        lose(st, dec);
        const lvl = missed >= DATA.ROT_DAYS ? 4 : missed >= 4 ? 3 : missed >= 2 ? 2 : 1;
        g.ripe = Math.max(g.ripe, lvl);
        if (missed >= DATA.ROT_DAYS) { g.rotten = true; g.recoverLogins = 0; }
        if (g.teaseDays > 0) { g.teaseDays = 0; msgs.push('焦らしが途切れました'); }
        msgs.push(`${missed}日ぶり。熟してバナナが ${fmt(before - g.banana)} 減りました${stopped ? `（ハンモックで${stopped}日ぶん防いだ）` : ''}`);
        if (g.rotten) msgs.push('腐り状態です。3日連続ログインで復活します');
      } else {
        if (g.teaseDays > 0 && !g.teasedToday) { g.teaseDays = 0; msgs.push('焦らしが途切れました'); }
        if (!g.rotten && g.ripe > 0) g.ripe--;
      }
      if (g.rotten) {
        g.recoverLogins = missed > 0 ? 1 : g.recoverLogins + 1;
        if (g.recoverLogins >= DATA.ROT_RECOVER_LOGINS) {
          g.rotten = false; g.ripe = 1; g.recoverLogins = 0;
          msgs.push('復活！ 少しずつ元気になります');
        } else {
          msgs.push(`回復中（${g.recoverLogins}/${DATA.ROT_RECOVER_LOGINS}日）。プレイの獲得量は半分、焦らしとイベントは選べません`);
        }
      }
    }

    p.loginStreak = diff === 1 ? p.loginStreak + 1 : 1;
    p.totalLogins++;
    let bk = DATA.LOGIN_BK;
    if (p.loginStreak % 7 === 0) bk += DATA.STREAK_BONUS_BK;
    p.bk += bk;
    if (!g.pendingCoffin) gain(st, DATA.LOGIN_BANANA);
    g.days = Days.diff(g.startDate, today) + 1;
    g.playsToday = 0; g.teasedToday = false; g.eventToday = false;
    p.lastDate = today;

    msgs.push(`ログインボーナス：+${DATA.LOGIN_BANANA}バナナ、+${bk}${DATA.CURRENCY}（${p.loginStreak}日連続）`);
    msgs.forEach(m => log(st, m));
    events.push({ type: 'login', msgs });
    if (!g.pendingCoffin) checkEvolution(st, events);
    return events;
  }

  // ---- プレイ（1日2回。焦らし明けの1回目だけ判定） ----
  function play(st, itemId, bonus) {
    const g = st.gen, p = st.player, events = [];
    if (g.pendingCoffin) return { ok: false, msg: 'お迎えの時間です' };
    if (!noLimit(st)) {
      if (g.teasedToday) return { ok: false, msg: '今日は焦らしています。プレイは明日' };
      if (g.playsToday >= DATA.PLAYS_PER_DAY) return { ok: false, msg: '今日のプレイはもう終わり' };
    }
    if (itemId) {
      if (!p.items[itemId]) return { ok: false, msg: 'そのアイテムは持っていません' };
      if (itemId === 'freezer') {
        if (g.teaseDays === 0) return { ok: false, msg: 'ひんやり冷凍庫は焦らし明けの1回目にだけ使えます' };
        if (g.teaseDays >= DATA.TEASE_MAX) return { ok: false, msg: '7日目のひんやり冷凍庫は使えません' };
      }
    }
    const res = { type: 'play', lines: [], total: 0, judge: null, secret: false };
    let amount = 1;
    const fav = itemId && g.lineage && DATA.LIN[g.lineage].fav === itemId;

    if (g.teaseDays > 0) {
      const t = DATA.TEASE[g.teaseDays];
      let selfRate = t[2];
      if (itemId === 'freezer') {
        selfRate = Math.max(0, selfRate - (fav ? DATA.ITEM.freezer.selfCutFav : DATA.ITEM.freezer.selfCut));
        res.lines.push(`ひんやり冷凍庫：セルフバナナ率 ${Math.round(selfRate * 100)}%`);
      }
      res.teaseDays = g.teaseDays;
      if (rnd() < selfRate) {
        amount = DATA.SELF_GAIN;
        g.stats.self++;
        res.judge = 'self';
        res.lines.push(`${g.teaseDays}日焦らし……セルフバナナ！ +${DATA.SELF_GAIN}バナナ`);
      } else {
        amount = randInt(t[0], t[1]);
        g.stats.teaseSuccess++;
        res.judge = 'success';
        if (g.teaseDays >= DATA.TEASE_MAX) res.secret = true;
        res.lines.push(`${g.teaseDays}日焦らし……成功！ +${amount}バナナ`);
      }
      g.teaseDays = 0;
    } else {
      res.lines.push('プレイ +1バナナ');
    }

    if (itemId && itemId !== 'freezer') {
      const it = DATA.ITEM[itemId];
      const add = fav ? it.fav : it.base;
      amount += add;
      res.lines.push(`${it.name}${fav ? '（得意！）' : ''} +${add}バナナ`);
      if (itemId === 'hammock') {
        const s = fav ? it.stopsFav : it.stops;
        g.hammockStops += s;
        res.lines.push(`翌日の熟しを${s}回止める`);
      }
    }
    if (itemId) { p.items[itemId]--; g.stats.itemUses++; }

    if (bonus) { amount += bonus; res.lines.push(`タイミングボーナス +${fmt(bonus)}バナナ`); res.bonus = bonus; }
    if (g.rotten) { amount = amount / 2; res.lines.push('回復中のため獲得量は半分'); }

    gain(st, amount);
    g.playsToday++; g.stats.plays++; p.bk += DATA.PLAY_BK;
    res.total = amount;
    res.lines.push(`+${DATA.PLAY_BK}${DATA.CURRENCY}`);
    log(st, `プレイ：+${fmt(amount)}バナナ${res.judge === 'self' ? '（セルフバナナ）' : res.judge === 'success' ? '（焦らし成功）' : ''}`);

    if (res.secret) {
      p.bk += DATA.SECRET_BK;
      g.lineage = 'secret';
      markSeen(st, 'secret', g.stage);
      res.lines.push(`+${DATA.SECRET_BK}${DATA.CURRENCY}`);
      log(st, 'ダイヤモンドバナナ！ シークレット系統に変わった');
      events.push({ type: 'secret', stage: g.stage, form: formName(g) });
    } else {
      events.push({ type: 'result', res });
    }
    checkEvolution(st, events);
    return { ok: true, events };
  }

  // ---- 焦らす（1日1回・その日はプレイ不可・最大7日連続） ----
  function tease(st) {
    const g = st.gen;
    if (g.pendingCoffin) return { ok: false, msg: 'お迎えの時間です' };
    if (g.rotten) return { ok: false, msg: '回復中は焦らせません' };
    if (!noLimit(st)) {
      if (g.playsToday > 0) return { ok: false, msg: '今日はもうプレイしたので焦らせません' };
      if (g.teasedToday) return { ok: false, msg: '今日はもう焦らしています' };
    }
    if (g.teaseDays >= DATA.TEASE_MAX) return { ok: false, msg: '焦らしは7日まで。プレイして判定しよう' };
    g.teaseDays++; g.teasedToday = !noLimit(st); g.stats.teaseTotal++;
    if (g.teaseDays > g.stats.longestTease) g.stats.longestTease = g.teaseDays;
    const t = DATA.TEASE[g.teaseDays];
    log(st, `焦らし ${g.teaseDays}日目`);
    const res = { type: 'tease', days: g.teaseDays, lines: [
      `焦らし ${g.teaseDays}日目。今日はプレイできません`,
      `明日の1回目：成功で +${t[0]}〜${t[1]}バナナ／セルフバナナ率 ${Math.round(t[2] * 100)}%`,
      g.teaseDays === DATA.TEASE_MAX ? '上限です。次のプレイで判定（成功5%でシークレット）' : `もう1日焦らすと：+${DATA.TEASE[g.teaseDays + 1][0]}〜${DATA.TEASE[g.teaseDays + 1][1]}／セルフ率 ${Math.round(DATA.TEASE[g.teaseDays + 1][2] * 100)}%`,
    ] };
    return { ok: true, events: [{ type: 'result', res }] };
  }

  // ---- イベントプレイ（1日1回・大きく増えるか減るか） ----
  function eventPlay(st, eventId) {
    const g = st.gen, events = [];
    if (g.pendingCoffin) return { ok: false, msg: 'お迎えの時間です' };
    if (g.rotten) return { ok: false, msg: '回復中はイベントプレイできません' };
    if (g.eventToday && !noLimit(st)) return { ok: false, msg: 'イベントプレイは1日1回' };
    const ev = DATA.EV[eventId] || DATA.EVENTS[Math.floor(rnd() * DATA.EVENTS.length)];
    const probs = DATA.RISK[ev.risk].p;
    let r = rnd(), pick = DATA.EVENT[DATA.EVENT.length - 1];
    for (let i = 0; i < DATA.EVENT.length; i++) { if (r < probs[i]) { pick = DATA.EVENT[i]; break; } r -= probs[i]; }
    const before = g.banana;
    if (pick.d >= 0) gain(st, pick.d); else lose(st, -pick.d);
    g.eventToday = true; g.stats.events++;
    const delta = Math.round((g.banana - before) * 10) / 10;
    log(st, `${ev.place}でイベントプレイ：${pick.name}（${delta >= 0 ? '+' : ''}${fmt(delta)}バナナ）`);
    const res = { type: 'event', outcome: pick.name, delta, place: ev.place, icon: ev.icon, lines: [
      `${ev.place}で${pick.name}！ ${pick.d >= 0 ? '+' : ''}${pick.d}バナナ`,
      delta !== pick.d ? `（今の進化段階より下には戻らないので実際は ${delta >= 0 ? '+' : ''}${fmt(delta)}）` : '',
    ].filter(Boolean) };
    events.push({ type: 'result', res });
    checkEvolution(st, events);
    return { ok: true, events };
  }

  // ---- 今日のイベント候補（その日は同じ2つが出る。テストモードでは毎回違う） ----
  function todayEvents(st) {
    const key = Days.today(st) + (noLimit(st) ? ':' + st.gen.stats.events : '');
    let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const list = DATA.EVENTS.slice();
    for (let i = list.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [list[i], list[j]] = [list[j], list[i]]; }
    return list.slice(0, 2);
  }

  // ---- ショップ ----
  function buyItem(st, id) {
    const it = DATA.ITEM[id], p = st.player;
    if (!it) return { ok: false, msg: '不明なアイテム' };
    if (p.bk < it.price) return { ok: false, msg: `${DATA.CURRENCY}が足りません` };
    p.bk -= it.price; p.items[id] = (p.items[id] || 0) + 1;
    log(st, `${it.name}を買った（−${it.price}${DATA.CURRENCY}）`);
    return { ok: true, msg: `${it.name}を買いました` };
  }
  function buyFashion(st, id) {
    const f = DATA.FASH[id], p = st.player;
    if (!f) return { ok: false, msg: '不明なオシャレ' };
    if (p.fashionOwned.includes(id)) return { ok: false, msg: 'もう持っています' };
    if (p.bk < f.price) return { ok: false, msg: `${DATA.CURRENCY}が足りません` };
    p.bk -= f.price; p.fashionOwned.push(id); p.fashionEquipped[f.slot] = id;
    log(st, `${f.name}を買って装備した（−${f.price}${DATA.CURRENCY}）`);
    return { ok: true, msg: `${f.name}を買って装備しました` };
  }
  function equip(st, slot, id) {
    const p = st.player;
    if (id && !p.fashionOwned.includes(id)) return { ok: false, msg: '持っていません' };
    p.fashionEquipped[slot] = id || null;
    return { ok: true };
  }

  // ---- 棺桶バナナのお迎え → 図鑑登録 → 次の世代 ----
  function coffinRecord(st) {
    const g = st.gen;
    return {
      gen: st.player.generation, name: g.name, lineage: g.lineage, form: formName(g),
      days: g.days, maxBanana: g.stats.maxBanana, longestTease: g.stats.longestTease, self: g.stats.self,
      date: Days.today(st),
    };
  }
  function confirmCoffin(st, nextName) {
    const g = st.gen, p = st.player;
    if (!g.pendingCoffin) return { ok: false, msg: 'まだお迎えの時間ではありません' };
    const rec = coffinRecord(st);
    p.dex.entries.push(rec);
    p.bk += DATA.DEX_BK;
    log(st, `${rec.name}（${rec.form}）を図鑑に登録。+${DATA.DEX_BK}${DATA.CURRENCY}`);
    p.generation++;
    st.gen = newGen(nextName, Days.today(st));
    log(st, `第${p.generation}世代 ${nextName} が生まれた`);
    return { ok: true, rec };
  }

  function startNew(name) {
    const st = newState(name);
    log(st, `第1世代 ${name} が生まれた`);
    return st;
  }

  // 開発者向け：バナナを直接足す（進化チェック込み）
  function debugAddBanana(st, n) {
    const events = [];
    gain(st, n);
    checkEvolution(st, events);
    return { ok: true, events };
  }

  return { rollover, play, tease, eventPlay, todayEvents, buyItem, buyFashion, equip, confirmCoffin, coffinRecord, startNew, formName, stageFloor, fmt, log, debugAddBanana, noLimit };
})();
