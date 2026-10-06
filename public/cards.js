/* AURAQIS business cards: a CSS-3D card engine (real thickness, light-reactive foil, emboss and paper stocks),
   the Phase 3 designs, the full-screen inspector and the In-context levitation stack. */
(() => {
  "use strict";

  const L = window.AuraqisLogos;
  const C = L.C;
  const BRAND = "../brand/mark-green.png";
  const H = 64.71; // card height in em; 1em = 1% of the card width (85 × 55 mm)
  const concepts = new Map([...L.phase1, ...L.phase2].map((c) => [c.id, c]));
  const LINES = "<span>+91 75791 99999</span><span>info@auraqis.com</span><span>auraqis.com</span>";
  const LINE = "+91 75791 99999 &nbsp;·&nbsp; info@auraqis.com &nbsp;·&nbsp; auraqis.com";
  let uid = 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const enc = (svg) => `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, "%27")}')`;

  /* ——— Artwork helpers ——— */

  function svg(id, o = {}) {
    const c = concepts.get(id);
    const concept = o.pal ? { ...c, palettes: [o.pal] } : c;
    return `<span class="bc-svg" style="${o.style || ""}">${L.render(concept, { layout: "mark", palette: o.pal ? 0 : (o.palette ?? 0), href: BRAND, uid: `bc${++uid}` })}</span>`;
  }

  // Luminance mask: everything drawn in the background colour becomes a knockout.
  const MASK_PAL = { name: "mask", bg: "#000", primary: "#fff", accent: "#fff", soft: "#8c8c8c", deep: "#d6d6d6", text: "#fff", desc: "#fff" };
  const maskCache = new Map();
  function maskOf(id) {
    if (id.startsWith("P1")) return `--m:url(${BRAND});--mm:alpha`;
    if (!maskCache.has(id)) {
      const s = L.render({ ...concepts.get(id), palettes: [MASK_PAL] }, { layout: "mark", palette: 0, href: BRAND, uid: "mk" });
      maskCache.set(id, `--m:${enc(s)};--mm:luminance`);
    }
    return maskCache.get(id);
  }
  const shape = (body) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${H}">${body}</svg>`);

  const foil = (id, metal, style = "") => `<i class="fm m-${metal}" style="${maskOf(id)};${style}"></i>`;
  const foilShape = (body, metal) => `<i class="ab fm m-${metal}" style="inset:0;--m:${shape(body)};--mm:luminance;mask-size:100% 100%"></i>`;
  const blind = (id, paper, style = "") => `<span class="emb" style="${style}"><i class="fm" style="${maskOf(id)};background:${paper}"></i></span>`;
  const ink = (id, color, style = "") => `<i class="fm" style="${maskOf(id)};background:${color};${style}"></i>`;

  function word(id, style = "", cls = "", centred = false) {
    const w = concepts.get(id).word;
    const accent = w.accent ? `<span style="color:${w.accent.color}">${w.accent.text}</span>` : "";
    return (
      `<span class="wm ${cls}" style="font-family:${w.family};font-weight:${w.weight || 400};letter-spacing:${w.ls}em;` +
      `${centred ? `margin-right:-${w.ls}em;` : ""}${w.italic ? "font-style:italic;" : ""}${style}">${w.text}${accent}</span>`
    );
  }

  const cap = (text, style) => `<span class="cap" style="${style}">${text}</span>`;
  const DESC = "Constructions · Interiors";

  /* ——— Phase 3 designs ——— */

  const KRAFT = "#b48f66";
  const KRAFT_W = { name: "w", bg: KRAFT, primary: "#f6f2ea", accent: "#f6f2ea", soft: "#f6f2ea", deep: "#f6f2ea", text: "#f6f2ea", desc: "#f6f2ea" };
  const KRAFT_F = { ...KRAFT_W, primary: C.forest, accent: C.forest, soft: C.forest, deep: C.forest };

  const vellumFront = () =>
    `<div class="ab center" style="inset:0">${svg("P2-09", { palette: 0, style: "width:17em;height:17em" })}${word("P2-09", "font-size:3.4em;margin-top:1.3em;color:#2f4530", "", true)}</div>`;
  const vellumBack = () =>
    `<div class="ab" style="left:8em;top:9em;display:grid"><span style="font-weight:600;font-size:4.6em;line-height:1;color:#2f4530">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.42em;color:#a88a58;margin-top:1.3em")}</div>` +
    `<div class="ab lines" style="left:8em;bottom:8em;font-size:2.2em;color:#2f4530">${LINES}</div>`;

  const designs = [
    {
      id: "P3-01",
      slug: "brass-atelier",
      name: "Brass Atelier",
      logo: "P1-02",
      story: "Heavy forest-dyed cotton with the marble swirl hot-stamped in brushed gold foil. The reverse is ivory cotton, letterpressed, and all four edges are gilded so the card flashes gold whenever it’s picked up.",
      stock: { key: "cotton", name: "Cotton 700 gsm, duplex (Forest / Ivory)", tk: 1.3 },
      edge: "#7d5f30 0%, #e2c993 50%, #8a6a38 100%",
      edgeName: "Gilded gold edges",
      finishes: ["Gold foil hot-stamp", "Letterpress, one colour", "Gilded edges", "Duplex lamination"],
      type: ["Cormorant Garamond 600", "Manrope 600"],
      colours: [C.forestDeep, "#e2c993", C.brass, "#ebe6db"],
      scene: ["#45463d", "#151612"],
      front: () => ({
        bg: C.forestDeep,
        html:
          `<div class="ab center" style="inset:0">${foil("P1-02", "gold", "width:17em;height:17em")}` +
          word("P1-02", "font-size:5.4em;margin-top:.6em", "foil m-gold", true) +
          cap(DESC, "font-size:1.5em;letter-spacing:.52em;margin-right:-.52em;margin-top:1.5em;color:#cdb07a;opacity:.85") +
          `</div>`,
      }),
      back: () => ({
        bg: "#ebe6db",
        ink: C.forest,
        html:
          `<div class="ab" style="left:8em;top:9em;display:grid;justify-items:start">` +
          `<span class="lp" style="font-family:'Cormorant Garamond';font-weight:600;font-size:6em;line-height:1">Your Name</span>` +
          cap("Designation", "font-size:1.6em;letter-spacing:.36em;color:#a88a58;margin-top:1.2em") +
          `<i class="foil-rule m-gold" style="width:12em;height:.28em;margin:3em 0 2.6em"></i>` +
          `<span class="lines lp" style="font-size:2.3em">${LINES}</span></div>` +
          foil("P1-02", "gold", "position:absolute;right:8em;bottom:8em;width:8.5em;height:8.5em"),
      }),
    },
    {
      id: "P3-02",
      slug: "blueprint-gable",
      name: "Blueprint Gable",
      logo: "P2-02",
      story: "Drawn like an architect’s sheet. A 5 mm construction grid is blind-debossed into the stock, the Gable lettermark sits on it, and the reverse becomes a title block: name, role and contacts in ruled cells.",
      stock: { key: "smooth", name: "Smooth uncoated 450 gsm", tk: 0.9 },
      edge: "#658c55 0 100%",
      edgeName: "Sage painted edge",
      finishes: ["Blind-debossed 5 mm grid", "Two-colour offset (Sage + Brass)", "Sage painted edge"],
      type: ["Manrope 600", "Manrope 500"],
      colours: [C.paper, C.sage, C.brass, C.charcoal],
      scene: ["#efede7", "#c9c5bb"],
      front: () => ({
        bg: C.paper,
        ink: C.charcoal,
        html:
          `<i class="ab grid-deb" style="inset:0"></i><i class="ab crop" style="left:5em;top:5em"></i><i class="ab crop" style="right:5em;bottom:5em;transform:rotate(180deg)"></i>` +
          `<div class="ab center" style="inset:0">${svg("P2-02", { palette: 0, style: "width:15em;height:15em" })}` +
          word("P2-02", "font-size:3.8em;margin-top:1.3em", "", true) +
          cap(DESC, "font-size:1.35em;letter-spacing:.5em;margin-right:-.5em;margin-top:1.5em;color:#658c55") +
          `</div>` +
          cap("Sheet A-01 · Scale 1:1", "position:absolute;left:5.4em;bottom:4.6em;font-size:1.15em;letter-spacing:.26em;color:#8d887c"),
      }),
      back: () => ({
        bg: C.paper,
        ink: C.charcoal,
        html:
          `<i class="ab grid-deb" style="inset:0;opacity:.55"></i>` +
          `<div class="ab" style="left:6em;top:6em;display:flex;align-items:center;gap:1.8em">${svg("P2-02", { palette: 0, style: "width:7.5em;height:7.5em" })}` +
          `<span style="display:grid">${word("P2-02", "font-size:2.4em")}${cap(DESC, "font-size:1.15em;letter-spacing:.4em;color:#658c55;margin-top:.7em")}</span></div>` +
          `<div class="ab tblock" style="left:6em;right:6em;bottom:6em">` +
          `<div style="grid-column:span 2"><small>Name</small><b>Your Name</b></div><div><small>Role</small><span>Designation</span></div>` +
          `<div><small>Phone</small><span>+91 75791 99999</span></div><div><small>Email</small><span>info@auraqis.com</span></div><div><small>Web</small><span>auraqis.com</span></div></div>`,
      }),
    },
    {
      id: "P3-03",
      slug: "noir-triplex",
      name: "Noir Triplex",
      logo: "P2-14",
      story: "Three layers pressed together: black, sage, black. The sage core only shows at the edges, as a thin line of brand colour. On the front, the Section mark is in mirror-silver foil over a spot-UV wordmark pattern that only appears as the card tilts.",
      stock: { key: "black", name: "Black-core triplex 1100 gsm, sage core", tk: 1.9 },
      edge: "#121311 0 33%, #6d9a5c 33% 67%, #121311 67% 100%",
      edgeName: "Triplex edge with sage core",
      finishes: ["Mirror-silver foil", "Spot UV pattern", "Triplex sage core"],
      type: ["Space Grotesk 600", "Space Grotesk 400"],
      colours: ["#161715", "#d9dde0", C.sage, C.stone],
      scene: ["#5b5e58", "#1d1f1c"],
      front: () => ({
        bg: "#161715",
        html:
          `<div class="ab uvpat" style="inset:-6em">${`<span>${"AURAQIS ".repeat(7)}</span>`.repeat(14)}</div>` +
          `<div class="ab center" style="inset:0">${foil("P2-14", "silver", "width:25em;height:25em")}</div>` +
          cap("Design · Build · Interiors", "position:absolute;left:0;right:0;bottom:5.8em;text-align:center;font-size:1.25em;letter-spacing:.6em;color:#6f726c"),
      }),
      back: () => ({
        bg: "#161715",
        ink: C.stone,
        html:
          `<div class="ab" style="left:8em;top:9em;display:grid;justify-items:start"><span class="foil m-silver" style="font-family:'Space Grotesk';font-weight:600;font-size:5em;line-height:1.05">Your Name</span>` +
          cap("Designation", "font-size:1.5em;letter-spacing:.42em;color:#7aa868;margin-top:1.4em") +
          `</div><div class="ab lines" style="left:8em;bottom:8em;font-size:2.1em;font-family:'Space Grotesk'">${LINES}</div>` +
          `<div class="ab" style="right:8em;bottom:8em;display:grid;justify-items:end;gap:1.4em">${foil("P2-14", "silver", "width:9em;height:9em")}${word("P2-14", "font-size:1.7em;color:#c8c3b7", "", true)}</div>` +
          `<i class="ab" style="right:8em;top:9em;width:1.3em;height:1.3em;border-radius:50%;background:#6d9a5c"></i>`,
      }),
    },
    {
      id: "P3-04",
      slug: "marble-heritage",
      name: "Marble Heritage",
      logo: "P1-01",
      story: "The heritage swirl, enlarged until it runs off the edge like a slab of veined stone. Soft-touch laminate makes the card feel like suede, and a spot-gloss layer catches the light only on the marble.",
      stock: { key: "soft", name: "Soft-touch laminated 650 gsm, duplex", tk: 1.1 },
      edge: "#e9e6de 0 100%",
      edgeName: "Natural ivory core",
      finishes: ["Two-Pantone offset", "Soft-touch laminate", "Spot gloss on the swirl"],
      type: ["Quicksand 500", "Manrope 600"],
      colours: ["#e7e5df", C.sageLight, C.sage, C.forest],
      scene: ["#dedbd2", "#aca79b"],
      front: () => {
        const pos = "right:-17em;top:-15em;width:74em;height:74em";
        return {
          bg: "#e7e5df",
          html:
            `<i class="ab fm" style="${pos};--m:url(${BRAND});background:linear-gradient(160deg,#8fae80,#658c55 55%,#2f4530)"></i>` +
            `<i class="ab fm gloss" style="${pos};--m:url(${BRAND})"></i>` +
            `<div class="ab" style="left:7em;bottom:7em;display:grid">${word("P1-01", "font-size:4.4em;color:#2f4530")}${cap(DESC, "font-size:1.35em;letter-spacing:.42em;color:#a88a58;margin-top:1.3em")}</div>`,
        };
      },
      back: () => ({
        bg: C.sage,
        ink: "#eceae5",
        html:
          ink("P1-01", C.ivory, "position:absolute;right:7em;top:7em;width:9em;height:9em") +
          `<div class="ab" style="left:7em;top:8em;display:grid"><span style="font-family:'Quicksand';font-weight:600;font-size:5em;line-height:1">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.38em;color:#1f2e20;margin-top:1.3em")}</div>` +
          `<div class="ab lines" style="left:7em;bottom:7em;font-size:2.2em">${LINES}</div>` +
          `<span class="ab" style="right:7em;bottom:7em;font-family:'Instrument Serif';font-style:italic;font-size:2.7em;line-height:1;color:#dfe8d8">Where Vision Meets Craftsmanship</span>`,
      }),
    },
    {
      id: "P3-05",
      slug: "portal-die-cut",
      name: "Portal Die-cut",
      logo: "P2-01",
      story: "An arched window is die-cut right through the card, and you can see the world through it. A brass foil line traces the arch on both sides, so the card itself becomes the Portal mark.",
      stock: { key: "cotton", name: "Forest-dyed cotton 600 gsm, duplex", tk: 1.2 },
      edge: "#2f4530 0 100%",
      edgeName: "Forest core",
      finishes: ["Arched die-cut window", "Brass foil outline", "Duplex (Forest / Ivory)", "Letterpress reverse"],
      type: ["Cormorant Garamond 600", "Instrument Serif Italic"],
      colours: [C.forestDeep, C.brass, "#ebe6db", C.forest],
      scene: ["#c9b99a", "#6f6553"],
      front: () => ({
        bg: C.forestDeep,
        cut: shape(`<rect width="100" height="${H}" fill="#fff"/><path d="M12 52 V24 A9 9 0 0 1 30 24 V52 Z" fill="#000"/>`),
        html:
          foilShape(`<path d="M10.5 53.5 V24 A10.5 10.5 0 0 1 31.5 24 V53.5" fill="none" stroke="#fff" stroke-width=".55"/>`, "gold") +
          `<div class="ab" style="left:40em;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center">${word("P2-01", "font-size:5.2em;color:#e3e2dd")}` +
          cap(DESC, "font-size:1.4em;letter-spacing:.44em;color:#cdb07a;margin-top:1.4em") +
          `<span style="font-family:'Instrument Serif';font-style:italic;font-size:2.6em;line-height:1;color:rgba(227,226,221,.68);margin-top:2.4em">Where Vision Meets Craftsmanship</span></div>`,
      }),
      back: () => ({
        bg: "#ebe6db",
        ink: C.forest,
        cut: shape(`<rect width="100" height="${H}" fill="#fff"/><path d="M70 52 V24 A9 9 0 0 1 88 24 V52 Z" fill="#000"/>`),
        html:
          foilShape(`<path d="M68.5 53.5 V24 A10.5 10.5 0 0 1 89.5 24 V53.5" fill="none" stroke="#fff" stroke-width=".55"/>`, "gold") +
          `<div class="ab" style="left:8em;top:9em;display:grid"><span class="lp" style="font-family:'Cormorant Garamond';font-weight:600;font-size:5.6em;line-height:1">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.36em;color:#a88a58;margin-top:1.3em")}</div>` +
          `<div class="ab lines lp" style="left:8em;bottom:8em;font-size:2.2em">${LINES}</div>`,
      }),
    },
    {
      id: "P3-06",
      slug: "kraft-leaf",
      name: "Kraft Leaf",
      logo: "P2-06",
      story: "Raw recycled kraft board with visible fibres, the Leaf Plan screen-printed in dense white ink. The reverse is letterpressed in forest green. Honest, tactile and sustainable, the way the brand wants to build.",
      stock: { key: "kraft", name: "Recycled kraft board 500 gsm", tk: 1.2 },
      edge: "#9c7a53 0 100%",
      edgeName: "Natural kraft",
      finishes: ["Opaque white screen-print", "Forest letterpress", "100% recycled fibre"],
      type: ["Fraunces 500", "Manrope 600"],
      colours: [KRAFT, "#f6f2ea", C.forest],
      scene: ["#e9e5db", "#bfb8a8"],
      front: () => ({
        bg: KRAFT,
        html:
          `<div class="ab center" style="inset:0">${svg("P2-06", { pal: KRAFT_W, style: "width:18em;height:18em" })}` +
          word("P2-06", "font-size:4.8em;margin-top:1.4em;color:#f6f2ea", "", true) +
          cap(DESC, "font-size:1.4em;letter-spacing:.46em;margin-right:-.46em;color:#2f4530;margin-top:1.3em") +
          `</div>`,
      }),
      back: () => ({
        bg: KRAFT,
        ink: C.forest,
        html:
          `<div class="ab" style="left:8em;top:9em;display:grid"><span class="lp" style="font-family:'Fraunces';font-weight:500;font-size:5.4em;line-height:1">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.36em;margin-top:1.3em;color:#f6f2ea")}</div>` +
          `<div class="ab lines lp" style="left:8em;bottom:8em;font-size:2.2em">${LINES}</div>` +
          `<div class="ab" style="right:8em;bottom:8em;display:grid;justify-items:end;gap:1.2em">${svg("P2-06", { pal: KRAFT_F, style: "width:8em;height:8em" })}<span style="font-family:'Fraunces';font-style:italic;font-size:1.5em;opacity:.8">Printed on 100% recycled board</span></div>`,
      }),
    },
    {
      id: "P3-07",
      slug: "copper-keystone",
      name: "Copper Keystone",
      logo: "P2-11",
      story: "Midnight-teal linen with a polished copper Keystone. The linen weave is embossed into the board, so you can feel it under your thumb, and the copper edges glow like a hotel lobby at night.",
      stock: { key: "linen", name: "Embossed linen 600 gsm, midnight teal", tk: 1.25 },
      edge: "#6b3a20 0%, #e0a879 50%, #7d4a2c 100%",
      edgeName: "Copper painted edge",
      finishes: ["Copper foil", "Linen-embossed board", "Copper painted edge"],
      type: ["Cinzel 500", "Manrope 500"],
      colours: ["#132420", "#e0a879", "#c47f52", "#ece3d3"],
      scene: ["#33433e", "#0d1513"],
      front: () => ({
        bg: "#132420",
        html:
          `<div class="ab center" style="inset:0">${foil("P2-11", "copper", "width:21em;height:21em")}` +
          word("P2-11", "font-size:4.3em;margin-top:1em", "foil m-copper", true) +
          cap(DESC, "font-size:1.35em;letter-spacing:.5em;margin-right:-.5em;color:#d9a273;opacity:.75;margin-top:1.4em") +
          `</div>`,
      }),
      back: () => ({
        bg: "#132420",
        ink: "#ece3d3",
        html:
          `<div class="ab" style="left:8em;top:9em;display:grid;justify-items:start"><span style="font-family:'Cinzel';font-weight:500;font-size:4.6em;letter-spacing:.06em;line-height:1">Your Name</span>` +
          cap("Designation", "font-size:1.5em;letter-spacing:.4em;color:#d9a273;margin-top:1.3em") +
          `<i class="foil-rule m-copper" style="width:10em;height:.26em;margin-top:2.8em"></i></div>` +
          `<div class="ab lines" style="left:8em;bottom:8em;font-size:2.15em;opacity:.86">${LINES}</div>` +
          foil("P2-11", "copper", "position:absolute;right:8em;bottom:8em;width:10em;height:10em"),
      }),
    },
    {
      id: "P3-08",
      slug: "strata-edge",
      name: "Strata Edge",
      logo: "P2-05",
      story: "An extra-thick 1200 gsm board with its edge painted in a gradient from sage to forest, echoing the stacked floor plates of the Strata mark. Side-on, the card itself reads as layers of construction.",
      stock: { key: "smooth", name: "Extra-thick 1200 gsm, duplex", tk: 2.7 },
      edge: "#cfdcc6 0%, #8fae80 30%, #658c55 60%, #2f4530 100%",
      edgeName: "Gradient painted edge (Sage → Forest)",
      finishes: ["Gradient painted edge", "One-colour offset", "Extra-thick duplex"],
      type: ["Outfit 500"],
      colours: ["#f4f3ef", C.sageLight, C.sage, C.forest],
      scene: ["#e4e2db", "#aeaa9e"],
      front: () => ({
        bg: "#f4f3ef",
        html:
          svg("P2-05", { palette: 0, style: "position:absolute;left:7em;top:7em;width:13em;height:13em" }) +
          cap(DESC, "position:absolute;right:7em;top:8.6em;font-size:1.3em;letter-spacing:.4em;color:#8d887c") +
          word("P2-05", "position:absolute;left:6.6em;bottom:5.6em;font-size:6.6em;line-height:1;color:#2f4530"),
      }),
      back: () => ({
        bg: C.forest,
        ink: C.ivory,
        html:
          `<div class="ab" style="right:7em;top:8em;display:grid;justify-items:end;text-align:right"><span style="font-family:'Outfit';font-weight:500;font-size:5em;line-height:1">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.38em;color:#8fae80;margin-top:1.3em")}</div>` +
          `<div class="ab lines" style="right:7em;bottom:7em;font-size:2.2em;text-align:right;font-family:'Outfit'">${LINES}</div>` +
          svg("P2-05", { palette: 1, style: "position:absolute;left:7em;bottom:7em;width:10em;height:10em" }),
      }),
    },
    {
      id: "P3-09",
      slug: "vellum-horizon",
      name: "Vellum Horizon",
      logo: "P2-09",
      story: "Printed on translucent vellum. Light passes through the card and the reverse shows faintly as a ghost, so it feels like tracing paper laid over a drawing. Ethereal, light and unexpected.",
      stock: { key: "vellum", name: "Translucent vellum 300 gsm", tk: 0.6 },
      edge: "rgba(250,250,244,.6) 0 100%",
      edgeName: "Translucent",
      finishes: ["Translucent vellum", "Two-colour print", "Reverse ghosts through"],
      type: ["Manrope 300", "Manrope 600"],
      colours: ["#eceee6", C.forest, C.brass],
      scene: ["#93b384", "#3d5734"],
      front: () => ({ bg: "rgba(236,238,230,.8)", html: `<div class="ab ghost" style="inset:0">${vellumBack()}</div>${vellumFront()}` }),
      back: () => ({ bg: "rgba(236,238,230,.8)", html: `<div class="ab ghost" style="inset:0">${vellumFront()}</div>${vellumBack()}` }),
    },
    {
      id: "P3-10",
      slug: "editorial-mono",
      name: "Editorial Mono",
      logo: "P1-08",
      story: "A wordmark so large it barely fits the card, set in Syne Bold and finished with a sage full stop in spot UV. The edge is painted the same sage, so the card makes a statement even when it’s side-on in a stack.",
      stock: { key: "smooth", name: "Super-smooth 600 gsm, ultra-white", tk: 1.1 },
      edge: "#79a865 0 100%",
      edgeName: "Sage painted edge",
      finishes: ["One-colour offset", "Spot UV full stop", "Sage painted edge"],
      type: ["Syne 700", "Manrope 600"],
      colours: ["#f5f4f0", C.charcoal, "#79a865", C.stoneDark],
      scene: ["#e9e7e1", "#c3bfb5"],
      front: () => ({
        bg: "#f5f4f0",
        ink: C.charcoal,
        html:
          cap("Design · Build · Interiors", "position:absolute;left:6.5em;top:6.6em;font-size:1.3em;letter-spacing:.42em;color:#8d887c") +
          ink("P1-08", C.charcoal, "position:absolute;right:6.5em;top:5.4em;width:7em;height:7em") +
          `<span class="ab" style="left:5.4em;bottom:4.4em;font-family:'Syne';font-weight:700;font-size:15.5em;line-height:.84;letter-spacing:-.01em">AURA<br>QIS<span style="color:#79a865">.</span></span>`,
      }),
      back: () => ({
        bg: C.charcoal,
        ink: C.ivory,
        html:
          `<div class="ab" style="left:7em;top:8em;display:grid"><span style="font-family:'Syne';font-weight:700;font-size:5.4em;line-height:1">Your Name<span style="color:#79a865">.</span></span>${cap("Designation", "font-size:1.5em;letter-spacing:.4em;color:#8d887c;margin-top:1.3em")}</div>` +
          `<div class="ab lines" style="left:7em;bottom:7em;font-size:2.2em;color:#c8c3b7">${LINES}</div>` +
          `<span class="ab" style="right:7em;bottom:6.6em;font-family:'Syne';font-weight:700;font-size:3em;letter-spacing:.04em">AURAQIS<span style="color:#79a865">.</span></span>`,
      }),
    },
    {
      id: "P3-11",
      slug: "seal-emboss",
      name: "Seal Emboss",
      logo: "P2-08",
      story: "No ink on the front at all. The Atelier Seal is blind-embossed into thick cotton and appears only as light and shadow, so move the lamp and it surfaces. The reverse is letterpressed in forest green with a small gold seal.",
      stock: { key: "cotton", name: "Pure cotton 800 gsm, ivory", tk: 1.5 },
      edge: "#efe9dd 0 100%",
      edgeName: "Natural cotton",
      finishes: ["Blind emboss (no ink)", "Forest letterpress", "Gold foil seal"],
      type: ["Marcellus 400", "Manrope 600"],
      colours: ["#ece6da", C.forest, C.brass],
      scene: ["#d8d2c4", "#9c9586"],
      front: () => ({
        bg: "#ece6da",
        html:
          `<div class="ab center" style="inset:0">${blind("P2-08", "#ece6da", "width:31em;height:31em")}</div>` +
          cap("Quality · Innovation · Integrity", "position:absolute;left:0;right:0;bottom:5.4em;text-align:center;font-size:1.25em;letter-spacing:.56em;color:rgba(47,69,48,.7)"),
      }),
      back: () => ({
        bg: "#ece6da",
        ink: C.forest,
        html:
          `<div class="ab center" style="inset:0;text-align:center">${foil("P2-08", "gold", "width:8.5em;height:8.5em;margin-bottom:2.6em")}` +
          `<span class="lp" style="font-family:'Marcellus';font-size:5em;line-height:1">Your Name</span>` +
          cap("Designation", "font-size:1.5em;letter-spacing:.42em;margin-right:-.42em;color:#a88a58;margin-top:1.4em") +
          `<span class="lp" style="font-size:1.95em;margin-top:3em">${LINE}</span></div>`,
      }),
    },
    {
      id: "P3-12",
      slug: "aura-pearl",
      name: "Aura Pearl",
      logo: "P2-04",
      story: "Pearlescent forest board that shifts from rose to mint to champagne as it turns, a soft aura to match the mark’s name. Tilt it and the colour moves across the surface like light on water.",
      stock: { key: "pearl", name: "Pearlescent shimmer 400 gsm, forest", tk: 1.0 },
      edge: "#24352a 0 100%",
      edgeName: "Forest core",
      finishes: ["Pearl shimmer board", "White ink + brass", "Iridescent on tilt"],
      type: ["Jost 400", "Manrope 600"],
      colours: [C.forestDeep, C.ivory, C.brassLight, "#cfe7da"],
      scene: ["#3d4e40", "#121a13"],
      front: () => ({
        bg: C.forestDeep,
        html:
          `<i class="ab pearl" style="inset:0"></i><div class="ab center" style="inset:0">${svg("P2-04", { palette: 1, style: "width:22em;height:22em" })}` +
          word("P2-04", "font-size:3.6em;margin-top:1.3em;color:#e3e2dd", "", true) +
          `</div>`,
      }),
      back: () => ({
        bg: C.forestDeep,
        ink: C.ivory,
        html:
          `<i class="ab pearl" style="inset:0"></i>` +
          `<div class="ab" style="left:8em;top:9em;display:grid"><span style="font-family:'Jost';font-size:5em;line-height:1">Your Name</span>${cap("Designation", "font-size:1.5em;letter-spacing:.44em;color:#cdb07a;margin-top:1.3em")}</div>` +
          `<div class="ab lines" style="left:8em;bottom:8em;font-size:2.2em;font-family:'Jost';opacity:.88">${LINES}</div>` +
          svg("P2-04", { palette: 1, style: "position:absolute;right:8em;bottom:8em;width:9.5em;height:9.5em" }),
      }),
    },
  ];

  /** A plain card generated from any logo concept, for the In-context stack. */
  function conceptDesign(c, dark, light) {
    const p1 = c.id.startsWith("P1");
    const P = (i) => (p1 ? { bg: c.bg, text: c.word.color, desc: c.desc.color, accent: c.rule || c.desc.color } : c.palettes[i]);
    const D = P(dark);
    const Lt = P(light);
    const size = clamp(c.word.size / 8.6, 3.4, 6.4);
    return {
      id: c.id,
      stock: { key: "cotton", tk: 1.3 },
      edge: `${D.accent} 0 100%`,
      front: () => ({
        bg: D.bg,
        html: `<div class="ab center" style="inset:0">${svg(c.id, { palette: dark, style: "width:21em;height:21em" })}${word(c.id, `font-size:${size}em;margin-top:1.4em;color:${D.text}`, "", true)}</div>`,
      }),
      back: () => ({
        bg: Lt.bg,
        ink: Lt.text,
        html:
          `<div class="ab" style="left:8em;top:9em;display:grid"><span style="font-weight:600;font-size:4.8em;line-height:1">Your Name</span>${cap("Designation", `font-size:1.5em;letter-spacing:.4em;color:${Lt.desc};margin-top:1.3em`)}</div>` +
          `<div class="ab lines" style="left:8em;bottom:8em;font-size:2.2em;opacity:.9">${LINES}</div>` +
          svg(c.id, { palette: light, style: "position:absolute;right:8em;bottom:8em;width:10em;height:10em" }),
      }),
    };
  }

  /* ——— Card DOM ——— */

  function face(side, f) {
    const cut = f.cut ? ` cut" style="--cut:${f.cut};` : `" style="`;
    return `<div class="bc-face bc-${side}${cut}background:${f.bg};color:${f.ink || "inherit"}">${f.html}<i class="bc-tex"></i><i class="bc-glare"></i></div>`;
  }

  function build(d, w, o = {}) {
    const el = document.createElement("div");
    el.className = `bc stock-${d.stock.key}`;
    el.style.cssText = `--w:${w};--tk:${d.stock.tk};--edge:${d.edge}`;
    const front = o.plain ? { bg: d.front().bg, html: "" } : d.front();
    const back = o.plain ? { bg: d.back().bg, html: "" } : d.back();
    el.innerHTML =
      `<div class="bc-rot">${face("front", front)}${face("back", back)}` +
      `<i class="bc-side bc-top"></i><i class="bc-side bc-bottom"></i><i class="bc-side bc-left"></i><i class="bc-side bc-right"></i></div>`;
    return el;
  }

  /* ——— Motion: one rAF loop drives every visible card ——— */

  const live = new Set();
  let raf = 0;
  function loop(now) {
    raf = live.size ? requestAnimationFrame(loop) : 0;
    for (const c of live) c.tick(now);
  }
  const wake = (c) => {
    live.add(c);
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const sleep = (c) => live.delete(c);

  const vis = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const c = e.target._bc;
      if (!c) continue;
      if (e.isIntersecting) {
        wake(c);
        c.onVisible?.();
      } else sleep(c);
    }
  });

  class Card {
    constructor(el, o = {}) {
      this.el = el;
      this.rot = el.querySelector(".bc-rot");
      this.mode = o.mode || "tile";
      this.base = { rx: o.rx ?? 12, ry: o.ry ?? -20 };
      this.rx = o.startRx ?? this.base.rx;
      this.ry = o.startRy ?? this.base.ry;
      this.tRx = this.base.rx;
      this.tRy = this.base.ry;
      this.flip = 0;
      this.hover = null;
      this.light = "lamp";
      this.ease = o.ease ?? 0.085;
      this.t0 = performance.now();
      this.onFrame = o.onFrame;
    }

    tick(now) {
      const t = (now - this.t0) / 1000;
      if (this.mode === "tile") {
        const h = this.hover;
        this.tRx = h ? (0.5 - h.y) * 34 : this.base.rx + Math.sin(t * 0.8) * 4;
        this.tRy = (h ? (h.x - 0.5) * 48 : this.base.ry + Math.sin(t * 0.5) * 11) + this.flip * 180;
      }
      this.onFrame?.(this, t);
      this.rx += (this.tRx - this.rx) * this.ease;
      this.ry += (this.tRy - this.ry) * this.ease;
      this.rot.style.transform = `rotateX(${this.rx.toFixed(2)}deg) rotateY(${this.ry.toFixed(2)}deg)`;
      this.paintLight();
    }

    paintLight() {
      const sy = Math.sin((this.ry * Math.PI) / 180);
      const sx = Math.sin((this.rx * Math.PI) / 180);
      let fx;
      let bx;
      let ly;
      let depth = 1;
      let gl = 1;
      if (this.light === "raking") {
        fx = -0.45 - sy * 0.3;
        bx = -0.45 + sy * 0.3;
        ly = 0.42 + sx * 0.3;
        depth = 2.8;
        gl = 0.7;
      } else if (this.light === "studio") {
        fx = 0.5 - sy * 0.5;
        bx = 0.5 + sy * 0.5;
        ly = 0.15 + sx * 0.5;
        depth = 0.7;
        gl = 0.55;
      } else if (this.hover) {
        fx = this.hover.x;
        bx = 1 - this.hover.x;
        ly = this.hover.y;
      } else {
        fx = 0.3 - sy * 0.85;
        bx = 0.3 + sy * 0.85;
        ly = 0.22 + sx * 0.85;
      }
      const s = this.el.style;
      s.setProperty("--lxn", fx.toFixed(3));
      s.setProperty("--lxnb", bx.toFixed(3));
      s.setProperty("--lyn", ly.toFixed(3));
      s.setProperty("--sx", clamp((0.5 - fx) * 2, -2.4, 2.4).toFixed(3));
      s.setProperty("--sxb", clamp((0.5 - bx) * 2, -2.4, 2.4).toFixed(3));
      s.setProperty("--sy", clamp((0.5 - ly) * 2, -2.4, 2.4).toFixed(3));
      s.setProperty("--depth", depth);
      s.setProperty("--gl", gl);
    }

    showsFront() {
      return Math.cos((this.ry * Math.PI) / 180) >= 0;
    }
  }

  const rel = (e, el) => {
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  /* ——— Phase 3 grid ——— */

  function specRows(d) {
    const c = concepts.get(d.logo);
    return [
      ["Stock", d.stock.name],
      ["Finish", d.finishes.join(" · ")],
      ["Edge", d.edgeName],
      ["Logo", `${d.logo} · ${c.name}`],
      ["Type", d.type.join(" / ")],
    ];
  }

  function renderPhase3(api) {
    const grid = document.querySelector('[data-grid="p3"]');
    designs.forEach((d, i) => {
      const el = document.createElement("article");
      el.className = "card card-bc";
      el.id = d.id.toLowerCase();
      el.innerHTML = `
        <div class="art bc-stage" style="--s1:${d.scene[0]};--s2:${d.scene[1]}">
          <div class="bc-holder"></div>
          <i class="bc-floor"></i>
          <span class="tag">${d.id}</span>
          <div class="art-tools">
            <button type="button" class="chip-btn" data-act="flip">Flip</button>
            <button type="button" class="chip-btn" data-act="inspect">Inspect</button>
          </div>
          <span class="bc-hint">Move to light · Click to flip</span>
        </div>
        <div class="meta">
          <div class="meta-head"><h3><small>${d.id}</small>${d.name}</h3>${api.starBtn(d)}</div>
          <p>${d.story}</p>
          <dl class="bc-specs">${specRows(d).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          <div class="actions">
            <button type="button" class="btn" data-act="inspect">Inspect in 3D</button>
            <button type="button" class="btn" data-act="flip">Flip card</button>
          </div>
        </div>`;
      grid.append(el);

      const stage = el.querySelector(".bc-stage");
      const holder = el.querySelector(".bc-holder");
      const floor = el.querySelector(".bc-floor");
      const lum = parseInt(d.scene[0].slice(1, 3), 16) > 140;
      stage.style.setProperty("--fg", lum ? C.charcoal : C.ivory);

      const card = build(d, 300);
      holder.append(card);
      const ctl = new Card(card, {
        rx: 14,
        ry: -22,
        startRy: -160,
        onFrame: (c) => {
          floor.style.transform = `scaleX(${(0.35 + 0.65 * Math.abs(Math.cos((c.ry * Math.PI) / 180))).toFixed(3)})`;
        },
      });
      card._bc = ctl;
      ctl.onVisible = () => {
        if (ctl.demoed) return;
        ctl.demoed = true;
        setTimeout(() => !ctl.touched && (ctl.flip = 1), 1800);
        setTimeout(() => !ctl.touched && (ctl.flip = 0), 5200);
      };
      vis.observe(card);
      new ResizeObserver(() => card.style.setProperty("--w", Math.round(clamp(stage.clientWidth * 0.6, 180, 420)))).observe(stage);

      stage.addEventListener("pointermove", (e) => {
        ctl.hover = rel(e, stage);
        ctl.touched = true;
      });
      stage.addEventListener("pointerleave", () => (ctl.hover = null));
      el.addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "inspect") return openViewer(i);
        if (act === "flip" || (!act && e.target.closest(".bc-stage"))) {
          ctl.touched = true;
          ctl.flip ^= 1;
        }
      });
    });
  }

  /* ——— Inspector ——— */

  const V = { dlg: null, i: 0, ctl: null, zoom: 1, loupe: false, drag: null, vel: 0, side: null, lens: null, w: 0 };
  const $v = (s) => V.dlg.querySelector(s);

  function ensureViewer() {
    if (V.dlg) return;
    const dlg = document.createElement("dialog");
    dlg.className = "bcv";
    dlg.setAttribute("aria-label", "Business card inspector");
    dlg.innerHTML = `
      <div class="bcv-stage" data-stage data-light="lamp">
        <p class="bcv-hint">Drag to turn · Scroll to zoom · The cursor is your lamp</p>
        <div class="bcv-holder" data-holder></div>
        <i class="bc-floor"></i>
        <div class="bcv-loupe" data-loupe hidden></div>
        <div class="bcv-toolbar">
          <div class="seg" role="group" aria-label="View">
            <button type="button" data-v="front">Front</button><button type="button" data-v="back">Back</button><button type="button" data-v="edge">Edge</button><button type="button" data-v="spin">Spin 360°</button>
          </div>
          <div class="seg" role="group" aria-label="Lighting">
            <button type="button" data-light="lamp" aria-pressed="true">Lamp</button><button type="button" data-light="raking">Raking light</button><button type="button" data-light="studio">Studio</button>
          </div>
          <button type="button" class="pill" data-v="loupe" aria-pressed="false">Loupe ×3</button>
        </div>
      </div>
      <aside class="bcv-panel">
        <div class="bcv-nav">
          <button type="button" data-v="prev" aria-label="Previous card">←</button>
          <span data-count></span>
          <button type="button" data-v="next" aria-label="Next card">→</button>
          <button type="button" class="bcv-close" data-v="close">Close</button>
        </div>
        <p class="bcv-id" data-id></p>
        <h2 data-title></h2>
        <p class="bcv-story" data-story></p>
        <dl class="bcv-specs" data-specs></dl>
        <div class="bcv-swatches" data-swatches></div>
        <p class="bcv-keys">Keys: <kbd>←</kbd> <kbd>→</kbd> browse · <kbd>F</kbd> flip · <kbd>L</kbd> loupe · <kbd>Esc</kbd> close</p>
      </aside>`;
    document.body.append(dlg);
    V.dlg = dlg;

    const stage = $v("[data-stage]");
    const holder = $v("[data-holder]");
    const loupe = $v("[data-loupe]");

    const nearest = (target, offset) => Math.round((V.ctl.tRy - offset) / 360) * 360 + offset;
    const view = (v) => {
      const c = V.ctl;
      if (v === "front") Object.assign(c, { tRx: 0, tRy: nearest(c.tRy, 0) });
      if (v === "back") Object.assign(c, { tRx: 0, tRy: nearest(c.tRy, 180) });
      if (v === "edge") Object.assign(c, { tRx: 10, tRy: nearest(c.tRy, 0) + 80 });
      if (v === "spin") c.tRy += 360;
      if (v === "flip") c.tRy += 180;
      if (v === "loupe") {
        V.loupe = !V.loupe;
        V.side = null;
        $v('[data-v="loupe"]').setAttribute("aria-pressed", V.loupe);
        stage.classList.toggle("is-loupe", V.loupe);
        if (V.loupe) view(c.showsFront() ? "front" : "back");
        else loupe.hidden = true;
      }
      if (v === "prev" || v === "next") {
        V.i = (V.i + (v === "next" ? 1 : -1) + designs.length) % designs.length;
        show();
      }
      if (v === "close") dlg.close();
    };

    dlg.addEventListener("click", (e) => {
      const b = e.target.closest("[data-v]");
      if (b) view(b.dataset.v);
      const l = e.target.closest("[data-light]");
      if (l) {
        V.ctl.light = l.dataset.light;
        stage.dataset.light = l.dataset.light;
        $v("[data-light][aria-pressed='true']")?.setAttribute("aria-pressed", "false");
        l.setAttribute("aria-pressed", "true");
      }
    });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dlg.close();
      }
      if (e.key === "ArrowRight") view("next");
      if (e.key === "ArrowLeft") view("prev");
      if (e.key.toLowerCase() === "f") view("flip");
      if (e.key.toLowerCase() === "l") view("loupe");
    });
    dlg.addEventListener("close", () => {
      if (V.ctl) sleep(V.ctl);
      document.documentElement.style.overflow = "";
    });

    stage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        V.zoom = clamp(V.zoom * (1 - e.deltaY * 0.0012), 0.6, 1.9);
        holder.style.transform = `scale(${V.zoom.toFixed(3)})`;
      },
      { passive: false },
    );
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      V.drag = { x: e.clientX, y: e.clientY, moved: 0 };
      V.vel = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      const p = rel(e, stage);
      stage.style.setProperty("--px", `${(p.x * 100).toFixed(1)}%`);
      stage.style.setProperty("--py", `${(p.y * 100).toFixed(1)}%`);
      V.ctl.hover = rel(e, V.ctl.el);
      if (V.drag) {
        const dx = e.clientX - V.drag.x;
        const dy = e.clientY - V.drag.y;
        V.drag.x = e.clientX;
        V.drag.y = e.clientY;
        V.drag.moved += Math.abs(dx) + Math.abs(dy);
        if (!V.loupe) {
          V.ctl.tRy += dx * 0.5;
          V.ctl.tRx = clamp(V.ctl.tRx - dy * 0.4, -75, 75);
          V.vel = dx * 0.5;
        }
      }
      if (V.loupe) moveLoupe(e, stage, loupe);
    });
    stage.addEventListener("pointerup", () => {
      if (V.drag && V.drag.moved < 5 && !V.loupe) view("flip");
      V.drag = null;
    });
    stage.addEventListener("pointerleave", () => {
      V.ctl.hover = null;
      loupe.hidden = true;
    });
  }

  function moveLoupe(e, stage, loupe) {
    const front = V.ctl.showsFront();
    const faceEl = V.ctl.el.querySelector(front ? ".bc-front" : ".bc-back");
    const r = faceEl.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width;
    const v = (e.clientY - r.top) / r.height;
    if (u < 0 || u > 1 || v < 0 || v > 1) {
      loupe.hidden = true;
      return;
    }
    loupe.hidden = false;
    if (V.side !== front) {
      V.side = front;
      V.lens = document.createElement("div");
      V.lens.className = `${V.ctl.el.className} bc-lens`;
      V.lens.append(faceEl.cloneNode(true));
      loupe.replaceChildren(V.lens);
    }
    const w = V.w;
    const h = w * (H / 100);
    const Z = (2.9 * r.width) / w;
    const S = loupe.offsetWidth;
    const sr = stage.getBoundingClientRect();
    loupe.style.left = `${e.clientX - sr.left}px`;
    loupe.style.top = `${e.clientY - sr.top}px`;
    V.lens.style.cssText =
      `${V.ctl.el.style.cssText};position:absolute;left:0;top:0;transform-origin:0 0;` +
      `transform:translate(${(S / 2 - u * w * Z).toFixed(1)}px,${(S / 2 - v * h * Z).toFixed(1)}px) scale(${Z.toFixed(3)})`;
  }

  function show() {
    const d = designs[V.i];
    const stage = $v("[data-stage]");
    const holder = $v("[data-holder]");
    const floor = stage.querySelector(".bc-floor");
    if (V.ctl) sleep(V.ctl);
    V.w = Math.round(clamp(Math.min(stage.clientWidth * 0.62, stage.clientHeight * 0.95), 260, 640));
    const el = build(d, V.w);
    holder.replaceChildren(el);
    V.ctl = new Card(el, {
      mode: "manual",
      rx: 10,
      ry: -18,
      startRx: 40,
      startRy: -200,
      ease: 0.1,
      onFrame: (c) => {
        if (!V.drag && Math.abs(V.vel) > 0.02) {
          c.tRy += V.vel;
          V.vel *= 0.94;
        }
        floor.style.transform = `scaleX(${(0.3 + 0.7 * Math.abs(Math.cos((c.ry * Math.PI) / 180))).toFixed(3)})`;
      },
    });
    V.ctl.light = stage.dataset.light;
    V.side = null;
    $v("[data-loupe]").hidden = true;
    wake(V.ctl);

    stage.style.setProperty("--s1", d.scene[0]);
    stage.style.setProperty("--s2", d.scene[1]);
    $v("[data-count]").textContent = `${String(V.i + 1).padStart(2, "0")} / ${designs.length}`;
    $v("[data-id]").textContent = `${d.id} · Business card`;
    $v("[data-title]").textContent = d.name;
    $v("[data-story]").textContent = d.story;
    $v("[data-specs]").innerHTML = [["Size", "85 × 55 mm · 2 mm radius"], ...specRows(d)].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $v("[data-swatches]").innerHTML = d.colours.map((c) => `<span><i style="background:${c}"></i>${c.toUpperCase()}</span>`).join("");
  }

  function openViewer(i) {
    ensureViewer();
    V.i = i;
    V.zoom = 1;
    $v("[data-holder]").style.transform = "";
    V.dlg.showModal();
    document.documentElement.style.overflow = "hidden";
    show();
  }

  /* ——— In context: a card levitating above its own stack ——— */

  function levitate(scene, d) {
    scene.querySelector(".lev")?._destroy?.();
    const root = document.createElement("div");
    root.className = "lev";
    root.innerHTML = `<div class="lev-world"><div class="lev-stack"><i class="lev-ground"></i></div></div><span class="lev-hint">Move the light · Drag to spin · Click to flip</span>`;
    scene.append(root);
    const stack = root.querySelector(".lev-stack");
    const w = Math.round(clamp(scene.clientWidth * 0.46, 190, 320));
    const t = w * d.stock.tk * 0.01;
    const n = 6;
    stack.style.setProperty("--w", w);
    for (let i = 0; i < n; i++) {
      const slab = build(d, w, { plain: i < n - 1 });
      slab.style.transform = `translateZ(${(i * t).toFixed(2)}px)`;
      slab.querySelector(".bc-rot").style.transform = "none";
      stack.append(slab);
    }
    const shadow = document.createElement("i");
    shadow.className = "lev-shadow";
    shadow.style.transform = `translateZ(${(n * t + 0.6).toFixed(2)}px)`;
    stack.append(shadow);
    const float = document.createElement("div");
    float.className = "lev-float";
    stack.append(float);
    const card = build(d, w);
    float.append(card);

    let spin = 0;
    let last = 0;
    let drag = null;
    const ctl = new Card(card, {
      mode: "manual",
      rx: 0,
      ry: 0,
      startRy: -90,
      ease: 0.08,
      onFrame: (c, time) => {
        const dt = last ? Math.min(0.05, time - last) : 0;
        last = time;
        if (!c.hover && !drag) spin += dt * 26;
        c.tRy = spin + c.flip * 180;
        c.tRx = c.hover ? (0.5 - c.hover.y) * 18 : 0;
        const bob = Math.sin(time * 1.4);
        const lift = n * t + w * 0.34 + bob * 7;
        float.style.transform = `translateZ(${lift.toFixed(1)}px) rotateZ(30deg) rotateX(-46deg)`;
        shadow.style.opacity = (0.5 - bob * 0.08).toFixed(3);
        shadow.style.scale = (0.92 + bob * 0.04).toFixed(3);
      },
    });
    card._bc = ctl;
    vis.observe(card);

    const move = (e) => {
      const p = rel(e, scene);
      scene.style.setProperty("--px", `${(p.x * 100).toFixed(1)}%`);
      scene.style.setProperty("--py", `${(p.y * 100).toFixed(1)}%`);
      ctl.hover = rel(e, card);
      if (drag) {
        spin += (e.clientX - drag.x) * 0.6;
        drag.moved += Math.abs(e.clientX - drag.x);
        drag.x = e.clientX;
      }
    };
    const down = (e) => {
      drag = { x: e.clientX, moved: 0 };
      scene.setPointerCapture(e.pointerId);
    };
    const up = () => {
      if (drag && drag.moved < 5) ctl.flip ^= 1;
      drag = null;
    };
    const leave = () => (ctl.hover = null);
    scene.addEventListener("pointermove", move);
    scene.addEventListener("pointerdown", down);
    scene.addEventListener("pointerup", up);
    scene.addEventListener("pointerleave", leave);
    root._destroy = () => {
      sleep(ctl);
      vis.unobserve(card);
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerdown", down);
      scene.removeEventListener("pointerup", up);
      scene.removeEventListener("pointerleave", leave);
      root.remove();
    };
  }

  window.AuraqisCards = { designs, build, conceptDesign, renderPhase3, openViewer, levitate };
})();
