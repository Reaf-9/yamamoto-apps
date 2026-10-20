// 起動・イベント配線。ルールは game.js、画面は render.js。
(() => {
  let st = Store.load();

  function save() { Store.save(st); }
  function refresh() { UI.render(st); }
  function fire(events) { (events || []).forEach(e => UI.enqueue(e)); }

  // URL の ?test=1 でテストモードON、?test=0 でOFF（設定画面のバージョン表示7回タップでも切替）
  const q = new URLSearchParams(location.search);
  if (window.BANAIKU_TEST && st && !st.player.testMode) { st.player.testMode = true; st.player.testNoLimit = true; save(); }
  if (st && q.has('test')) {
    st.player.testMode = q.get('test') !== '0';
    st.player.testNoLimit = st.player.testMode;
    save();
  }

  // プレイ：先に可否だけ確かめ、ミニゲーム → ルール適用
  function startPlay(itemId) {
    const g = st.gen;
    if (g.pendingCoffin) return UI.toast('お迎えの時間です');
    if (!Game.noLimit(st)) {
      if (g.teasedToday) return UI.toast('今日は焦らしています。プレイは明日');
      if (g.playsToday >= DATA.PLAYS_PER_DAY) return UI.toast('今日のプレイはもう終わり');
    }
    if (itemId && !st.player.items[itemId]) return UI.toast('そのアイテムは持っていません');
    if (itemId === 'freezer' && (g.teaseDays === 0 || g.teaseDays >= DATA.TEASE_MAX)) return UI.toast(g.teaseDays === 0 ? 'ひんやり冷凍庫は焦らし明けの1回目にだけ使えます' : '7日目のひんやり冷凍庫は使えません');
    UI.playGame(st, itemId, bonus => {
      const rr = Game.play(st, itemId, bonus);
      if (!rr.ok) return UI.toast(rr.msg);
      save(); refresh(); fire(rr.events);
    });
  }

  function tick() {
    if (!st) { refresh(); return; }
    const ev = Game.rollover(st);
    if (ev.length) { save(); fire(ev); }
    refresh();
  }

  tick();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  setInterval(tick, 60 * 1000);

  document.addEventListener('submit', e => {
    if (e.target.id === 'nameForm') {
      e.preventDefault();
      const name = document.getElementById('nameInput').value.trim();
      if (!name) return;
      st = Game.startNew(name);
      if (window.BANAIKU_TEST || (q.has('test') && q.get('test') !== '0')) { st.player.testMode = true; st.player.testNoLimit = true; }
      const ev = Game.rollover(st);
      save(); refresh(); fire(ev);
    }
    if (e.target.id === 'coffinForm') {
      e.preventDefault();
      const name = document.getElementById('nameInput').value.trim();
      if (!name) return;
      const r = Game.confirmCoffin(st, name);
      if (!r.ok) return UI.toast(r.msg);
      save(); refresh();
      UI.toast(`${r.rec.name}バナナを図鑑に登録しました`);
    }
  });

  document.addEventListener('click', e => {
    const shopBtn = e.target.closest('[data-shop]');
    if (shopBtn) { UI.shopTab = shopBtn.dataset.shop; refresh(); return; }
    if (st && e.target.closest('#stage') && !e.target.closest('[data-act]')) { UI.tapReact(st); return; }

    const btn = e.target.closest('[data-act]');
    if (btn && btn.dataset.act === 'startName') { UI.titleStep = 'name'; refresh(); setTimeout(() => { const i = document.getElementById('nameInput'); if (i) i.focus(); }, 50); return; }
    if (!btn || !st) return;
    const act = btn.dataset.act, id = btn.dataset.id;
    let r;
    switch (act) {
      case 'play': return startPlay(null);
      case 'items': UI.itemSheet(st); return;
      case 'menu': UI.menuSheet(st); return;
      case 'eventGo': {
        UI.eventSuspense(st, id, () => {
          const rr = Game.eventPlay(st, id);
          if (!rr.ok) return UI.toast(rr.msg);
          save(); refresh(); fire(rr.events);
        });
        return;
      }
      case 'panel': UI.panel = btn.dataset.panel; refresh(); return;
      case 'closePanel': UI.panel = null; refresh(); return;
      case 'playWith': return startPlay(id);
      case 'tease': r = Game.tease(st); break;
      case 'event': {
        const g = st.gen;
        if (g.pendingCoffin || g.rotten || (g.eventToday && !Game.noLimit(st))) { const rr = Game.eventPlay(st, '__check__'); return UI.toast(rr.msg || 'いまはできません'); }
        UI.eventSheet(st); return;
      }
      case 'buyItem': {
        const it = DATA.ITEM[id];
        UI.ask(`${it.name}を ${it.price}${DATA.CURRENCY} で購入しますか？\n${it.desc}`, '購入する').then(ok => { if (!ok) return; const rr = Game.buyItem(st, id); if (!rr.ok) return UI.toast(rr.msg); save(); refresh(); UI.toast(rr.msg); });
        return;
      }
      case 'buyFashion': {
        const f = DATA.FASH[id];
        UI.ask(`${f.name}を ${f.price}${DATA.CURRENCY} で購入しますか？\n買うとすぐ装備します。`, '購入する').then(ok => { if (!ok) return; const rr = Game.buyFashion(st, id); if (!rr.ok) return UI.toast(rr.msg); save(); refresh(); UI.toast(rr.msg); });
        return;
      }
      case 'equip': r = Game.equip(st, btn.dataset.slot, id); break;
      case 'unequip': r = Game.equip(st, btn.dataset.slot, null); break;
      case 'export': {
        const box = document.getElementById('backupBox');
        box.value = Store.export(st);
        box.focus(); box.select();
        try { navigator.clipboard && navigator.clipboard.writeText(box.value); } catch (_) {}
        return UI.toast('書き出しました（コピー済み）');
      }
      case 'download': {
        const blob = new Blob([Store.export(st)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `banana_backup_${Days.today(st)}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        return UI.toast('ファイルを保存しました');
      }
      case 'import': {
        const text = document.getElementById('backupBox').value.trim();
        if (!text) return UI.toast('貼り付けてから押してください');
        let next;
        try { next = Store.parseImport(text); } catch (err) { return UI.toast('読み込めませんでした：' + err.message); }
        UI.ask('今のデータを、貼り付けたデータで置き換えます。\nよいですか？', '置き換える').then(ok => {
          if (!ok) return;
          st = next; save(); tick(); UI.toast('読み込みました');
        });
        return;
      }
      case 'reset': {
        UI.ask('本当に全データを消しますか？\n図鑑もBKも消えます。', '消す', true).then(ok => {
          if (!ok) return;
          return UI.ask('もう一度確認します。\n消したデータは戻せません。本当に消しますか？', '本当に消す', true).then(ok2 => {
            if (!ok2) return;
            try { localStorage.removeItem(STORE_KEY); } catch (_) {}
            st = null; UI.panel = null; refresh();
          });
        });
        return;
      }
      case 'version': {
        st.player.versionTaps = (st.player.versionTaps || 0) + 1;
        if (st.player.versionTaps >= 7) {
          st.player.versionTaps = 0;
          st.player.testMode = !st.player.testMode; st.player.testNoLimit = st.player.testMode;
          save(); refresh();
          return UI.toast(st.player.testMode ? 'テストモード ON' : 'テストモード OFF');
        }
        if (st.player.versionTaps >= 4) UI.toast(`あと${7 - st.player.versionTaps}回でテストモード`);
        return;
      }
      case 'testOff': st.player.testMode = false; st.player.testNoLimit = false; save(); refresh(); return UI.toast('テストモード OFF');
      case 'testData': {
        UI.ask('今のデータをテスト用データ\n（第2世代・犬系・BK500・アイテムあり）に置き換えます。', '置き換える').then(ok => {
          if (!ok) return;
          st = TestData.make(); save(); UI.panel = null; refresh();
          UI.toast('テストデータを読み込みました');
        });
        return;
      }
      case 'dbgDay': st.player.debugDayOffset += Number(btn.dataset.n); save(); tick(); return;
      case 'dbgBK': st.player.bk += 100; save(); refresh(); return UI.toast('+100 ' + DATA.CURRENCY);
      case 'dbgBanana': r = Game.debugAddBanana(st, 5); break;
      default: return;
    }
    if (!r) return;
    if (!r.ok) { UI.toast(r.msg); return; }
    save(); refresh();
    if (r.msg) UI.toast(r.msg);
    fire(r.events);
  });
})();
