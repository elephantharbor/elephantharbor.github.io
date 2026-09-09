/*! Elephant Harbor console theme toggle
 *  Persists light/dark in localStorage key eh-console-theme.
 *  Sets html[data-theme]. Auto-injects a toggle into .topbar .updated or .top-meta.
 */
(function () {
  var KEY = "eh-console-theme";
  var root = document.documentElement;

  function preferred() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return "dark";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    var btn = document.getElementById("eh-theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      btn.textContent = theme === "light" ? "Dark" : "Light";
      btn.title =
        theme === "light" ? "Switch to dark desk theme" : "Switch to light (brand canvas) theme";
    }
  }

  function ensureToggle() {
    if (document.getElementById("eh-theme-toggle")) return;
    var host =
      document.querySelector(".topbar .updated") ||
      document.querySelector(".topbar .top-meta") ||
      document.querySelector(".topbar");
    if (!host) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "eh-theme-toggle";
    btn.className = "eh-theme-toggle";
    btn.setAttribute("aria-label", "Toggle color theme");
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
    });
    host.appendChild(btn);
    apply(root.getAttribute("data-theme") || preferred());
  }

  // Apply ASAP to avoid flash (also call from <head> inline if desired)
  apply(preferred());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureToggle);
  } else {
    ensureToggle();
  }

  window.EH = window.EH || {};
  window.EH.setTheme = apply;
  window.EH.getTheme = function () {
    return root.getAttribute("data-theme") || preferred();
  };
})();
