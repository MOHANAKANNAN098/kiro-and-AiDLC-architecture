// sos.js — SOS Module
// Requirements: 1.1, 1.2, 1.4, 1.5, 1.6

const SOSModule = (() => {
  const DEMO_MODE = true; // set false when real backend is deployed

  let _successCallbacks = [];
  let _errorCallbacks = [];

  function onSuccess(cb) { _successCallbacks.push(cb); }
  function onError(cb)   { _errorCallbacks.push(cb); }

  /** Pure function — builds the SOS payload object */
  function buildPayload(userId, userName, coords, locationStale = false) {
    return {
      userId,
      userName,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      timestamp: new Date().toISOString(),
      locationStale: Boolean(locationStale)
    };
  }

  /** Creates a dismissible banner appended to <body> */
  function showBanner(message, type) {
    // Remove any existing banner
    document.querySelectorAll('.banner').forEach(b => b.remove());

    const banner = document.createElement('div');
    banner.className = `banner banner-${type}`;
    banner.setAttribute('role', 'alert');
    banner.textContent = message;
    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity .4s ease';
      setTimeout(() => banner.remove(), 400);
    }, 5000);
  }

  /** Briefly flashes the screen red */
  function _flashOverlay() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(220,53,69,.55)',
      zIndex: '9998', pointerEvents: 'none',
      animation: 'sos-flash .6s ease forwards'
    });
    if (!document.getElementById('sos-flash-style')) {
      const style = document.createElement('style');
      style.id = 'sos-flash-style';
      style.textContent = '@keyframes sos-flash{0%{opacity:1}100%{opacity:0}}';
      document.head.appendChild(style);
    }
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 700);
  }

  /** 3-beep alert via Web Audio API */
  function _playAlertSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 880;
        const start = ctx.currentTime + i * 0.25;
        gain.gain.setValueAtTime(0.4, start);
        gain.gain.setValueAtTime(0, start + 0.15);
        osc.start(start);
        osc.stop(start + 0.15);
      }
    } catch (_) { /* AudioContext unavailable — skip */ }
  }

  /** Main SOS dispatch */
  async function trigger() {
    const userId   = (typeof AppState !== 'undefined' && AppState.userId)   || localStorage.getItem('she-shield-userId') || 'anonymous';
    const userName = (typeof AppState !== 'undefined' && AppState.userName) || 'User';

    let coords;
    let locationStale = false;

    try {
      coords = await LocationTracker.getPosition();
    } catch (_) {
      const last = LocationTracker.getLastKnown();
      coords = last ? { lat: last.lat, lng: last.lng, accuracy: last.accuracy } : { lat: 0, lng: 0, accuracy: 0 };
      locationStale = true;
    }

    const payload = buildPayload(userId, userName, coords, locationStale);

    _flashOverlay();
    _playAlertSound();

    try {
      let data;
      if (DEMO_MODE) {
        await new Promise(res => setTimeout(res, 1500));
        data = { dispatched: true, contactsNotified: 0 };
      } else {
        const res = await fetch('https://api.she-shield-ai.example.com/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      }
      showBanner('🚨 SOS Alert Sent! Emergency contacts notified.', 'success');
      _successCallbacks.forEach(cb => { try { cb(data); } catch (_) {} });
    } catch (err) {
      showBanner('Alert failed — call 911 directly', 'error');
      _errorCallbacks.forEach(cb => { try { cb(err); } catch (_) {} });
    }
  }

  return { trigger, onSuccess, onError, buildPayload, showBanner };
})();
