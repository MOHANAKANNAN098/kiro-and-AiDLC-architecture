// fakecall.js — Fake Call Module
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

const FakeCallModule = (() => {
  let _overlay = null;
  let _timerInterval = null;
  let _timerSeconds = 0;
  let _audioCtx = null;
  let _ringInterval = null;

  // ── Audio ──
  function _createCtx() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      return Ctx ? new Ctx() : null;
    } catch (_) { return null; }
  }

  function _beep(ctx, freq, start, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start); osc.stop(start + dur);
  }

  function _startRingtone() {
    _audioCtx = _createCtx();
    if (!_audioCtx) return;
    function ring() {
      if (!_audioCtx) return;
      const now = _audioCtx.currentTime;
      _beep(_audioCtx, 480, now, 0.3);
      _beep(_audioCtx, 620, now + 0.35, 0.3);
    }
    ring();
    _ringInterval = setInterval(ring, 2000);
  }

  function _stopRingtone() {
    if (_ringInterval) { clearInterval(_ringInterval); _ringInterval = null; }
    if (_audioCtx) { try { _audioCtx.close(); } catch (_) {} _audioCtx = null; }
  }

  // ── Timer ──
  function _fmt(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  function _stopTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    _timerSeconds = 0;
  }

  // ── DOM ──
  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _buildOverlay(callerName) {
    const el = document.createElement('div');
    el.className = 'fake-call-overlay';
    el.innerHTML = `
      <div style="text-align:center;">
        <div class="fake-call-avatar">${_esc(callerName.charAt(0).toUpperCase() || '?')}</div>
        <div class="caller-name" style="margin-top:1.5rem;">${_esc(callerName)}</div>
        <div class="call-status">Incoming Call…</div>
      </div>
      <div class="fake-call-actions">
        <button class="btn-call-accept" aria-label="Accept call">📞</button>
        <button class="btn-call-decline" aria-label="Decline call">📵</button>
      </div>`;
    el.querySelector('.btn-call-accept').addEventListener('click', accept);
    el.querySelector('.btn-call-decline').addEventListener('click', end);
    return el;
  }

  // ── Public API ──
  function start(callerName) {
    if (_overlay) return;
    _overlay = _buildOverlay(callerName || 'Unknown');
    document.body.appendChild(_overlay);
    document.body.style.overflow = 'hidden';
    _startRingtone();
  }

  function accept() {
    if (!_overlay) return;
    _stopRingtone();
    const statusEl = _overlay.querySelector('.call-status');
    if (statusEl) statusEl.textContent = 'Connected';
    const actionsEl = _overlay.querySelector('.fake-call-actions');
    if (actionsEl) {
      actionsEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
          <div style="font-size:1.5rem;font-weight:700;color:#fff;" id="fake-call-timer">00:00</div>
          <button class="btn-call-decline" aria-label="End call" id="btn-end-call">📵</button>
        </div>`;
      actionsEl.querySelector('#btn-end-call').addEventListener('click', end);
    }
    _timerSeconds = 0;
    _timerInterval = setInterval(() => {
      _timerSeconds++;
      const el = document.getElementById('fake-call-timer');
      if (el) el.textContent = _fmt(_timerSeconds);
    }, 1000);
  }

  function end() {
    _stopTimer();
    _stopRingtone();
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    document.body.style.overflow = '';
  }

  return { start, accept, end };
})();
