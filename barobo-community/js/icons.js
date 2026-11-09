/* icons.js — small inline Lucide icon set that also works offline */
(function (B) {
  const paths = {
    house: '<path d="m3 10 9-7 9 7"></path><path d="M9 21v-8h6v8"></path><path d="M5 9v12h14V9"></path>',
    newspaper: '<path d="M15 18h-5"></path><path d="M18 14h-8"></path><path d="M18 10h-8"></path><path d="M6 6h.01"></path><path d="M6 14h.01"></path><path d="M6 18h.01"></path><rect width="20" height="16" x="2" y="4" rx="2"></rect>',
    calendar: '<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path>',
    messages: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0 1 22 16.92z"></path>',
    megaphone: '<path d="m3 11 18-5v12L3 13v-2z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path><path d="M3 11v2"></path><path d="M21 8v8"></path>',
    stethoscope: '<path d="M11 2v2"></path><path d="M5 2v2"></path><path d="M5 3H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"></path><path d="M8 15a6 6 0 0 0 12 0v-3"></path><circle cx="20" cy="10" r="2"></circle>',
    'graduation-cap': '<path d="m22 10-10-5L2 10l10 5 10-5Z"></path><path d="M6 12v5c3.33 2.67 8.67 2.67 12 0v-5"></path><path d="M22 10v6"></path>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-10 6L2 7"></path>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
    info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"></path>',
    'thumbs-up': '<path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11l2.2-4.42a1.8 1.8 0 0 1 3.25 1.41Z"></path>',
    reply: '<path d="m9 17-5-5 5-5"></path><path d="M4 12h10a6 6 0 0 1 6 6v1"></path>',
    eye: '<path d="M2.06 12.34a1 1 0 0 1 0-.68 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .68 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>',
    'eye-off': '<path d="m3 3 18 18"></path><path d="M10.58 10.58a2 2 0 0 0 2.83 2.83"></path><path d="M9.88 5.09A10.77 10.77 0 0 1 12 4.88c5.5 0 9.5 4.12 10.5 7.12a10.7 10.7 0 0 1-3.1 4.55"></path><path d="M6.61 6.61A11.1 11.1 0 0 0 1.5 12c.5 1.5 1.6 3.2 3.3 4.5A10.6 10.6 0 0 0 12 19.12c1.2 0 2.3-.2 3.3-.6"></path>',
    check: '<path d="m5 12 4 4L19 6"></path>',
    menu: '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>',
    x: '<path d="m18 6-12 12"></path><path d="m6 6 12 12"></path>',
    search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>'
  };

  function svg(name, className) {
    if (!Object.prototype.hasOwnProperty.call(paths, name)) {
      throw new Error('Unknown Lucide icon: ' + name);
    }
    return '<svg class="lucide-icon' + (className ? ' ' + className : '') +
      '" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths[name] + '</svg>';
  }

  B.icons = { svg: svg };
})(window.Barobo = window.Barobo || {});
