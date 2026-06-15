/* ============================================================
   Wiki engine. You shouldn't need to edit this to add content —
   just edit the JSON files in /data and config.js.
   ============================================================ */
(function () {
  const S = window.SITE;
  const app = document.getElementById("app");
  const ENTRIES = {};   // id -> entry
  let LOADED = false;

  // ---------- Data loading ----------
  async function loadAll() {
    for (const cat of S.categories) {
      try {
        const res = await fetch("data/" + cat.data, { cache: "no-cache" });
        const items = await res.json();
        cat._items = items;
        items.forEach(it => { ENTRIES[it.id] = it; });
      } catch (e) {
        cat._items = [];
        console.error("Failed to load", cat.data, e);
      }
    }
    LOADED = true;
  }

  // ---------- Helpers ----------
  const esc = s => (s || "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

  // Resolve [[id|label]] or [[id]] links inside text
  function linkify(text) {
    return esc(text).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
      id = id.trim();
      const target = ENTRIES[id];
      const txt = label ? label.trim() : (target ? target.title : id);
      if (target) return `<a data-link href="#/entry/${id}">${esc(txt)}</a>`;
      return `<span title="missing entry: ${esc(id)}" style="color:var(--ink-faint);border-bottom:1px dashed var(--ink-faint)">${esc(txt)}</span>`;
    });
  }

  function renderBody(blocks) {
    if (!blocks) return "";
    return blocks.map(b => {
      switch (b.type) {
        case "h2": return `<h2>${linkify(b.text)}</h2>`;
        case "h3": return `<h3>${linkify(b.text)}</h3>`;
        case "p":  return `<p>${linkify(b.text)}</p>`;
        case "quote": return `<blockquote>${linkify(b.text)}</blockquote>`;
        case "ul": return `<ul>${(b.items||[]).map(i=>`<li>${linkify(i)}</li>`).join("")}</ul>`;
        case "ol": return `<ol>${(b.items||[]).map(i=>`<li>${linkify(i)}</li>`).join("")}</ol>`;
        case "img": return `<img src="${esc(b.src)}" alt="${esc(b.alt||"")}" style="border-radius:8px;margin:16px 0">`;
        default: return "";
      }
    }).join("");
  }

  function initial(t){ return (t||"?").trim().charAt(0).toUpperCase(); }

  // ---------- Views ----------
  function viewHome() {
    const cards = S.categories.map(c => {
      const n = (c._items || []).length;
      return `<a class="cat-card" href="#/cat/${c.id}">
        <div class="cat-count">${n} ${n===1?"entry":"entries"}</div>
        <h3>${esc(c.label)}</h3>
        <p>${esc(c.blurb||"")}</p>
      </a>`;
    }).join("");

    return `
      <section class="hero">
        <div class="eyebrow">World Codex</div>
        <h1>${esc(S.name)}</h1>
        <p>${esc(S.tagline)}</p>
      </section>
      <div class="cat-grid">${cards}</div>`;
  }

  function viewCategory(id) {
    const cat = S.categories.find(c => c.id === id);
    if (!cat) return notice("Category not found.");
    if (cat.isTimeline) return viewTimeline(cat);

    const items = cat._items || [];
    const list = items.length ? items.map(it => `
      <a class="entry-card" href="#/entry/${it.id}">
        <div class="thumb" ${it.image?`style="background-image:url('${esc(it.image)}')"`:""}>${it.image?"":initial(it.title)}</div>
        <div>
          <div class="ec-title">${esc(it.title)}</div>
          <div class="ec-sub">${esc(it.subtitle||"")}</div>
        </div>
      </a>`).join("") : notice("No entries yet. Add some in data/" + cat.data);

    return `
      <div class="section-head"><h2>${esc(cat.label)}</h2><span class="count">${items.length}</span></div>
      <div class="entry-list">${list}</div>`;
  }

  function viewTimeline(cat) {
    const items = (cat._items || []);
    const tl = items.length ? items.map(it => `
      <div class="tl-item">
        <div class="tl-era">${esc(it.era||"")}</div>
        <h3>${esc(it.title)}</h3>
        <div>${renderBody(it.body)}</div>
      </div>`).join("") : notice("No events yet.");
    return `
      <div class="section-head"><h2>${esc(cat.label)}</h2><span class="count">${items.length} events</span></div>
      <div class="timeline">${tl}</div>`;
  }

  function viewEntry(id) {
    const e = ENTRIES[id];
    if (!e) return notice("Entry not found.");
    const cat = S.categories.find(c => c.id === e.category);
    const infoRows = e.info ? Object.entries(e.info).map(([k,v]) =>
      `<dt>${esc(k)}</dt><dd>${linkify(String(v))}</dd>`).join("") : "";
    const tags = e.tags ? `<div class="tags">${e.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>` : "";

    const infobox = `
      <aside class="infobox">
        <div class="ib-image" ${e.image?`style="background-image:url('${esc(e.image)}')"`:""}>${e.image?"":initial(e.title)}</div>
        <div class="ib-title">${esc(e.title)}</div>
        ${infoRows?`<dl>${infoRows}</dl>`:""}
      </aside>`;

    return `
      <article class="article">
        <div class="breadcrumb"><a href="#/">${esc(S.name)}</a> ›
          ${cat?`<a href="#/cat/${cat.id}">${esc(cat.label)}</a> ›`:""}
          ${esc(e.title)}</div>
        <div class="article-layout">
          <div>
            <h1>${esc(e.title)}</h1>
            ${e.subtitle?`<p class="subtitle">${esc(e.subtitle)}</p>`:""}
            ${tags}
            <div class="body">${renderBody(e.body)}</div>
          </div>
          ${infobox}
        </div>
      </article>`;
  }

  function notice(msg){ return `<div class="notice">${esc(msg)}</div>`; }

  // ---------- Search ----------
  function buildSearchIndex() {
    const idx = [];
    Object.values(ENTRIES).forEach(e => {
      const cat = S.categories.find(c => c.id === e.category);
      const text = [e.title, e.subtitle, (e.tags||[]).join(" "),
        (e.body||[]).map(b => b.text || (b.items||[]).join(" ")).join(" ")].join(" ").toLowerCase();
      idx.push({ id: e.id, title: e.title, cat: cat ? cat.label : "", text });
    });
    return idx;
  }
  let SEARCH = [];

  function runSearch(q) {
    const box = document.getElementById("searchResults");
    q = q.trim().toLowerCase();
    if (!q) { box.classList.remove("show"); return; }
    const hits = SEARCH.filter(e => e.text.includes(q)).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map(h => `<a href="#/entry/${h.id}"><div>${esc(h.title)}</div><div class="sr-cat">${esc(h.cat)}</div></a>`).join("")
      : `<div class="sr-empty">No matches for “${esc(q)}”.</div>`;
    box.classList.add("show");
  }

  // ---------- Header / nav ----------
  function renderChrome() {
    document.getElementById("brand").innerHTML =
      `<a href="#/" style="color:inherit"><span>${esc(S.name)}</span> <span class="brand-mark">${esc(S.brandSuffix||"")}</span></a>`;
    document.getElementById("nav").innerHTML =
      S.categories.map(c => `<a href="#/cat/${c.id}" data-nav="${c.id}">${esc(c.label)}</a>`).join("");
    document.getElementById("footer").textContent = S.footer || "";
    document.title = S.name + " · " + (S.brandSuffix || "Wiki");
  }

  function setActiveNav(catId) {
    document.querySelectorAll("[data-nav]").forEach(a =>
      a.classList.toggle("active", a.getAttribute("data-nav") === catId));
  }

  // ---------- Router ----------
  function render() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);
    window.scrollTo(0, 0);

    if (parts.length === 0) { app.innerHTML = viewHome(); setActiveNav(null); return; }
    if (parts[0] === "cat")   { app.innerHTML = viewCategory(parts[1]); setActiveNav(parts[1]); return; }
    if (parts[0] === "entry") {
      app.innerHTML = viewEntry(parts[1]);
      const e = ENTRIES[parts[1]];
      setActiveNav(e ? e.category : null);
      return;
    }
    app.innerHTML = notice("Page not found.");
  }

  // ---------- Boot ----------
  async function boot() {
    renderChrome();
    app.innerHTML = `<div class="notice">Loading…</div>`;
    await loadAll();
    SEARCH = buildSearchIndex();
    render();

    const input = document.getElementById("searchInput");
    input.addEventListener("input", e => runSearch(e.target.value));
    document.addEventListener("click", e => {
      if (!e.target.closest(".search-box")) document.getElementById("searchResults").classList.remove("show");
    });
    window.addEventListener("hashchange", () => {
      render();
      document.getElementById("searchResults").classList.remove("show");
      input.value = "";
    });
  }

  boot();
})();
