/* AURAQIS logo concepts — shared by index.html (browser) and tools/scripts/export_logo_concepts.mjs (node). */
(function (root) {
  "use strict";

  const C = {
    ivory: "#e3e2dd",
    ivorySoft: "#eceae5",
    paper: "#f2f1ed",
    charcoal: "#171916",
    ink: "#2b2e29",
    sage: "#658c55",
    sageLight: "#8fae80",
    sagePale: "#cfdcc6",
    forest: "#2f4530",
    forestDeep: "#1f2e20",
    stone: "#c8c3b7",
    stoneDark: "#8d887c",
    brass: "#a88a58",
    brassLight: "#cdb07a",
    brassDeep: "#7a6038",
  };

  const FONT_CSS =
    "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Cinzel:wght@400..700&family=Cormorant+Garamond:wght@400;500;600&family=DM+Serif+Display&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Serif:ital@0;1&family=Italiana&family=Josefin+Sans:wght@300..600&family=Jost:wght@300..600&family=Manrope:wght@200..800&family=Marcellus&family=Outfit:wght@200..700&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Quicksand:wght@300..700&family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&family=Tenor+Sans&family=Unbounded:wght@300..700&display=swap";

  const f = (n) => +n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const lin = (angle, ...stops) => ({ angle, stops });

  /** Animation attribute factory. Static exports get no classes, so every element renders in its final state. */
  function animator(on) {
    const a = (cls, d = 0, vars = "") => {
      const len = cls === "draw" ? ' pathLength="1"' : "";
      return on ? `${len} class="a-${cls}" style="--d:${d}s;${vars}"` : len;
    };
    a.on = on;
    a.idle = (cls) => (on ? ` class="i-${cls}"` : "");
    return a;
  }

  function paint(fill, id) {
    if (typeof fill === "string") return { defs: "", ref: fill };
    const r = (fill.angle * Math.PI) / 180;
    const s = Math.sin(r) / 2;
    const c = Math.cos(r) / 2;
    const stops = fill.stops.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join("");
    return {
      defs: `<linearGradient id="${id}" x1="${f(0.5 - s)}" y1="${f(0.5 + c)}" x2="${f(0.5 + s)}" y2="${f(0.5 - c)}">${stops}</linearGradient>`,
      ref: `url(#${id})`,
    };
  }

  function text(t, color, x, y, anchor, a, d) {
    const lsPx = t.ls * t.size;
    const ax = anchor === "middle" ? x + lsPx / 2 : x;
    const style =
      `font-family:${t.family};font-weight:${t.weight || 400};font-size:${t.size}px;letter-spacing:${t.ls}em;` +
      (t.italic ? "font-style:italic;" : "");
    const accent = t.accent ? `<tspan fill="${t.accent.color}">${esc(t.accent.text)}</tspan>` : "";
    const anim = a.on ? ` class="a-track" style="--d:${d}s;--ls:${t.ls}em;${style}"` : ` style="${style}"`;
    return `<text x="${f(ax)}" y="${f(y)}" text-anchor="${anchor}" fill="${color}"${anim}>${esc(t.text)}${accent}</text>`;
  }

  const estimate = (t) => (t ? (t.text.length + (t.accent ? t.accent.text.length : 0)) * t.size * ((t.cw ?? 0.68) + t.ls) : 0);

  /**
   * Lays out mark + wordmark + descriptor. `mark(x, y, s)` returns the mark markup at that box.
   * The viewBox here is an estimate; the browser refits it to the real text bounds.
   */
  function lockup({ mark, s, word, desc, rule, colors, layout, a, label, bg }) {
    const pad = 28;
    let body = "";
    let vb;
    if (layout === "row") {
      const capH = word.size * 0.72;
      const descBlock = desc ? 18 + desc.size * 0.75 + (rule ? 10 : 0) : 0;
      const top = s / 2 - (capH + descBlock) / 2;
      const wy = top + capH;
      const tx = s * 1.22;
      body += mark(0, 0, s);
      body += text(word, colors.text, tx, wy, "start", a, 0.55);
      if (rule) body += `<path d="M${f(tx)} ${f(wy + 13)} h30" stroke="${colors.rule}" stroke-width="1.2"${a("draw", 0.9)}/>`;
      if (desc) body += text(desc, colors.desc, tx, wy + descBlock, "start", a, 0.85);
      const w = tx + Math.max(estimate(word), estimate(desc));
      vb = [-pad, -pad, w + pad * 2, s + pad * 2];
    } else {
      const cx = 200;
      const wy = s + s * 0.2 + word.size * 0.72;
      body += mark(cx - s / 2, 0, s);
      body += text(word, colors.text, cx, wy, "middle", a, 0.55);
      if (rule) body += `<path d="M${cx - 16} ${f(wy + 17)} h32" stroke="${colors.rule}" stroke-width="1.2"${a("draw", 0.9)}/>`;
      let h = wy;
      if (desc) {
        h = wy + (rule ? 38 : 26) + desc.size * 0.2;
        body += text(desc, colors.desc, cx, h, "middle", a, 0.85);
      }
      const w = Math.max(s, estimate(word), estimate(desc));
      vb = [cx - w / 2 - pad, -pad, w + pad * 2, h + pad * 2];
    }
    return svgRoot(vb, body, a, label, bg);
  }

  function svgRoot(vb, body, a, label, bg) {
    const box = vb.map(f).join(" ");
    const bgRect = bg ? `<rect class="bg" x="${f(vb[0])}" y="${f(vb[1])}" width="${f(vb[2])}" height="${f(vb[3])}" fill="${bg}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"${a.on ? ' class="anim"' : ""} role="img" aria-label="${esc(label)}">${bgRect}<g class="fit">${body}</g></svg>`;
  }

  /* ——————————————————————— Phase 1 · original mark, new colour + type ——————————————————————— */

  const DESC = "CONSTRUCTIONS · INTERIORS";

  const phase1 = [
    {
      id: "P1-01",
      slug: "sage-heritage",
      name: "Sage Heritage",
      story: "The current identity, refined. A calmer weight, wider tracking and a brass descriptor that picks up the site’s accent colour.",
      bg: C.ivory,
      mark: C.sage,
      word: { text: "AURAQIS", family: "'Quicksand'", weight: 500, size: 34, ls: 0.52, cw: 0.66, color: C.forest },
      desc: { text: DESC, family: "'Manrope'", weight: 600, size: 9.5, ls: 0.42, cw: 0.64, color: C.brass },
      fonts: ["Quicksand 500", "Manrope 600"],
      swatches: [C.ivory, C.sage, C.forest, C.brass],
    },
    {
      id: "P1-02",
      slug: "forest-brass",
      name: "Forest & Brass",
      story: "A luxury hospitality look. The mark is brushed brass on deep forest, with a high-contrast classical serif for the wordmark.",
      bg: C.forestDeep,
      mark: lin(135, [0, "#e2c993"], [0.5, C.brass], [1, C.brassDeep]),
      sheen: true,
      word: { text: "AURAQIS", family: "'Cormorant Garamond'", weight: 600, size: 40, ls: 0.34, cw: 0.66, color: C.ivory },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.5, cw: 0.64, color: C.brassLight },
      rule: C.brass,
      fonts: ["Cormorant Garamond 600", "Manrope 500"],
      swatches: [C.forestDeep, C.brassLight, C.brass, C.ivory],
    },
    {
      id: "P1-03",
      slug: "noir-atelier",
      name: "Noir Atelier",
      story: "A gallery-grade monochrome. A soft ivory-to-stone gradient on charcoal, set in Marcellus’ chiselled Roman capitals.",
      bg: C.charcoal,
      mark: lin(180, [0, "#f4f2ec"], [1, C.stoneDark]),
      sheen: true,
      word: { text: "AURAQIS", family: "'Marcellus'", weight: 400, size: 36, ls: 0.42, cw: 0.7, color: C.ivory },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.5, cw: 0.64, color: C.stoneDark },
      fonts: ["Marcellus 400", "Manrope 500"],
      swatches: [C.charcoal, C.ivory, C.stone, C.stoneDark],
    },
    {
      id: "P1-04",
      slug: "gallery-serif",
      name: "Gallery Serif",
      story: "Uses the website’s own display face, Instrument Serif, so the logo and the headings speak with the same editorial voice.",
      bg: C.paper,
      mark: C.forest,
      layout: "row",
      word: { text: "Auraqis", family: "'Instrument Serif'", weight: 400, size: 64, ls: 0.005, cw: 0.46, color: C.charcoal },
      desc: { text: "CONSTRUCTIONS & INTERIORS", family: "'Manrope'", weight: 600, size: 9.5, ls: 0.44, cw: 0.64, color: C.sage },
      fonts: ["Instrument Serif 400", "Manrope 600"],
      swatches: [C.paper, C.forest, C.charcoal, C.sage],
    },
    {
      id: "P1-05",
      slug: "earth-gradient",
      name: "Earth Gradient",
      story: "The marble moves from new-leaf sage into forest, like light across a garden façade. Geometric Jost Light keeps it airy.",
      bg: C.ivory,
      mark: lin(160, [0, C.sageLight], [0.55, C.sage], [1, C.forest]),
      word: { text: "AURAQIS", family: "'Jost'", weight: 300, size: 36, ls: 0.46, cw: 0.66, color: C.charcoal },
      desc: { text: DESC, family: "'Jost'", weight: 500, size: 9.5, ls: 0.5, cw: 0.6, color: C.brass },
      rule: C.stone,
      fonts: ["Jost 300", "Jost 500"],
      swatches: [C.ivory, C.sageLight, C.sage, C.forest],
    },
    {
      id: "P1-06",
      slug: "quiet-stone",
      name: "Quiet Stone",
      story: "Ink on warm stone, like an engraved plaque. Tenor Sans brings a refined, slightly humanist tone. Timeless and confident.",
      bg: "#d9d6ce",
      mark: C.ink,
      word: { text: "AURAQIS", family: "'Tenor Sans'", weight: 400, size: 34, ls: 0.5, cw: 0.66, color: C.ink },
      desc: { text: DESC, family: "'Tenor Sans'", weight: 400, size: 9.5, ls: 0.46, cw: 0.62, color: C.stoneDark },
      fonts: ["Tenor Sans 400"],
      swatches: ["#d9d6ce", C.ink, C.stoneDark, C.stone],
    },
    {
      id: "P1-07",
      slug: "sage-reverse",
      name: "Sage Reverse",
      story: "The brand colour as a field and the mark knocked out in ivory. Bold and fresh, ideal for site hoardings, vehicles and social media.",
      bg: C.sage,
      mark: C.ivory,
      word: { text: "AURAQIS", family: "'Outfit'", weight: 300, size: 36, ls: 0.5, cw: 0.64, color: C.ivory },
      desc: { text: DESC, family: "'Outfit'", weight: 500, size: 9.5, ls: 0.46, cw: 0.6, color: C.forestDeep },
      fonts: ["Outfit 300", "Outfit 500"],
      swatches: [C.sage, C.ivory, C.forestDeep, C.sageLight],
    },
    {
      id: "P1-08",
      slug: "modern-editorial",
      name: "Modern Editorial",
      story: "A confident, contemporary wordmark in Syne Bold with a sage full stop, the way a design studio signs off its work.",
      bg: C.ivory,
      mark: C.charcoal,
      layout: "row",
      word: { text: "AURAQIS", family: "'Syne'", weight: 700, size: 44, ls: 0.04, cw: 0.78, color: C.charcoal, accent: { text: ".", color: C.sage } },
      desc: { text: "DESIGN · BUILD · INTERIORS", family: "'Manrope'", weight: 600, size: 9, ls: 0.42, cw: 0.64, color: C.stoneDark },
      fonts: ["Syne 700", "Manrope 600"],
      swatches: [C.ivory, C.charcoal, C.sage, C.stoneDark],
    },
    {
      id: "P1-09",
      slug: "dusk-duotone",
      name: "Dusk Duotone",
      story: "A sage-to-brass duotone, like dusk light on a finished building. Fraunces adds warmth and a crafted, hand-finished feel.",
      bg: C.forest,
      mark: lin(120, [0, C.sageLight], [1, C.brassLight]),
      word: { text: "AURAQIS", family: "'Fraunces'", weight: 400, size: 38, ls: 0.3, cw: 0.7, color: C.ivory },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.5, cw: 0.64, color: C.brassLight },
      rule: C.sageLight,
      fonts: ["Fraunces 400", "Manrope 500"],
      swatches: [C.forest, C.sageLight, C.brassLight, C.ivory],
    },
    {
      id: "P1-10",
      slug: "paper-brass",
      name: "Paper & Brass",
      story: "A brushed-brass mark on paper, with a fashion-house Bodoni wordmark. Premium stationery, ready for foil.",
      bg: C.paper,
      mark: lin(135, [0, "#d8bd86"], [0.55, C.brass], [1, C.brassDeep]),
      sheen: true,
      word: { text: "AURAQIS", family: "'Bodoni Moda'", weight: 500, size: 36, ls: 0.3, cw: 0.72, color: C.charcoal },
      desc: { text: DESC, family: "'Manrope'", weight: 600, size: 9, ls: 0.48, cw: 0.64, color: C.brass },
      fonts: ["Bodoni Moda 500", "Manrope 600"],
      swatches: [C.paper, C.brassLight, C.brass, C.charcoal],
    },
    {
      id: "P1-11",
      slug: "terracotta-courtyard",
      name: "Terracotta Courtyard",
      story: "Sun-baked clay on limewash, like a Mediterranean courtyard. DM Serif Display gives the wordmark a warm, hospitable weight.",
      bg: "#ebe3d6",
      mark: lin(150, [0, "#d08e68"], [0.55, "#a85f40"], [1, "#7c4029"]),
      word: { text: "AURAQIS", family: "'DM Serif Display'", weight: 400, size: 40, ls: 0.22, cw: 0.66, color: C.forest },
      desc: { text: DESC, family: "'Manrope'", weight: 600, size: 9, ls: 0.46, cw: 0.64, color: "#a85f40" },
      rule: C.forest,
      fonts: ["DM Serif Display 400", "Manrope 600"],
      swatches: ["#ebe3d6", "#d08e68", "#a85f40", C.forest],
    },
    {
      id: "P1-12",
      slug: "midnight-copper",
      name: "Midnight Copper",
      story: "Polished copper on a deep teal-green, like a hotel lobby after dark. Cinzel’s inscriptional capitals feel carved in stone.",
      bg: "#122320",
      mark: lin(135, [0, "#f0c39a"], [0.5, "#c98a5b"], [1, "#7d4a2c"]),
      sheen: true,
      word: { text: "AURAQIS", family: "'Cinzel'", weight: 500, size: 34, ls: 0.36, cw: 0.76, color: C.ivory },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.5, cw: 0.64, color: "#d9a47a" },
      rule: "#c98a5b",
      fonts: ["Cinzel 500", "Manrope 500"],
      swatches: ["#122320", "#f0c39a", "#c98a5b", C.ivory],
    },
    {
      id: "P1-13",
      slug: "olive-linen",
      name: "Olive Linen",
      story: "Olive ink on natural linen, quiet and organic. Josefin Sans Light is geometric and airy, with an Art Deco elegance.",
      bg: "#e5e1d0",
      mark: "#5d6233",
      word: { text: "AURAQIS", family: "'Josefin Sans'", weight: 300, size: 36, ls: 0.5, cw: 0.64, color: "#3d4020" },
      desc: { text: DESC, family: "'Josefin Sans'", weight: 600, size: 9.5, ls: 0.44, cw: 0.6, color: C.brass },
      fonts: ["Josefin Sans 300", "Josefin Sans 600"],
      swatches: ["#e5e1d0", "#5d6233", "#3d4020", C.brass],
    },
    {
      id: "P1-14",
      slug: "blueprint-slate",
      name: "Blueprint Slate",
      story: "An architect’s blueprint: the mark in chalk-white over slate blue, set in technical Space Grotesk. Precise and engineered, for the construction arm.",
      bg: "#1c2a38",
      mark: lin(180, [0, "#eef3f6"], [1, "#8fb0c9"]),
      word: { text: "AURAQIS", family: "'Space Grotesk'", weight: 500, size: 32, ls: 0.46, cw: 0.7, color: "#e6edf2" },
      desc: { text: DESC, family: "'Space Grotesk'", weight: 400, size: 9, ls: 0.5, cw: 0.64, color: "#8fb0c9" },
      rule: "#8fb0c9",
      fonts: ["Space Grotesk 500", "Space Grotesk 400"],
      swatches: ["#1c2a38", "#eef3f6", "#8fb0c9", C.brassLight],
    },
    {
      id: "P1-15",
      slug: "champagne-ivory",
      name: "Champagne Ivory",
      story: "Champagne foil on warm ivory, set in Italiana’s fine, high-contrast capitals. Bridal-boutique luxury, ideal for premium interiors clients.",
      bg: "#f4efe5",
      mark: lin(135, [0, "#efdcb4"], [0.5, "#c7a873"], [1, "#8f7140"]),
      sheen: true,
      word: { text: "AURAQIS", family: "'Italiana'", weight: 400, size: 40, ls: 0.32, cw: 0.66, color: C.charcoal },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.52, cw: 0.64, color: C.stoneDark },
      fonts: ["Italiana 400", "Manrope 500"],
      swatches: ["#f4efe5", "#efdcb4", "#c7a873", C.charcoal],
    },
    {
      id: "P1-16",
      slug: "moss-velvet",
      name: "Moss Velvet",
      story: "A velvet moss ground with the swirl fading from pale sage to leaf green. Playfair Display adds a literary, boutique-hotel finish.",
      bg: "#26382a",
      mark: lin(165, [0, C.sagePale], [0.6, C.sageLight], [1, C.sage]),
      word: { text: "AURAQIS", family: "'Playfair Display'", weight: 500, size: 38, ls: 0.24, cw: 0.72, color: "#e9eadf" },
      desc: { text: DESC, family: "'Manrope'", weight: 500, size: 9, ls: 0.5, cw: 0.64, color: C.sagePale },
      rule: C.sageLight,
      fonts: ["Playfair Display 500", "Manrope 500"],
      swatches: ["#26382a", C.sagePale, C.sageLight, "#e9eadf"],
    },
  ];

  /** Phase 1 mark: the supplied swirl PNG used as an alpha mask, so any colour or gradient can fill it. */
  function phase1Mark(c, u, a, o) {
    return (x, y, s) => {
      if (o.markImage) return `<image href="${o.markImage}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
      const p = paint(c.mark, `${u}-g`);
      const sheen = c.sheen && a.on;
      return (
        `<defs>${p.defs}` +
        `<mask id="${u}-m" mask-type="alpha" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${s}" height="${s}"><image href="${o.href}" x="${x}" y="${y}" width="${s}" height="${s}"/></mask>` +
        // The highlight moves inside a static full-size gradient: a translating rect left a visible seam in Chrome.
        (sheen
          ? `<linearGradient id="${u}-s" x1="0" y1="0" x2="1" y2="0" gradientTransform="translate(-1 0)"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/>` +
            `<animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;1 0" keyTimes="0;.5;1" calcMode="spline" keySplines=".65 0 .35 1;0 0 1 1" dur="6s" begin="1.8s" repeatCount="indefinite"/></linearGradient>`
          : "") +
        `</defs><g${a("orb", 0)}><g mask="url(#${u}-m)"><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${p.ref}"/>` +
        (sheen ? `<rect class="i-sheen" x="${x}" y="${y}" width="${s}" height="${s}" fill="url(#${u}-s)"/>` : "") +
        `</g></g>`
      );
    };
  }

  /* ——————————————————————— Phase 2 · new marks (120 × 120 grid) ——————————————————————— */

  const PAL = {
    ivory: { name: "Ivory · Forest", bg: C.ivory, primary: C.forest, accent: C.brass, soft: C.sageLight, deep: C.forestDeep, text: C.forest, desc: C.stoneDark },
    night: { name: "Forest Night", bg: C.forestDeep, primary: C.ivory, accent: C.brassLight, soft: C.sage, deep: C.stone, text: C.ivory, desc: C.brassLight },
    noir: { name: "Charcoal · Brass", bg: C.charcoal, primary: C.brassLight, accent: C.ivory, soft: C.stoneDark, deep: C.brassDeep, text: C.stone, desc: C.stoneDark },
    sage: { name: "Sage Field", bg: C.sage, primary: C.ivory, accent: C.forestDeep, soft: C.sageLight, deep: C.forest, text: C.ivory, desc: C.forestDeep },
    paper: { name: "Paper · Sage", bg: C.paper, primary: C.sage, accent: C.brass, soft: C.sageLight, deep: C.forest, text: C.charcoal, desc: C.sage },
    copper: { name: "Midnight · Copper", bg: "#132420", primary: "#d9a273", accent: "#efe3d0", soft: "#3f5d52", deep: "#8a5434", text: "#ece3d3", desc: "#d9a273" },
    clay: { name: "Limewash · Clay", bg: "#ebe3d6", primary: "#9a5638", accent: C.forest, soft: "#d8b59b", deep: "#6b3a24", text: "#3b2a20", desc: "#9a5638" },
    olive: { name: "Olive · Linen", bg: "#e6e2d2", primary: "#575c2e", accent: C.brass, soft: "#b6b88e", deep: "#383b1d", text: "#383b1d", desc: C.brass },
    blueprint: { name: "Blueprint", bg: "#1b2a39", primary: "#e8eff4", accent: C.brassLight, soft: "#4a6a86", deep: "#a6bccd", text: "#e8eff4", desc: "#93b6cf" },
  };
  const DEFAULT_PALS = [PAL.ivory, PAL.night, PAL.noir];
  const descSpec = (over = {}) => ({ text: DESC, family: "'Manrope'", weight: 600, size: 9, ls: 0.44, cw: 0.64, ...over });

  function plate(cx, cy, w, t, top, left, right) {
    const h = w / 2;
    return (
      `<path d="M${cx - w} ${cy} L${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} Z" fill="${top}"/>` +
      `<path d="M${cx - w} ${cy} L${cx} ${cy + h} V${cy + h + t} L${cx - w} ${cy + t} Z" fill="${left}"/>` +
      `<path d="M${cx} ${cy + h} L${cx + w} ${cy} V${cy + t} L${cx} ${cy + h + t} Z" fill="${right}"/>`
    );
  }

  const phase2 = [
    {
      id: "P2-01",
      slug: "portal",
      name: "Portal",
      story: "An arched doorway, the threshold between construction and interior. Inside it, the brand’s marble swirl carries on as flowing lines.",
      word: { text: "AURAQIS", family: "'Cormorant Garamond'", weight: 600, size: 38, ls: 0.32, cw: 0.66 },
      desc: descSpec(),
      fonts: ["Cormorant Garamond 600", "Manrope 600"],
      palettes: [...DEFAULT_PALS, PAL.copper],
      draw(p, u, a) {
        const outer = "M22 112 V52 A38 38 0 0 1 98 52 V112 Z";
        const inner = "M32 112 V54 A28 28 0 0 1 88 54 V112";
        const waves = [
          "M14 56 C28 50 42 64 58 54 S86 44 106 42",
          "M14 70 C32 58 46 84 64 70 S90 60 106 58",
          "M14 86 C34 74 50 98 70 84 S92 78 106 76",
          "M14 100 C30 92 48 108 66 98 S90 94 106 92",
        ];
        return (
          `<defs><clipPath id="${u}-c"><path d="${inner} Z"/></clipPath></defs>` +
          `<path d="${outer}" fill="${p.primary}"${a("rise", 0)}/>` +
          `<g clip-path="url(#${u}-c)"><g${a.idle("flow")}>` +
          waves.map((d, i) => `<path d="${d}" fill="none" stroke="${p.bg}" stroke-width="3.4" stroke-linecap="round"${a("draw", 0.55 + i * 0.12)}/>`).join("") +
          `</g></g>` +
          `<path d="${inner}" fill="none" stroke="${p.accent}" stroke-width="1.6"${a("draw", 1)}/>` +
          `<path d="M8 112 H112" stroke="${p.primary}" stroke-width="2"${a("draw", 0.15)}/>`
        );
      },
    },
    {
      id: "P2-02",
      slug: "gable",
      name: "Gable",
      story: "A blueprint lettermark. The ‘A’ is a roof gable, its crossbar a floor slab, with a doorway below and a dimension line beside it. An architect’s drawing that reads as a letter.",
      word: { text: "AURAQIS", family: "'Manrope'", weight: 600, size: 30, ls: 0.5, cw: 0.7 },
      desc: descSpec({ weight: 500, ls: 0.5 }),
      fonts: ["Manrope 600", "Manrope 500"],
      palettes: [PAL.paper, PAL.night, PAL.noir, PAL.blueprint],
      draw(p, u, a) {
        const grid = [20, 40, 60, 80, 100].map((x) => `M${x} 6 V112`).concat([20, 40, 60, 80, 100].map((y) => `M6 ${y} H112`));
        return (
          `<path d="${grid.join(" ")}" fill="none" stroke="${p.soft}" stroke-width=".6" stroke-dasharray="2 3" opacity=".55"${a("fade", 0, "--o:.55")}/>` +
          `<path d="M6 100 H106" stroke="${p.primary}" stroke-width="1.4"${a("draw", 0.1)}/>` +
          `<path d="M20 100 L60 18 L100 100" fill="none" stroke="${p.primary}" stroke-width="5" stroke-miterlimit="10"${a("draw", 0.3)}/>` +
          `<path d="M35.6 68 H84.4" stroke="${p.primary}" stroke-width="4"${a("draw", 0.95)}/>` +
          `<path d="M52 100 V82 H68 V100" fill="none" stroke="${p.primary}" stroke-width="3"${a("draw", 1.15)}/>` +
          `<path d="M113 18 V100 M109 18 H117 M109 100 H117" fill="none" stroke="${p.accent}" stroke-width="1"${a("draw", 1.35)}/>` +
          `<circle cx="60" cy="5" r="2.8" fill="${p.accent}"${a("pop", 1.6)}/>`
        );
      },
    },
    {
      id: "P2-03",
      slug: "aq-monogram",
      name: "AQ Monogram",
      story: "A and Q in one stroke. The A sits inside the Q’s circle, and its right leg carries on past the ring to become the Q’s tail, picked out in brass.",
      word: { text: "AURAQIS", family: "'Syne'", weight: 700, size: 34, ls: 0.2, cw: 0.78 },
      desc: descSpec(),
      fonts: ["Syne 700", "Manrope 600"],
      palettes: [PAL.ivory, PAL.night, PAL.sage, PAL.clay],
      draw(p, u, a) {
        return (
          `<circle cx="60" cy="58" r="38" fill="none" stroke="${p.primary}" stroke-width="7" transform="rotate(54.9 60 58)"${a("draw", 0)}/>` +
          `<path d="M38.2 89.13 L60 27 L81.8 89.13" fill="none" stroke="${p.primary}" stroke-width="7" stroke-miterlimit="12"${a("draw", 0.6)}/>` +
          `<path d="M45.6 68 H74.4" stroke="${p.primary}" stroke-width="6"${a("draw", 1.05)}/>` +
          `<path d="M81.8 89.13 L89.4 110.8" stroke="${p.accent}" stroke-width="7"${a("draw", 1.35)}/>`
        );
      },
    },
    {
      id: "P2-04",
      slug: "aura",
      name: "Aura",
      story: "The name, drawn literally. A ring of light around a rising skyline, with a brass arc and a sun marking the brand’s aura. One of the doorways carries an arched window.",
      word: { text: "AURAQIS", family: "'Jost'", weight: 400, size: 32, ls: 0.52, cw: 0.66 },
      desc: descSpec({ family: "'Jost'", weight: 500, cw: 0.6 }),
      fonts: ["Jost 400", "Jost 500"],
      palettes: [...DEFAULT_PALS, PAL.copper],
      draw(p, u, a) {
        return (
          `<circle cx="60" cy="60" r="46" fill="none" stroke="${p.primary}" stroke-width="2.2" transform="rotate(-90 60 60)"${a("draw", 0)}/>` +
          `<path d="M67.99 14.7 A46 46 0 0 1 105.3 52.01" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round"${a("draw", 0.9)}/>` +
          `<rect x="36" y="54" width="12" height="32" fill="${p.primary}"${a("rise", 0.4)}/>` +
          `<rect x="52" y="38" width="14" height="48" fill="${p.primary}"${a("rise", 0.55)}/>` +
          `<rect x="70" y="60" width="12" height="26" fill="${p.primary}"${a("rise", 0.7)}/>` +
          `<path d="M55.5 86 V74 A3.5 3.5 0 0 1 62.5 74 V86 Z" fill="${p.bg}"${a("fade", 1.05)}/>` +
          `<path d="M26 86 H94" stroke="${p.primary}" stroke-width="2.2"${a("draw", 0.3)}/>` +
          `<g${a.idle("pulse")}><circle cx="83" cy="38" r="5.5" fill="${p.accent}"${a("pop", 1.25)}/></g>`
        );
      },
    },
    {
      id: "P2-05",
      slug: "strata",
      name: "Strata",
      story: "Three isometric floor plates stack into a rising form: foundation, structure, finish. The brass crown marks the finished interior on top.",
      word: { text: "AURAQIS", family: "'Outfit'", weight: 500, size: 32, ls: 0.38, cw: 0.66 },
      desc: descSpec({ family: "'Outfit'", weight: 500, cw: 0.6 }),
      fonts: ["Outfit 500"],
      palettes: [
        { name: "Paper · Sage", bg: C.paper, primary: C.sage, accent: C.brassLight, soft: C.sageLight, deep: C.forest, text: C.forest, desc: C.stoneDark },
        { name: "Forest Night", bg: C.forestDeep, primary: C.sage, accent: C.brassLight, soft: C.sageLight, deep: C.forest, text: C.ivory, desc: C.brassLight },
        { name: "Charcoal · Stone", bg: C.charcoal, primary: C.stoneDark, accent: C.brassLight, soft: C.stone, deep: C.ink, text: C.stone, desc: C.stoneDark },
        { name: "Limewash · Clay", bg: "#ebe3d6", primary: "#a8613f", accent: C.forest, soft: "#dcbfa6", deep: "#6b3a24", text: "#3b2a20", desc: "#9a5638" },
      ],
      draw(p, u, a) {
        return (
          `<g${a("drop", 0.1)}>${plate(60, 82, 44, 7, p.soft, p.primary, p.deep)}</g>` +
          `<g${a("drop", 0.35)}>${plate(60, 60, 32, 7, p.soft, p.primary, p.deep)}</g>` +
          `<g${a("drop", 0.6)}>${plate(60, 40, 20, 7, p.accent, p.primary, p.deep)}</g>`
        );
      },
    },
    {
      id: "P2-06",
      slug: "leaf-plan",
      name: "Leaf Plan",
      story: "A leaf whose veins are the walls of a floor plan, complete with door swings. Sustainability and spatial design in one shape.",
      word: { text: "AURAQIS", family: "'Fraunces'", weight: 500, size: 34, ls: 0.26, cw: 0.7 },
      desc: descSpec(),
      fonts: ["Fraunces 500", "Manrope 600"],
      palettes: [PAL.paper, PAL.night, PAL.sage, PAL.olive],
      draw(p, u, a) {
        const leaf = "M60 10 C98 30 100 78 60 112 C20 78 22 30 60 10 Z";
        const walls = ["M60 46 H70 M78 46 H104", "M60 66 H50 M42 66 H14", "M60 86 H72 M80 86 H104"];
        const doors = ["M70 46 V38 A8 8 0 0 1 78 46", "M50 66 V58 A8 8 0 0 0 42 66", "M72 86 V78 A8 8 0 0 1 80 86"];
        return (
          `<defs><clipPath id="${u}-c"><path d="${leaf}"/></clipPath></defs>` +
          `<path d="M60 108 Q61 114 55 118" fill="none" stroke="${p.primary}" stroke-width="2.6" stroke-linecap="round"${a("draw", 0.3)}/>` +
          `<path d="${leaf}" fill="${p.primary}"${a("grow", 0)}/>` +
          `<g clip-path="url(#${u}-c)">` +
          `<path d="M60 20 V106" stroke="${p.bg}" stroke-width="2.6"${a("draw", 0.5)}/>` +
          walls.map((d, i) => `<path d="${d}" fill="none" stroke="${p.bg}" stroke-width="2.6"${a("draw", 0.8 + i * 0.15)}/>`).join("") +
          doors.map((d, i) => `<path d="${d}" fill="none" stroke="${p.bg}" stroke-width="1"${a("draw", 1.2 + i * 0.15)}/>`).join("") +
          `</g>`
        );
      },
    },
    {
      id: "P2-07",
      slug: "marble-a",
      name: "Marble A",
      story: "Phase 1 and Phase 2 meet. The original marble swirl now fills a bold architectural ‘A’, so the brand moves forward without losing its heritage.",
      word: { text: "AURAQIS", family: "'Bodoni Moda'", weight: 500, size: 34, ls: 0.3, cw: 0.72 },
      desc: descSpec(),
      fonts: ["Bodoni Moda 500", "Manrope 600"],
      palettes: [
        { name: "Ivory · Forest", bg: C.ivory, primary: C.forest, accent: C.brass, soft: C.sagePale, deep: C.forestDeep, text: C.forest, desc: C.stoneDark },
        { name: "Forest Night", bg: C.forestDeep, primary: C.sageLight, accent: C.brassLight, soft: C.forest, deep: C.stone, text: C.ivory, desc: C.brassLight },
        { name: "Charcoal · Brass", bg: C.charcoal, primary: C.brassLight, accent: C.ivory, soft: C.ink, deep: C.brassDeep, text: C.stone, desc: C.stoneDark },
        { name: "Limewash · Clay", bg: "#ebe3d6", primary: "#9a5638", accent: C.forest, soft: "#e3cdb9", deep: "#6b3a24", text: "#3b2a20", desc: "#9a5638" },
      ],
      draw(p, u, a, o) {
        const A = "M60 8 L108 112 H86 L77 92 H43 L34 112 H12 Z M60 46 L70 72 H50 Z";
        return (
          `<defs><clipPath id="${u}-c"><path d="${A}" clip-rule="evenodd"/></clipPath>` +
          `<mask id="${u}-m" mask-type="alpha" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-20" y="-20" width="160" height="160"><g${a.idle("drift")}><image href="${o.href}" x="-10" y="-6" width="140" height="140"/></g></mask></defs>` +
          `<g clip-path="url(#${u}-c)"${a("fade", 0.5)}><rect width="120" height="120" fill="${p.soft}"/><rect x="-20" y="-20" width="160" height="160" fill="${p.primary}" mask="url(#${u}-m)"/></g>` +
          `<path d="${A}" fill="none" fill-rule="evenodd" stroke="${p.primary}" stroke-width="1.4" stroke-linejoin="round"${a("draw", 0)}/>` +
          `<path d="M12 117 H108" stroke="${p.accent}" stroke-width="1.5"${a("draw", 1.1)}/>`
        );
      },
    },
    {
      id: "P2-08",
      slug: "atelier-seal",
      name: "Atelier Seal",
      story: "A heritage seal for premium touchpoints: plaques, embossed letterheads, handover certificates. The arched monogram slowly turns within its rings.",
      word: { text: "AURAQIS", family: "'Marcellus'", weight: 400, size: 32, ls: 0.42, cw: 0.7 },
      desc: descSpec({ text: "QUALITY · INNOVATION · INTEGRITY", ls: 0.4 }),
      fonts: ["Marcellus 400", "Manrope 600"],
      palettes: [PAL.ivory, PAL.night, PAL.noir, PAL.copper],
      draw(p, u, a) {
        // Glyphs are placed one by one (not textPath) so the ring renders identically in librsvg exports.
        const chars = [..."AURAQIS · CONSTRUCTIONS · INTERIORS · "];
        const step = 360 / chars.length;
        const ring = chars
          .map((ch, i) => (ch === " " ? "" : `<text x="60" y="15" text-anchor="middle" transform="rotate(${f((i - 3) * step)} 60 60)">${esc(ch)}</text>`))
          .join("");
        return (
          `<circle cx="60" cy="60" r="57" fill="none" stroke="${p.primary}" stroke-width="1.2" transform="rotate(-90 60 60)"${a("draw", 0)}/>` +
          `<circle cx="60" cy="60" r="38" fill="none" stroke="${p.accent}" stroke-width="1.2" transform="rotate(-90 60 60)"${a("draw", 0.2)}/>` +
          `<g${a.idle("rotate")}><g fill="${p.primary}" font-family="Marcellus, serif" font-size="8"${a("fade", 0.6)}>${ring}</g></g>` +
          `<path d="M47 84 V60 A13 13 0 0 1 73 60 V84 Z" fill="${p.primary}"${a("rise", 0.4)}/>` +
          `<path d="M53.5 82 L60 63 L66.5 82 M56.2 76 H63.8" fill="none" stroke="${p.bg}" stroke-width="2"${a("draw", 0.9)}/>` +
          `<path d="M43 89 H77" stroke="${p.accent}" stroke-width="1.2"${a("draw", 1)}/>`
        );
      },
    },
    {
      id: "P2-09",
      slug: "horizon",
      name: "Horizon",
      story: "Viewfinder corners frame a sun rising over a horizon line. Ultra-minimal, very current, and it reads clearly even at favicon size. New beginnings, framed by design.",
      word: { text: "AURAQIS", family: "'Manrope'", weight: 300, size: 30, ls: 0.62, cw: 0.7 },
      desc: descSpec({ weight: 500, ls: 0.5 }),
      fonts: ["Manrope 300", "Manrope 500"],
      palettes: [PAL.ivory, PAL.night, PAL.sage, PAL.clay],
      draw(p, u, a) {
        const corner = (d, tx, ty, delay) =>
          `<path d="${d}" fill="none" stroke="${p.primary}" stroke-width="4" stroke-linecap="square"${a("slide", delay, `--tx:${tx}px;--ty:${ty}px`)}/>`;
        return (
          corner("M20 38 V20 H38", -10, -10, 0) +
          corner("M82 20 H100 V38", 10, -10, 0.08) +
          corner("M100 82 V100 H82", 10, 10, 0.16) +
          corner("M38 100 H20 V82", -10, 10, 0.24) +
          `<defs><clipPath id="${u}-c"><rect width="120" height="70"/></clipPath></defs>` +
          `<g clip-path="url(#${u}-c)"><g${a.idle("pulse")}><path d="M44 70 A16 16 0 0 1 76 70 Z" fill="${p.accent}"${a("up", 0.8, "--ty:18px")}/></g></g>` +
          `<path d="M30 70 H90" stroke="${p.primary}" stroke-width="3"${a("draw", 0.45)}/>` +
          `<path d="M42 78 H78" stroke="${p.primary}" stroke-width="1.6" opacity=".55"${a("fade", 1.25, "--o:.55")}/>` +
          `<path d="M50 85 H70" stroke="${p.primary}" stroke-width="1.2" opacity=".35"${a("fade", 1.4, "--o:.35")}/>`
        );
      },
    },
    {
      id: "P2-10",
      slug: "fold",
      name: "Fold",
      story: "Two panels fold into an ‘A’, like joinery or an unfolding partition, with a brass slab as the crossbar. A modern geometric mark in a contemporary, wide typeface.",
      word: { text: "AURAQIS", family: "'Unbounded'", weight: 500, size: 28, ls: 0.16, cw: 0.92 },
      desc: descSpec({ ls: 0.5 }),
      fonts: ["Unbounded 500", "Manrope 600"],
      palettes: [PAL.paper, PAL.night, PAL.noir, PAL.olive],
      draw(p, u, a) {
        return (
          `<path d="M18 104 L52 16 H68 L40 104 Z" fill="${p.soft}"${a("unfoldL", 0)}/>` +
          `<path d="M52 16 H68 L102 104 H80 Z" fill="${p.primary}"${a("unfoldR", 0.25)}/>` +
          `<path d="M52 16 H68 L60 41.1 Z" fill="${p.deep}"${a("fade", 0.7)}/>` +
          `<path d="M48.9 76 H71.1 L74.3 86 H45.7 Z" fill="${p.accent}"${a("slide", 0.9, "--tx:-16px;--ty:0px")}/>`
        );
      },
    },
    {
      id: "P2-11",
      slug: "keystone",
      name: "Keystone",
      story: "The keystone is the last stone set in an arch, and it locks every other piece in place. Seven voussoirs rise from two piers and meet at a brass keystone: integrity, made literal.",
      word: { text: "AURAQIS", family: "'Cinzel'", weight: 500, size: 32, ls: 0.38, cw: 0.78 },
      desc: descSpec(),
      fonts: ["Cinzel 500", "Manrope 600"],
      palettes: [PAL.ivory, PAL.copper, PAL.noir, PAL.clay],
      draw(p, u, a) {
        const cx = 60;
        const cy = 74;
        const ri = 28;
        const n = 7;
        const step = 180 / n;
        const g = 1.1;
        const pt = (r, deg) => `${f(cx + r * Math.cos((deg * Math.PI) / 180))} ${f(cy - r * Math.sin((deg * Math.PI) / 180))}`;
        let out =
          `<path d="M4 100 H116" stroke="${p.primary}" stroke-width="2"${a("draw", 0)}/>` +
          `<rect x="12" y="74" width="20" height="24" fill="${p.primary}"${a("rise", 0.1)}/>` +
          `<rect x="88" y="74" width="20" height="24" fill="${p.primary}"${a("rise", 0.1)}/>`;
        for (let i = 0; i < n; i++) {
          const key = i === 3;
          const ro = key ? 54 : 48;
          const s = 180 - i * step - g;
          const e = 180 - (i + 1) * step + g;
          const d = `M${pt(ro, s)} A${ro} ${ro} 0 0 1 ${pt(ro, e)} L${pt(ri, e)} A${ri} ${ri} 0 0 0 ${pt(ri, s)} Z`;
          out += `<path d="${d}" fill="${key ? p.accent : p.primary}"${a("drop", key ? 1.25 : 0.3 + (3 - Math.abs(i - 3)) * 0.2)}/>`;
        }
        return out;
      },
    },
    {
      id: "P2-12",
      slug: "compass",
      name: "Compass",
      story: "An architect’s dividers, opened to sweep an arc. The legs form the A and the arc becomes its crossbar, a reminder that every space begins with one measured line.",
      word: { text: "AURAQIS", family: "'Playfair Display'", weight: 500, size: 34, ls: 0.28, cw: 0.72 },
      desc: descSpec(),
      fonts: ["Playfair Display 500", "Manrope 600"],
      palettes: [PAL.paper, PAL.night, PAL.blueprint, PAL.olive],
      draw(p, u, a) {
        return (
          `<path d="M54.18 25.99 L59.82 28.01 L28 108 Z" fill="${p.primary}"${a("swing", 0.35, "--r:-16deg;transform-origin:92% 0%")}/>` +
          `<path d="M65.82 25.99 L60.18 28.01 L92 108 Z" fill="${p.primary}"${a("swing", 0.35, "--r:16deg;transform-origin:8% 0%")}/>` +
          `<path d="M36.07 85.8 A70 70 0 0 0 83.93 85.8" fill="none" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round"${a("draw", 1.05)}/>` +
          `<rect x="58" y="3" width="4" height="10" rx="1" fill="${p.primary}"${a("fade", 0)}/>` +
          `<circle cx="60" cy="20" r="8" fill="${p.primary}"${a("pop", 0)}/>` +
          `<circle cx="60" cy="20" r="2.6" fill="${p.bg}"${a("pop", 0.2)}/>`
        );
      },
    },
    {
      id: "P2-13",
      slug: "corner-room",
      name: "Corner Room",
      story: "An interior in a single glance: two walls, a floor, a window and a brass doorway with light falling across the boards. The corner of a room, where every interior begins.",
      word: { text: "AURAQIS", family: "'Josefin Sans'", weight: 400, size: 32, ls: 0.48, cw: 0.66 },
      desc: descSpec({ family: "'Josefin Sans'", weight: 600, cw: 0.6 }),
      fonts: ["Josefin Sans 400", "Josefin Sans 600"],
      palettes: [PAL.ivory, PAL.night, PAL.clay, PAL.olive],
      draw(p, u, a) {
        return (
          `<g transform="translate(0 -4)">` +
          `<path d="M60 112 L104 88 L60 64 L16 88 Z" fill="${p.soft}"${a("grow", 0)}/>` +
          `<path d="M16 88 L60 64 L60 16 L16 40 Z" fill="${p.primary}"${a("rise", 0.3)}/>` +
          `<path d="M60 64 L104 88 L104 40 L60 16 Z" fill="${p.deep}"${a("rise", 0.45)}/>` +
          `<path d="M27 60.4 L46.8 49.6 L46.8 32.8 L27 43.6 Z" fill="${p.bg}"${a("fade", 0.9)}/>` +
          `<path d="M75.4 72.4 L88.6 79.6 L88.6 50.8 L75.4 43.6 Z" fill="${p.accent}"${a("rise", 1.05)}/>` +
          `<path d="M34 93 L50 84 L64 92 L48 101 Z" fill="${p.accent}" opacity=".45"${a("fade", 1.3, "--o:.45")}/>` +
          `</g>`
        );
      },
    },
    {
      id: "P2-14",
      slug: "section",
      name: "Section",
      story: "Borrowed from construction drawings: the section callout that tells a builder where to cut and which way to look. A sits above the line and Q below, an AQ monogram only a design-and-build firm would think of.",
      word: { text: "AURAQIS", family: "'Space Grotesk'", weight: 500, size: 30, ls: 0.5, cw: 0.7 },
      desc: descSpec({ family: "'Space Grotesk'", weight: 400, ls: 0.5 }),
      fonts: ["Space Grotesk 500", "Space Grotesk 400"],
      palettes: [PAL.paper, PAL.blueprint, PAL.noir, PAL.night],
      draw(p, u, a) {
        return (
          `<circle cx="60" cy="60" r="40" fill="none" stroke="${p.primary}" stroke-width="4" transform="rotate(-90 60 60)"${a("draw", 0)}/>` +
          `<path d="M20 60 H100" stroke="${p.primary}" stroke-width="3"${a("draw", 0.35)}/>` +
          `<path d="M2 60 H16" stroke="${p.primary}" stroke-width="3" stroke-dasharray="4 3"${a("fade", 0.6)}/>` +
          `<path d="M100 60 H118 L100 40 Z" fill="${p.accent}"${a("pop", 1.35)}/>` +
          `<path d="M48 50 L60 25 L72 50 M52.4 41 H67.6" fill="none" stroke="${p.primary}" stroke-width="4.5" stroke-miterlimit="10"${a("draw", 0.6)}/>` +
          `<circle cx="60" cy="80" r="10" fill="none" stroke="${p.primary}" stroke-width="4.5" transform="rotate(-90 60 80)"${a("draw", 0.85)}/>` +
          `<path d="M66 86 L73 93" stroke="${p.accent}" stroke-width="4.5"${a("draw", 1.15)}/>`
        );
      },
    },
    {
      id: "P2-15",
      slug: "threshold",
      name: "Threshold",
      story: "A door left ajar, warm light spilling across the threshold. An invitation inside, to the interiors AURAQIS builds and to the people it welcomes.",
      word: { text: "AURAQIS", family: "'DM Serif Display'", weight: 400, size: 36, ls: 0.24, cw: 0.66 },
      desc: descSpec(),
      fonts: ["DM Serif Display 400", "Manrope 600"],
      palettes: [PAL.ivory, PAL.night, PAL.copper, PAL.clay],
      draw(p, u, a) {
        return (
          `<rect x="30" y="14" width="60" height="96" fill="${p.accent}"${a("fade", 0.5)}/>` +
          `<path d="M52 110 H88 L106 118 H42 Z" fill="${p.accent}" opacity=".4"${a("fade", 1.3, "--o:.4")}/>` +
          `<path d="M30 14 L50 22 V102 L30 110 Z" fill="${p.primary}"${a("door", 0.6)}/>` +
          `<circle cx="45" cy="63" r="2.2" fill="${p.accent}"${a("pop", 1.6)}/>` +
          `<path d="M28 110 V12 H92 V110" fill="none" stroke="${p.primary}" stroke-width="4"${a("draw", 0)}/>` +
          `<path d="M8 110 H112" stroke="${p.primary}" stroke-width="2"${a("draw", 0.15)}/>`
        );
      },
    },
    {
      id: "P2-16",
      slug: "block",
      name: "Block",
      story: "A solid block with the original marble swirl on its top face, as if cut from the brand itself. Heritage on top, solid construction underneath.",
      word: { text: "AURAQIS", family: "'Jost'", weight: 500, size: 32, ls: 0.46, cw: 0.66 },
      desc: descSpec({ family: "'Jost'", weight: 500, cw: 0.6 }),
      fonts: ["Jost 500"],
      palettes: [
        { name: "Ivory · Forest", bg: C.ivory, primary: C.forest, accent: C.brass, soft: C.sagePale, deep: C.forestDeep, text: C.forest, desc: C.stoneDark },
        { name: "Forest Night", bg: C.forestDeep, primary: C.sageLight, accent: C.brassLight, soft: C.forest, deep: C.stone, text: C.ivory, desc: C.brassLight },
        { name: "Charcoal · Brass", bg: C.charcoal, primary: C.brassLight, accent: C.ivory, soft: C.ink, deep: C.brassDeep, text: C.stone, desc: C.stoneDark },
        { name: "Limewash · Clay", bg: "#ebe3d6", primary: "#9a5638", accent: C.forest, soft: "#e3cdb9", deep: "#6b3a24", text: "#3b2a20", desc: "#9a5638" },
      ],
      draw(p, u, a, o) {
        const top = "M60 12 L102 36 L60 60 L18 36 Z";
        return (
          `<defs><clipPath id="${u}-c"><path d="${top}"/></clipPath>` +
          `<mask id="${u}-m" mask-type="alpha" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><g transform="matrix(.42 .24 -.42 .24 60 12)"><g${a.idle("drift")}><image href="${o.href}" x="-15" y="-15" width="130" height="130"/></g></g></mask></defs>` +
          `<path d="M18 36 L60 60 V108 L18 84 Z" fill="${p.primary}"${a("drop", 0.1)}/>` +
          `<path d="M60 60 L102 36 V84 L60 108 Z" fill="${p.deep}"${a("drop", 0.3)}/>` +
          `<g${a("drop", 0.55)}><path d="${top}" fill="${p.soft}"/><g clip-path="url(#${u}-c)"><rect width="120" height="120" fill="${p.primary}" mask="url(#${u}-m)"/></g></g>` +
          `<path d="M60 60 V108" stroke="${p.accent}" stroke-width="1.4"${a("draw", 1.1)}/>`
        );
      },
    },
  ];

  /* ——————————————————————— Public API ——————————————————————— */

  /**
   * render(concept, opts) → SVG string.
   * opts: layout ('stack' | 'row' | 'mark'), palette (phase 2 index), anim, uid, href (swirl PNG),
   *       markImage (pre-coloured PNG, phase 1 exports), bg (adds background rect), fonts (embeds @import).
   */
  function render(c, o = {}) {
    const a = animator(!!o.anim);
    const u = (o.uid || c.id).replace(/[^a-zA-Z0-9-]/g, "");
    const layout = o.layout || c.layout || "stack";
    const label = `AURAQIS logo concept ${c.id} ${c.name}`;
    const isP1 = c.id.startsWith("P1");
    const pal = isP1 ? null : c.palettes[o.palette ?? 0];
    const bg = o.bg ? (isP1 ? c.bg : pal.bg) : null;

    const mark = isP1
      ? phase1Mark(c, u, a, o)
      : (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s / 120)})">${c.draw(pal, u, a, o)}</g>`;

    if (layout === "mark") {
      const s = 120;
      const pad = o.pad ?? 0;
      return withFonts(svgRoot([-pad, -pad, s + pad * 2, s + pad * 2], mark(0, 0, s), a, label, bg), o.fonts);
    }

    const colors = isP1
      ? { text: c.word.color, desc: c.desc.color, rule: c.rule }
      : { text: pal.text, desc: pal.desc, rule: pal.accent };
    const s = (isP1 ? 150 : 140) * (layout === "row" ? 0.72 : 1);
    const svg = lockup({ mark, s, word: c.word, desc: c.desc, rule: isP1 ? c.rule : null, colors, layout, a, label, bg });
    return withFonts(svg, o.fonts);
  }

  function withFonts(svg, on) {
    return on ? svg.replace(/(<svg[^>]*>)/, `$1<style><![CDATA[@import url('${FONT_CSS}');]]></style>`) : svg;
  }

  root.AuraqisLogos = { C, FONT_CSS, PAL, phase1, phase2, render, withFonts, paint };
})(typeof window !== "undefined" ? window : globalThis);
