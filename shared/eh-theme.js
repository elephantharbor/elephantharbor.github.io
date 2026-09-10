/*! Elephant Harbor console theme + logo + trial clock helpers
 *  localStorage: eh-console-theme = light|dark
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

  function logoUrl(theme) {
    var base = "";
    var link = document.querySelector('link[href*="eh-console.css"]');
    if (link && link.href) base = link.href.replace(/eh-console\.css.*$/, "");
    if (!base) base = "/shared/";
    return theme === "light" ? base + "mark-on-canvas.svg" : base + "mark-on-ink.svg";
  }

  function refreshLogo() {
    document.querySelectorAll(".mark.eh-logo img").forEach(function (img) {
      img.src = logoUrl(root.getAttribute("data-theme") || preferred());
    });
  }

  function ensureLogo() {
    document.querySelectorAll(".topbar .mark").forEach(function (el) {
      if (el.classList.contains("eh-logo") && el.querySelector("img")) return;
      el.classList.add("eh-logo");
      el.setAttribute("aria-label", "Elephant Harbor");
      el.innerHTML = "";
      var img = document.createElement("img");
      img.alt = "";
      img.width = 36;
      img.height = 36;
      img.src = logoUrl(root.getAttribute("data-theme") || preferred());
      el.appendChild(img);
    });
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
    refreshLogo();
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
  }

  function boot() {
    ensureToggle();
    ensureLogo();
    apply(root.getAttribute("data-theme") || preferred());
  }

  apply(preferred());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.EH = window.EH || {};
  window.EH.setTheme = apply;
  window.EH.getTheme = function () {
    return root.getAttribute("data-theme") || preferred();
  };

  window.EH.renderTrialClock = function (data, opts) {
    opts = opts || {};
    if (!data || !data.endDate) {
      return (
        '<aside class="trial-clock" aria-label="Trial clock"><div>' +
        '<div class="tc-label">Trial clock</div>' +
        '<div class="tc-meta">Dates not set yet — awaiting Thomas.</div>' +
        "</div></aside>"
      );
    }
    var endStr = String(data.endDate);
    var end = new Date(endStr.length === 10 ? endStr + "T23:59:59-05:00" : endStr);
    var days = Math.max(0, Math.ceil((end - new Date()) / 86400000));
    var urgent = days <= 3;
    var label = data.label || "Trial";
    var range = (data.startDate || "—") + " → " + (data.endDate || "—");
    return (
      '<aside class="trial-clock' +
      (urgent ? " urgent" : "") +
      '" aria-label="Trial clock"><div>' +
      '<div class="tc-label">' +
      label +
      "</div>" +
      '<div class="tc-days">' +
      days +
      " day" +
      (days === 1 ? "" : "s") +
      " left</div>" +
      '<div class="tc-meta">' +
      range +
      " · America/Chicago · updated " +
      (data.lastUpdated || "—") +
      "</div></div>" +
      (opts.extra || "") +
      "</aside>"
    );
  };

  window.EH.loadTrialClock = function (url) {
    return fetch(url || "data/trial-clock.json", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("trial-clock HTTP " + r.status);
      return r.json();
    });
  };

  /** Capital-style lesson card HTML from a normalized lesson object. */
  window.EH.renderLessonCard = function (l, esc) {
    esc =
      esc ||
      function (s) {
        return String(s == null ? "" : s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      };
    var conclusion = l.what_we_learned || l.learning || l.heading || l.conclusion || "";
    var originated = l.originationDate || l.origination_date || l.date_ct || "";
    var id = l.lesson_id || l.id || "";
    var source = l.source || "";
    var obs = l.what_happened || l.experience || l.observation || "";
    var belief = l.believed_beforehand || l.belief || "";
    var evidence = l.evidence_showed || l.evidence || l.outcome || "";
    var change = l.what_changed || l.change || "";
    return (
      '<div class="lesson">' +
      '<div class="conclusion">' +
      esc(conclusion) +
      "</div>" +
      (originated
        ? '<div class="lesson-origination">Originated ' + esc(originated) + "</div>"
        : '<div class="lesson-origination missing">Origination date missing</div>') +
      (id || source
        ? "<div><span class=\"id\">" +
          esc(id) +
          "</span>" +
          (source ? ' <span class="dim">· ' + esc(source) + "</span>" : "") +
          "</div>"
        : "") +
      (obs
        ? '<div class="row"><div class="k">Observation</div><div class="v">' + esc(obs) + "</div></div>"
        : "") +
      (belief
        ? '<div class="row"><div class="k">Decision / belief</div><div class="v">' +
          esc(belief) +
          "</div></div>"
        : "") +
      (evidence
        ? '<div class="row"><div class="k">Outcome / evidence</div><div class="v">' +
          esc(evidence) +
          "</div></div>"
        : "") +
      (conclusion
        ? '<div class="row"><div class="k">Lesson</div><div class="v"><strong>' +
          esc(conclusion) +
          "</strong></div></div>"
        : "") +
      (change
        ? '<div class="row"><div class="k">System change</div><div class="v">' +
          esc(change) +
          "</div></div>"
        : "") +
      "</div>"
    );
  };
})();
