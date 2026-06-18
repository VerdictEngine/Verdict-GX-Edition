/* =====================================================================
   Verdict! Engine - Evidence Board (self-contained)
   Parallax corkboard, draggable lifting clues, red-string links,
   click-to-inspect spotlight. Lazy-inits when scrolled into view.
   ===================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var started = false;

  function init() {
    if (started) return;
    var stage = document.getElementById("boardStage");
    if (!stage) return;
    started = true;

    var surface = document.getElementById("boardSurface");
    var svg = document.getElementById("boardStrings");
    var inspect = document.getElementById("boardInspect");
    var inspectCard = document.getElementById("boardInspectCard");
    var inspectClose = document.getElementById("boardInspectClose");
    var resetBtn = document.getElementById("boardReset");

    var CLUES = [
      { type: "photo", icon: "fa-house-chimney-crack", title: "The Scene", sub: "9:42 PM, study", tag: "neutral", x: 0.08, y: 0.10, rot: -4, z: 30 },
      { type: "photo", icon: "fa-user-secret", title: "The Suspect", sub: "Last seen on site", tag: "prosecution", x: 0.40, y: 0.06, rot: 3, z: 50 },
      { type: "note", title: "Alibi?", sub: "Claims he was at the docks", tag: "defense", x: 0.72, y: 0.12, rot: 5, z: 20 },
      { type: "paper", icon: "fa-fingerprint", title: "Lab Report", sub: "Partial print, inconclusive", tag: "neutral", x: 0.14, y: 0.46, rot: 2, z: 40 },
      { type: "photo", icon: "fa-wine-bottle", title: "The Weapon", sub: "No usable prints", tag: "prosecution", x: 0.45, y: 0.44, rot: -3, z: 60 },
      { type: "note", title: "Motive", sub: "Owed a large debt", tag: "prosecution", x: 0.74, y: 0.46, rot: -5, z: 25 },
      { type: "paper", icon: "fa-clock", title: "Timeline", sub: "12 min unaccounted", tag: "defense", x: 0.26, y: 0.74, rot: 4, z: 35 },
      { type: "photo", icon: "fa-video", title: "CCTV Still", sub: "Figure in dark coat", tag: "prosecution", x: 0.58, y: 0.72, rot: 3, z: 45 }
    ];
    var LINKS = [[0, 1], [1, 4], [4, 5], [1, 2], [3, 4], [0, 6], [7, 1]];
    var cards = [];

    function tagHTML(c) { return '<span class="clue-tag ' + c.tag + '">' + c.tag + '</span>'; }
    function clueHTML(c) {
      if (c.type === "photo") {
        return '<div class="clue-photo-img"><i class="fa-solid ' + c.icon + '"></i></div>' +
          '<div class="clue-cap"><div class="clue-title">' + c.title + '</div><div class="clue-sub">' + c.sub + '</div>' + tagHTML(c) + '</div>';
      }
      if (c.type === "paper") {
        return '<div class="clue-title"><i class="fa-solid ' + c.icon + ' mr-1"></i>' + c.title + '</div>' +
          '<div class="clue-sub">' + c.sub + '</div>' + tagHTML(c);
      }
      return '<div class="clue-title">' + c.title + '</div><div class="clue-sub">' + c.sub + '</div>' + tagHTML(c);
    }

    function layout() {
      var w = stage.clientWidth, h = stage.clientHeight;
      cards.forEach(function (card, i) {
        var c = CLUES[i];
        if (card._placed) return;
        card.style.left = (c.x * (w - 168)) + "px";
        card.style.top = (c.y * (h - 150)) + "px";
      });
      drawStrings();
    }
    function center(card) { return { x: card.offsetLeft + card.offsetWidth / 2, y: card.offsetTop + card.offsetHeight / 2 }; }
    function drawStrings() {
      var ns = "http://www.w3.org/2000/svg";
      svg.innerHTML = "";
      LINKS.forEach(function (pair) {
        var a = cards[pair[0]], b = cards[pair[1]];
        if (!a || !b) return;
        var ca = center(a), cb = center(b);
        var line = document.createElementNS(ns, "line");
        line.setAttribute("x1", ca.x); line.setAttribute("y1", ca.y);
        line.setAttribute("x2", cb.x); line.setAttribute("y2", cb.y);
        svg.appendChild(line);
      });
    }

    CLUES.forEach(function (c) {
      var card = document.createElement("div");
      card.className = "clue " + c.type;
      card.style.setProperty("--rot", c.rot + "deg");
      card.style.setProperty("--z", c.z + "px");
      card.innerHTML = clueHTML(c);
      surface.appendChild(card);
      cards.push(card);
      attachClueDrag(card, c);
    });
    layout();

    /* parallax tilt */
    var tilting = false;
    stage.addEventListener("mousemove", function (e) {
      if (tilting || prefersReduced) return;
      var r = stage.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width - 0.5;
      var my = (e.clientY - r.top) / r.height - 0.5;
      surface.style.transform = "rotateY(" + (mx * 7).toFixed(2) + "deg) rotateX(" + (-my * 7).toFixed(2) + "deg)";
    });
    stage.addEventListener("mouseleave", function () { surface.style.transform = ""; });

    /* drag clues */
    function attachClueDrag(card, c) {
      card.addEventListener("pointerdown", function (e) {
        if (e.button != null && e.button !== 0) return;
        tilting = true; surface.style.transform = "";
        var sr = surface.getBoundingClientRect();
        var startX = e.clientX, startY = e.clientY;
        var ox = e.clientX - sr.left - card.offsetLeft;
        var oy = e.clientY - sr.top - card.offsetTop;
        var moved = false;
        card.classList.add("dragging");
        card.style.setProperty("--z", (parseFloat(c.z) + 60) + "px");
        card.style.zIndex = 30;
        card.setPointerCapture(e.pointerId);

        function onMove(ev) {
          var dx = ev.clientX - startX, dy = ev.clientY - startY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
          card._placed = true;
          var nx = clamp(ev.clientX - sr.left - ox, 0, surface.clientWidth - card.offsetWidth);
          var ny = clamp(ev.clientY - sr.top - oy, 0, surface.clientHeight - card.offsetHeight);
          card.style.left = nx + "px"; card.style.top = ny + "px";
          drawStrings();
        }
        function onUp() {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          card.classList.remove("dragging");
          card.style.setProperty("--z", c.z + "px");
          card.style.zIndex = "";
          tilting = false;
          if (!moved) openInspect(c);
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    }

    /* inspect */
    function openInspect(c) {
      inspectCard.innerHTML = '<div class="clue ' + c.type + '">' + clueHTML(c) + '</div>';
      inspect.hidden = false;
    }
    function closeInspect() { inspect.hidden = true; inspectCard.innerHTML = ""; }
    if (inspectClose) inspectClose.addEventListener("click", closeInspect);
    inspect.addEventListener("click", function (e) { if (e.target === inspect) closeInspect(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !inspect.hidden) closeInspect(); });

    if (resetBtn) resetBtn.addEventListener("click", function () {
      cards.forEach(function (card) { card._placed = false; });
      layout();
    });
    window.addEventListener("resize", function () {
      cards.forEach(function (card) { card._placed = false; });
      layout();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.getElementById("boardStage");
    if (!stage) return;
    if (!("IntersectionObserver" in window)) { init(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { init(); io.disconnect(); } });
    }, { rootMargin: "200px" });
    io.observe(stage);
  });
})();
