// location.js — Location Tracker Module
// Requirements: 5.1, 5.3, 5.4, 5.5

const LocationTracker = (() => {
  let _lastKnown = null; // { lat, lng, accuracy, timestamp }
  let _watchId = null;

  function haversineMetres(a, b) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) *
      Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function _updateUI(lat, lng) {
    const coordsEl = document.getElementById('location-coords');
    if (coordsEl) {
      coordsEl.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    }
    const mapEl = document.getElementById('location-map');
    if (mapEl) {
      mapEl.innerHTML = `<iframe
        width="100%" height="100%"
        style="border:0;border-radius:.5rem;"
        loading="lazy" allowfullscreen
        src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}"
        title="Your current location"></iframe>`;
    }
  }

  function _showPermissionDenied() {
    const coordsEl = document.getElementById('location-coords');
    if (coordsEl) {
      coordsEl.textContent = 'Location access denied. Please enable location permissions in your browser settings.';
    }
  }

  /** Returns Promise<{lat, lng, accuracy}> */
  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          _lastKnown = coords;
          _updateUI(coords.lat, coords.lng);
          resolve({ lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) _showPermissionDenied();
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /** Calls cb({lat,lng,accuracy}) only when haversine distance > 50m */
  function watchPosition(cb) {
    if (!navigator.geolocation) return;
    _watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        const shouldFire = !_lastKnown || haversineMetres(_lastKnown, current) > 50;
        _lastKnown = current;
        _updateUI(current.lat, current.lng);
        if (shouldFire) cb({ lat: current.lat, lng: current.lng, accuracy: current.accuracy });
      },
      (err) => { if (err.code === err.PERMISSION_DENIED) _showPermissionDenied(); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function stopWatch() {
    if (_watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(_watchId);
      _watchId = null;
    }
  }

  function getLastKnown() { return _lastKnown; }

  return { getPosition, watchPosition, stopWatch, getLastKnown };
})();
