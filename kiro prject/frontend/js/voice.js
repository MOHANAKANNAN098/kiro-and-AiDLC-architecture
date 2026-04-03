// voice.js — Voice Detector Module
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

const VoiceDetector = (() => {
  const TRIGGER_PHRASES = ['help me', 'she shield', 'emergency', 'i am in danger'];
  const CONFIDENCE_THRESHOLD = 0.80;

  let recognition = null;
  const triggerCallbacks = [];

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function onTrigger(cb) {
    if (typeof cb === 'function') triggerCallbacks.push(cb);
  }

  function start() {
    if (!isSupported()) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim().toLowerCase();
        const confidence = result[0].confidence;
        const matched = TRIGGER_PHRASES.some(p => transcript.includes(p));
        if (matched && confidence > CONFIDENCE_THRESHOLD) {
          triggerCallbacks.forEach(cb => cb({ transcript, confidence }));
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        _showPermissionDeniedGuidance();
        stop();
      }
    };

    recognition.start();

    const mic = document.getElementById('mic-indicator');
    if (mic) mic.classList.remove('d-none');

    const btn = document.getElementById('btn-voice-toggle');
    if (btn) btn.setAttribute('aria-pressed', 'true');
  }

  function stop() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    const mic = document.getElementById('mic-indicator');
    if (mic) mic.classList.add('d-none');

    const btn = document.getElementById('btn-voice-toggle');
    if (btn) btn.setAttribute('aria-pressed', 'false');
  }

  function _handleUnsupportedBrowser() {
    const btn = document.getElementById('btn-voice-toggle');
    if (btn) btn.classList.add('d-none');
    const coords = document.getElementById('location-coords');
    if (coords) coords.textContent = 'Voice detection unavailable on this browser.';
  }

  function _showPermissionDeniedGuidance() {
    const btn = document.getElementById('btn-voice-toggle');
    if (btn) { btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); }
    const coords = document.getElementById('location-coords');
    if (coords) coords.textContent = 'Microphone access denied. Please allow microphone permission in your browser settings.';
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!isSupported()) _handleUnsupportedBrowser();
    });
  }

  return { isSupported, start, stop, onTrigger };
})();
