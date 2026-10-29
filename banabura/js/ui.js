// 保存（スマホ内）とランキング、画面の切り替え
const Save = (() => {
  const P = CONFIG.SAVE_PREFIX;
  function get(key, def) { try { const v = localStorage.getItem(P + key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } }
  function set(key, val) { try { localStorage.setItem(P + key, JSON.stringify(val)); } catch (e) {} }
  return { get, set };
})();

const Ranking = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function fmt(iso) {
    const d = new Date(iso); const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${z(d.getMonth() + 1)}/${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  }
  function list() { return Save.get('ranking', []); }

  // 記録して、ランキングでの位置と「前の人との比較」を返す
  function add(name, total, scores) {
    const rec = { name, total, scores, at: new Date().toISOString(), id: Math.random().toString(36).slice(2) };
    const history = Save.get('history', []);
    const prevAny = history[history.length - 1] || null;                     // 直前に遊んだ記録（誰でも）
    const mine = history.filter(h => h.name === name);
    const prevBest = mine.length ? Math.max(...mine.map(h => h.total)) : null; // 同じ名前のベスト
    history.push(rec); Save.set('history', history.slice(-50));

    const all = list().concat(rec).sort((a, b) => b.total - a.total || a.at.localeCompare(b.at));
    const top = all.slice(0, CONFIG.RANKING_SIZE);
    Save.set('ranking', top);
    const rank = top.findIndex(r => r.id === rec.id) + 1; // 0 ならランク外

    const msgs = [];
    if (prevAny) {
      const d = total - prevAny.total, who = prevAny.name === name ? '前回の自分' : `前回の${prevAny.name}さん`;
      msgs.push(d > 0 ? `${who}（${prevAny.total}点）より +${d}点！` : d === 0 ? `${who}（${prevAny.total}点）と同点！` : `${who}（${prevAny.total}点）まで あと${-d}点`);
    }
    if (prevBest !== null && !(prevAny && prevAny.name === name && prevAny.total === prevBest)) {
      const d = total - prevBest;
      msgs.push(d > 0 ? `自己ベスト更新！（+${d}点）` : `自己ベスト ${prevBest}点まで あと${-d}点`);
    } else if (prevBest === null) msgs.push('はじめての記録！');
    if (rank === 1) {
      const second = top[1];
      msgs.unshift(second ? `1位！ 2位の${second.name}さんに ${total - second.total}点差` : '1位！');
    } else if (rank > 1) {
      const above = top[rank - 2], first = top[0];
      msgs.unshift(`${rank}位！ 1つ上の${above.name}さんまで あと${above.total - total}点`);
      if (rank > 2) msgs.push(`1位の${first.name}さんまで あと${first.total - total}点`);
    } else {
      const last = top[top.length - 1];
      msgs.unshift(`ランク外… ${CONFIG.RANKING_SIZE}位まで あと${last.total - total + 1}点`);
    }
    return { rec, rank, msgs, newRecord: rank >= 1 };
  }

  function html(highlightId) {
    const rows = list();
    if (!rows.length) return '<p class="empty">まだ記録がありません。<br>3ステージをクリアすると、ここに並びます。</p>';
    return `<table class="rank"><thead><tr><th>順位</th><th>名前</th><th>合計満足度</th><th class="sc">1面/2面/3面</th><th>日時</th></tr></thead><tbody>${rows.map((r, i) => `
      <tr class="${r.id === highlightId ? 'me' : ''} ${i < 3 ? 'top' + (i + 1) : ''}"><td>${i + 1}</td><td>${esc(r.name)}</td><td><b>${r.total}</b>点</td><td class="sc">${(r.scores || []).join(' / ')}</td><td>${fmt(r.at)}</td></tr>`).join('')}</tbody></table>`;
  }
  function clear() { Save.set('ranking', []); Save.set('history', []); }
  return { add, html, clear, esc, fmt };
})();

const Screens = (() => {
  const $ = s => document.querySelector(s);
  function show(id) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('show', el.id === id));
    document.body.dataset.scene = id || 'play';
  }
  function hideAll() { show(null); }
  return { $, show, hideAll };
})();
