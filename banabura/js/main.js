// 起動と画面の流れ（タイトル → ステージ → 満足度 → … → ランキング）
(() => {
  const C = CONFIG, $ = Screens.$;
  const App = { scene: 'title', mode: null, run: null, paused: false, bgStage: 0, t: 0, lastResult: null };
  window.App = App; // 動作確認用

  // ---------------- 画面サイズ（16:9 を画面いっぱいに） ----------------
  const stageEl = $('#stage');
  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = vw, h = vw * 9 / 16;
    if (h > vh) { h = vh; w = vh * 16 / 9; }
    stageEl.style.width = w + 'px'; stageEl.style.height = h + 'px';
    document.documentElement.style.setProperty('--u', (h / 100) + 'px');
    Render.resize();
  }
  addEventListener('resize', fit);
  addEventListener('orientationchange', () => setTimeout(fit, 200));
  const portraitTouch = () => matchMedia('(orientation: portrait) and (pointer: coarse)').matches;

  // ---------------- 便利 ----------------
  function bind(id, fn) { const el = $(id); el.addEventListener('click', e => { e.preventDefault(); Sound.init(); Sound.play('select'); fn(e); }); }
  function tryFullscreen() {
    try {
      const d = document.documentElement;
      if (!document.fullscreenElement && d.requestFullscreen && matchMedia('(pointer: coarse)').matches) d.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
    } catch (e) {}
  }

  // ---------------- タイトル ----------------
  function toTitle() {
    App.scene = 'title'; App.mode = null; App.paused = false;
    Sound.stopBgm();
    Screens.show('scrTitle');
  }
  bind('#btnStart', () => { tryFullscreen(); startRun(); });
  bind('#btnSelect', () => showSelect());
  bind('#btnRanking', () => showRanking(null));

  // ---------------- ステージセレクト ----------------
  function showSelect() {
    App.scene = 'select';
    const unlocked = Save.get('unlocked', 1), best = Save.get('best', [0, 0, 0]);
    $('#selectList').innerHTML = C.STAGES.map((s, i) => {
      const open = i < unlocked;
      return `<button class="stagecard ${open ? '' : 'locked'}" data-i="${i}" ${open ? '' : 'disabled'}>
        <span class="num">${i + 1}</span><b>${s.name}</b><small>難易度：${s.level}／合格ライン ${s.pass}点</small>
        <em>${open ? (best[i] ? `ベスト満足度 ${best[i]}点` : 'まだ記録なし') : '前の面をクリアで解放'}</em></button>`;
    }).join('');
    $('#selectList').querySelectorAll('.stagecard:not(.locked)').forEach(b => b.addEventListener('click', () => { Sound.init(); Sound.play('select'); tryFullscreen(); startPractice(+b.dataset.i); }));
    Screens.show('scrSelect');
  }
  bind('#btnSelectBack', toTitle);

  // ---------------- 遊ぶ ----------------
  const newRun = () => ({ lives: C.START_LIVES, coins: 0, scores: [], stage: 0 });
  function startRun() { App.mode = 'run'; App.run = newRun(); intro(0); }
  function startPractice(i) { App.mode = 'practice'; App.run = newRun(); intro(i); }

  let introTimer = null;
  function intro(i) {
    App.run.stage = i; App.scene = 'intro'; App.bgStage = i;
    const s = C.STAGES[i];
    $('#introStage').textContent = `STAGE ${i + 1}`;
    $('#introName').textContent = s.name;
    $('#introInfo').innerHTML = `難易度：${s.level}　合格ライン：<b>${s.pass}点</b>　制限時間：${s.time}秒`;
    $('#introLives').textContent = `× ${App.run.lives}`;
    $('#introMode').textContent = App.mode === 'practice' ? '練習（ステージセレクト）' : '';
    Sound.stopBgm();
    Screens.show('scrIntro');
    clearTimeout(introTimer);
    introTimer = setTimeout(beginStage, 2400);
  }
  $('#scrIntro').addEventListener('click', () => { Sound.init(); beginStage(); });
  function beginStage() {
    if (App.scene !== 'intro') return;
    clearTimeout(introTimer);
    Game.newWorld(App.run.stage, App.run);
    App.scene = 'play'; App.paused = false;
    Input.reset(); Sound.setTempo(1); Sound.bgm(C.STAGES[App.run.stage].bgm);
    Screens.hideAll();
  }

  function onMiss() {
    App.run.lives--;
    if (App.run.lives <= 0) { App.scene = 'over'; Sound.stopBgm(); Screens.show('scrOver'); }
    else intro(App.run.stage);
  }
  bind('#btnOverRetry', () => { App.run.lives = C.START_LIVES; intro(App.run.stage); });
  bind('#btnOverTitle', toTitle);

  function onCleared() {
    const i = App.run.stage, res = Game.score();
    App.scene = 'result'; App.lastResult = res;
    Sound.setTempo(1);
    Sound.play(res.pass ? 'pass' : 'fail');
    const best = Save.get('best', [0, 0, 0]);
    const newBest = res.pass && res.total > (best[i] || 0);
    if (res.pass) {
      if (newBest) { best[i] = res.total; Save.set('best', best); }
      Save.set('unlocked', Math.max(Save.get('unlocked', 1), Math.min(C.STAGES.length, i + 2)));
      App.run.scores[i] = res.total;
    }
    $('#resStage').textContent = `STAGE ${i + 1}　${C.STAGES[i].name}`;
    $('#resItems').innerHTML = res.items.map(([k, v]) => `<li><span>${k}</span><b class="${v < 0 ? 'minus' : ''}">${v >= 0 ? '+' : ''}${v}</b></li>`).join('');
    $('#resTotal').textContent = res.total;
    $('#resRank').textContent = res.rank;
    $('#resRank').className = 'rankname ' + (res.pass ? 'ok' : 'ng');
    $('#resMsg').innerHTML = res.pass
      ? `合格！（合格ライン ${res.pass_line}点）${newBest ? '<span class="tag">ベスト更新</span>' : ''}`
      : `合格ライン <b>${res.pass_line}点</b> に届かず… もう一回！`;
    const last = i === C.STAGES.length - 1;
    const btns = [];
    if (res.pass && App.mode === 'run') btns.push(['next', last ? '結果発表へ' : '次のステージへ']);
    if (res.pass && App.mode === 'practice') { if (!last && i + 1 < Save.get('unlocked', 1)) btns.push(['nextp', '次の面へ']); btns.push(['retry', 'もう一回']); btns.push(['select', 'ステージセレクト']); }
    if (!res.pass) { btns.push(['retry', 'もう一回！']); btns.push(['title', 'タイトルへ']); }
    $('#resBtns').innerHTML = btns.map(([id, label], n) => `<button class="btn ${n === 0 ? 'primary' : ''}" data-act="${id}">${label}</button>`).join('');
    $('#resBtns').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { Sound.play('select'); resultAction(b.dataset.act); }));
    setTimeout(() => Screens.show('scrResult'), 300);
  }
  function resultAction(act) {
    const i = App.run.stage;
    if (act === 'next') { if (i === C.STAGES.length - 1) showNameEntry(); else intro(i + 1); }
    else if (act === 'nextp') intro(i + 1);
    else if (act === 'retry') intro(i);
    else if (act === 'select') showSelect();
    else toTitle();
  }

  // ---------------- 名前入力 → ランキング ----------------
  function showNameEntry() {
    App.scene = 'name';
    const s = App.run.scores, total = s.reduce((a, b) => a + (b || 0), 0);
    App.run.total = total;
    $('#nameScores').innerHTML = C.STAGES.map((st, i) => `<li><span>${i + 1}. ${st.name}</span><b>${s[i] || 0}点</b></li>`).join('');
    $('#nameTotal').textContent = total;
    $('#nameInput').value = Save.get('lastName', '');
    Sound.play('record');
    Screens.show('scrName');
  }
  function submitName() {
    const name = ($('#nameInput').value || '').trim().slice(0, 8) || 'ななし';
    Save.set('lastName', name);
    const r = Ranking.add(name, App.run.total, App.run.scores.map(v => v || 0));
    $('#nameInput').blur();
    showRanking(r);
  }
  bind('#btnNameOk', submitName);
  $('#nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitName(); } });

  function showRanking(r) {
    App.scene = 'ranking';
    $('#rankNew').style.display = r && r.newRecord ? '' : 'none';
    $('#rankMine').innerHTML = r ? `<p class="mine"><b>${Ranking.esc(r.rec.name)}</b> さん　合計満足度 <b class="big">${r.rec.total}</b>点</p>${r.msgs.map(m => `<p>${Ranking.esc(m)}</p>`).join('')}` : '';
    $('#rankTable').innerHTML = Ranking.html(r ? r.rec.id : null);
    $('#btnRankAgain').style.display = r ? '' : 'none';
    $('#btnRankClear').style.display = r ? 'none' : '';
    if (r && r.newRecord) Sound.play('record');
    Screens.show('scrRanking');
  }
  bind('#btnRankAgain', () => startRun());
  bind('#btnRankTitle', toTitle);
  bind('#btnRankClear', () => {
    // 消すときは2回確認する
    if (!confirm('ランキングの記録をすべて消しますか？')) return;
    if (!confirm('本当に消しますか？元には戻せません。')) return;
    Ranking.clear(); showRanking(null);
  });

  // ---------------- ポーズ・音 ----------------
  function pause() { if (App.scene !== 'play' || App.paused) return; App.paused = true; Screens.show('scrPause'); }
  bind('#btnPause', pause);
  bind('#btnResume', () => { App.paused = false; Screens.hideAll(); Input.reset(); });
  bind('#btnRestart', () => { App.paused = false; intro(App.run.stage); });
  bind('#btnPauseTitle', toTitle);
  function soundLabel() { $('#btnSound').textContent = Sound.isOn() ? '♪' : '×'; $('#btnSound').classList.toggle('off', !Sound.isOn()); }
  $('#btnSound').addEventListener('click', e => { e.preventDefault(); Sound.init(); Sound.toggle(); soundLabel(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  // ---------------- ループ ----------------
  let last = performance.now(), acc = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(100, now - last); last = now;
    App.t++;
    if (App.scene === 'play' || App.scene === 'result') {
      const W = Game.world;
      if (App.scene === 'play' && !App.paused && !portraitTouch()) {
        acc += dt;
        let n = 0;
        while (acc >= 1000 / 60 && n < 5) { Game.step(); acc -= 1000 / 60; n++; }
        if (W.state === 'miss') onMiss();
        else if (W.state === 'cleared') onCleared();
      } else acc = 0;
      Render.frame(Game.world);
    } else {
      Render.idle(App.bgStage, App.t);
    }
  }

  // ---------------- 起動 ----------------
  function boot() {
    Render.init($('#cv'));
    Input.bind();
    fit();
    soundLabel();
    $('#titleChara').src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Chara.svg(0, 'genki', false));
    $('#titleDia').src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Chara.svg(0, 'genki', true));
    toTitle();
    requestAnimationFrame(loop);
  }
  const fontReady = document.fonts && document.fonts.load ? document.fonts.load('16px "DotGothic16"').catch(() => {}) : Promise.resolve();
  Promise.all([Chara.load(), Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))])]).then(boot);
})();
