/*! Elephant Harbor — Active Ventures shared renderer (V1)
 * Canonical area file: { areaId, areaName, lastUpdated, items[], emptyReason }
 * Aliases accepted: ventures↔items, emptyWhy↔emptyReason, detailUrl↔detailLink
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

  function fmtWhen(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch (_) {
      return esc(iso);
    }
  }

  function normalizeDoc(doc) {
    if (!doc || typeof doc !== "object") {
      return { items: [], emptyReason: "No active ventures published." };
    }
    if (Array.isArray(doc)) {
      return { items: doc, emptyReason: null };
    }
    var items = doc.items || doc.ventures || [];
    if (!Array.isArray(items)) items = [];
    return {
      areaId: doc.areaId,
      areaName: doc.areaName,
      lastUpdated: doc.lastUpdated,
      items: items,
      emptyReason: doc.emptyReason || doc.emptyWhy || null,
    };
  }

  function detailHref(v) {
    return v.detailLink || v.detailUrl || "";
  }

  function cardHtml(v) {
    var href = detailHref(v);
    var link = href
      ? '<a class="av-link" href="' +
        esc(href) +
        '" target="_blank" rel="noopener noreferrer">Open detail</a>'
      : "";
    var sub = [v.segment, v.submarket].filter(Boolean).join(" · ");
    return (
      '<article class="av-card">' +
      '<div class="av-head">' +
      "<h3>" +
      esc(v.title || "Untitled venture") +
      "</h3>" +
      '<span class="av-status">' +
      esc(v.status || "—") +
      "</span>" +
      "</div>" +
      (sub ? '<p class="av-sub">' + esc(sub) + "</p>" : "") +
      '<p class="av-desc">' +
      esc(v.description || "") +
      "</p>" +
      '<dl class="av-meta">' +
      "<div><dt>Owner</dt><dd>" +
      esc(v.owner || "—") +
      "</dd></div>" +
      "<div><dt>Started</dt><dd>" +
      esc(v.startDate || "—") +
      "</dd></div>" +
      "<div><dt>Exposure</dt><dd>" +
      esc(v.exposure || "—") +
      "</dd></div>" +
      "<div><dt>Performance</dt><dd>" +
      esc(v.performance || "—") +
      "</dd></div>" +
      "<div class=\"av-span\"><dt>Next milestone</dt><dd>" +
      esc(v.nextMilestone || "—") +
      "</dd></div>" +
      "</dl>" +
      '<div class="av-foot">' +
      link +
      '<span class="av-updated">Updated ' +
      esc(fmtWhen(v.lastUpdated)) +
      "</span>" +
      "</div>" +
      "</article>"
    );
  }

  window.EH.renderActiveVentures = function (docOrItems, opts) {
    opts = opts || {};
    var doc = normalizeDoc(docOrItems);
    var title = opts.title || "Active ventures";
    var items = doc.items || [];
    var why =
      opts.emptyWhy ||
      doc.emptyReason ||
      "Nothing material is in motion here right now.";
    var body;
    if (!items.length) {
      var emptyTitle = opts.emptyTitle || "No active ventures";
      body =
        '<div class="empty"><strong>' +
        esc(emptyTitle) +
        "</strong>" +
        esc(why) +
        "</div>";
    } else {
      body =
        '<div class="av-stack">' + items.map(cardHtml).join("") + "</div>";
    }
    return (
      '<section class="active-ventures">' +
      '<h2 class="section-title">' +
      esc(title) +
      (items.length ? ' <span class="muted">' + items.length + "</span>" : "") +
      "</h2>" +
      '<p class="section-help">Material work intended to create or validate economic value. Active only.</p>' +
      body +
      "</section>"
    );
  };

  window.EH.loadActiveVentures = function (url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  };

  window.EH.mountActiveVentures = function (el, url, opts) {
    if (!el) return Promise.resolve();
    el.innerHTML = '<p class="muted">Loading active ventures…</p>';
    return window.EH.loadActiveVentures(url)
      .then(function (doc) {
        el.outerHTML = window.EH.renderActiveVentures(doc, opts);
      })
      .catch(function () {
        el.outerHTML = window.EH.renderActiveVentures(
          { items: [], emptyReason: "Could not load active ventures feed." },
          opts
        );
      });
  };

  window.EH.aggregateActiveVentures = function (docs, opts) {
    opts = opts || {};
    var items = [];
    docs.forEach(function (raw) {
      var d = normalizeDoc(raw);
      (d.items || []).forEach(function (v) {
        items.push(v);
      });
    });
    items.sort(function (a, b) {
      return String(b.lastUpdated || "").localeCompare(String(a.lastUpdated || ""));
    });
    return window.EH.renderActiveVentures(
      {
        items: items,
        emptyReason:
          opts.emptyWhy ||
          "No active ventures across Capital, Presence, Foundry, or Local.",
      },
      { title: opts.title || "Active ventures (portfolio)" }
    );
  };
})();
