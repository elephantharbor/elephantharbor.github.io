/* Harbor Eats operating dashboard — read-only SPA */
(function () {
  "use strict";

  let SNAP = null;
  const app = document.getElementById("app");
  const nav = document.getElementById("nav");

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtUpdated(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return esc(iso);
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
      return esc(iso);
    }
  }

  function setActive(view) {
    nav.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === view);
    });
  }

  /** Opaque desk surface — readable content must not sit on the atmosphere grid. */
  function deskView(title, helpHtml, bodyHtml) {
    const help = helpHtml
      ? `<p class="eh-desk-panel__help">${helpHtml}</p>`
      : "";
    return `<div class="eh-desk-view">
      <section class="eh-desk-panel">
        <h2 class="eh-desk-panel__title">${esc(title)}</h2>
        ${help}
        <div class="eh-desk-panel__body">${bodyHtml}</div>
      </section>
    </div>`;
  }

  function deskCard(title, innerHtml, opts) {
    const hint = opts && opts.hint
      ? `<p class="eh-desk-card__help dim">${opts.hint}</p>`
      : "";
    const cls = opts && opts.inset ? " eh-desk-card eh-desk-card--inset" : " eh-desk-card";
    return `<section class="${cls.trim()}">
      ${title ? `<h3 class="eh-desk-card__title">${esc(title)}</h3>` : ""}
      ${hint}
      ${innerHtml}
    </section>`;
  }

  function planStatusBadge(status) {
    const s = String(status || "");
    const key = s.toLowerCase();
    const map = {
      unselected: "badge-unselected",
      selected: "badge-selected",
      cooked: "badge-cooked",
      rated: "badge-rated",
      skipped: "badge-skipped",
      archived: "badge-archived",
    };
    const cls = map[key] || "badge-empty";
    return `<span class="badge ${cls}">${esc(s)}</span>`;
  }

  function dietaryLabel(key) {
    return String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function renderDietaryLocks(d) {
    if (!d || typeof d !== "object") return `<p class="muted">None listed.</p>`;
    const rows = Object.entries(d)
      .map(
        ([k, v]) =>
          `<tr><td>${esc(dietaryLabel(k))}</td><td>${esc(String(v))}</td></tr>`
      )
      .join("");
    return `<div class="table-wrap"><table class="data"><thead><tr><th>Rule</th><th>Policy</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderHeadlineMetrics(metrics) {
    const list = metrics || [];
    if (!list.length) return "";
    const kpis = list
      .map(
        (m) => `<div class="kpi">
        <div class="label">${esc(m.label)}</div>
        <div class="val">${esc(m.value)}</div>
        ${m.hint ? `<div class="hint">${esc(m.hint)}</div>` : ""}
      </div>`
      )
      .join("");
    return `<div class="kpi-row">${kpis}</div>`;
  }

  function lessonCard(l) {
    if (!l) return "";
    if (window.EH && EH.renderLessonCard) {
      return EH.renderLessonCard(l, esc);
    }
    return `<div class="lesson"><div class="conclusion">${esc(l.learning || "")}</div></div>`;
  }

  function collectLessons(s) {
    if (Array.isArray(s.lessons) && s.lessons.length) return s.lessons;
    if (s.latestLesson) return [s.latestLesson];
    return [];
  }

  function simpleMd(md) {
    if (!md) return "";
    let html = esc(md);
    html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^# (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`);
    html = html.replace(/\n\n+/g, "</p><p>");
    html = `<p>${html}</p>`;
    html = html.replace(/<p><h3>/g, "<h3>");
    html = html.replace(/<\/h3><\/p>/g, "</h3>");
    html = html.replace(/<p><h4>/g, "<h4>");
    html = html.replace(/<\/h4><\/p>/g, "</h4>");
    html = html.replace(/<p><ul>/g, "<ul>");
    html = html.replace(/<\/ul><\/p>/g, "</ul>");
    html = html.replace(/<p>\s*<\/p>/g, "");
    return html;
  }

  function renderOverview(s) {
    const lessons = collectLessons(s);
    const latestHtml = lessons.length
      ? lessonCard(lessons[0])
      : `<div class="eh-desk-empty"><strong>No lessons recorded</strong></div>`;

    let humanHtml = "";
    if (s.needsHumanAction) {
      humanHtml = deskCard(
        "Needs human action",
        `<div class="callout warn">${esc(s.humanAction || "See snapshot.")}</div>`
      );
    }

    const body = `
      ${humanHtml}
      ${renderHeadlineMetrics(s.headlineMetrics)
        ? deskCard("Headline metrics", renderHeadlineMetrics(s.headlineMetrics))
        : ""}
      <div class="grid grid-2">
        ${deskCard("Current objective", `<p class="plain">${esc(s.currentObjective)}</p>`)}
        ${deskCard("Status brief", `<p class="plain">${esc(s.currentStatusBrief)}</p>`)}
      </div>
      ${deskCard("Dietary hard locks (household)", renderDietaryLocks(s.dietary), {
        hint: "From snapshot — not averaged across diners.",
      })}
      ${deskCard("Latest lesson", latestHtml, {
        hint: "Experience → Evidence → Learning → Change",
      })}
      ${deskCard(
        "Operating mode",
        `<p class="plain">${esc(s.operatingMode || "—")} · Diners: ${esc((s.diners || []).join(", "))}</p>`
      )}
    `;
    return deskView("Overview", null, body);
  }

  function renderOption(opt) {
    const sel = opt.selected ? " selected-opt" : "";
    return `<div class="option-card${sel}">
      <div class="opt-id">${esc(opt.meal_option_id)} · ${esc(opt.recipe_slug)} ${esc(opt.recipe_version || "")}</div>
      <div class="opt-name">${esc(opt.letter)} — ${esc(opt.name)}</div>
      <p class="plain dim" style="font-size:11px">${esc(opt.description_short || "")}</p>
      ${opt.selected ? `<span class="badge badge-selected">Selected</span>` : ""}
    </div>`;
  }

  function renderPlan(p) {
    const opts = (p.options || []).map(renderOption).join("");
    const ratings = p.ratings || {};
    return `<div class="plan-card">
      <div class="head">
        <h3 class="title">${esc(p.plan_id)}</h3>
        ${planStatusBadge(p.status)}
        <span class="badge badge-empty">${esc(p.created_date || "")}</span>
      </div>
      <div class="meta-grid">
        <div class="k">Selected option</div><div class="v">${esc(p.selected_meal_option_id || "—")}</div>
        <div class="k">Tom rating</div><div class="v">${esc(ratings.tom != null ? ratings.tom : "—")}</div>
        <div class="k">Renata rating</div><div class="v">${esc(ratings.renata != null ? ratings.renata : "—")}</div>
        ${p.notes ? `<div class="k">Notes</div><div class="v">${esc(p.notes)}</div>` : ""}
      </div>
      <div class="option-grid">${opts}</div>
    </div>`;
  }

  function renderPlans(s) {
    const plans = s.plans || [];
    const activeIds = new Set(s.activePlanIds || []);
    const active = plans.filter((p) => activeIds.has(p.plan_id));
    const queue = plans.filter((p) => !activeIds.has(p.plan_id));
    const c = s.counters || {};

    const counterHtml = `<div class="kpi-row">
      <div class="kpi"><div class="label">Plans generated</div><div class="val">${esc(c.plans_generated)}</div></div>
      <div class="kpi"><div class="label">Active unselected</div><div class="val">${esc(c.active_unselected_plans)}</div></div>
      <div class="kpi"><div class="label">Selections recorded</div><div class="val">${esc(c.selections_recorded)}</div></div>
      <div class="kpi"><div class="label">Meal options</div><div class="val">${esc(c.meal_options_generated)}</div></div>
    </div>`;

    const body = `
      ${deskCard("Counters", counterHtml)}
      ${deskCard(
        `Active / queue (${active.length})`,
        `<div class="stack">${active.length ? active.map(renderPlan).join("") : `<div class="eh-desk-empty"><strong>No active plans</strong></div>`}</div>`
      )}
      ${
        queue.length
          ? deskCard(
              `Other plans (${queue.length})`,
              `<div class="stack">${queue.map(renderPlan).join("")}</div>`
            )
          : ""
      }
    `;
    const lifecycle = (s.docs && s.docs.lifecycle) || [];
    const help = `Plan ID <code>HE-YYYY-MM-DD-PNN</code> · Meal options A / B / C · Lifecycle: ${esc(
      lifecycle.join(" → ")
    )}`;
    return deskView("Plans", help, body);
  }

  function renderRecipes(s) {
    const recipes = s.recipes || [];
    const cards = recipes
      .map(
        (r) => `<details class="recipe-card">
        <summary><strong>${esc(r.title)}</strong> · <span class="dim">${esc(r.slug)} · ${esc(r.version)}</span></summary>
        <div class="recipe-body">${simpleMd(r.bodyMd || r.body || "")}</div>
      </details>`
      )
      .join("");
    const body = `<div class="stack">${cards || `<div class="eh-desk-empty"><strong>No recipes</strong></div>`}</div>`;
    return deskView(
      "Recipes",
      `${esc(String(recipes.length))} recipes in library (snapshot).`,
      body
    );
  }

  function renderInferred(inf) {
    if (!inf || typeof inf !== "object") return `<p class="muted">No inferred preferences yet.</p>`;
    const keys = Object.keys(inf).filter((k) => {
      const v = inf[k];
      return v && typeof v === "object" && Object.keys(v).length > 0;
    });
    if (!keys.length) return `<p class="muted">No inferred preferences yet.</p>`;
    return keys
      .map((k) => {
        const entries = Object.entries(inf[k] || {})
          .map(([name, val]) => `<span class="chip">${esc(name)}: ${esc(String(val))}</span>`)
          .join("");
        return `<div style="margin-top:8px"><div class="k dim" style="font-size:10px;text-transform:uppercase">${esc(k)}</div><div class="chip-list">${entries}</div></div>`;
      })
      .join("");
  }

  function renderPersonPref(personKey, block) {
    if (!block) return "";
    const ratings = block.ratings || [];
    const selections = block.selections || [];
    let dietaryBlock = "";
    if (block.dietary) {
      dietaryBlock = `<div style="margin-top:10px"><h3 style="font-size:11px;color:var(--muted);text-transform:uppercase">Personal dietary</h3>${renderDietaryLocks(block.dietary)}</div>`;
    }
    return `<div class="pref-card">
      <h3 class="title">${esc(block.person || personKey)}</h3>
      <div class="meta-grid">
        <div class="k">Ratings count</div><div class="v">${esc(String(ratings.length))}</div>
        <div class="k">Selections count</div><div class="v">${esc(String(selections.length))}</div>
      </div>
      ${ratings.length ? `<p class="dim" style="font-size:11px;margin:8px 0 4px">Ratings</p><ul class="list-plain">${ratings.map((r) => `<li>${esc(typeof r === "string" ? r : JSON.stringify(r))}</li>`).join("")}</ul>` : ""}
      ${selections.length ? `<p class="dim" style="font-size:11px;margin:8px 0 4px">Selections</p><ul class="list-plain">${selections.map((r) => `<li>${esc(typeof r === "string" ? r : JSON.stringify(r))}</li>`).join("")}</ul>` : ""}
      ${(block.confidence_notes || []).length ? `<p class="dim" style="font-size:11px;margin:8px 0 4px">Confidence notes</p><ul class="list-plain">${block.confidence_notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      ${(block.qualitative || []).length ? `<p class="dim" style="font-size:11px;margin:8px 0 4px">Qualitative</p><ul class="list-plain">${block.qualitative.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      <h3 style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:12px">Inferred (this person only)</h3>
      ${renderInferred(block.inferred)}
      ${dietaryBlock}
    </div>`;
  }

  function renderPreferences(s) {
    const p = s.preferences || {};
    const hh = p.household || {};
    const shared = hh.shared || {};
    const body = `
      ${renderPersonPref("tom", p.tom)}
      ${renderPersonPref("renata", p.renata)}
      <div class="pref-card">
        <h3 class="title">Household</h3>
        <div class="meta-grid">
          <div class="k">Default servings</div><div class="v">${esc(hh.servings_default != null ? hh.servings_default : "—")}</div>
        </div>
        <p class="dim" style="font-size:11px;margin:8px 0 4px">Equipment</p>
        <div class="chip-list">${(hh.equipment || []).map((e) => `<span class="chip">${esc(e)}</span>`).join("") || `<span class="muted">—</span>`}</div>
        <p class="dim" style="font-size:11px;margin:12px 0 4px">Shared learning (pairs / agreement)</p>
        <div class="meta-grid">
          <div class="k">Rating pairs</div><div class="v">${esc(String((shared.ratings_pairs || []).length))}</div>
          <div class="k">High agreement</div><div class="v">${esc(String((shared.high_agreement_meals || []).length))}</div>
          <div class="k">Polarizing</div><div class="v">${esc(String((shared.polarizing || []).length))}</div>
          <div class="k">Keepers</div><div class="v">${esc(String((shared.keepers || []).length))}</div>
          <div class="k">Favorites</div><div class="v">${esc(String((shared.favorites || []).length))}</div>
          <div class="k">Repeat candidates</div><div class="v">${esc(String((shared.repeat_candidates || []).length))}</div>
        </div>
      </div>
    `;
    return deskView(
      "Preferences",
      "Tom, Renata, and Household are shown separately — never averaged.",
      body
    );
  }

  function renderLessons(s) {
    const lessons = collectLessons(s);
    const cards = lessons.map(lessonCard).join("");
    const body = `<div class="stack">${cards || `<div class="eh-desk-empty"><strong>No lessons yet</strong></div>`}</div>`;
    return deskView(
      "Lessons",
      "Experience → Evidence → Learning → Change (Harbor Eats snapshot).",
      body
    );
  }

  function normalizeActivityEntry(e) {
    const ts = e.timestamp || e.ts || "";
    const type = e.event || e.type || "—";
    const detail = e.details || e.detail || "";
    const actor = e.actor || "";
    return { ts, type, detail, actor };
  }

  function renderLog(s) {
    const raw = s.activity || [];
    const entries = raw.map(normalizeActivityEntry).sort((a, b) => {
      try {
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      } catch (_) {
        return 0;
      }
    });
    const rows = entries
      .map(
        (e) => `<tr class="log-row">
        <td class="mono">${fmtUpdated(e.ts)}</td>
        <td>${esc(e.type)}</td>
        <td>${esc(e.actor)}</td>
        <td>${esc(e.detail)}</td>
      </tr>`
      )
      .join("");
    const body = deskCard(
      "Activity",
      `<div class="eh-desk-table-wrap">
        <table class="data eh-desk-table">
          <thead><tr><th>When</th><th>Event</th><th>Actor</th><th>Details</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="4" class="muted">No activity.</td></tr>`}</tbody>
        </table>
      </div>`,
      { hint: "Newest first · from snapshot." }
    );
    return deskView("Log", "Session and ops activity (public-safe snapshot).", body);
  }

  function renderDocs(s) {
    const d = s.docs || {};
    const ids = d.ids || {};
    const lifecycle = (d.lifecycle || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const notion = s.notionSecondary;
    const notionHtml = notion && notion.url
      ? `<p class="plain" style="margin-top:12px"><a href="${esc(notion.url)}" target="_blank" rel="noopener noreferrer">${esc(notion.label || "Notion desk (secondary)")}</a> — optional sync target; this github.io desk is primary.</p>`
      : "";

    const body = `
      <details class="doc-sec" open>
        <summary>Mission</summary>
        <p class="plain">${esc(d.mission)}</p>
      </details>
      <details class="doc-sec" open>
        <summary>ID scheme</summary>
        <ul>
          <li>Plan: <code>${esc(ids.plan)}</code></li>
          <li>Meal option: <code>${esc(ids.mealOption)}</code></li>
        </ul>
      </details>
      <details class="doc-sec" open>
        <summary>Lifecycle states</summary>
        <ul>${lifecycle}</ul>
      </details>
      <details class="doc-sec" open>
        <summary>On-demand rules</summary>
        <p class="plain">${esc(d.onDemand)}</p>
      </details>
      <details class="doc-sec" open>
        <summary>Kitchen &amp; equipment</summary>
        <p class="plain">${esc(d.kitchen)}</p>
      </details>
      ${notionHtml}
    `;
    return deskView("Docs", "Operating reference from snapshot.", body);
  }

  const VIEWS = {
    overview: renderOverview,
    plans: renderPlans,
    recipes: renderRecipes,
    preferences: renderPreferences,
    lessons: renderLessons,
    log: renderLog,
    docs: renderDocs,
  };

  function show(view) {
    const fn = VIEWS[view] || VIEWS.overview;
    setActive(view);
    app.innerHTML = fn(SNAP);
    try {
      history.replaceState(null, "", "#" + view);
    } catch (_) {}
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]");
    if (!btn || !SNAP) return;
    show(btn.dataset.view);
  });

  async function boot() {
    try {
      const res = await fetch("data/snapshot.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      SNAP = await res.json();
      const el = document.getElementById("last-updated");
      if (el) el.textContent = fmtUpdated(SNAP.generatedAt);
      let view = "overview";
      try {
        const h = (location.hash || "").replace(/^#/, "");
        if (h && VIEWS[h]) view = h;
      } catch (_) {}
      show(view);
    } catch (err) {
      app.innerHTML = deskView(
        "Snapshot unavailable",
        null,
        `<div class="error"><strong>Could not load snapshot</strong> ${esc(err.message || err)}</div>`
      );
    }
  }

  boot();
})();
