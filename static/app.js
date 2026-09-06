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
  for (const link of s.publicLinks || []) {
    bits.push(
      `<a class="btn ghost" href="${escapeHtml(link.url)}" rel="noopener">${escapeHtml(
        link.label
      )}</a>`
    );
  }
  return `<div class="actions">${bits.join("")}</div>`;
}

function tileHtml(s) {
  const metrics = (s.headlineMetrics || [])
    .map(
      (m) =>
        `<li title="${escapeHtml(m.hint || "")}"><span class="label">${escapeHtml(
          m.label
        )}</span><span class="value">${escapeHtml(m.value)}</span></li>`
    )
    .join("");
  const status = s.status || "—";
  const badgeClass = /wait|paused|action/i.test(status) ? "warn" : "operating";
  const actionFlag = s.needsHumanAction
    ? `<p class="meta"><span>Action needed:</span> ${escapeHtml(s.humanAction || "Human decision required")}</p>`
    : "";
  return `<article class="tile" id="${escapeHtml(s.segmentId)}" data-segment="${escapeHtml(s.segmentId)}">
    <div class="tile-head">
      <div>
        <h2>${escapeHtml(s.segmentName)}</h2>
        <p class="mission">${escapeHtml(s.mission || s.description || "")}</p>
      </div>
      <span class="badge ${badgeClass}">${escapeHtml(status)}</span>
    </div>
    <p class="meta">Owner: <span>${escapeHtml(s.owner)}</span> · Updated <span>${escapeHtml(
    fmtWhen(s.lastUpdated)
  )}</span></p>
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

function renderAttention(segments) {
  const el = document.getElementById("attention");
  const needs = segments.filter((s) => s.needsHumanAction);
  if (!needs.length) {
    el.className = "attention empty";
    el.textContent = "Nothing needs your attention right now.";
    return;
  }
  el.className = "attention hot";
  el.innerHTML =
    "<strong>Action needed</strong><ul>" +
    needs
      .map(
        (s) =>
          `<li><span class="seg">${escapeHtml(s.segmentName)}</span> — ${escapeHtml(
            s.humanAction || "Human decision required"
          )}</li>`
      )
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


async function loadNextUpAreas() {
  const areaIds = ["capital", "presence", "foundry"];
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

async function main() {
  try {
    const portfolio = await loadJSON("data/portfolio.json");
    document.getElementById("status-brief").textContent = portfolio.statusBrief;
    document.getElementById("updated").textContent = "Updated " + fmtWhen(portfolio.lastUpdated);
    document.getElementById("public-note").innerHTML = `<strong>Public vs operating:</strong> ${escapeHtml(
      portfolio.publicSiteNote
    )} <a href="${escapeHtml(portfolio.publicSiteUrl)}" rel="noopener">elephantharbor.com</a>`;

    const segments = [];
    for (const id of portfolio.segments) {
      segments.push(await loadJSON(`data/segments/${id}.json`));
    }
    renderStats(portfolio, segments);
    renderAttention(segments);
    document.getElementById("tiles").innerHTML = segments.map(tileHtml).join("");
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
  } catch (err) {
    document.getElementById("app").innerHTML = `<p class="error">Could not load portfolio data. ${escapeHtml(
      err.message
    )}</p>`;
  }
}

main();
