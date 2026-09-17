/*! Elephant Harbor — Desk grid / query primitive (OS v2 console §6)
 * Framework-free helper for sortable, filterable, paginated desk tables.
 * Hard rule: one resolved query drives rows, filtered count, pagination, and
 * active filters together — never flash a stale count while loading.
 *
 * Contract: docs/DESK-GRID.md
 */
(function () {
  "use strict";
  window.EH = window.EH || {};
  window.EH.DeskGrid = window.EH.DeskGrid || {};

  var DG = window.EH.DeskGrid;

  var RESERVED = { page: 1, pageSize: 1, sort: 1, dir: 1 };

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clampInt(n, min, max) {
    var v = parseInt(n, 10);
    if (isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  }

  function normDir(raw) {
    var d = String(raw || "asc").toLowerCase();
    return d === "desc" ? "desc" : "asc";
  }

  function cloneQuery(q) {
    return {
      page: q.page,
      pageSize: q.pageSize,
      sort: q.sort,
      dir: q.dir,
      filters: Object.assign({}, q.filters || {}),
    };
  }

  function mergeDefaults(partial, defaults) {
    var d = defaults || {};
    var filters = Object.assign({}, d.filters || {}, partial.filters || {});
    return {
      page: partial.page != null ? partial.page : d.page != null ? d.page : 1,
      pageSize:
        partial.pageSize != null
          ? partial.pageSize
          : d.pageSize != null
            ? d.pageSize
            : 25,
      sort: partial.sort != null ? partial.sort : d.sort != null ? d.sort : "",
      dir: normDir(partial.dir != null ? partial.dir : d.dir),
      filters: filters,
    };
  }

  /** Human-readable date (America/Chicago). IDs stay secondary in host row HTML. */
  DG.fmtDate = function fmtDate(raw) {
    if (!raw) return "—";
    try {
      var s = String(raw);
      var d =
        s.length === 10
          ? new Date(s + "T12:00:00-06:00")
          : new Date(s);
      if (isNaN(d.getTime())) return esc(s);
      return d.toLocaleDateString("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return esc(raw);
    }
  };

  DG.fmtDateTime = function fmtDateTime(raw) {
    if (!raw) return "—";
    try {
      var d = new Date(raw);
      if (isNaN(d.getTime())) return esc(String(raw));
      return d.toLocaleString("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch (_) {
      return esc(raw);
    }
  };

  /**
   * Create a URL-backed query controller.
   * @param {object} opts
   * @param {object} opts.defaults — page, pageSize, sort, dir, filters{}
   * @param {string[]} [opts.filterKeys] — known filter param names (others ignored on parse)
   * @param {boolean} [opts.useHash=false] — persist in location.hash instead of search
   * @param {boolean} [opts.replace=false] — use replaceState vs pushState on write
   */
  DG.createQuery = function createQuery(opts) {
    opts = opts || {};
    var defaults = mergeDefaults({}, opts.defaults || {});
    var filterKeys = opts.filterKeys || null;
    var useHash = Boolean(opts.useHash);
    var replaceDefault = Boolean(opts.replace);

    function parseParams(searchOrHash) {
      var raw = String(searchOrHash || "");
      if (raw.charAt(0) === "?") raw = raw.slice(1);
      if (raw.charAt(0) === "#") raw = raw.slice(1);
      var sp = new URLSearchParams(raw);
      var partial = { filters: {} };
      sp.forEach(function (val, key) {
        if (RESERVED[key]) {
          partial[key] = val;
        } else if (!filterKeys || filterKeys.indexOf(key) >= 0) {
          if (val !== "") partial.filters[key] = val;
        }
      });
      return mergeDefaults(partial, defaults);
    }

    function readFromLocation() {
      var src = useHash ? location.hash : location.search;
      return parseParams(src);
    }

    function serialize(query) {
      var q = mergeDefaults(query || {}, defaults);
      var sp = new URLSearchParams();
      if (q.page && q.page !== defaults.page) sp.set("page", String(q.page));
      if (q.pageSize && q.pageSize !== defaults.pageSize)
        sp.set("pageSize", String(q.pageSize));
      if (q.sort && q.sort !== defaults.sort) sp.set("sort", q.sort);
      if (q.dir && q.dir !== defaults.dir) sp.set("dir", q.dir);
      Object.keys(q.filters || {}).sort().forEach(function (k) {
        var v = q.filters[k];
        if (v != null && v !== "") sp.set(k, String(v));
      });
      var s = sp.toString();
      return s ? (useHash ? "#" + s : "?" + s) : useHash ? "" : "";
    }

    function write(query, writeOpts) {
      writeOpts = writeOpts || {};
      var q = mergeDefaults(query || {}, defaults);
      var serialized = serialize(q);
      var base = location.pathname + location.search.split("?")[0];
      var nextUrl;
      if (useHash) {
        nextUrl = base + (location.search || "") + serialized;
      } else {
        nextUrl = base + serialized + (location.hash || "");
      }
      var method = writeOpts.replace != null ? writeOpts.replace : replaceDefault;
      if (method) {
        history.replaceState({ ehDeskQuery: q }, "", nextUrl);
      } else {
        history.pushState({ ehDeskQuery: q }, "", nextUrl);
      }
      return q;
    }

    function patch(delta, writeOpts) {
      var cur = readFromLocation();
      var next = mergeDefaults(
        {
          page: delta.page != null ? delta.page : cur.page,
          pageSize: delta.pageSize != null ? delta.pageSize : cur.pageSize,
          sort: delta.sort != null ? delta.sort : cur.sort,
          dir: delta.dir != null ? delta.dir : cur.dir,
          filters: Object.assign({}, cur.filters, delta.filters || {}),
        },
        defaults
      );
      if (delta.clearFilters) next.filters = Object.assign({}, defaults.filters || {});
      return write(next, writeOpts);
    }

    return {
      defaults: cloneQuery(defaults),
      parse: parseParams,
      read: readFromLocation,
      serialize: serialize,
      write: write,
      patch: patch,
      useHash: useHash,
    };
  };

  /**
   * Resolve one query against row data — single source of truth for the grid.
   * @returns {{ rows, total, filteredTotal, page, pageSize, totalPages, query, status }}
   */
  DG.resolve = function resolve(opts) {
    opts = opts || {};
    var rowsIn = opts.rows;
    if (!Array.isArray(rowsIn)) rowsIn = [];
    var query = mergeDefaults(opts.query || {}, opts.defaults || {});
    var pageSize = clampInt(
      opts.pageSize != null ? opts.pageSize : query.pageSize,
      1,
      500
    );
    query.pageSize = pageSize;

    var total = rowsIn.length;
    var filtered = rowsIn;
    if (typeof opts.filterFn === "function") {
      filtered = rowsIn.filter(function (row) {
        return opts.filterFn(row, query);
      });
    }
    var filteredTotal = filtered.length;

    if (typeof opts.sortFn === "function") {
      filtered = filtered.slice().sort(function (a, b) {
        return opts.sortFn(a, b, query);
      });
    } else if (query.sort) {
      var key = query.sort;
      var dir = query.dir === "desc" ? -1 : 1;
      filtered = filtered.slice().sort(function (a, b) {
        var av = a != null ? a[key] : "";
        var bv = b != null ? b[key] : "";
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number")
          return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    var totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize) || 1);
    var page = clampInt(query.page, 1, totalPages);
    query.page = page;

    var start = (page - 1) * pageSize;
    var pageRows = filtered.slice(start, start + pageSize);

    return {
      rows: pageRows,
      total: total,
      filteredTotal: filteredTotal,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
      query: query,
      status: opts.status === "loading" ? "loading" : "ready",
    };
  };

  /** Loading shell — never includes a numeric count. */
  DG.renderLoading = function renderLoading(opts) {
    opts = opts || {};
    var label = opts.label || "Loading…";
    return (
      '<div class="eh-desk-grid__state eh-desk-grid__loading" role="status" aria-live="polite">' +
      '<span class="eh-desk-grid__spinner" aria-hidden="true"></span>' +
      esc(label) +
      "</div>"
    );
  };

  /**
   * Empty state after query resolved — may include filtered/total when status is ready.
   */
  DG.renderEmpty = function renderEmpty(result, opts) {
    opts = opts || {};
    result = result || {};
    var title = opts.title || "Nothing here";
    var why =
      opts.why ||
      (result.query &&
      Object.keys(result.query.filters || {}).some(function (k) {
        return result.query.filters[k];
      })
        ? "No rows match the current filters."
        : "No rows published yet.");
    var countHtml = "";
    if (result.status === "ready" && result.filteredTotal === 0) {
      countHtml =
        '<p class="eh-desk-grid__count eh-desk-grid__count--empty" aria-live="polite">' +
        esc(DG.formatCounter(result)) +
        "</p>";
    }
    return (
      '<div class="eh-desk-grid__state eh-desk-grid__empty">' +
      "<strong>" +
      esc(title) +
      "</strong> " +
      esc(why) +
      countHtml +
      "</div>"
    );
  };

  /** Counter text — returns empty string unless status === 'ready'. */
  DG.formatCounter = function formatCounter(result, opts) {
    opts = opts || {};
    if (!result || result.status !== "ready") return "";
    var ft = result.filteredTotal;
    var total = result.total;
    if (ft === total) {
      return ft === 1 ? "1 row" : ft + " rows";
    }
    return ft + " of " + total + " rows";
  };

  DG.renderCounter = function renderCounter(result, opts) {
    opts = opts || {};
    var text = DG.formatCounter(result, opts);
    if (!text) {
      return (
        '<span class="eh-desk-grid__count eh-desk-grid__count--pending" aria-busy="true">' +
        esc(opts.pendingLabel || "…") +
        "</span>"
      );
    }
    var pageNote = "";
    if (result.totalPages > 1) {
      pageNote =
        ' · page <span class="eh-desk-grid__count-page">' +
        esc(result.page) +
        "</span> of " +
        esc(result.totalPages);
    }
    return (
      '<span class="eh-desk-grid__count" aria-live="polite">' +
      esc(text) +
      pageNote +
      "</span>"
    );
  };

  DG.renderPagination = function renderPagination(result, opts) {
    opts = opts || {};
    if (!result || result.status !== "ready") return "";
    if (result.totalPages <= 1) return "";

    var id = opts.id || "eh-desk-grid-pager";
    var prevDisabled = result.page <= 1;
    var nextDisabled = result.page >= result.totalPages;

    return (
      '<nav class="eh-desk-grid__pager" aria-label="' +
      esc(opts.label || "Pagination") +
      '">' +
      '<button type="button" class="eh-desk-grid__page-btn" data-dg-page="prev"' +
      (prevDisabled ? ' disabled aria-disabled="true"' : "") +
      ">Previous</button>" +
      '<span class="eh-desk-grid__page-status" id="' +
      esc(id) +
      '-status">Page ' +
      esc(result.page) +
      " of " +
      esc(result.totalPages) +
      "</span>" +
      '<button type="button" class="eh-desk-grid__page-btn" data-dg-page="next"' +
      (nextDisabled ? ' disabled aria-disabled="true"' : "") +
      ">Next</button>" +
      "</nav>"
    );
  };

  DG.renderSortHeader = function renderSortHeader(col, result, opts) {
    opts = opts || {};
    col = col || {};
    var key = col.key || col.id || "";
    var label = col.label || key;
    if (!col.sortable) {
      return "<th scope=\"col\">" + esc(label) + "</th>";
    }
    var active = result && result.query && result.query.sort === key;
    var dir = active && result.query.dir === "desc" ? "descending" : active ? "ascending" : "none";
    var indicator = active ? (result.query.dir === "desc" ? " ▼" : " ▲") : "";
    return (
      '<th scope="col">' +
      '<button type="button" class="eh-desk-grid__sort" data-dg-sort="' +
      esc(key) +
      '" aria-sort="' +
      dir +
      '">' +
      esc(label) +
      '<span class="eh-desk-grid__sort-indicator" aria-hidden="true">' +
      esc(indicator) +
      "</span>" +
      "</button>" +
      "</th>"
    );
  };

  /**
   * Lightweight table chrome. Host supplies row HTML via renderRows or tbodyHtml.
   */
  DG.renderShell = function renderShell(opts) {
    opts = opts || {};
    var id = opts.id || "eh-desk-grid";
    var title = opts.title || "";
    var columns = opts.columns || [];
    var result = opts.result || { status: "loading", query: {} };
    var toolbar = opts.toolbarHtml || "";
    var tbody =
      opts.tbodyHtml != null
        ? opts.tbodyHtml
        : result.status === "loading"
          ? '<tr><td colspan="' +
            Math.max(columns.length, 1) +
            '">' +
            DG.renderLoading({ label: opts.loadingLabel }) +
            "</td></tr>"
          : result.filteredTotal === 0
            ? '<tr><td colspan="' +
              Math.max(columns.length, 1) +
              '">' +
              DG.renderEmpty(result, opts.empty) +
              "</td></tr>"
            : "";

    var head =
      columns.length > 0
        ? "<thead><tr>" +
          columns
            .map(function (c) {
              return DG.renderSortHeader(c, result, opts);
            })
            .join("") +
          "</tr></thead>"
        : "";

    var counter = DG.renderCounter(result, opts.counter);
    var pager = DG.renderPagination(result, { id: id + "-pager" });

    return (
      '<section class="eh-desk-grid" id="' +
      esc(id) +
      '" data-dg-status="' +
      esc(result.status || "loading") +
      '">' +
      (title
        ? '<h2 class="eh-desk-grid__title section-title">' + esc(title) + "</h2>"
        : "") +
      '<div class="eh-desk-grid__toolbar">' +
      '<div class="eh-desk-grid__toolbar-main">' +
      toolbar +
      "</div>" +
      counter +
      "</div>" +
      '<div class="eh-desk-grid__table-wrap">' +
      '<table class="eh-desk-grid__table">' +
      head +
      "<tbody>" +
      tbody +
      "</tbody>" +
      "</table>" +
      "</div>" +
      pager +
      "</section>"
    );
  };

  /**
   * Wire sort buttons and pagination inside a rendered shell.
   * @param {Element} root — .eh-desk-grid element
   * @param {object} queryCtrl — from createQuery()
   * @param {function} onChange — called with merged query after interaction
   */
  DG.bindChrome = function bindChrome(root, queryCtrl, onChange) {
    if (!root || !queryCtrl) return;
    root.addEventListener("click", function (ev) {
      var sortBtn = ev.target.closest("[data-dg-sort]");
      if (sortBtn) {
        ev.preventDefault();
        var key = sortBtn.getAttribute("data-dg-sort");
        var cur = queryCtrl.read();
        var dir = "asc";
        if (cur.sort === key) dir = cur.dir === "asc" ? "desc" : "asc";
        var next = queryCtrl.patch({ sort: key, dir: dir, page: 1 });
        if (typeof onChange === "function") onChange(next);
        return;
      }
      var pageBtn = ev.target.closest("[data-dg-page]");
      if (pageBtn && !pageBtn.disabled) {
        ev.preventDefault();
        var action = pageBtn.getAttribute("data-dg-page");
        var curPage = queryCtrl.read().page;
        var nextPage = action === "next" ? curPage + 1 : curPage - 1;
        var nextQ = queryCtrl.patch({ page: nextPage });
        if (typeof onChange === "function") onChange(nextQ);
      }
    });
  };

  /* —— Local Prospects exemplar mapping (host lives outside this repo) ——
   *
   * var queryCtrl = EH.DeskGrid.createQuery({
   *   defaults: { page: 1, pageSize: 25, sort: "lastTouch", dir: "desc", filters: {} },
   *   filterKeys: ["q", "status", "owner", "stage"],
   * });
   *
   * function loadProspects() {
   *   setGrid({ status: "loading" }); // counter shows … not a stale number
   *   return fetchProspects().then(function (rows) {
   *     var result = EH.DeskGrid.resolve({
   *       rows: rows,
   *       query: queryCtrl.read(),
   *       filterFn: function (row, q) {
   *         if (q.filters.status && row.status !== q.filters.status) return false;
   *         if (q.filters.owner && row.owner !== q.filters.owner) return false;
   *         if (q.filters.stage && row.stage !== q.filters.stage) return false;
   *         if (q.filters.q) {
   *           var needle = q.filters.q.toLowerCase();
   *           var hay = (row.name + " " + row.company).toLowerCase();
   *           if (hay.indexOf(needle) < 0) return false;
   *         }
   *         return true;
   *       },
   *       sortFn: function (a, b, q) {
   *         if (q.sort === "lastTouch") {
   *           return String(b.lastTouch || "").localeCompare(String(a.lastTouch || ""));
   *         }
   *         return 0;
   *       },
   *     });
   *     paintGrid(result);
   *   });
   * }
   *
   * window.addEventListener("popstate", function () { loadProspects(); });
   */
})();
