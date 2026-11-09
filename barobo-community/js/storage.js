/* storage.js — safe localStorage wrapper that does not crash when storage is blocked */
(function (B) {
  const memory = {};

  function key(name) { return B.config.storagePrefix + name; }

  function get(name, fallback) {
    try {
      const raw = window.localStorage.getItem(key(name));
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(memory, name) ? memory[name] : fallback;
    }
  }

  function set(name, value) {
    memory[name] = value;
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  B.storage = { get, set };
})(window.Barobo = window.Barobo || {});
