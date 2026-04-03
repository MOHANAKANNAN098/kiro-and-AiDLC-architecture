// contacts.js — Contact Manager Module
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

'use strict';

function isValidPhone(str) {
  return /^\+[1-9]\d{1,14}$/.test(str);
}

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

const STORAGE_KEY = 'she-shield-contacts';

const ContactManager = (() => {

  function _read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (_) { return []; }
  }

  function _write(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _render(contacts) {
    const list = document.getElementById('contacts-list');
    if (!list) return;
    if (!contacts.length) {
      list.innerHTML = '<p class="text-muted-white small text-center mb-0">No contacts yet. Add one below.</p>';
      return;
    }
    list.innerHTML = contacts.map(c => `
      <div class="contact-item d-flex align-items-center gap-2 mb-2">
        <div class="contact-avatar">${_esc((c.name || '?').charAt(0).toUpperCase())}</div>
        <div class="flex-grow-1 overflow-hidden">
          <div class="fw-semibold text-truncate">${_esc(c.name)}</div>
          <div class="small text-muted-white text-truncate">${_esc(c.phone)}</div>
        </div>
        <div class="contact-actions d-flex gap-1 flex-shrink-0">
          <button class="btn btn-outline-primary btn-sm" data-phone="${_esc(c.phone)}" data-action="edit" aria-label="Edit ${_esc(c.name)}">
            <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" data-phone="${_esc(c.phone)}" data-action="delete" aria-label="Delete ${_esc(c.name)}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>`).join('');
    _bindEvents();
  }

  function _clearErrors() {
    ['contact-name','contact-phone','contact-email'].forEach(id => {
      const el = document.getElementById(id);
      const err = document.getElementById(id + '-error');
      if (el) el.classList.remove('is-invalid');
      if (err) err.textContent = '';
    });
  }

  function _showError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + '-error');
    if (el) el.classList.add('is-invalid');
    if (err) err.textContent = msg;
  }

  function load() {
    _render(_read());
  }

  function add(name, phone, email) {
    _clearErrors();
    let valid = true;
    if (!name || !name.trim()) { _showError('contact-name', 'Name is required.'); valid = false; }
    if (!isValidPhone(phone)) { _showError('contact-phone', 'Enter a valid phone in E.164 format (e.g. +15551234567).'); valid = false; }
    if (!isValidEmail(email)) { _showError('contact-email', 'Enter a valid email address.'); valid = false; }
    if (!valid) return false;

    const contacts = _read();
    if (contacts.some(c => c.phone === phone)) {
      _showError('contact-phone', 'A contact with this phone number already exists.');
      return false;
    }
    contacts.push({ name: name.trim(), phone, email: email.trim(), createdAt: new Date().toISOString() });
    _write(contacts);
    _render(contacts);
    return true;
  }

  function deleteContact(phone) {
    if (!confirm(`Remove contact with phone ${phone}?`)) return;
    const contacts = _read().filter(c => c.phone !== phone);
    _write(contacts);
    _render(contacts);
  }

  function edit(phone, data) {
    const contacts = _read().map(c => c.phone === phone ? Object.assign({}, c, data) : c);
    _write(contacts);
    _render(contacts);
  }

  function _bindEvents() {
    const list = document.getElementById('contacts-list');
    if (!list) return;
    list.removeEventListener('click', _onClick);
    list.addEventListener('click', _onClick);
  }

  function _onClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const phone = btn.dataset.phone;
    if (btn.dataset.action === 'delete') {
      deleteContact(phone);
    } else if (btn.dataset.action === 'edit') {
      const newName  = prompt('New name (leave blank to keep):');
      const newEmail = prompt('New email (leave blank to keep):');
      const updates = {};
      if (newName  && newName.trim())  updates.name  = newName.trim();
      if (newEmail && newEmail.trim()) updates.email = newEmail.trim();
      if (Object.keys(updates).length) edit(phone, updates);
    }
  }

  function _wireForm() {
    const form = document.getElementById('add-contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name  = (document.getElementById('contact-name')  || {}).value || '';
      const phone = (document.getElementById('contact-phone') || {}).value || '';
      const email = (document.getElementById('contact-email') || {}).value || '';
      const ok = add(name, phone, email);
      if (ok) {
        form.reset();
        const modal = document.getElementById('addContactModal');
        if (modal && window.bootstrap) {
          const bsModal = window.bootstrap.Modal.getInstance(modal);
          if (bsModal) bsModal.hide();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _wireForm);
  } else {
    _wireForm();
  }

  return { load, add, delete: deleteContact, edit };
})();
