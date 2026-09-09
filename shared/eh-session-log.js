/*! Elephant Harbor — Session Log + lesson date helpers
 *  Source: elephantharbor.github.io/shared/eh-session-log.js
 *  Load after page; optional global EH namespace.
 */
(function (global) {
  var EH = global.EH || (global.EH = {});

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Format ISO timestamp for America/Chicago display. */
  EH.formatChicago = function formatChicago(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }).format(d);
    } catch (e) {
      return String(iso);
    }
  };

  /** Format originationDate (date or datetime) for display. */
  EH.formatOriginationDate = function formatOriginationDate(raw) {
    if (!raw) return null;
    var s = String(raw);
    // Date-only YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      try {
        var d = new Date(s + "T12:00:00-05:00");
        return new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Chicago",
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(d);
      } catch (e) {
        return s;
      }
    }
    return EH.formatChicago(s);
  };

  /**
   * Render lesson origination line.
   * @param {object} lesson
   * @returns {string} HTML
   */
  EH.renderLessonOrigination = function renderLessonOrigination(lesson) {
    var raw =
      (lesson && (lesson.originationDate || lesson.origination_date || lesson.originatedAt)) ||
      null;
    if (!raw) {
      return '<div class="lesson-origination missing">Origination date missing — backfill required</div>';
    }
    return (
      '<div class="lesson-origination">Originated ' +
      esc(EH.formatOriginationDate(raw)) +
      "</div>"
    );
  };

  /**
   * Render Session Log panel.
   * @param {object} data session-log JSON
   * @param {object} [opts]
   * @returns {string} HTML
   */
  EH.renderSessionLog = function renderSessionLog(data, opts) {
    opts = opts || {};
    var title = opts.title || "Session Log";
    var help =
      opts.help ||
      "Append-only activity for humans. Newest first. Plain English — what was done and what changed on the desk.";
    var entries = (data && data.entries) || [];
    var sorted = entries.slice().sort(function (a, b) {
      return String(b.at || "").localeCompare(String(a.at || ""));
    });
    if (!sorted.length) {
      return (
        '<section class="session-log empty" aria-label="' +
        esc(title) +
        '">' +
        '<h2 class="session-log-title">' +
        esc(title) +
        "</h2>" +
        '<p class="session-log-help">' +
        esc(help) +
        "</p>" +
        '<p class="session-log-empty">No sessions logged yet.</p>' +
        "</section>"
      );
    }
    var items = sorted
      .map(function (e) {
        var lesson =
          e.lessonId
            ? '<div class="sl-lesson">Related lesson: ' + esc(e.lessonId) + "</div>"
            : "";
        return (
          "<li>" +
          '<div class="sl-when">' +
          esc(EH.formatChicago(e.at)) +
          "</div>" +
          '<div class="sl-actor">' +
          esc(e.actor || "—") +
          "</div>" +
          '<div class="sl-summary">' +
          esc(e.summary || "") +
          "</div>" +
          '<div class="sl-desk">Desk: ' +
          esc(e.deskChanges || "—") +
          "</div>" +
          lesson +
          "</li>"
        );
      })
      .join("");
    return (
      '<section class="session-log" aria-label="' +
      esc(title) +
      '">' +
      '<h2 class="session-log-title">' +
      esc(title) +
      "</h2>" +
      '<p class="session-log-help">' +
      esc(help) +
      "</p>" +
      "<ol>" +
      items +
      "</ol>" +
      "</section>"
    );
  };

  /** Fetch session-log JSON and return a Promise of parsed data. */
  EH.loadSessionLog = function loadSessionLog(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("session-log HTTP " + r.status);
      return r.json();
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
