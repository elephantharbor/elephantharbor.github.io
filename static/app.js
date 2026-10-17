async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtWhen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function lessonHtml(lesson) {
  if (!lesson) return `<p class="block-body muted">No lesson published yet.</p>`;
  const learning = lesson.learning || "—";
  const change = lesson.change || "—";
  return `<p class="block-body">${escapeHtml(learning)}</p>
    <p class="meta">What changed: <span>${escapeHtml(change)}</span></p>`;
}

function actionsHtml(s) {
  const bits = [];
  if (s.dashboardState === "live" && s.dashboardUrl) {
    bits.push(`<a class="btn primary" href="${escapeHtml(s.dashboardUrl)}" rel="noopener">Open operating dashboard</a>`);
  } else {
    bits.push(`<span class="planned">Detailed operating dashboard: planned</span>`);
  }
  // Capital: direct entry to the Sports Predictions surface on the Capital desk (2026-10-10, Wells).
  if (s.segmentId === "capital" && s.dashboardState === "live" && s.dashboardUrl) {
    const base = String(s.dashboardUrl).replace(/#.*$/, "");
    bits.push(`<a class="btn ghost" href="${escapeHtml(base + "#sports-predictions")}" rel="noopener">Sports Predictions</a>`);
  }
  const links = Array.isArray(s.publicLinks) ? s.publicLinks : [];
  for (const link of links) {
    if (!link || !link.url) continue;
    bits.push(
      `<a class="btn ghost" href="${escapeHtml(link.url)}" rel="noopener">${escapeHtml(
        link.label || link.url
      )}</a>`
    );
  }
  return `<div class="actions">${bits.join("")}</div>`;
}

function maturityStripForSegment(maturityDoc, segmentId) {
  if (window.EH && EH.findSegment && EH.renderMaturityStrip) {
    return EH.renderMaturityStrip(EH.findSegment(maturityDoc, segmentId));
  }
  return "";
}

function tileStaleMeta(s, maturityDoc) {
  if (!window.EH || !EH.isTileStale) return { stale: false, badge: "" };
  const stale = EH.isTileStale(s.lastUpdated);
  let badge = stale && EH.renderStaleBadge ? EH.renderStaleBadge(s.lastUpdated) : "";
  if (maturityDoc && EH.findSegment && s.lastUpdated) {
    const mat = EH.findSegment(maturityDoc, s.segmentId);
    if (mat && mat.lastReviewed) {
      try {
        const tileTs = new Date(s.lastUpdated).getTime();
        const revTs = new Date(mat.lastReviewed + "T12:00:00-05:00").getTime();
        if (tileTs > revTs) {
          const gapDays = Math.floor((tileTs - revTs) / 86400000);
          if (gapDays >= 3) {
            badge =
              (badge || "") +
              ' <span class="mat-stale-badge mat-stale-secondary" title="Segment tile lastUpdated is newer than maturity lastReviewed — confirm maturity baseline.">Maturity lag</span>';
          }
        }
      } catch (_) {
        /* optional secondary signal */
      }
    }
  }
  return { stale, badge };
}

function tileHtml(s, maturityDoc) {
  const rawMetrics = s.headlineMetrics;
  const metricsList = Array.isArray(rawMetrics)
    ? rawMetrics
    : rawMetrics && typeof rawMetrics === "object"
      ? Object.entries(rawMetrics).map(([label, value]) => ({
          label,
          value: value == null ? "" : String(value),
        }))
      : [];
  const metrics = metricsList
    .map(
      (m) =>
        `<li title="${escapeHtml(m.hint || "")}"><span class="label">${escapeHtml(
          m.label
        )}</span><span class="value">${escapeHtml(m.value)}</span></li>`
    )
    .join("");
  const status = s.status || "—";
  const badgeClass = /wait|paused|action/i.test(status) ? "warn" : "operating";
  const { stale, badge: staleBadge } = tileStaleMeta(s, maturityDoc);
  const staleClass = stale ? " tile-stale" : "";
  const actionFlag =
    s.needsHumanAction && !stale
      ? `<p class="meta"><span>Action needed:</span> ${escapeHtml(s.humanAction || "Human decision required")}</p>`
      : s.needsHumanAction && stale
        ? `<p class="meta tile-stale-action"><span>Action noted (tile stale — verify before acting):</span> ${escapeHtml(
            s.humanAction || "Human decision required"
          )}</p>`
        : "";
  const matStrip = maturityStripForSegment(maturityDoc, s.segmentId);
  return `<article class="tile${staleClass}" id="${escapeHtml(s.segmentId)}" data-segment="${escapeHtml(s.segmentId)}"${
    stale ? ' data-tile-stale="true"' : ""
  }>
    <div class="tile-head">
      <div>
        <h2>${escapeHtml(s.segmentName)}</h2>
        <p class="mission">${escapeHtml(s.mission || s.description || "")}</p>
      </div>
      <span class="badge ${badgeClass}${stale ? " badge-stale-soft" : ""}">${escapeHtml(status)}</span>
    </div>
    ${matStrip}
    <p class="meta">Owner: <span>${escapeHtml(s.owner)}</span> · Updated <span>${escapeHtml(
    fmtWhen(s.lastUpdated)
  )}</span>${staleBadge ? ` · ${staleBadge}` : ""}</p>
    ${s.freshnessNote ? `<p class="meta"><span>${escapeHtml(s.freshnessNote)}</span></p>` : ""}
    <ul class="metrics">${metrics}</ul>
    <div>
      <p class="block-label">Current objective</p>
      <p class="block-body">${escapeHtml(s.currentObjective || "—")}</p>
    </div>
    <div>
      <p class="block-label">What is happening now</p>
      <p class="block-body">${escapeHtml(s.currentStatusBrief || "—")}</p>
    </div>
    <div>
      <p class="block-label">Latest lesson</p>
      ${lessonHtml(s.latestLesson)}
    </div>
    ${actionFlag}
    ${actionsHtml(s)}
  </article>`;
}

function renderAttention(segments, maturityDoc) {
  const el = document.getElementById("attention");
  const needs = segments.filter((s) => s.needsHumanAction);
  if (!needs.length) {
    el.className = "attention empty";
    el.textContent = "Nothing needs your attention right now.";
    return;
  }
  const anyStale = needs.some(
    (s) => window.EH && EH.isTileStale && EH.isTileStale(s.lastUpdated)
  );
  el.className = "attention hot" + (anyStale ? " attention-stale-soft" : "");
  el.innerHTML =
    (anyStale
      ? "<strong>Action noted</strong><p class=\"attention-stale-note\">One or more items below have stale segment tiles — confirm desk truth before acting.</p>"
      : "<strong>Action needed</strong>") +
    "<ul>" +
    needs
      .map((s) => {
        const stale =
          window.EH && EH.isTileStale ? EH.isTileStale(s.lastUpdated) : false;
        return `<li class="${stale ? "attention-item-stale" : ""}" data-segment="${escapeHtml(
          s.segmentId
        )}"><span class="seg">${escapeHtml(s.segmentName)}</span>${
          stale ? ' <span class="mat-stale-badge">Stale tile</span>' : ""
        } — ${escapeHtml(s.humanAction || "Human decision required")}</li>`;
      })
      .join("") +
    "</ul>";
}

function renderStats(portfolio, segments) {
  const s = portfolio.stats || {};
  const needing = segments.filter((x) => x.needsHumanAction).length;
  const values = [
    ["Active segments", s.activeSegments ?? segments.length],
    ["Need your action", needing],
    ["Active sprints", s.activeSprints ?? "—"],
    ["Operating ventures", s.operatingVentures ?? "—"],
  ];
  document.getElementById("stats").innerHTML = values
    .map(
      ([k, v]) =>
        `<div class="stat"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(
          v
        )}</div></div>`
    )
    .join("");
}



async function loadActiveVentureAreas() {
  const areaIds = ["capital", "presence", "foundry", "local", "eats", "reach", "gaming"];
  const docs = [];
  for (const id of areaIds) {
    try {
      docs.push(await loadJSON(`data/active-ventures/${id}.json`));
    } catch (_) {
      docs.push({ areaId: id, items: [], emptyReason: null });
    }
  }
  return docs;
}

function renderOrgActiveVentures(docs) {
  const host = document.getElementById("active-ventures-host");
  if (!host) return;
  if (window.EH && EH.aggregateActiveVentures) {
    host.innerHTML = EH.aggregateActiveVentures(docs);
  } else {
    host.innerHTML = `<section class="active-ventures"><h2 class="section-title">Active ventures</h2><div class="empty"><strong>No active ventures</strong>Shared renderer unavailable.</div></section>`;
  }
}

function renderOrgLearning(doc) {
  const host = document.getElementById("learning-host");
  if (!host) return;
  if (window.EH && EH.renderLearning) {
    host.innerHTML = EH.renderLearning(doc, { title: "Learning" });
  } else {
    host.innerHTML = `<section class="learning-desk"><h2 class="section-title">Learning</h2><div class="empty"><strong>No lessons</strong> Shared renderer unavailable.</div></section>`;
  }
}

async function loadNextUpAreas() {
  const areaIds = ["portfolio", "capital", "presence", "foundry", "local", "eats"];
  const areas = [];
  for (const id of areaIds) {
    try {
      areas.push(await loadJSON(`data/next-up/${id}.json`));
    } catch (_) {
      /* missing file = treat as empty */
      areas.push({ areaId: id, areaName: id, items: [] });
    }
  }
  return areas;
}

function fmtNextRun(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function renderOrgNextUp(areas) {
  const el = document.getElementById("next-up");
  if (!el) return;
  const flat = [];
  for (const area of areas) {
    for (const item of area.items || []) {
      if (!item || !item.title || !item.nextRunAt) continue;
      flat.push({
        ...item,
        areaName: area.areaName || area.areaId,
        areaId: area.areaId,
      });
    }
  }
  flat.sort((a, b) => String(a.nextRunAt).localeCompare(String(b.nextRunAt)));
  const top = flat.slice(0, 5);
  if (!top.length) {
    el.className = "next-up empty";
    el.innerHTML = `<p class="next-up-empty">Nothing scheduled.</p>`;
    return;
  }
  el.className = "next-up";
  el.innerHTML =
    "<ol>" +
    top
      .map((it) => {
        const meta = [
          it.scheduleLabel ? escapeHtml(it.scheduleLabel) : "",
          it.owner ? escapeHtml(it.owner) : "",
        ]
          .filter(Boolean)
          .join(" · ");
        return `<li>
          <div class="nu-title"><span class="nu-area">${escapeHtml(it.areaName)}</span>${escapeHtml(it.title)}</div>
          <div class="nu-when">${escapeHtml(fmtNextRun(it.nextRunAt))}</div>
          ${meta ? `<div class="nu-meta">${meta}</div>` : ""}
        </li>`;
      })
      .join("") +
    "</ol>";
}

function renderMaturitySurfaces(maturityDoc, registryDoc) {
  const expHost = document.getElementById("experiment-registry-host");
  if (expHost && window.EH && EH.renderExperimentRegistry) {
    expHost.innerHTML = EH.renderExperimentRegistry(registryDoc);
  }
  const rollHost = document.getElementById("maturity-rollup-host");
  if (rollHost && window.EH && EH.renderMaturityRollup) {
    rollHost.innerHTML = EH.renderMaturityRollup(maturityDoc);
  }
}

// Model governance summary card (portfolio-level, not a segment tile). 2026-10-17, Wells.
// Reads data/governance/model-governance.json (refreshed by the Portfolio Systems monitor); falls back to
// portfolio.modelGovernance; degrades to a quiet "unavailable" note. Never blocks or breaks the segment tiles.
const GOV_COUNT_LABELS = [
  ["thirdPartyModelCalls", "Third-party model calls"],
  ["bugbotRuns", "Bugbot runs"],
  ["bugbotRunComments", "Bugbot run requests"],
  ["oldModelSettings", "Old model settings to fix"],
  ["newUnreviewedSetups", "New unreviewed agent setups"],
  ["cost", "Cost"],
];

function govValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function govCardHtml(doc, fallbackNote) {
  const status = String(doc.status || "").toLowerCase();
  const badgeClass = status === "green" ? "operating" : "warn";
  const label = doc.statusLabel || (status ? status[0].toUpperCase() + status.slice(1) : "—");
  const ex = doc.exceptions && typeof doc.exceptions === "object" ? doc.exceptions : {};
  const counts = GOV_COUNT_LABELS.filter(([k]) => k in ex)
    .map(
      ([k, l]) =>
        `<li><span class="label">${escapeHtml(l)}</span><span class="value">${escapeHtml(govValue(ex[k]))}</span></li>`
    )
    .join("");
  const lines = (Array.isArray(doc.lines) ? doc.lines : []).filter(Boolean);
  const link = doc.summaryUrl
    ? `<div class="actions"><a class="btn ghost" href="${escapeHtml(doc.summaryUrl)}" rel="noopener">Summary file</a></div>`
    : "";
  return `<article class="tile seg-portfolio gov-card" data-card="model-governance">
    <div class="tile-head">
      <div>
        <h2>${escapeHtml(doc.title || "Model governance")}</h2>
        <p class="mission">Which AI models agents may use, and anything that slipped past the rules.</p>
      </div>
      <span class="badge ${badgeClass}">${escapeHtml(label)}</span>
    </div>
    <p class="meta">Owner: <span>${escapeHtml(doc.owner || "Portfolio Systems")}</span> · Checked <span>${escapeHtml(
      fmtWhen(doc.lastChecked)
    )}</span></p>
    ${counts ? `<ul class="metrics gov-counts">${counts}</ul>` : ""}
    ${lines.length ? `<ul class="gov-lines">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>` : ""}
    ${fallbackNote ? `<p class="meta"><span>${escapeHtml(fallbackNote)}</span></p>` : ""}
    ${doc.note ? `<p class="meta">${escapeHtml(doc.note)}</p>` : ""}
    ${link}
  </article>`;
}

async function renderModelGovernance(portfolio) {
  const host = document.getElementById("model-governance-host");
  if (!host) return;
  const pointer = portfolio && portfolio.modelGovernance ? portfolio.modelGovernance : null;
  const url = (pointer && pointer.summaryUrl) || "data/governance/model-governance.json";
  try {
    const doc = await loadJSON(url);
    host.innerHTML = govCardHtml({ summaryUrl: url, ...doc });
  } catch (_) {
    if (pointer) {
      host.innerHTML = govCardHtml(
        { title: "Model governance", status: pointer.status, lastChecked: pointer.lastChecked, exceptions: pointer.exceptions },
        "Detailed summary unavailable; showing last published snapshot."
      );
    } else {
      host.innerHTML = "";
    }
  }
}

async function main() {
  try {
    const portfolio = await loadJSON("data/portfolio.json");
    let maturityDoc = null;
    let registryDoc = null;
    try {
      maturityDoc = await loadJSON("data/maturity/SEGMENT_MATURITY.json");
    } catch (_) {
      maturityDoc = null;
    }
    try {
      registryDoc = await loadJSON("data/maturity/EXPERIMENT_REGISTRY.json");
    } catch (_) {
      registryDoc = null;
    }
    document.getElementById("status-brief").textContent = portfolio.statusBrief;
    (document.getElementById("updated-text") || document.getElementById("updated")).textContent = "Updated " + fmtWhen(portfolio.lastUpdated);
    document.getElementById("public-note").innerHTML = `<strong>Public vs operating:</strong> ${escapeHtml(
      portfolio.publicSiteNote
    )} <a href="${escapeHtml(portfolio.publicSiteUrl)}" rel="noopener">elephantharbor.com</a>`;

    const segments = [];
    for (const id of portfolio.segments) {
      segments.push(await loadJSON(`data/segments/${id}.json`));
    }
    renderStats(portfolio, segments);
    renderModelGovernance(portfolio).catch(() => {
      /* governance card optional; never blocks tiles */
    });
    try {
      const tcHost = document.getElementById("trial-clock");
      if (tcHost && window.EH && EH.loadTrialClock) {
        const tc = await EH.loadTrialClock("data/trial-clock.json");
        tcHost.innerHTML = EH.renderTrialClock(tc);
      }
    } catch (e) {
      const tcHost = document.getElementById("trial-clock");
      if (tcHost && window.EH && EH.renderTrialClock) tcHost.innerHTML = EH.renderTrialClock(null);
    }

    renderAttention(segments, maturityDoc);
    document.getElementById("tiles").innerHTML = segments
      .map((s) => tileHtml(s, maturityDoc))
      .join("");
    try {
      renderMaturitySurfaces(maturityDoc, registryDoc);
    } catch (_) {
      /* maturity surfaces optional */
    }
    try {
      const nextAreas = await loadNextUpAreas();
      renderOrgNextUp(nextAreas);
    } catch (e) {
      const el = document.getElementById("next-up");
      if (el) {
        el.className = "next-up empty";
        el.innerHTML = `<p class="next-up-empty">Nothing scheduled.</p>`;
      }
    }
    try {
      renderOrgActiveVentures(await loadActiveVentureAreas());
    } catch (e) {
      const host = document.getElementById("active-ventures-host");
      if (host) {
        host.innerHTML = `<section class="active-ventures"><h2 class="section-title">Active ventures</h2><div class="empty"><strong>No active ventures</strong>Could not load feeds.</div></section>`;
      }
    }
    try {
      renderOrgLearning(await loadJSON("data/learning/portfolio.json"));
    } catch (e) {
      const host = document.getElementById("learning-host");
      if (host) {
        host.innerHTML = `<section class="learning-desk"><h2 class="section-title">Learning</h2><div class="empty"><strong>No lessons</strong> Could not load learning feed.</div></section>`;
      }
    }
  } catch (err) {
    document.getElementById("app").innerHTML = `<p class="error">Could not load portfolio data. ${escapeHtml(
      err.message
    )}</p>`;
  }
}

main();
