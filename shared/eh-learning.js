/*! Elephant Harbor — Learning desk shared renderer (V0)
 * Canonical area file: { areaId, areaName, lastUpdated, schemaVersion, items[] }
 * Hard rule: items missing requiredBehavioralChange are not rendered.
 */
(function () {
  "use strict";
  window.EH = window.EH || {};

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
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return esc(raw);
    }
  }

  function fmtWindow(win) {
    if (!win || (!win.start && !win.end)) return "—";
    return fmtDate(win.start) + " → " + fmtDate(win.end);
  }

  function normalizeDoc(doc) {
    if (!doc || typeof doc !== "object") {
      return { items: [], emptyReason: "No lessons published." };
    }
    if (Array.isArray(doc)) {
      return { items: doc, emptyReason: null };
    }
    var items = doc.items || doc.lessons || [];
    if (!Array.isArray(items)) items = [];
    return {
      areaId: doc.areaId,
      areaName: doc.areaName,
      lastUpdated: doc.lastUpdated,
      schemaVersion: doc.schemaVersion,
      items: items,
      emptyReason: doc.emptyReason || doc.emptyWhy || null,
    };
  }

  function hasRequiredChange(item) {
    return Boolean(String(item.requiredBehavioralChange || "").trim());
  }

  var SEGMENT_LABELS = {
    capital: "Capital",
    presence: "Presence",
    foundry: "Foundry",
    local: "Local",
    eats: "Eats",
    reach: "Harbor Reach",
    portfolio: "Portfolio",
    cross: "Cross",
  };

  var STATUS_CLASS = {
    candidate: "lrn-status-candidate",
    testing: "lrn-status-testing",
    confirmed: "lrn-status-confirmed",
    institutionalized: "lrn-status-institutionalized",
    weakening: "lrn-status-weakening",
    superseded: "lrn-status-superseded",
    rejected: "lrn-status-rejected",
  };

  function normSegment(raw) {
    var s = String(raw || "").trim().toLowerCase();
    if (!s) return "";
    if (SEGMENT_LABELS[s]) return s;
    if (s.indexOf("capital") >= 0) return "capital";
    if (s.indexOf("presence") >= 0) return "presence";
    if (s.indexOf("foundry") >= 0) return "foundry";
    if (s.indexOf("local") >= 0) return "local";
    if (s.indexOf("portfolio") >= 0) return "portfolio";
    if (s.indexOf("cross") >= 0) return "cross";
    return "";
  }

  function normStatus(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function metaRow(label, value) {
    if (value == null || value === "") return "";
    return (
      "<div><dt>" +
      esc(label) +
      "</dt><dd>" +
      esc(value) +
      "</dd></div>"
    );
  }

  function cardHtml(item) {
    if (!hasRequiredChange(item)) return "";

    var seg = normSegment(item.segment);
    var statusKey = normStatus(item.status);
    var statusClass = STATUS_CLASS[statusKey] || "lrn-status-other";
    var accentClass = seg ? "lrn-accent-segment-" + seg : "";
    var segLabel = SEGMENT_LABELS[seg] || item.segment || "—";

    var notion = item.notionUrl
      ? '<a class="lrn-link" href="' +
        esc(item.notionUrl) +
        '" target="_blank" rel="noopener noreferrer">Notion record</a>'
      : "";

    return (
      '<details class="lrn-card ' +
      accentClass +
      '"' +
      (seg ? ' data-segment="' + esc(seg) + '"' : "") +
      ' data-lesson-id="' +
      esc(item.id || "") +
      '">' +
      '<summary class="lrn-summary">' +
      '<span class="lrn-title">' +
      esc(item.title || "Untitled lesson") +
      "</span>" +
      '<span class="lrn-pill lrn-status ' +
      statusClass +
      '">' +
      esc(item.status || "—") +
      "</span>" +
      '<span class="lrn-pill lrn-segment">' +
      esc(segLabel) +
      "</span>" +
      '<span class="lrn-owner">' +
      esc(item.owner || "—") +
      "</span>" +
      '<span class="lrn-change">' +
      esc(item.requiredBehavioralChange) +
      "</span>" +
      '<span class="lrn-review">Review ' +
      esc(fmtDate(item.reviewDate)) +
      "</span>" +
      '<span class="lrn-primitive">' +
      esc(item.durablePrimitive || "—") +
      "</span>" +
      "</summary>" +
      '<div class="lrn-body">' +
      '<dl class="lrn-meta">' +
      metaRow("Scope", item.scope) +
      metaRow("Observation", item.observation) +
      metaRow("Evidence", item.evidence) +
      metaRow("Evidence window", fmtWindow(item.evidenceWindow)) +
      metaRow("Hypothesis", item.hypothesis) +
      metaRow("Confidence", item.confidence) +
      metaRow("Test method", item.testMethod) +
      metaRow("Metrics", item.metrics) +
      metaRow("Last validated", fmtDate(item.lastValidated)) +
      metaRow("Opened", fmtDate(item.openedAt)) +
      metaRow("Sample note", item.sampleNote) +
      metaRow("Outcome", item.outcome) +
      "</dl>" +
      (notion ? '<div class="lrn-foot">' + notion + "</div>" : "") +
      "</div>" +
      "</details>"
    );
  }

  function renderableItems(items) {
    return (items || []).filter(hasRequiredChange);
  }

  window.EH.renderLearning = function (docOrItems, opts) {
    opts = opts || {};
    var doc = normalizeDoc(docOrItems);
    var title = opts.title || "Learning";
    var items = renderableItems(doc.items);
    var why =
      opts.emptyWhy ||
      doc.emptyReason ||
      "No lessons with required behavioral change published yet.";
    var body;
    if (!items.length) {
      var emptyTitle = opts.emptyTitle || "No lessons";
      body =
        '<div class="empty"><strong>' +
        esc(emptyTitle) +
        "</strong> " +
        esc(why) +
        "</div>";
    } else {
      body =
        '<div class="lrn-stack">' + items.map(cardHtml).join("") + "</div>";
    }
    return (
      '<section class="learning-desk">' +
      '<h2 class="section-title">' +
      esc(title) +
      (items.length ? ' <span class="muted">' + items.length + "</span>" : "") +
      "</h2>" +
      '<p class="section-help">Structured lessons with mandatory behavioral change. Expand a card for evidence, test method, and outcome. Status changes update here same turn.</p>' +
      body +
      "</section>"
    );
  };

  window.EH.loadLearning = function (url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  };

  window.EH.mountLearning = function (el, url, opts) {
    if (!el) return Promise.resolve();
    el.innerHTML = '<p class="muted">Loading learning…</p>';
    return window.EH.loadLearning(url)
      .then(function (doc) {
        el.outerHTML = window.EH.renderLearning(doc, opts);
      })
      .catch(function () {
        el.outerHTML = window.EH.renderLearning(
          { items: [], emptyReason: "Could not load learning feed." },
          opts
        );
      });
  };

  window.EH.aggregateLearning = function (docs, opts) {
    opts = opts || {};
    var items = [];
    docs.forEach(function (raw) {
      var d = normalizeDoc(raw);
      (d.items || []).forEach(function (item) {
        items.push(item);
      });
    });
    items.sort(function (a, b) {
      return String(b.openedAt || "").localeCompare(String(a.openedAt || ""));
    });
    return window.EH.renderLearning(
      {
        items: items,
        emptyReason:
          opts.emptyWhy ||
          "No lessons across Capital, Presence, Foundry, Local, or Eats.",
      },
      { title: opts.title || "Learning (portfolio)" }
    );
  };
})();
