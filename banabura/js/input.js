// 操作：画面内ボタン（十字キー・A・B）とキーボード（矢印・Z=A・X=B）
const Input = (() => {
  const state = { left: false, right: false, a: false, b: false };
  let aEdge = false;          // A を「押した瞬間」
  const touch = { left: false, right: false, a: false, b: false };
  const key = { left: false, right: false, a: false, b: false };

  function merge() {
    for (const k of ['left', 'right', 'a', 'b']) {
      const now = touch[k] || key[k];
      if (k === 'a' && now && !state.a) aEdge = true;
      state[k] = now;
    }
  }

  // ---- キーボード ----
  const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', KeyZ: 'a', Space: 'a', ArrowUp: 'a', KeyX: 'b', ShiftLeft: 'b', ShiftRight: 'b' };
  addEventListener('keydown', e => {
    const k = KEYMAP[e.code]; if (!k) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    key[k] = true; merge(); e.preventDefault();
  });
  addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (!k) return; key[k] = false; merge(); });
  addEventListener('blur', () => { for (const k in key) key[k] = false; for (const k in touch) touch[k] = false; merge(); });

  // ---- 画面内ボタン（複数の指を同時に使える） ----
  function bindPad(el) {
    const ptrs = new Map(); // pointerId -> 'left' | 'right' | null
    const dirOf = e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      if (Math.abs(x) < r.width * 0.08) return null;
      return x < 0 ? 'left' : 'right';
    };
    const update = () => {
      touch.left = touch.right = false;
      for (const d of ptrs.values()) if (d) touch[d] = true;
      el.classList.toggle('on-left', touch.left);
      el.classList.toggle('on-right', touch.right);
      merge();
    };
    el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) {} ptrs.set(e.pointerId, dirOf(e)); update(); });
    el.addEventListener('pointermove', e => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, dirOf(e)); update(); });
    const end = e => { ptrs.delete(e.pointerId); update(); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  }
  function bindButton(el, k) {
    const ptrs = new Set();
    const update = () => { touch[k] = ptrs.size > 0; el.classList.toggle('on', touch[k]); merge(); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) {} ptrs.add(e.pointerId); update(); });
    const end = e => { ptrs.delete(e.pointerId); update(); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  }
  function bind() {
    bindPad(document.getElementById('pad'));
    bindButton(document.getElementById('btnA'), 'a');
    bindButton(document.getElementById('btnB'), 'b');
  }

  function consumeA() { const v = aEdge; aEdge = false; return v; }
  function reset() { aEdge = false; }
  return { state, bind, consumeA, reset };
})();
