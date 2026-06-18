/* =====================================================================
   Verdict! Engine - Scales of Justice
   Drag evidence chips onto the pans; spring-physics beam + verdict meter.
   ===================================================================== */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  document.addEventListener("DOMContentLoaded", function () {
    if ($("#scalesStage")) initScales();
  });

  function initScales() {
    var EVIDENCE = [
      { id: "prints", label: "Fingerprints", icon: "fa-fingerprint", w: 3, aff: "left" },
      { id: "eye", label: "Eyewitness", icon: "fa-eye", w: 2, aff: "left" },
      { id: "motive", label: "Clear Motive", icon: "fa-heart-crack", w: 2, aff: "left" },
      { id: "weapon", label: "The Weapon", icon: "fa-wine-bottle", w: 3, aff: "left" },
      { id: "cctv", label: "CCTV Footage", icon: "fa-video", w: 2, aff: "left" },
      { id: "alibi", label: "Solid Alibi", icon: "fa-clock", w: 3, aff: "right" },
      { id: "char", label: "Character Witness", icon: "fa-user-check", w: 2, aff: "right" },
      { id: "dna", label: "DNA Mismatch", icon: "fa-dna", w: 3, aff: "right" },
      { id: "doubt", label: "Reasonable Doubt", icon: "fa-circle-question", w: 2, aff: "right" },
      { id: "expert", label: "Expert Rebuttal", icon: "fa-user-graduate", w: 2, aff: "right" }
    ];

    var tray = $("#trayItems");
    var panItems = { left: $("#panItemsLeft"), right: $("#panItemsRight") };
    var dishes = { left: $("#panLeft .pan-dish"), right: $("#panRight .pan-dish") };
    var beam = $("#scaleBeam"), panLeft = $("#panLeft"), panRight = $("#panRight");
    var needle = $("#vmNeedle"), readout = $("#vmReadout"), stage = $("#scalesStage");

    var weights = { left: 0, right: 0 };
    var byId = {};
    EVIDENCE.forEach(function (e) { byId[e.id] = e; });

    function makeChip(e) {
      var el = document.createElement("div");
      el.className = "chip-ev";
      el.setAttribute("data-id", e.id);
      el.setAttribute("data-aff", e.aff);
      el.innerHTML = '<i class="fa-solid ' + e.icon + '"></i> <span>' + e.label + '</span> <span class="chip-w">' + e.w + '</span>';
      attachChipDrag(el);
      return el;
    }

    function resetAll() {
      tray.innerHTML = "";
      panItems.left.innerHTML = ""; panItems.right.innerHTML = "";
      weights.left = 0; weights.right = 0;
      EVIDENCE.forEach(function (e) { tray.appendChild(makeChip(e)); });
      updateBeam(); updateMeter();
    }

    /* ---- spring physics for the beam ---- */
    var spring = { cur: 0, vel: 0, aim: 0, running: false };
    function updateBeam() {
      spring.aim = clamp((weights.right - weights.left) * 3.1, -15, 15);
      if (!spring.running) { spring.running = true; requestAnimationFrame(springStep); }
    }
    function springStep() {
      var force = (spring.aim - spring.cur) * 0.08;
      spring.vel = (spring.vel + force) * 0.82;
      spring.cur += spring.vel;
      beam.style.transform = "rotate(" + spring.cur.toFixed(2) + "deg)";
      panLeft.style.transform = "translateX(50%) rotate(" + (-spring.cur).toFixed(2) + "deg)";
      panRight.style.transform = "translateX(-50%) rotate(" + (-spring.cur).toFixed(2) + "deg)";
      if (Math.abs(spring.vel) < 0.002 && Math.abs(spring.aim - spring.cur) < 0.02) {
        spring.running = false; return;
      }
      requestAnimationFrame(springStep);
    }

    function updateMeter() {
      var diff = weights.left - weights.right;     // + => prosecution heavier => guilty
      var pos = clamp(50 - diff * 4, 4, 96);
      needle.style.left = pos + "%";
      stage.classList.remove("lean-guilty", "lean-clear");
      var txt, col;
      if (diff >= 4) { txt = "Strongly leaning Guilty"; col = "#d98a84"; stage.classList.add("lean-guilty"); }
      else if (diff >= 1) { txt = "Leaning Guilty"; col = "#d98a84"; stage.classList.add("lean-guilty"); }
      else if (diff <= -4) { txt = "Strongly leaning Not Guilty"; col = "#94c79f"; stage.classList.add("lean-clear"); }
      else if (diff <= -1) { txt = "Leaning Not Guilty"; col = "#94c79f"; stage.classList.add("lean-clear"); }
      else if (weights.left === 0 && weights.right === 0) { txt = "Balanced. Present the evidence."; col = "#d6d3d1"; }
      else { txt = "The jury is undecided"; col = "#e3b762"; }
      readout.textContent = txt; readout.style.color = col;
    }

    /* ---- pointer drag for chips ---- */
    function attachChipDrag(el) {
      el.addEventListener("pointerdown", function (e) {
        if (e.button != null && e.button !== 0) return;
        e.preventDefault();
        var rect = el.getBoundingClientRect();
        var offX = e.clientX - rect.left, offY = e.clientY - rect.top;
        var ghost = el.cloneNode(true);
        ghost.classList.add("floating");
        ghost.style.width = rect.width + "px";
        document.body.appendChild(ghost);
        el.classList.add("dragging");
        moveGhost(e.clientX, e.clientY);

        function moveGhost(x, y) { ghost.style.left = (x - offX) + "px"; ghost.style.top = (y - offY) + "px"; }
        function hot(x, y, on) {
          var side = sideAt(x, y);
          dishes.left.classList.toggle("drop-hot", on && side === "left");
          dishes.right.classList.toggle("drop-hot", on && side === "right");
        }
        function onMove(ev) { moveGhost(ev.clientX, ev.clientY); hot(ev.clientX, ev.clientY, true); }
        function onUp(ev) {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          ghost.remove();
          el.classList.remove("dragging");
          hot(0, 0, false);
          placeChip(el, sideAt(ev.clientX, ev.clientY));
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    }

    function sideAt(x, y) {
      var rl = dishes.left.getBoundingClientRect();
      var rr = dishes.right.getBoundingClientRect();
      if (x >= rl.left - 18 && x <= rl.right + 18 && y >= rl.top - 18 && y <= rl.bottom + 40) return "left";
      if (x >= rr.left - 18 && x <= rr.right + 18 && y >= rr.top - 18 && y <= rr.bottom + 40) return "right";
      return null;
    }

    function currentSideOf(el) {
      if (panItems.left.contains(el)) return "left";
      if (panItems.right.contains(el)) return "right";
      return null;
    }

    function placeChip(el, side) {
      var w = byId[el.getAttribute("data-id")].w;
      var from = currentSideOf(el);
      if (from) weights[from] -= w;

      if (side === "left" || side === "right") {
        el.classList.add("in-pan");
        panItems[side].appendChild(el);
        weights[side] += w;
      } else {
        el.classList.remove("in-pan");
        tray.appendChild(el);
      }
      updateBeam(); updateMeter();
    }

    $("#scalesReset").addEventListener("click", resetAll);
    resetAll();
  }
})();
