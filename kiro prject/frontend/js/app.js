// app.js — Application state wiring
// Requirements: 5.3, 7.1, 7.6

'use strict';

const AppState = {
  userId: null,
  userName: 'User',
  contacts: [],
  voiceActive: false,
  sosActive: false,
  lastLocation: null,
  fakeCallActive: false,
  selectedTipCategory: null,
  emergencyAlerts: []
};

function _generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function _getOrCreateUserId() {
  const KEY = 'she-shield-userId';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : _generateUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Scroll-based fade animation observer
function _initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
}

// Emergency alert logging
function _logEmergencyAlert(message) {
  const timestamp = new Date().toLocaleTimeString();
  const alert = { message, timestamp };
  AppState.emergencyAlerts.unshift(alert);
  if (AppState.emergencyAlerts.length > 5) AppState.emergencyAlerts.pop();
  
  const logContainer = document.getElementById('emergency-alert-log');
  if (logContainer) {
    const alertItem = document.createElement('div');
    alertItem.className = 'alert-log-item';
    alertItem.innerHTML = `<small><strong>${timestamp}</strong><br/>${message}</small>`;
    const existingItems = logContainer.querySelectorAll('.alert-log-item');
    if (existingItems.length > 0) {
      logContainer.insertBefore(alertItem, existingItems[0]);
    } else {
      logContainer.appendChild(alertItem);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // a. userId
  AppState.userId = _getOrCreateUserId();

  // b. Load contacts
  if (typeof ContactManager !== 'undefined') ContactManager.load();

  // c. Tips (TipsModule auto-inits, but ensure container is populated)
  if (typeof TipsModule !== 'undefined') {
    const tc = document.getElementById('tips-container');
    if (tc && !tc.children.length) TipsModule.render(tc);
  }

  // d. Wire all SOS buttons
  ['hero-sos-btn', 'nav-sos-btn', 'dashboard-sos-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn && typeof SOSModule !== 'undefined') {
      btn.addEventListener('click', () => {
        AppState.sosActive = true;
        _logEmergencyAlert('🚨 SOS Alert Triggered');
        SOSModule.trigger();
      });
    }
  });

  // e. Voice toggle
  const voiceBtn = document.getElementById('btn-voice-toggle');
  if (voiceBtn && typeof VoiceDetector !== 'undefined') {
    voiceBtn.addEventListener('click', () => {
      if (AppState.voiceActive) {
        VoiceDetector.stop();
        AppState.voiceActive = false;
        voiceBtn.setAttribute('aria-pressed', 'false');
      } else {
        VoiceDetector.start();
        AppState.voiceActive = true;
        voiceBtn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  // f. Get location button
  const locBtn = document.getElementById('btn-get-location');
  if (locBtn && typeof LocationTracker !== 'undefined') {
    locBtn.addEventListener('click', () => LocationTracker.getPosition());
  }

  // g. Fake call button
  const fakeBtn = document.getElementById('btn-fake-call');
  if (fakeBtn && typeof FakeCallModule !== 'undefined') {
    fakeBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('fake-caller-name');
      const callerName = (nameInput && nameInput.value.trim()) || 'Mom';
      AppState.fakeCallActive = true;
      FakeCallModule.start(callerName);
    });
  }

  // h. Voice → SOS bridge
  if (typeof VoiceDetector !== 'undefined' && typeof SOSModule !== 'undefined') {
    VoiceDetector.onTrigger(() => {
      _logEmergencyAlert('🎤 Voice Trigger Detected');
      SOSModule.trigger();
    });
  }

  // i. SOS success callback
  if (typeof SOSModule !== 'undefined') {
    SOSModule.onSuccess(() => { 
      AppState.sosActive = false;
      _logEmergencyAlert('✓ Alerts Sent to Contacts');
    });
  }

  // j. Watch location
  if (typeof LocationTracker !== 'undefined') {
    LocationTracker.watchPosition(coords => { AppState.lastLocation = coords; });
  }

  // k. Navbar scroll-shrink
  const navbar = document.getElementById('navbar');
  if (navbar) {
    function _onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', _onScroll, { passive: true });
    _onScroll();
  }

  // l. Initialize scroll animations
  _initScrollAnimations();

});
