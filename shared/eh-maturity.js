/*! Elephant Harbor — Portfolio Maturity desk (V1)
 * Canonical: data/maturity/SEGMENT_MATURITY.json, EXPERIMENT_REGISTRY.json
 * CEOs = business truth; Wells = chrome + freshness alarms; Hayes = aggregate usefulness.
 */
(function () {
  "use strict";
  window.EH = window.EH || {};

  var STALE_TILE_THRESHOLD_DAYS = 2;
  var TZ = "America/Chicago";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDate(raw) {
    if (!raw) return "—";
    try {
      var d = new Date(raw.length === 10 ? raw + "T12:00:00" : raw);
      return d.toLocaleDateString("en-US", {
        timeZone: TZ,
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return esc(raw);
    }
  }

  function chicagoMidnightUtc(d) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    var parts = fmt.formatToParts(d);
    var y = 0;
    var m = 0;
    var day = 0;
    parts.forEach(function (p) {
      if (p.type === "year") y = +p.value;
      if (p.type === "month") m = +p.value - 1;
      if (p.type === "day") day = +p.value;
    });
    return Date.UTC(y, m, day);
  }

  /** Calendar days between lastUpdated (Chicago) and reference instant (default now). */
  window.EH.calendarDaysSinceUpdate = function (iso, refDate) {
    if (!iso) return null;
    try {
      var ref = refDate || new Date();
      var delta = chicagoMidnightUtc(ref) - chicagoMidnightUtc(new Date(iso));
      return Math.floor(delta / 86400000);
    } catch (_) {
      return null;
    }
  };

  window.EH.STALE_TILE_THRESHOLD_DAYS = STALE_TILE_THRESHOLD_DAYS;

  window.EH.isTileStale = function (lastUpdatedIso, thresholdDays, refDate) {
    var th = thresholdDays == null ? STALE_TILE_THRESHOLD_DAYS : thresholdDays;
    var days = window.EH.calendarDaysSinceUpdate(lastUpdatedIso, refDate);
    if (days == null) return false;
    return days >= th;
  };

  function stageSlug(stage) {
    return String(stage || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  var SEGMENT_LABELS = {
    capital: "Capital",
    presence: "Presence",
    foundry: "Foundry",
    local: "Local",
    eats: "Eats",
    reach: "Reach",
    gaming: "Gaming",
    systems: "Systems",
  };

  var EXP_STATUS_CLASS = {
    running: "mat-exp-running",
    complete: "mat-exp-complete",
    paused: "mat-exp-paused",
    killed: "mat-exp-killed",
    forming: "mat-exp-forming",
  };

  function normStatus(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase();
  }

  function truncate(s, max) {
    var t = String(s || "").trim();
    if (!max || t.length <= max) return t;
    return t.slice(0, max - 1).trim() + "…";
  }

  window.EH.findSegment = function (maturityDoc, segmentId) {
    if (!maturityDoc || !segmentId) return null;
    var id = String(segmentId).trim().toLowerCase();
    var list = maturityDoc.segments || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id || "").toLowerCase() === id) return list[i];
    }
    return null;
  };

  window.EH.renderMaturityStrip = function (segmentRow, opts) {
    opts = opts || {};
    if (!segmentRow) {
      return (
        '<div class="mat-strip mat-strip-empty">' +
        '<span class="muted">Maturity not published for this segment.</span></div>'
      );
    }
    var slug = stageSlug(segmentRow.stage);
    var segId = String(segmentRow.id || "").toLowerCase();
    return (
      '<div class="mat-strip" data-segment="' +
      esc(segId) +
      '">' +
      '<span class="mat-strip-label">Maturity</span>' +
      '<span class="mat-stage-chip mat-stage-' +
      esc(slug) +
      '">' +
      esc(segmentRow.stage || "—") +
      "</span>" +
      '<span class="mat-next">' +
      '<span class="mat-next-k">Next</span> ' +
      esc(segmentRow.nextMilestone || "—") +
      "</span>" +
      "</div>"
    );
  };

  window.EH.renderStaleBadge = function (lastUpdatedIso, opts) {
    opts = opts || {};
    if (!window.EH.isTileStale(lastUpdatedIso, opts.thresholdDays, opts.refDate)) {
      return "";
    }
    var days = window.EH.calendarDaysSinceUpdate(lastUpdatedIso, opts.refDate);
    var label = opts.label || "Stale";
    var title =
      "Segment summary lastUpdated is " +
      (days != null ? days + "+ calendar day(s)" : "≥ threshold") +
      " old (America/Chicago, threshold ≥ " +
      (opts.thresholdDays != null ? opts.thresholdDays : STALE_TILE_THRESHOLD_DAYS) +
      " days). Verify desk truth before acting on chips.";
    return (
      '<span class="mat-stale-badge" title="' +
      esc(title) +
      '">' +
      esc(label) +
      "</span>"
    );
  };

  function rollupCard(seg) {
    var slug = stageSlug(seg.stage);
    var segId = String(seg.id || "").toLowerCase();
    return (
      '<article class="mat-rollup-card" data-segment="' +
      esc(segId) +
      '">' +
      '<div class="mat-rollup-head">' +
      '<span class="mat-rollup-name">' +
      esc(seg.name || SEGMENT_LABELS[segId] || segId) +
      "</span>" +
      '<span class="mat-stage-chip mat-stage-' +
      esc(slug) +
      '">' +
      esc(seg.stage || "—") +
      "</span>" +
      "</div>" +
      '<p class="mat-rollup-next">' +
      esc(seg.nextMilestone || "—") +
      "</p>" +
      (seg.ownerCeo
        ? '<p class="mat-rollup-meta">CEO ' + esc(seg.ownerCeo) + "</p>"
        : "") +
      "</article>"
    );
  }

  window.EH.renderMaturityRollup = function (maturityDoc, opts) {
    opts = opts || {};
    if (!maturityDoc || !maturityDoc.segments) {
      return (
        '<section class="maturity-rollup"><h2 class="section-title">Portfolio maturity</h2>' +
        '<div class="empty"><strong>Not loaded</strong> Could not read SEGMENT_MATURITY.json.</div></section>'
      );
    }
    var segs = maturityDoc.segments.slice();
    var reviewed = maturityDoc.lastReviewedPortfolio || maturityDoc.lastReviewed;
    return (
      '<section class="maturity-rollup">' +
      '<h2 class="section-title">' +
      esc(opts.title || "Portfolio maturity") +
      "</h2>" +
      '<p class="section-help">Organisational stage and next milestone per segment (Hayes aggregate). Business truth owned by segment CEOs; last portfolio review ' +
      esc(fmtDate(reviewed)) +
      " CT.</p>" +
      '<div class="mat-rollup-grid">' +
      segs.map(rollupCard).join("") +
      "</div>" +
      "</section>"
    );
  };

  function experimentRow(exp) {
    var seg = String(exp.segment || "").toLowerCase();
    var statusKey = normStatus(exp.status);
    var statusClass = EXP_STATUS_CLASS[statusKey] || "mat-exp-other";
    var result =
      exp.result == null || exp.result === "" ? "—" : String(exp.result);
    var hypo = truncate(exp.hypothesis, 140);
    var behavior =
      exp.behaviorChange != null && String(exp.behaviorChange).trim()
        ? truncate(exp.behaviorChange, 100)
        : "";
    return (
      "<tr data-segment=\"" +
      esc(seg) +
      "\" data-exp-id=\"" +
      esc(exp.id || "") +
      "\">" +
      "<td><span class=\"mat-exp-seg mat-seg-" +
      esc(seg) +
      "\">" +
      esc(SEGMENT_LABELS[seg] || exp.segment || "—") +
      "</span></td>" +
      "<td class=\"mat-exp-title\">" +
      esc(truncate(exp.experiment, 120)) +
      "</td>" +
      "<td><span class=\"mat-exp-status " +
      statusClass +
      "\">" +
      esc(exp.status || "—") +
      "</span></td>" +
      "<td>" +
      esc(exp.owner || "—") +
      "</td>" +
      "<td>" +
      esc(fmtDate(exp.startDate)) +
      "</td>" +
      "<td class=\"mat-exp-hypo\">" +
      esc(hypo) +
      "</td>" +
      "<td>" +
      esc(result) +
      "</td>" +
      (behavior
        ? "<td class=\"mat-exp-behavior\">" + esc(behavior) + "</td>"
        : "<td class=\"mat-exp-behavior muted\">—</td>") +
      "</tr>"
    );
  }

  window.EH.renderExperimentRegistry = function (registryDoc, opts) {
    opts = opts || {};
    if (!registryDoc) {
      return (
        '<section class="experiment-registry"><h2 class="section-title">Material experiments</h2>' +
        '<div class="empty"><strong>Not loaded</strong> Could not read EXPERIMENT_REGISTRY.json.</div></section>'
      );
    }
    var exps = registryDoc.experiments || [];
    var omitted = registryDoc.omittedOrForming || [];
    var footnotes = omitted
      .map(function (o) {
        return (
          "<li><span class=\"mat-omitted-seg\">" +
          esc(SEGMENT_LABELS[o.segment] || o.segment || "—") +
          "</span> — " +
          esc(o.note || "") +
          "</li>"
        );
      })
      .join("");
    return (
      '<section class="experiment-registry">' +
      '<h2 class="section-title">' +
      esc(opts.title || "Material experiments") +
      (exps.length ? ' <span class="muted">' + exps.length + "</span>" : "") +
      "</h2>" +
      '<p class="section-help">Running portfolio experiments only — results stay null until CEOs publish evidence. Reviewed ' +
      esc(fmtDate(registryDoc.lastReviewed)) +
      " CT.</p>" +
      '<div class="mat-exp-table-wrap">' +
      '<table class="mat-exp-table">' +
      "<thead><tr>" +
      "<th>Segment</th><th>Experiment</th><th>Status</th><th>Owner</th><th>Start</th><th>Hypothesis</th><th>Result</th><th>Behavior change</th>" +
      "</tr></thead>" +
      "<tbody>" +
      exps.map(experimentRow).join("") +
      "</tbody></table></div>" +
      (footnotes
        ? '<div class="mat-omitted"><p class="mat-omitted-title">Omitted or forming</p><ul class="mat-omitted-list">' +
          footnotes +
          "</ul></div>"
        : "") +
      "</section>"
    );
  };

  window.EH.loadMaturity = function (url) {
    return fetch(url || "data/maturity/SEGMENT_MATURITY.json", {
      cache: "no-store",
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  };

  window.EH.loadExperimentRegistry = function (url) {
    return fetch(url || "data/maturity/EXPERIMENT_REGISTRY.json", {
      cache: "no-store",
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  };

  window.EH.mountMaturityStrip = function (el, segmentId, opts) {
    opts = opts || {};
    if (!el) return Promise.resolve();
    var url = opts.maturityUrl || "data/maturity/SEGMENT_MATURITY.json";
    el.innerHTML = '<span class="muted">Loading maturity…</span>';
    return window.EH.loadMaturity(url)
      .then(function (doc) {
        var seg = window.EH.findSegment(doc, segmentId);
        el.innerHTML = window.EH.renderMaturityStrip(seg, opts);
      })
      .catch(function () {
        el.innerHTML =
          '<div class="mat-strip mat-strip-empty"><span class="muted">Maturity unavailable.</span></div>';
      });
  };
})();
