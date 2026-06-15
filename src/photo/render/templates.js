/* ============================================================
   Gümrükte Güncel — shared photo render module.
   The SINGLE source that turns a validated photo "document"
   (see src/photo/schema.ts) into design-system React elements.
   Used by both the headless render page (Puppeteer export) and
   the panel's iframe preview → "what you preview is what you export".

   Plain React.createElement (no JSX/Babel) so it runs from vendored
   React UMD with zero build step or CDN dependency. The visual
   mapping mirrors gum-foto's editor.html + templates Post.jsx files.
   ============================================================ */
(function () {
  var h = React.createElement;

  // "**word**" → yellow Highlight (posts). Returns an array of nodes.
  function highlightMarkup(value, ns) {
    if (typeof value !== "string") return value;
    var parts = value.split(/(\*\*[^*]+\*\*)/g);
    return parts.map(function (part, idx) {
      if (part.indexOf("**") === 0 && part.lastIndexOf("**") === part.length - 2) {
        return h(ns.Highlight, { key: idx }, part.slice(2, -2));
      }
      return part;
    });
  }

  // Thumbnail title: "**word**" → <Y> (yellow), "!!word!!" → <Hot> (red).
  function thumbTitle(value, ns) {
    if (typeof value !== "string") return value;
    var parts = value.split(/(\*\*[^*]+\*\*|!![^!]+!!)/g);
    return parts.map(function (part, idx) {
      if (part.indexOf("**") === 0 && part.lastIndexOf("**") === part.length - 2) {
        return h(ns.Y, { key: idx }, part.slice(2, -2));
      }
      if (part.indexOf("!!") === 0 && part.lastIndexOf("!!") === part.length - 2) {
        return h(ns.Hot, { key: idx }, part.slice(2, -2));
      }
      return part;
    });
  }

  function assetBase() {
    return window.GG_ASSET_BASE || "assets";
  }

  function topicsArray(topics) {
    if (Array.isArray(topics)) return topics.filter(Boolean);
    return String(topics || "")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  var col = function (extra) {
    return Object.assign(
      { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 },
      extra || {}
    );
  };

  var H1 = function (value, ns, style) {
    return h(
      "h1",
      {
        style: Object.assign(
          {
            margin: 0,
            maxWidth: 880,
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            fontWeight: "var(--fw-black)",
            lineHeight: "var(--lh-head)",
            letterSpacing: "var(--tr-tight)",
            color: "var(--ink-strong)",
            textWrap: "balance",
          },
          style || {}
        ),
      },
      highlightMarkup(value, ns)
    );
  };

  var Body = function (value, ns, style) {
    return h(
      "p",
      {
        style: Object.assign(
          {
            margin: 0,
            maxWidth: 760,
            fontSize: "var(--fs-body)",
            fontWeight: "var(--fw-regular)",
            lineHeight: "var(--lh-body)",
            color: "var(--ink-muted)",
          },
          style || {}
        ),
      },
      highlightMarkup(value, ns)
    );
  };

  // ---------- single-canvas posts ----------

  function renderWelcome(doc, ns) {
    var PostFrame = ns.PostFrame, TopicChips = ns.TopicChips;
    return h(
      PostFrame,
      { motif: "combo", brand: doc.brand === true, handle: doc.handle },
      h(
        "div",
        { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 40 } },
        h(
          "div",
          { style: { display: "inline-flex", flexDirection: "column", alignItems: "stretch", gap: 20 } },
          String(doc.title || "").split("\n").map(function (line, index) {
            return h(
              "span",
              {
                key: index,
                style: {
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-black)",
                  fontSize: 150,
                  lineHeight: 0.9,
                  letterSpacing: index === 0 ? "0.005em" : "0.135em",
                  color: "var(--white)",
                  whiteSpace: "nowrap",
                },
              },
              highlightMarkup(line, ns)
            );
          })
        ),
        h(
          "p",
          {
            style: {
              margin: 0, maxWidth: 760, fontSize: "var(--fs-lead)", fontWeight: "var(--fw-medium)",
              lineHeight: "var(--lh-body)", color: "var(--ink-muted)", letterSpacing: "-0.005em",
            },
          },
          highlightMarkup(doc.body, ns)
        )
      ),
      h(
        "div",
        { style: { display: "flex", justifyContent: "center", paddingTop: 10 } },
        h(TopicChips, { items: topicsArray(doc.topics) })
      )
    );
  }

  function eyebrowWithIcon(ns, tone, iconName, iconColor, text, opts) {
    var children = [];
    if (iconName) {
      children.push(h(ns.LineIcon, { key: "ic", name: iconName, size: 32, color: iconColor, strokeWidth: 2 }));
    }
    children.push(text);
    return h(ns.Eyebrow, Object.assign({ tone: tone }, opts || {}), children);
  }

  function renderValue(doc, ns) {
    var PostFrame = ns.PostFrame, StatNumber = ns.StatNumber;
    return h(
      PostFrame,
      { motif: "routes", handle: doc.handle },
      h(
        "div",
        { style: col() },
        eyebrowWithIcon(ns, "faint", doc.icon, "var(--ink-faint)", doc.eyebrow),
        h(StatNumber, { value: doc.statValue, unit: doc.statUnit }),
        H1(doc.headline, ns),
        Body(doc.body, ns)
      )
    );
  }

  function renderWarning(doc, ns) {
    var PostFrame = ns.PostFrame, WarningStrip = ns.WarningStrip;
    return h(
      PostFrame,
      { motif: "routes", handle: doc.handle },
      h(
        "div",
        { style: col() },
        eyebrowWithIcon(ns, "accent", "alert", "var(--accent)", doc.eyebrow),
        H1(doc.hook, ns, { fontSize: "var(--fs-display)", lineHeight: "var(--lh-tight)", maxWidth: undefined }),
        Body(doc.body, ns, { maxWidth: 820 })
      ),
      h(WarningStrip, { icon: "alert" }, doc.stripText)
    );
  }

  function renderUpdate(doc, ns) {
    var PostFrame = ns.PostFrame;
    return h(
      PostFrame,
      { motif: "combo", handle: doc.handle },
      h(
        "div",
        { style: col() },
        h(ns.Eyebrow, { tone: "accent", rule: true }, doc.eyebrow),
        H1(doc.headline, ns, { fontSize: "var(--fs-display)", lineHeight: "var(--lh-tight)", maxWidth: 900 }),
        Body(doc.body, ns, { maxWidth: 800 })
      )
    );
  }

  function renderPhoto(doc, ns) {
    var PostFrame = ns.PostFrame;
    return h(
      PostFrame,
      { photo: assetBase() + "/photos/" + doc.photo, photoPos: doc.photoPos || "center", scrim: doc.scrim || "bottom", handle: doc.handle },
      h(
        "div",
        { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 32 } },
        h(ns.Eyebrow, { tone: "accent", rule: true }, doc.eyebrow),
        H1(doc.headline, ns, { textShadow: "0 2px 24px rgba(7,16,31,0.55)" }),
        Body(doc.body, ns)
      )
    );
  }

  // ---------- carousel slides ----------

  function renderCoverSlide(s, ns, handle) {
    var PostFrame = ns.PostFrame;
    return h(
      PostFrame,
      { motif: "combo", handle: handle },
      h(
        "div",
        { style: col({ gap: 36 }) },
        h(ns.Eyebrow, { tone: "accent", rule: true }, s.eyebrow),
        H1(s.headline, ns, { fontSize: "var(--fs-display)", lineHeight: 0.98 }),
        Body(s.body, ns, { maxWidth: 720 })
      )
    );
  }
  function renderStatSlide(s, ns, handle) {
    var PostFrame = ns.PostFrame, StatNumber = ns.StatNumber;
    return h(
      PostFrame,
      { motif: "routes", handle: handle },
      h(
        "div",
        { style: col({ gap: 36 }) },
        eyebrowWithIcon(ns, "faint", s.icon, "var(--ink-faint)", s.eyebrow),
        h(StatNumber, { value: s.statValue, unit: s.statUnit }),
        Body(s.body, ns, { maxWidth: 800 })
      )
    );
  }
  function renderWarningSlide(s, ns, handle) {
    var PostFrame = ns.PostFrame, WarningStrip = ns.WarningStrip;
    return h(
      PostFrame,
      { motif: "routes", handle: handle },
      h(
        "div",
        { style: col({ gap: 36 }) },
        eyebrowWithIcon(ns, "accent", "alert", "var(--accent)", s.eyebrow),
        H1(s.headline, ns, { lineHeight: 1.04 })
      ),
      h(WarningStrip, { icon: "alert" }, s.stripText)
    );
  }
  function renderCtaSlide(s, ns, handle) {
    var PostFrame = ns.PostFrame;
    return h(
      PostFrame,
      { motif: "combo", handle: handle },
      h(
        "div",
        { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 40 } },
        h(ns.LineIcon, { name: s.icon || "document", size: 96, color: "var(--accent)", strokeWidth: 1.6 }),
        H1(s.headline, ns, { fontSize: "var(--fs-h1)", lineHeight: 1.02, maxWidth: 820 }),
        h("p", { style: { margin: 0, fontSize: "var(--fs-body)", color: "var(--ink-muted)" } }, highlightMarkup(s.body, ns))
      )
    );
  }

  function renderCarouselSlide(slide, ns, handle) {
    switch (slide.kind) {
      case "cover": return renderCoverSlide(slide, ns, handle);
      case "stat": return renderStatSlide(slide, ns, handle);
      case "warning": return renderWarningSlide(slide, ns, handle);
      case "cta": return renderCtaSlide(slide, ns, handle);
      default: return null;
    }
  }

  // ---------- thumbnails ----------

  function renderThumb(doc, ns) {
    var VideoThumb = ns.VideoThumb;
    var props = {
      format: doc.type === "shorts-thumb" ? "shorts" : "youtube",
      photo: assetBase() + "/photos/" + doc.photo,
      photoPos: doc.photoPos || "center",
      scrim: doc.scrim,
      eyebrow: doc.eyebrow || undefined,
      title: thumbTitle(doc.title, ns),
      callout: doc.callout || undefined,
      calloutTone: doc.calloutTone || "hot",
      align: doc.align,
    };
    if (typeof doc.grade === "number") props.grade = doc.grade;
    if (doc.brand === null) props.brand = null;
    else if (typeof doc.brand === "string") props.brand = doc.brand;
    return h(VideoThumb, props);
  }

  // ---------- public API ----------

  function slideCount(doc) {
    if (doc && doc.type === "carousel") return Array.isArray(doc.slides) ? doc.slides.length : 0;
    return 1;
  }

  // opts.slide → which carousel slide (0-based). Ignored for non-carousel.
  function renderDocument(doc, ns, opts) {
    ns = ns || window.GMrKteGNcelDesignSystem_500523;
    opts = opts || {};
    if (!ns || !doc || !doc.type) return null;
    switch (doc.type) {
      case "welcome": return renderWelcome(doc, ns);
      case "value": return renderValue(doc, ns);
      case "warning": return renderWarning(doc, ns);
      case "update": return renderUpdate(doc, ns);
      case "photo": return renderPhoto(doc, ns);
      case "carousel": {
        var i = opts.slide || 0;
        var slide = (doc.slides || [])[i];
        return slide ? renderCarouselSlide(slide, ns, doc.handle) : null;
      }
      case "youtube-thumb":
      case "shorts-thumb": return renderThumb(doc, ns);
      default: return null;
    }
  }

  window.PhotoRender = {
    renderDocument: renderDocument,
    slideCount: slideCount,
    highlightMarkup: highlightMarkup,
    thumbTitle: thumbTitle,
  };
})();
