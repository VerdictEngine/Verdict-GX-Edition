/* =====================================================================
   Verdict! Engine - Vanilla JS
   Nav tracking, animated counters, edition tabs, game loader,
   mouse parallax, scroll reveals, bug modal
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     CONFIG - EDIT THESE
     --------------------------------------------------------------- */
  // Default game loaded by the "Launch Game Preview" button and the
  // "Open Full Edition" links when no edition-specific URL is set.
  // You can use a hosted URL or a local path like "game/index.html".
  // Leave blank to show the built-in placeholder screen.
  var GAME_URL = ""; // e.g. "https://your-host.example/verdict/index.html"

  // Per-edition external links. Falls back to GAME_URL when blank.
  var EDITION_URLS = {
    gx: "https://gx.games/games/kfj7ob/verdict-gx-edition/",
    flagship: "",
    website: "",
    rbx: "https://www.roblox.com/games/117728270942109/Verdict-RBX-Edition",
    scratch: "https://scratch.mit.edu/projects/539591328/"
  };

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The edition currently shown in the Editions panel. The preview
  // cabinet uses this to decide which build to launch / link to.
  var currentEdition = "gx";
  var syncPreviewLinks = function () {}; // set in initPreview

  function effectiveUrl(edition) {
    if (edition && EDITION_URLS[edition]) return EDITION_URLS[edition];
    return GAME_URL;
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#year").textContent = new Date().getFullYear();
    initHeader();
    initMobileMenu();
    initNavTracking();
    initReveals();
    initCounters();
    initParallax();
    initMechGlow();
    initPreview();
    initEditions();
    initBugModal();
    initSmoothNav();
  });

  /* ---------------- Header scroll state ---------------- */
  function initHeader() {
    var header = $("#header");
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var toggle = $("#menuToggle");
    var menu = $("#mobileMenu");
    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", open);
      toggle.innerHTML = open ? '<i class="fa-solid fa-bars"></i>' : '<i class="fa-solid fa-xmark"></i>';
    });
    $$(".mobile-link").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.add("hidden");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  /* ---------------- Smooth scroll for in-page nav ---------------- */
  function initSmoothNav() {
    $$('a[data-nav]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (href && href.charAt(0) === "#") {
          var target = $(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
          }
        }
      });
    });
  }

  /* ---------------- Nav underline + active section ---------------- */
  function initNavTracking() {
    var links = $$("#navLinks .nav-link");
    var underline = $("#navUnderline");
    var sections = ["home", "history", "editions", "preview", "founder"];

    function moveUnderlineTo(link) {
      if (!link) { underline.style.opacity = "0"; return; }
      underline.style.opacity = "1";
      underline.style.left = link.offsetLeft + "px";
      underline.style.width = link.offsetWidth + "px";
    }

    function setActive(id) {
      var active = null;
      links.forEach(function (l) {
        var on = l.getAttribute("href") === "#" + id;
        l.classList.toggle("active", on);
        if (on) active = l;
      });
      $$(".mobile-link").forEach(function (l) {
        l.classList.toggle("active", l.getAttribute("href") === "#" + id);
      });
      moveUnderlineTo(active);
    }

    // Scroll spy
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (id) {
      var el = $("#" + id);
      if (el) observer.observe(el);
    });

    // Hover preview of underline
    links.forEach(function (l) {
      l.addEventListener("mouseenter", function () { moveUnderlineTo(l); });
    });
    $("#navLinks").addEventListener("mouseleave", function () {
      var active = $("#navLinks .nav-link.active");
      moveUnderlineTo(active);
    });

    window.addEventListener("resize", function () {
      moveUnderlineTo($("#navLinks .nav-link.active"));
    });
    setActive("home");
  }

  /* ---------------- Scroll reveals ---------------- */
  function initReveals() {
    var items = $$(".reveal");
    if (prefersReduced) { items.forEach(function (i) { i.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters() {
    var nums = $$("[data-count]");
    var started = new WeakSet();

    function format(n) { return Math.round(n).toLocaleString("en-US"); }

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReduced) { el.textContent = format(target) + suffix; return; }
      var dur = 1800, start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = format(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !started.has(en.target)) {
          started.add(en.target); run(en.target); io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- Mouse parallax (hero) ---------------- */
  function initParallax() {
    if (prefersReduced) return;
    var scene = $("#heroScene");
    var layers = scene ? $$("[data-depth]", scene) : [];
    var bg = $('[data-parallax]');
    var tx = 0, ty = 0, cx = 0, cy = 0;

    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth) - 0.5;
      var ny = (e.clientY / window.innerHeight) - 0.5;
      tx = nx; ty = ny;
    });

    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth")) || 0;
        var rx = (-cy * d * 0.4).toFixed(2);
        var ry = (cx * d * 0.4).toFixed(2);
        l.style.transform = "translate3d(" + (cx * d).toFixed(1) + "px," + (cy * d).toFixed(1) + "px,0) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      if (bg) {
        var pd = parseFloat(bg.getAttribute("data-parallax")) || 0;
        bg.style.transform = "translate3d(" + (cx * pd * 600).toFixed(1) + "px," + (cy * pd * 400).toFixed(1) + "px,0) scale(1.08)";
      }
      requestAnimationFrame(loop);
    }
    loop();

    // Subtle tilt of the whole scene
    if (scene) {
      window.addEventListener("mousemove", function (e) {
        var r = scene.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var ny = (e.clientY - (r.top + r.height / 2)) / r.height;
        scene.style.transform = "rotateY(" + (nx * 8).toFixed(2) + "deg) rotateX(" + (-ny * 8).toFixed(2) + "deg)";
      });
    }
  }

  /* ---------------- Mechanics cursor glow ---------------- */
  function initMechGlow() {
    $$(".mech-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------------- Editions ---------------- */
  var EDITIONS = {
    gx: {
      title: "GX Edition",
      badge: "Main Release",
      plays: "1,300,000 plays",
      icon: "fa-bolt",
      img: "images/GX Edition Main Image.webp",
      desc: "The biggest edition by far, with over 1.3 million plays. It runs in the browser on GX.games, loads fast, and has the largest set of cases.",
      features: ["The largest player base of any edition", "Regular case updates", "Quick to jump into"]
    },
    flagship: {
      title: "Flagship (Download) Edition",
      badge: "Desktop Build",
      plays: "9,300 plays",
      icon: "fa-download",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1600&auto=format&fit=crop",
      desc: "The standalone desktop version. The interface is more responsive and there are more scenarios to work through, so it is the most complete way to play.",
      features: ["More responsive interface", "A wider range of scenarios", "Made for desktop play"]
    },
    website: {
      title: "Website Edition",
      badge: "Browser Build",
      plays: "48,100 plays",
      icon: "fa-globe",
      img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1600&auto=format&fit=crop",
      desc: "Built out from the early versions into a full courtroom interface that runs in the browser. No install needed.",
      features: ["A full courtroom interface in the browser", "Grew out of the original early builds", "Play instantly, anywhere"]
    },
    rbx: {
      title: "RBX (Roblox) Edition",
      badge: "3D Courtroom",
      plays: "7,900 plays",
      icon: "fa-cubes",
      img: "images/RBX Edition Main Image.webp",
      desc: "The core game rebuilt inside a 3D Roblox courtroom you can move around in, with controls made for the platform.",
      features: ["A 3D courtroom you can walk around", "Roblox-native controls", "A more social trial space"]
    },
    scratch: {
      title: "Scratch Edition",
      badge: "Where It Started",
      plays: "1,500 plays",
      icon: "fa-puzzle-piece",
      img: "images/Scratch Edition Main Image.png",
      desc: "The original prototype. It is short and built around simple yes or no choices, and it teaches the basic rules of how a courtroom works.",
      features: ["Short, simple choices", "Teaches the basic procedural rules", "A good first look at Verdict!"]
    }
  };

  function initEditions() {
    var tabs = $$(".edition-tab");
    var panel = $("#editionPanel");
    var img = $("#editionImg");
    var badge = $("#editionBadge");
    var tagIcon = $("#editionTagIcon");
    var plays = $("#editionPlays");
    var title = $("#editionTitle");
    var desc = $("#editionDesc");
    var features = $("#editionFeatures");
    var playBtn = $("#editionPlay");
    var rendered = null;

    function render(key) {
      var e = EDITIONS[key];
      if (!e || key === rendered) return;
      rendered = key;
      currentEdition = key;
      panel.classList.add("swapping");
      setTimeout(function () {
        img.onerror = function () {
          // Themed fallback so a missing photo never shows a broken icon
          img.style.display = "none";
          img.parentNode.classList.add("media-fallback");
        };
        img.onload = function () {
          img.style.display = "";
          img.parentNode.classList.remove("media-fallback");
        };
        img.src = e.img; img.alt = e.title + " preview";
        badge.textContent = e.badge;
        tagIcon.innerHTML = '<i class="fa-solid ' + e.icon + '"></i>';
        plays.textContent = e.plays;
        title.textContent = e.title;
        desc.textContent = e.desc;
        features.innerHTML = e.features.map(function (f) { return "<li>" + f + "</li>"; }).join("");

        // Route the "Play This Edition" button to its live link when set,
        // otherwise fall back to scrolling to the preview cabinet.
        var url = effectiveUrl(key);
        if (url) {
          playBtn.setAttribute("href", url);
          playBtn.setAttribute("target", "_blank");
          playBtn.setAttribute("rel", "noopener");
        } else {
          playBtn.setAttribute("href", "#preview");
          playBtn.removeAttribute("target");
          playBtn.removeAttribute("rel");
        }
        panel.classList.remove("swapping");
      }, 220);

      // Keep the preview cabinet's links pointed at the current edition.
      syncPreviewLinks();
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.remove("is-active"); });
        t.classList.add("is-active");
        render(t.getAttribute("data-edition"));
      });
    });

    render("gx");
  }

  /* ---------------- Live preview / game loader ---------------- */
  function initPreview() {
    var overlay = $("#launchOverlay");
    var launchBtn = $("#launchBtn");
    var screen = $("#screen");
    var status = $("#cabinetStatus");
    var fsBtn = $("#ctlFullscreen");
    var resetBtn = $("#ctlReset");
    var external = $("#ctlExternal");
    var overlayExternal = $("#overlayExternal");
    var iframe = null;

    // Point the external links at the current edition (or the default).
    syncPreviewLinks = function () {
      var url = effectiveUrl(currentEdition);
      if (url) {
        external.setAttribute("href", url);
        external.style.opacity = "";
        external.style.pointerEvents = "";
        overlayExternal.setAttribute("href", url);
        overlayExternal.style.display = "";
      } else {
        external.removeAttribute("href");
        external.style.opacity = "0.45";
        external.style.pointerEvents = "none";
        overlayExternal.style.display = "none";
      }
    };
    syncPreviewLinks();

    function buildPlaceholder() {
      // Self-contained fallback shown when no game URL is configured.
      var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
        'html,body{height:100%;margin:0;font-family:Inter,system-ui,sans-serif;background:radial-gradient(120% 120% at 50% 0%,#1b1714,#0c0a09);color:#e7e5e4;display:flex;align-items:center;justify-content:center;text-align:center}' +
        '.w{max-width:520px;padding:28px}.g{font-size:54px;color:#e3b762;filter:drop-shadow(0 0 22px rgba(212,162,74,.5))}' +
        'h1{font-family:Georgia,serif;color:#f1d08a;letter-spacing:.04em;margin:14px 0 6px}p{color:#a8a29e;line-height:1.6;font-size:14px}' +
        'code{color:#e3b762;background:rgba(212,162,74,.1);padding:2px 7px;border-radius:6px}' +
        '.k{margin-top:18px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
        '.b{border:1px solid rgba(212,162,74,.3);border-radius:8px;padding:8px 12px;font-size:13px;color:#d6d3d1}</style></head>' +
        '<body><div class="w"><div class="g">&#9878;</div><h1>Verdict! Preview Cabinet</h1>' +
        '<p>This is where the game embed loads. Point it at a build by setting <code>GAME_URL</code> in <code>js/main.js</code>, ' +
        'either a hosted URL or a local <code>game/index.html</code>.</p>' +
        '<div class="k"><span class="b">&#128270; Examine</span><span class="b">&#128188; Present</span>' +
        '<span class="b">&#129507; Object</span><span class="b">&#9878; Verdict</span></div></div></body></html>';
      var f = document.createElement("iframe");
      f.setAttribute("title", "Verdict! Preview");
      f.srcdoc = html;
      return f;
    }

    function buildIframe(src) {
      var f = document.createElement("iframe");
      f.setAttribute("title", "Verdict! Game Preview");
      f.setAttribute("allow", "fullscreen; autoplay; gamepad; clipboard-write");
      f.setAttribute("allowfullscreen", "");
      f.src = src;
      return f;
    }

    launchBtn.addEventListener("click", function () {
      if (launchBtn.classList.contains("loading")) return;
      launchBtn.classList.add("loading");
      status.textContent = "LOADING";

      // Short load animation, then inject the embed.
      setTimeout(function () {
        var src = effectiveUrl(currentEdition);
        iframe = src ? buildIframe(src) : buildPlaceholder();
        screen.appendChild(iframe);
        overlay.classList.add("hidden-overlay");
        launchBtn.classList.remove("loading");
        status.textContent = "LIVE";
        status.classList.add("live");
        fsBtn.disabled = false;
        resetBtn.disabled = false;
      }, 1100);
    });

    fsBtn.addEventListener("click", function () {
      if (!iframe) return;
      var el = $("#screen");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    });

    resetBtn.addEventListener("click", function () {
      if (!iframe) return;
      // Reload the embed
      if (iframe.srcdoc) {
        var sd = iframe.srcdoc; iframe.srcdoc = ""; iframe.srcdoc = sd;
      } else {
        var s = iframe.src; iframe.src = "about:blank"; setTimeout(function () { iframe.src = s; }, 60);
      }
      status.textContent = "RESET";
      setTimeout(function () { status.textContent = "LIVE"; }, 900);
    });
  }

  /* ---------------- Bug / suggestions modal ---------------- */
  function initBugModal() {
    var modal = $("#bugModal");
    var open = $("#ctlBug");
    var close = $("#bugClose");
    var formLink = $("#bugFormLink");

    function show() { modal.classList.remove("hidden"); setTimeout(function () { if (formLink) formLink.focus(); }, 50); }
    function hide() { modal.classList.add("hidden"); }

    open.addEventListener("click", show);
    close.addEventListener("click", hide);
    modal.addEventListener("click", function (e) { if (e.target === modal) hide(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });

    // Close the modal once the user heads off to the form.
    if (formLink) formLink.addEventListener("click", function () { setTimeout(hide, 100); });
  }
})();
