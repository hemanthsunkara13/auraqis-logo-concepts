(() => {
  "use strict";

  const L = window.AuraqisLogos;
  const C = L.C;
  const BRAND = "../brand/mark-green.png";
  const STORE = "auraqis-logo-shortlist";
  const all = [...L.phase1, ...L.phase2];
  const Cards = window.AuraqisCards;
  const byId = new Map([...all, ...Cards.designs].map((c) => [c.id, c]));
  const isP1 = (c) => c.id.startsWith("P1");

  const state = {
    pal: {},
    layout: {},
    shortlist: new Set(readShortlist()),
    fontsReady: false,
    seen: new WeakSet(),
  };

  let uidN = 0;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function readShortlist() {
    try {
      const v = JSON.parse(localStorage.getItem(STORE) || "[]");
      return Array.isArray(v) ? v.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  }

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const fgFor = (bg) => (luminance(bg) > 0.35 ? C.charcoal : C.ivory);
  const bgOf = (c, pal) => (isP1(c) ? c.bg : c.palettes[pal ?? 0].bg);

  /* ——— Mounting, fitting, playing ——— */

  function fit(svg) {
    const g = svg.querySelector(".fit");
    if (!g) return;
    const b = g.getBBox();
    if (!b.width || !b.height) return;
    const p = Math.max(b.width, b.height) * 0.05;
    svg.setAttribute("viewBox", [b.x - p, b.y - p, b.width + p * 2, b.height + p * 2].map((n) => n.toFixed(2)).join(" "));
  }

  function mount(container, c, opts = {}) {
    container.innerHTML = L.render(c, { href: BRAND, uid: `${c.id}-${++uidN}`, ...opts });
    const svg = container.querySelector("svg");
    svg.dataset.id = c.id;
    svg.dataset.pal = opts.palette ?? 0;
    if (opts.layout !== "mark") {
      svg.dataset.fit = "1";
      if (state.fontsReady) fit(svg);
    }
    if (opts.size) {
      svg.setAttribute("width", opts.size);
      svg.setAttribute("height", opts.size);
    }
    return svg;
  }

  function play(svg) {
    if (!svg || !svg.classList.contains("anim")) return;
    svg.classList.remove("is-in");
    svg.getBoundingClientRect();
    svg.classList.add("is-in");
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        state.seen.add(e.target);
        if (state.fontsReady) $$("svg.anim", e.target).forEach(play);
        io.unobserve(e.target);
      }
    },
    { threshold: 0.25 },
  );

  /** Mounts into a section that may already be on screen: play immediately if it has been seen. */
  function mountAndPlay(container, scope, c, opts) {
    const svg = mount(container, c, { anim: true, ...opts });
    if (state.fontsReady && state.seen.has(scope)) play(svg);
    return svg;
  }

  /* ——— Download ——— */

  async function toDataUrl(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  async function download(svg, c, suffix) {
    const clone = svg.cloneNode(true);
    clone.removeAttribute("class");
    clone.querySelectorAll(".i-sheen").forEach((n) => n.remove());
    clone.querySelectorAll("[class]").forEach((n) => n.removeAttribute("class"));
    const [x, y, w, h] = clone.getAttribute("viewBox").split(" ");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Object.entries({ x, y, width: w, height: h, fill: bgOf(c, +svg.dataset.pal) }).forEach(([k, v]) => rect.setAttribute(k, v));
    clone.insertBefore(rect, clone.firstChild);
    for (const img of clone.querySelectorAll("image")) {
      try {
        img.setAttribute("href", await toDataUrl(img.getAttribute("href")));
      } catch {
        /* file:// — keep the relative path */
      }
    }
    const markup = L.withFonts(new XMLSerializer().serializeToString(clone), true);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    a.download = `auraqis-${c.id.toLowerCase()}-${c.slug}${suffix ? "-" + suffix : ""}.svg`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ——— Shortlist ——— */

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>';
  const starBtn = (c) =>
    `<button type="button" class="star" data-star="${c.id}" aria-pressed="${state.shortlist.has(c.id)}">${STAR}<span>${state.shortlist.has(c.id) ? "Shortlisted" : "Shortlist"}</span></button>`;

  function syncShortlist() {
    localStorage.setItem(STORE, JSON.stringify([...state.shortlist]));
    $("[data-count]").textContent = state.shortlist.size;
    $$("[data-star]").forEach((b) => {
      const on = state.shortlist.has(b.dataset.star);
      b.setAttribute("aria-pressed", on);
      b.querySelector("span").textContent = on ? "Shortlisted" : "Shortlist";
    });
    const list = $("[data-shortlist-list]");
    list.replaceChildren(
      ...[...state.shortlist].filter((id) => byId.has(id)).map((id) => {
        const li = document.createElement("li");
        const tag = document.createElement("span");
        tag.textContent = id;
        li.append(tag, byId.get(id).name);
        return li;
      }),
    );
    if (!state.shortlist.size) $("[data-shortlist]").hidden = true;
  }

  function shortlistText() {
    const lines = [...state.shortlist].filter((id) => byId.has(id)).map((id) => {
      const c = byId.get(id);
      const pal = c.palettes ? ` (${c.palettes[state.pal[id] ?? 0].name})` : "";
      return `• ${id} ${c.name}${pal}`;
    });
    return `AURAQIS logo shortlist\n${lines.join("\n")}`;
  }

  async function copyShortlist(btn) {
    const text = shortlistText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = "Copy shortlist"), 1600);
  }

  /* ——— Foundation ——— */

  function renderFoundation() {
    const swatches = [
      ["Ivory", C.ivory], ["Paper", C.paper], ["Stone", C.stone], ["Stone Dark", C.stoneDark], ["Charcoal", C.charcoal],
      ["Sage Light", C.sageLight], ["Sage", C.sage], ["Forest", C.forest], ["Forest Deep", C.forestDeep], ["Brass", C.brass],
      ["Limewash", "#ebe3d6"], ["Terracotta", "#a85f40"], ["Copper", "#c98a5b"], ["Midnight Teal", "#132420"], ["Olive", "#5d6233"],
      ["Linen", "#e6e2d2"], ["Champagne", "#c7a873"], ["Moss", "#26382a"], ["Blueprint", "#1c2a38"], ["Chalk Blue", "#8fb0c9"],
    ];
    $("[data-swatches]").innerHTML = swatches
      .map(([n, hex]) => `<div class="swatch" style="background:${hex};color:${fgFor(hex)}"><b>${n}</b>${hex.toUpperCase()}</div>`)
      .join("");

    const specimens = [
      ["Instrument Serif", "'Instrument Serif'", 400, "Site display face"],
      ["Manrope", "'Manrope'", 600, "Site body face"],
      ["Quicksand", "'Quicksand'", 500, "Current wordmark"],
      ["Cormorant Garamond", "'Cormorant Garamond'", 600, "Luxury serif"],
      ["Marcellus", "'Marcellus'", 400, "Roman capitals"],
      ["Bodoni Moda", "'Bodoni Moda'", 500, "Fashion didone"],
      ["Fraunces", "'Fraunces'", 400, "Crafted soft serif"],
      ["Jost", "'Jost'", 300, "Geometric sans"],
      ["Syne", "'Syne'", 700, "Editorial display"],
      ["Unbounded", "'Unbounded'", 500, "Wide contemporary"],
      ["Tenor Sans", "'Tenor Sans'", 400, "Engraved humanist"],
      ["Outfit", "'Outfit'", 300, "Clean geometric"],
      ["Cinzel", "'Cinzel'", 500, "Inscriptional capitals"],
      ["Italiana", "'Italiana'", 400, "Fine high contrast"],
      ["Playfair Display", "'Playfair Display'", 500, "Literary serif"],
      ["DM Serif Display", "'DM Serif Display'", 400, "Warm display serif"],
      ["Josefin Sans", "'Josefin Sans'", 300, "Deco geometric"],
      ["Space Grotesk", "'Space Grotesk'", 500, "Technical grotesk"],
    ];
    $("[data-specimens]").innerHTML = specimens
      .map(([n, fam, w, use]) => `<div class="specimen"><span style="font-family:${fam};font-weight:${w}">Auraqis</span><span>${n}<br>${use}</span></div>`)
      .join("");
  }

  /* ——— Phase 1 ——— */

  function renderP1() {
    const grid = $('[data-grid="p1"]');
    for (const c of L.phase1) {
      const el = document.createElement("article");
      el.className = "card";
      el.id = c.id.toLowerCase();
      el.innerHTML = `
        <div class="art" style="--bg:${c.bg};--fg:${fgFor(c.bg)}">
          <div class="art-svg"></div>
          <span class="tag">${c.id}</span>
          <div class="art-tools">
            <button type="button" class="chip-btn" data-act="replay">Replay</button>
            <button type="button" class="chip-btn" data-act="layout">Layout</button>
          </div>
        </div>
        <div class="meta">
          <div class="meta-head"><h3><small>${c.id}</small>${c.name}</h3>${starBtn(c)}</div>
          <p>${c.story}</p>
          <div class="specs">
            <span><b>Type</b> ${c.fonts.join(" / ")}</span>
            <span><b>Palette</b><span class="dots">${c.swatches.map((s) => `<i style="background:${s}" title="${s}"></i>`).join("")}</span></span>
          </div>
          <div class="actions"><button type="button" class="btn" data-act="download">Download SVG</button></div>
        </div>`;
      grid.append(el);
      const art = $(".art", el);
      const target = $(".art-svg", el);
      const draw = () => mountAndPlay(target, art, c, { layout: state.layout[c.id] });
      draw();
      io.observe(art);

      el.addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "replay") play($("svg", target));
        if (act === "layout") {
          state.layout[c.id] = (state.layout[c.id] || c.layout || "stack") === "row" ? "stack" : "row";
          draw();
          play($("svg", target));
        }
        if (act === "download") download($("svg", target), c, state.layout[c.id] || c.layout || "stack");
      });
    }
  }

  /* ——— Phase 2 ——— */

  function renderP2() {
    const grid = $('[data-grid="p2"]');
    for (const c of L.phase2) {
      const el = document.createElement("article");
      el.className = "card";
      el.id = c.id.toLowerCase();
      el.innerHTML = `
        <div class="art">
          <div class="art-svg"></div>
          <span class="tag">${c.id}</span>
          <div class="art-tools">
            <button type="button" class="chip-btn" data-act="replay">Replay</button>
            <button type="button" class="chip-btn" data-act="layout">Layout</button>
          </div>
        </div>
        <div class="p2-strip">
          <div class="pals" role="group" aria-label="Colourways">
            ${c.palettes.map((p, i) => `<button type="button" class="pal" data-pal="${i}" style="--bg:${p.bg}" title="${p.name}" aria-label="${p.name}" aria-pressed="${i === 0}"></button>`).join("")}
          </div>
          <div class="sizes" aria-label="Scale test"></div>
        </div>
        <div class="meta">
          <div class="meta-head"><h3><small>${c.id}</small>${c.name}</h3>${starBtn(c)}</div>
          <p>${c.story}</p>
          <div class="specs"><span><b>Type</b> ${c.fonts.join(" / ")}</span><span><b>Colourway</b> <span data-pal-name>${c.palettes[0].name}</span></span></div>
          <div class="actions">
            <button type="button" class="btn" data-act="download">Download lockup</button>
            <button type="button" class="btn" data-act="download-mark">Download mark</button>
          </div>
        </div>`;
      grid.append(el);

      const art = $(".art", el);
      const target = $(".art-svg", el);
      const sizes = $(".sizes", el);
      $$(".pal", el).forEach((b, i) => mount(b, c, { layout: "mark", palette: i }));

      const draw = () => {
        const i = state.pal[c.id] ?? 0;
        const p = c.palettes[i];
        art.style.setProperty("--bg", p.bg);
        art.style.setProperty("--fg", fgFor(p.bg));
        sizes.style.setProperty("--bg", p.bg);
        $("[data-pal-name]", el).textContent = p.name;
        $$(".pal", el).forEach((b) => b.setAttribute("aria-pressed", +b.dataset.pal === i));
        mountAndPlay(target, art, c, { palette: i, layout: state.layout[c.id] });
        sizes.replaceChildren();
        for (const s of [56, 32, 20, 16]) {
          const holder = document.createElement("span");
          mount(holder, c, { layout: "mark", palette: i, size: s });
          sizes.append(holder.firstChild);
        }
      };
      draw();
      io.observe(art);

      el.addEventListener("click", (e) => {
        const pal = e.target.closest("[data-pal]");
        if (pal) {
          state.pal[c.id] = +pal.dataset.pal;
          draw();
          play($("svg", target));
          return;
        }
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "replay") play($("svg", target));
        if (act === "layout") {
          state.layout[c.id] = state.layout[c.id] === "row" ? "stack" : "row";
          draw();
          play($("svg", target));
        }
        if (act === "download") download($("svg", target), c, state.layout[c.id] || "stack");
        if (act === "download-mark") {
          const holder = document.createElement("div");
          holder.style.cssText = "position:absolute;left:-9999px;width:240px;height:240px";
          document.body.append(holder);
          const svg = mount(holder, c, { layout: "mark", palette: state.pal[c.id] ?? 0, pad: 16 });
          download(svg, c, "mark").finally(() => holder.remove());
        }
      });
    }
  }

  /* ——— Hero ——— */

  function startHero() {
    const featured = [
      ["P1-02", 0], ["P2-11", 1], ["P2-03", 1], ["P1-12", 0], ["P2-15", 0], ["P2-01", 0], ["P1-15", 0], ["P2-14", 1],
      ["P2-12", 0], ["P1-09", 0], ["P2-16", 0], ["P2-09", 1], ["P1-14", 0], ["P2-13", 0], ["P2-08", 2], ["P1-07", 0],
    ];
    const stage = $("[data-hero-stage]");
    const artEl = $("[data-hero-art]");
    const caption = $("[data-hero-caption]");
    const bar = $("[data-hero-progress]");
    const DURATION = 5200;
    let i = 0;

    const show = () => {
      const [id, pal] = featured[i % featured.length];
      const c = byId.get(id);
      const bg = bgOf(c, pal);
      stage.style.backgroundColor = bg;
      stage.style.color = fgFor(bg);
      caption.textContent = `${c.id} · ${c.name}`;
      const layer = document.createElement("div");
      layer.style.opacity = "0";
      artEl.append(layer);
      const svg = mount(layer, c, { anim: true, palette: pal, layout: "stack" });
      requestAnimationFrame(() => {
        layer.style.opacity = "1";
        play(svg);
      });
      [...artEl.children].slice(0, -1).forEach((old) => {
        old.style.opacity = "0";
        setTimeout(() => old.remove(), 900);
      });
      bar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: DURATION, easing: "linear" });
      i++;
    };
    show();
    setInterval(show, DURATION);
  }

  /* ——— In context ——— */

  function renderPhone(el, c, sel, darkI, lightI) {
    const n = isP1(c) ? 1 : c.palettes.length;
    const bgL = bgOf(c, lightI);
    el.innerHTML = `
      <div class="ph-status"><b>9:41</b><span class="ph-island"></span><i></i></div>
      <div class="ph-top"><span>auraqis</span><b>···</b></div>
      <div class="ph-profile">
        <div class="ph-avatar"><span style="background:${bgOf(c, sel)}"></span></div>
        <div class="ph-bio"><b>AURAQIS</b><span>Constructions · Interiors</span><span>Where Vision Meets Craftsmanship</span><a>auraqis.com</a></div>
      </div>
      <div class="ph-btns"><span class="on">Follow</span><span>Message</span><span>Contact</span></div>
      <div class="ph-hl">${["Projects", "Interiors", "Build", "Studio"].map((t, i) => `<div><span class="ph-ring"><span style="background:${bgOf(c, i % n)}"></span></span><small>${t}</small></div>`).join("")}</div>
      <div class="ph-grid">
        <span class="t-mark" style="background:${bgOf(c, darkI)}"></span>
        <span style="background-image:url(../images/site/site-frame-01.jpg)"></span>
        <span class="t-quote" style="background:${bgL};color:${fgFor(bgL)}"><span>Where vision<br><i>meets craft.</i></span></span>
        <span style="background-image:url(../images/site/site-frame-04.jpg)"></span>
        <span class="t-mark" style="background:${bgOf(c, sel)}"></span>
        <span style="background-image:url(../images/site/site-frame-05.jpg)"></span>
      </div>`;
    mount($(".ph-avatar span", el), c, { layout: "mark", palette: sel });
    $$(".ph-ring > span", el).forEach((s, i) => mount(s, c, { layout: "mark", palette: i % n }));
    const tiles = $$(".t-mark", el);
    mount(tiles[0], c, { layout: "mark", palette: darkI });
    mount(tiles[1], c, { layout: "mark", palette: sel });
  }

  function renderStationery(el, c, darkI, lightI) {
    const paper = bgOf(c, lightI);
    const env = bgOf(c, darkI);
    el.innerHTML = `
      <div class="st-letter" style="--bg:${paper};--fg:${fgFor(paper)}">
        <div class="st-logo"></div>
        <i class="st-rule"></i>
        <div class="st-lines">${"<i></i>".repeat(10)}</div>
        <div class="st-foot"><span>AURAQIS PRIVATE LIMITED</span><span>info@auraqis.com · auraqis.com</span></div>
      </div>
      <div class="st-env" style="--bg:${env}"><i class="st-flap"></i><div class="st-seal" style="background:${paper}"></div></div>
      <div class="st-card" style="background:${env}"></div>
      <i class="st-pencil"></i>`;
    mount($(".st-logo", el), c, { layout: "row", palette: lightI });
    mount($(".st-seal", el), c, { layout: "mark", palette: lightI });
    mount($(".st-card", el), c, { layout: "mark", palette: darkI });
  }

  function renderIcons(el, c, darkI, lightI) {
    const p1 = isP1(c);
    const tiles = p1 ? [[0, 76], [0, 60], [0, 46]] : c.palettes.slice(0, 4).map((_, i) => [i, 64]);
    el.style.setProperty("--a", bgOf(c, darkI));
    el.style.setProperty("--b", bgOf(c, lightI));
    el.innerHTML =
      `<div class="ic-home">${tiles.map(([i, s]) => `<div class="ic-app"><span class="icon-tile" style="width:${s}px;height:${s}px;--bg:${bgOf(c, i)}"></span><small>AURAQIS</small></div>`).join("")}</div>` +
      `<div class="ic-tabs">${[32, 16].map((s) => `<span class="ic-tab"><span class="ic-fav" data-s="${s}"></span>AURAQIS · ${s}px</span>`).join("")}</div>`;
    $$(".icon-tile", el).forEach((t, k) => mount(t, c, { layout: "mark", palette: tiles[k][0] }));
    $$(".ic-fav", el).forEach((f) => mount(f, c, { layout: "mark", palette: 0, size: +f.dataset.s }));
  }

  function renderContext() {
    const select = $("[data-context-select]");
    const palsEl = $("[data-context-pals]");
    const scope = $("[data-mockups]");
    const slot = (name) => $(`[data-slot="${name}"]`, scope);
    const mockOf = (el) => el.closest(".mock");
    const browser = $(".mock-browser", scope);
    const loader = slot("loader");
    const sign = slot("sign");

    select.innerHTML =
      `<optgroup label="Phase 1 · Same mark, new voice">${L.phase1.map((c) => `<option value="${c.id}">${c.id} · ${c.name}</option>`).join("")}</optgroup>` +
      `<optgroup label="Phase 2 · New marks">${L.phase2.map((c) => `<option value="${c.id}">${c.id} · ${c.name}</option>`).join("")}</optgroup>`;
    select.value = "P2-11";

    $$("[data-ambient]").forEach((b) =>
      b.addEventListener("click", () => {
        scope.dataset.time = b.dataset.ambient;
        $$("[data-ambient]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      }),
    );

    sign.addEventListener("pointermove", (e) => {
      const r = sign.getBoundingClientRect();
      sign.style.setProperty("--sdx", ((0.5 - (e.clientX - r.left) / r.width) * 22).toFixed(1));
      sign.style.setProperty("--sdy", (6 + (0.5 - (e.clientY - r.top) / r.height) * 14).toFixed(1));
    });

    let introTimer = 0;
    const playIntro = () => {
      const c = byId.get(select.value);
      const pal = isP1(c) ? 0 : (state.pal[c.id] ?? 0);
      const bg = bgOf(c, pal);
      clearTimeout(introTimer);
      loader.classList.remove("is-out", "is-run");
      loader.style.setProperty("--bg", bg);
      loader.style.color = fgFor(bg);
      const svg = mount($(".loader-art", loader), c, { anim: true, layout: "stack", palette: pal });
      loader.getBoundingClientRect();
      loader.classList.add("is-run");
      if (state.fontsReady) play(svg);
      introTimer = setTimeout(() => loader.classList.add("is-out"), 3000);
    };
    $("[data-replay-intro]", scope).addEventListener("click", playIntro);
    new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && state.fontsReady && playIntro()), { threshold: 0.5 }).observe(browser);

    const draw = () => {
      const c = byId.get(select.value);
      const p1 = isP1(c);
      const sel = p1 ? 0 : (state.pal[c.id] ?? 0);
      const pick = (test, fallback) => {
        if (p1) return 0;
        const i = c.palettes.findIndex((p) => test(luminance(p.bg)));
        return i < 0 ? fallback : i;
      };
      const darkI = pick((l) => l < 0.12, p1 ? 0 : Math.min(1, c.palettes.length - 1));
      const lightI = pick((l) => l > 0.45, 0);

      palsEl.replaceChildren();
      if (!p1) {
        c.palettes.forEach((p, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "pal";
          b.style.setProperty("--bg", p.bg);
          b.title = p.name;
          b.setAttribute("aria-label", p.name);
          b.setAttribute("aria-pressed", i === sel);
          b.addEventListener("click", () => {
            state.pal[c.id] = i;
            draw();
          });
          mount(b, c, { layout: "mark", palette: i });
          palsEl.append(b);
        });
      }

      mount(slot("favicon"), c, { layout: "mark", palette: sel, size: 14 });
      const nav = $(".browser-nav", scope);
      const navBg = bgOf(c, lightI);
      nav.style.background = navBg;
      nav.style.color = fgFor(navBg);
      mountAndPlay(slot("row"), browser, c, { layout: "row", palette: lightI });
      if (state.fontsReady) playIntro();

      renderPhone(slot("phone"), c, sel, darkI, lightI);

      const lev = slot("levitate");
      lev.style.setProperty("--bg", bgOf(c, darkI));
      window.AuraqisCards.levitate(lev, window.AuraqisCards.conceptDesign(c, darkI, lightI));

      sign.style.setProperty("--bg", bgOf(c, darkI));
      mountAndPlay($(".sign-art", sign), sign, c, { layout: "stack", palette: darkI });

      const hoard = slot("hoarding");
      const panel = $(".hoard-panel", hoard);
      const hb = bgOf(c, sel);
      panel.style.setProperty("--bg", hb);
      panel.style.color = fgFor(hb);
      mountAndPlay($(".hoard-logo", hoard), mockOf(hoard), c, { layout: "row", palette: sel });

      mount($(".glass-logo", slot("glass")), c, { layout: "stack", palette: lightI });
      renderStationery(slot("stationery"), c, darkI, lightI);
      renderIcons(slot("icons"), c, darkI, lightI);
    };

    select.addEventListener("change", draw);
    draw();
    $$(".mock", scope).forEach((m) => io.observe(m));
    return playIntro;
  }

  /* ——— Boot ——— */

  async function loadFonts() {
    const specs = new Set();
    for (const c of all) for (const t of [c.word, c.desc]) specs.add(`${t.weight || 400} 32px ${t.family}`);
    ["8px Marcellus", "italic 32px 'Instrument Serif'", "700 32px 'Space Grotesk'", "600 32px 'Space Grotesk'", "600 32px 'Quicksand'", "500 32px 'Fraunces'", "italic 32px 'Fraunces'"].forEach((s) => specs.add(s));
    const timeout = new Promise((r) => setTimeout(r, 3500));
    await Promise.race([Promise.allSettled([...specs].map((s) => document.fonts.load(s))), timeout]);
  }

  renderFoundation();
  renderP1();
  renderP2();
  Cards.renderPhase3({ starBtn });
  const playIntro = renderContext();
  syncShortlist();

  document.addEventListener("click", (e) => {
    const star = e.target.closest("[data-star]");
    if (star) {
      const id = star.dataset.star;
      state.shortlist.has(id) ? state.shortlist.delete(id) : state.shortlist.add(id);
      syncShortlist();
      if (state.shortlist.size) $("[data-shortlist]").hidden = false;
    }
    if (e.target.closest("[data-open-shortlist]") && state.shortlist.size) $("[data-shortlist]").hidden = false;
    if (e.target.closest("[data-close-shortlist]")) $("[data-shortlist]").hidden = true;
    const copyBtn = e.target.closest("[data-copy-shortlist]");
    if (copyBtn) copyShortlist(copyBtn);
  });

  loadFonts().then(() => {
    state.fontsReady = true;
    $$('svg[data-fit="1"]').forEach(fit);
    $$(".art, .mock").forEach((el) => {
      if (state.seen.has(el)) $$("svg.anim", el).forEach(play);
    });
    playIntro();
    startHero();
  });
})();
