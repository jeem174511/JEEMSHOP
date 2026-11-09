/* utils.js — small helper functions */
(function (B) {
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  /** 'YYYY-MM-DD' for the day n days from now (local time). */
  function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /** Date object from a 'YYYY-MM-DD' or ISO string. */
  function toDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T00:00:00') : new Date(value);
  }

  function fmtDate(value) {
    return toDate(value).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function timeAgo(iso) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' hr ago';
    return Math.floor(hrs / 24) + ' days ago';
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function initial(name) {
    const s = String(name || '?').trim();
    return (s.charAt(0) || '?').toUpperCase();
  }

  /** Simple debounce for search input. */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  B.utils = { esc, $, $$, daysFromNow, toDate, fmtDate, timeAgo, uid, initial, debounce };
})(window.Barobo = window.Barobo || {});
