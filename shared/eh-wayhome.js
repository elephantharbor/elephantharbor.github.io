/*! Elephant Harbor — portfolio way-home nav (single source of truth)
 *  Canonical segment list + console URLs. Load on every desk; mount fills nav.wayhome.
 *  Docs: shared/README.md · docs/NEW-SEGMENT-DESK.md
 */
(function () {
  "use strict";

  var CONSOLE = "https://console.elephantharbor.com";

  var SEGMENT_IDS = [
    "portfolio",
    "capital",
    "presence",
    "foundry",
    "local",
    "eats",
    "reach",
    "gaming",
  ];

  var LINKS = [
    {
      id: "portfolio",
      label: "Elephant Harbor / Portfolio",
      href: CONSOLE + "/",
      sepAfter: true,
    },
    { id: "capital", label: "Capital", href: CONSOLE + "/harbor-capital-desk/" },
    { id: "presence", label: "Presence", href: CONSOLE + "/harbor-presence/" },
    { id: "foundry", label: "Foundry", href: CONSOLE + "/harbor-foundry/" },
    { id: "local", label: "Local", href: CONSOLE + "/harbor-local/" },
    { id: "eats", label: "Eats", href: CONSOLE + "/harbor-eats/" },
    { id: "reach", label: "Reach", href: CONSOLE + "/harbor-reach/" },
    { id: "gaming", label: "Gaming", href: CONSOLE + "/harbor-gaming/" },
  ];

  function detectActive(navEl, override) {
    if (override) return override;
    var fromBody = document.body && document.body.getAttribute("data-eh-segment");
    if (fromBody) return fromBody;
    if (navEl) {
      var fromNav = navEl.getAttribute("data-eh-segment");
      if (fromNav) return fromNav;
    }
    if (document.body && document.body.classList) {
      for (var i = 0; i < SEGMENT_IDS.length; i++) {
        var id = SEGMENT_IDS[i];
        if (document.body.classList.contains("eh-" + id)) return id;
      }
    }
    return null;
  }

  /** @param {HTMLElement} navEl nav.wayhome
   *  @param {{ active?: string }} [opts] force active segment id */
  function mount(navEl, opts) {
    opts = opts || {};
    if (!navEl) return;
    var active = detectActive(navEl, opts.active);
    if (!navEl.getAttribute("aria-label")) {
      navEl.setAttribute("aria-label", "Elephant Harbor");
    }
    while (navEl.firstChild) navEl.removeChild(navEl.firstChild);
    LINKS.forEach(function (seg) {
      var a = document.createElement("a");
      a.href = seg.href;
      a.setAttribute("data-segment", seg.id);
      a.textContent = seg.label;
      if (active === seg.id) {
        a.className = "active";
        a.setAttribute("aria-current", "page");
      }
      navEl.appendChild(a);
      if (seg.sepAfter) {
        var sep = document.createElement("span");
        sep.className = "sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = "/";
        navEl.appendChild(sep);
      }
    });
  }

  function boot() {
    document.querySelectorAll("nav.wayhome").forEach(function (nav) {
      if (nav.getAttribute("data-eh-wayhome") === "off") return;
      mount(nav);
    });
  }

  window.EH = window.EH || {};
  window.EH.Wayhome = {
    mount: mount,
    detectActive: detectActive,
    segments: LINKS.slice(),
    consoleBase: CONSOLE,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
