/* Hamdan Esmail: the page's behaviour.
   1. The worlds: a pinned screen that turns into each build as you scroll, with a hard edge between two.
   2. The guide: a small figure who walks in, jumps between worlds and says each world's line.
   3. About: arrives once, and the portrait leans toward the pointer.
   The page is complete without this file; see the last block of css/site.css. */
(function () {
  "use strict";
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var soft = "cubic-bezier(0.22, 1, 0.36, 1)";
  var run = document.getElementById("run");
  var stage = document.getElementById("stage");
  var layer = document.getElementById("guide");
  var theme = document.querySelector('meta[name="theme-color"]');

  /* ---------- 1. The worlds. They are written in the page as nine linked pictures; everything is read from there. */
  var cur = stage.querySelector(".skin");
  var worlds = Array.prototype.map.call(cur.querySelectorAll(".frame"), function (a) {
    return { n: a.dataset.name, bg: a.dataset.bg, ink: a.dataset.ink, l: a.dataset.line, u: a.href };
  });
  var N = worlds.length;
  run.style.setProperty("--steps", N - 1);

  function wire(skin) {
    var list = skin.querySelector(".select");
    list.innerHTML = "";
    worlds.forEach(function (w, i) {
      var li = document.createElement("li"), b = document.createElement("button");
      b.type = "button";
      b.innerHTML = "<i></i>" + w.n;
      b.addEventListener("click", function () { go(i); });
      li.appendChild(b);
      list.appendChild(li);
    });
    /* The phone's stand-in for the list: back, where you are, and on. */
    var pager = document.createElement("div");
    pager.className = "pager";
    pager.innerHTML = '<button type="button" class="prev">Back</button><span></span><button type="button" class="next">Next world</button>';
    pager.querySelector(".prev").addEventListener("click", function () { go(active - 1); });
    pager.querySelector(".next").addEventListener("click", function () { go(active + 1); });
    list.after(pager);
    /* Reaching a picture with the keyboard brings its world to the screen. */
    Array.prototype.forEach.call(skin.querySelectorAll(".frame"), function (a, i) {
      a.addEventListener("focus", function () { if (i !== active) go(i); });
    });
  }

  /* Two copies of the screen: the world you are in, and the one arriving. The edge between them follows the scroll. */
  var other = cur.cloneNode(true);
  other.className = "skin other";
  other.setAttribute("aria-hidden", "true");
  other.inert = true;
  var h1 = other.querySelector("h1"), plain = document.createElement("div");
  plain.className = "h1";
  plain.innerHTML = h1.innerHTML;
  h1.replaceWith(plain);
  stage.insertBefore(other, layer);
  wire(cur);
  wire(other);
  worlds.forEach(function (w, i) {
    var snap = document.createElement("div");
    snap.className = "snap";
    snap.style.top = "calc(" + i + " * 55svh)";
    run.appendChild(snap);
  });

  /* A line is held in two parts: what has been said so far, and the rest, kept invisible so the bubble never
     changes size while he speaks. A hidden full copy is there for screen readers. */
  function setLine(skin, text, n) {
    var line = skin.querySelector(".now-line");
    line.innerHTML = '<span class="sr"></span><span aria-hidden="true"><span class="said"></span><span class="unsaid"></span></span>';
    line.querySelector(".sr").textContent = text;
    line.querySelector(".said").textContent = text.slice(0, n);
    line.querySelector(".unsaid").textContent = text.slice(n);
  }
  function render(skin, i) {
    var w = worlds[i];
    skin.style.setProperty("--field", w.bg);
    skin.style.setProperty("--field-ink", w.ink);
    skin.querySelector(".now-name").textContent = w.n;
    setLine(skin, w.l, skin === cur && !calm ? 0 : w.l.length);
    var open = skin.querySelector(".open");
    open.textContent = "Open " + w.n;
    open.href = w.u;
    Array.prototype.forEach.call(skin.querySelectorAll(".select button"), function (b, j) {
      b.setAttribute("aria-current", j === i ? "true" : "false");
    });
    skin.querySelector(".pager span").textContent = (i + 1) + " of " + N;
    skin.querySelector(".pager .prev").disabled = i === 0;
    skin.querySelector(".pager .next").disabled = i === N - 1;
  }

  var active = -1, shown = -1;
  /* The scroll distance of the run. Both heights come from the layout, so a phone's sliding address bar cannot skew it. */
  function total() { return run.offsetHeight - stage.offsetHeight; }
  function place() {
    var p = Math.min(1, Math.max(0, -run.getBoundingClientRect().top / total()));
    var pos = p * (N - 1);
    var i = Math.min(N - 2, Math.floor(pos)), f = pos - i;
    /* Within a few pixels of a world, count it as exactly there, so no sliver of the next one shows. */
    if (f < 0.006) f = 0; else if (f > 0.994) f = 1;
    var act = Math.round(pos);
    var lower = act === i + 1;
    var neighbour = lower ? i : i + 1;
    if (act !== active) {
      var first = active === -1;
      active = act;
      hush();
      render(cur, act);
      if (theme) theme.setAttribute("content", worlds[act].bg);
      if (!first) { hop(); history.replaceState(null, "", "#" + (act + 1)); }
    }
    if (neighbour !== shown) { render(other, neighbour); shown = neighbour; }
    var cut = (1 - f) * 100;
    var top = f === 0 ? "none" : "inset(0 0 " + (100 - cut).toFixed(3) + "% 0)";
    var bottom = "inset(calc(" + cut.toFixed(3) + "% - 1px) 0 0 0)";
    cur.style.clipPath = lower ? (f === 1 ? "none" : bottom) : top;
    other.style.clipPath = lower ? top : bottom;
    cur.style.zIndex = lower ? 2 : 1;
    other.style.zIndex = lower ? 1 : 2;
    other.style.visibility = f === 0 || f === 1 ? "hidden" : "visible";
    [cur, other].forEach(function (skin) {
      var win = skin.querySelector(".window"), reel = skin.querySelector(".reel");
      var h = reel.firstElementChild.offsetHeight;
      var gap = parseFloat(getComputedStyle(reel).rowGap) || 20;
      reel.style.transform = "translate3d(0," + (win.clientHeight / 2 - h / 2 - pos * (h + gap)).toFixed(1) + "px,0)";
    });
  }
  function spot(i) { return run.offsetTop + (i / (N - 1)) * total(); }
  function go(i) {
    i = Math.max(0, Math.min(N - 1, i));
    window.scrollTo({ top: spot(i), behavior: calm ? "auto" : "smooth" });
  }
  function inRun() { return window.scrollY < run.offsetTop + total() + 10; }

  /* ---------- 2. The guide. He lives in one layer above both copies, so the curtain never cuts him.
     `three` is the 3D figure once it has loaded; until then, and wherever 3D is not available, a flat pixel
     drawing of the same person stands in. */
  var three = null;
  var flat = layer.querySelector(".guide-2d");
  /* The dark mark on the ground under his feet. He is a 3D figure who jumps, so it shrinks as he rises. */
  var ground = layer.querySelector(".guide-ground");
  var INK = { K: "#14110e", W: "#f4f3ee", G: "#d6d4cc", S: "#c49672", B: "#35261d", F: "#34373c", E: "#17130f", L: "#4a3524" };
  var top8 = ["....KKKKKK....", "...KWWWWWWK...", "..KWWWWWWWWK..", "..KWSSSSSSWK..", "..KWFEFFEFWK..", "..KWSSSSSSWK..", "..KWBSBBSBWK..", "..KWWBBBBWWK.."];
  var POSE = {
    idle: top8.concat([".KWWWKBBKWWWK.", ".KWWWWWWWWWWK.", ".KWKWWGWWWKWK.", ".KWKWWGWWWKWK.", ".KSKWWWWWWKSK.", "..KKWWWWWWKK..", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "..KLLLKKLLLK..", "..KKKK..KKKK.."]),
    wave: top8.concat([".KWWWKBBKWWKSK", ".KWWWWWWWWWKWK", ".KWKWWGWWWWKK.", ".KWKWWGWWWK...", ".KSKWWWWWWK...", "..KKWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "..KLLLKKLLLK..", "..KKKK..KKKK.."]),
    jump: top8.concat([".KWWWKBBKWWWK.", ".KSKWWWWWWKSK.", ".KWKWWGWWWKWK.", ".KKKWWGWWWKKK.", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "...KWWWWWWK...", "..KLLKKKKLLK..", "..KKKK..KKKK..", ".............."])
  };
  function draw(name) {
    var g = flat.getContext("2d");
    g.clearRect(0, 0, 14, 20);
    POSE[name].forEach(function (row, y) {
      for (var x = 0; x < 14; x++) if (INK[row[x]]) { g.fillStyle = INK[row[x]]; g.fillRect(x, y, 1, 1); }
    });
  }
  /* Put the layer exactly over the empty place kept for him in the column. */
  function sync() {
    var a = cur.querySelector(".guide-slot").getBoundingClientRect(), b = stage.getBoundingClientRect();
    layer.style.display = a.width ? "block" : "none";
    layer.style.left = (a.left - b.left) + "px";
    layer.style.top = (a.top - b.top) + "px";
    layer.style.width = a.width + "px";
    layer.style.height = a.height + "px";
    layer.style.setProperty("--guide-h", a.height + "px");
    if (three) three.resize();
  }

  var typing = 0, sayAt = 0;
  function hush() {
    clearTimeout(typing); clearTimeout(sayAt);
    cur.querySelector(".bubble").classList.remove("speaking");
    if (three) three.talk(false);
  }
  /* He says the line a letter at a time, pausing at commas and full stops, with his mouth moving
     and three dots bouncing in the corner of the bubble until he is done. */
  function say() {
    hush();
    var bubble = cur.querySelector(".bubble"), text = worlds[Math.max(0, active)].l, i = 0;
    bubble.classList.remove("wait");
    if (calm) { setLine(cur, text, text.length); return; }
    setLine(cur, text, 0);
    var said = cur.querySelector(".said"), unsaid = cur.querySelector(".unsaid");
    bubble.classList.add("speaking");
    (function step() {
      if (i >= text.length) { bubble.classList.remove("speaking"); if (three) three.talk(false); return; }
      var ch = text[i++];
      said.textContent = text.slice(0, i);
      unsaid.textContent = text.slice(i);
      var pause = ch === "." || ch === "?" ? 260 : ch === "," ? 120 : 17;
      if (three) three.talk(pause < 100);
      typing = setTimeout(step, pause);
    })();
  }
  /* A jump: he crouches, goes up turning once, lands with a little squash, points at the screen and starts talking. */
  function hop() {
    hush();
    if (calm) { if (three) three.point(1.6); say(); return; }
    cur.querySelector(".bubble").animate([{ transform: "scale(0.93)" }, { transform: "none" }], { duration: 220, easing: soft });
    if (three) { three.hop(); three.point(3); } else draw("jump");
    var figure = three ? layer.querySelector(".guide-3d") : flat, ms = 580;
    figure.animate([
      { transform: "translateY(0) scale(1.07, 0.9)", offset: 0 },
      { transform: "translateY(0) scale(0.97, 1.05)", offset: 0.14, easing: "cubic-bezier(0.2, 0.8, 0.4, 1)" },
      { transform: "translateY(-46px) scale(1, 1)", offset: 0.54, easing: "cubic-bezier(0.6, 0, 0.9, 0.4)" },
      { transform: "translateY(0) scale(1, 1)", offset: 0.87 },
      { transform: "translateY(0) scale(1.09, 0.89)", offset: 0.93 },
      { transform: "translateY(0) scale(1, 1)", offset: 1 }
    ], { duration: ms });
    ground.animate([{ transform: "scale(1)" }, { transform: "scale(1)", offset: 0.14 }, { transform: "scale(0.55)", offset: 0.54 }, { transform: "scale(1)", offset: 0.87 }, { transform: "scale(1)" }], { duration: ms });
    if (three) {
      var t0 = performance.now();
      (function lift() {
        var p = (performance.now() - t0) / ms;
        if (p >= 0.87) { three.air(0); return; }
        three.air(p < 0.14 ? 0 : Math.sin(((p - 0.14) / 0.73) * Math.PI));
        requestAnimationFrame(lift);
      })();
    } else setTimeout(function () { draw("wave"); setTimeout(function () { draw("idle"); }, 900); }, ms);
    sayAt = setTimeout(say, ms - 60);
  }
  var began = false;
  function begin() {
    if (began) return;
    began = true;
    sync();
    layer.style.visibility = "visible";
    if (calm) { if (three) three.wave(); say(); return; }
    if (three) three.walk(true);
    layer.animate([{ transform: "translateX(-280px)" }, { transform: "none" }], { duration: 1050, easing: "linear" });
    setTimeout(function () {
      if (three) { three.walk(false); three.wave(1.5); } else { draw("wave"); setTimeout(function () { draw("idle"); }, 1100); }
      var bubble = cur.querySelector(".bubble");
      if (bubble.classList.contains("wait")) {
        bubble.classList.remove("wait");
        bubble.animate([{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: soft });
        sayAt = setTimeout(say, 420);
      }
    }, 1050);
  }
  /* Come close and he waves; click him and he jumps and says it again. */
  var wavedAt = 0;
  layer.addEventListener("click", hop);
  function watch(x, y) {
    if (!three) return;
    var r = layer.getBoundingClientRect();
    var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    three.look(dx / (window.innerWidth * 0.45), dy / (window.innerHeight * 0.6));
    if (dx * dx + dy * dy < 150 * 150 && Date.now() - wavedAt > 7000) { wavedAt = Date.now(); three.wave(1.2); }
  }
  /* Called by the page once the 3D figure's code has arrived. */
  window.guideReady = function (make) {
    try {
      var canvas = layer.querySelector(".guide-3d");
      canvas.hidden = false;
      three = make(canvas);
      flat.hidden = true;
      three.start();
      if (began) three.wave(1.4);
      /* He only moves while he can be seen: not when the worlds have scrolled away, not in a hidden tab. */
      var seen = true;
      var wake = function () { if (seen && !document.hidden) three.start(); else three.stop(); };
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; wake(); }).observe(stage);
      document.addEventListener("visibilitychange", wake);
    } catch (e) { three = null; layer.querySelector(".guide-3d").hidden = true; flat.hidden = false; }
    begin();
  };
  draw("idle");
  setTimeout(begin, 2600); /* if the 3D figure has not arrived by now, the flat one walks in */

  /* ---------- Listening. */
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { place(); ticking = false; });
  }, { passive: true });
  /* A turned phone or a resized window keeps the world you were in. A change of height alone (a phone's address
     bar sliding away) must not move the page, so only a change of width re-aligns it. */
  var width = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth !== width) {
      width = window.innerWidth;
      if (active >= 0 && inRun()) window.scrollTo(0, spot(active));
    }
    place();
    sync();
  });
  window.addEventListener("hashchange", function () {
    var k = parseInt(location.hash.slice(1), 10);
    if (k >= 1 && k <= N) go(k - 1);
  });
  window.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || !inRun()) return;
    var k = parseInt(e.key, 10);
    if (k >= 1 && k <= N) go(k - 1);
    else if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
  });
  window.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") watch(e.clientX, e.clientY); }, { passive: true });

  /* A link can open on a world: #3 is the third. */
  var start = parseInt(location.hash.slice(1), 10);
  if (start >= 1 && start <= N) window.scrollTo(0, spot(start - 1));
  place();
  sync();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(); sync(); });

  /* ---------- 3. About: arrive once, and let the portrait lean a few degrees toward the pointer. */
  var about = document.getElementById("about");
  var tilt = about.querySelector(".tilt");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, io) {
      entries.forEach(function (en) { if (en.isIntersecting) { about.classList.add("in"); io.disconnect(); } });
    }, { threshold: 0.18 }).observe(about);
  } else about.classList.add("in");
  if (!calm && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    about.addEventListener("pointermove", function (e) {
      var r = tilt.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5)));
      var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5)));
      tilt.style.transform = "rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 4).toFixed(2) + "deg)";
    }, { passive: true });
    about.addEventListener("pointerleave", function () { tilt.style.transform = "none"; });
  }
})();
