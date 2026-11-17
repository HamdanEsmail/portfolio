// The guide: a small blocky figure of Hamdan, built from boxes and lit like a toy.
// createGuide(canvas) returns the controls listed at the bottom of this file.
import * as THREE from "../vendor/three.module.min.js";

// Every colour in one place. The photo this was drawn from is black and white,
// so skin and beard are a first guess for Hamdan to correct.
export const LOOK = {
  skin: 0xc49672,
  lip: 0xa9745b,
  mouth: 0x4a1c17,
  teeth: 0xf4f3ee,
  beard: 0x35261d,
  robe: 0xf4f3ee,
  fold: 0xd6d4cc,
  agal: 0x191612,
  eye: 0x17130f,
  frame: 0x34373c,
  sandal: 0x4a3524,
  strap: 0x191612,
  dial: 0xb9bcc0,
  line: 0x14110e
};

const YAW = 0.4; // he stands turned a little toward the screen he is talking about

export function createGuide(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-9.6, 9.6, 12, -12, 0.1, 200);
  cam.position.set(0, 16.5, 60);
  cam.lookAt(0, 10.9, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb4b8c0, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-6, 12, 20);
  scene.add(sun);

  const mats = {};
  const mat = (c) => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  const ink = new THREE.MeshBasicMaterial({ color: LOOK.line, side: THREE.BackSide });
  // One box, centred at x, y, z. `line` draws the dark edge around it; details on a surface pass 0.
  function box(parent, w, h, d, color, x, y, z, line = 0.17) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    if (line) {
      const edge = new THREE.Mesh(geo, ink);
      edge.scale.set(1 + (line * 2) / w, 1 + (line * 2) / h, 1 + (line * 2) / d);
      mesh.add(edge);
    }
    return mesh;
  }
  function group(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }

  const root = group(scene, 0, 0, 0);

  // Body: sandals, the kandura with its placket, buttons, hem and chest pocket, the collar.
  const body = group(root, 0, 0, 0);
  box(body, 2.3, 0.8, 3.6, LOOK.sandal, -1.7, 0.4, 0.5);
  box(body, 2.3, 0.8, 3.6, LOOK.sandal, 1.7, 0.4, 0.5);
  box(body, 7.4, 10.2, 4.8, LOOK.robe, 0, 5.8, 0);
  box(body, 0.5, 2.7, 0.1, LOOK.fold, 0, 9.4, 2.44, 0);
  box(body, 0.32, 0.32, 0.12, LOOK.dial, 0, 10.3, 2.5, 0);
  box(body, 0.32, 0.32, 0.12, LOOK.dial, 0, 9.3, 2.5, 0);
  box(body, 7.5, 0.35, 4.9, LOOK.fold, 0, 0.95, 0, 0);
  box(body, 2.0, 1.7, 0.1, LOOK.fold, 1.95, 7.5, 2.44, 0);
  box(body, 3.9, 0.9, 3.9, LOOK.robe, 0, 11.2, 0.1);

  function arm(side) {
    const a = group(body, side * 4.5, 10.5, 0);
    box(a, 1.8, 6.6, 2.8, LOOK.robe, 0, -3.1, 0);
    box(a, 1.86, 0.3, 2.86, LOOK.fold, 0, -6.1, 0, 0);
    box(a, 1.5, 1.5, 2.3, LOOK.skin, 0, -7.0, 0);
    return a;
  }
  const armR = arm(-1); // his right, on the viewer's left
  const armL = arm(1);  // his left, the side the screen is on
  box(armL, 2.05, 0.8, 3.05, LOOK.strap, 0, -5.5, 0, 0.08); // the watch
  box(armL, 0.3, 1.1, 1.4, LOOK.dial, 1.05, -5.5, 0, 0);
  box(armL, 1.4, 1.1, 0.3, LOOK.dial, 0, -5.5, 1.55, 0);

  // Head: face, short beard and moustache, a mouth that opens, eyes that move, glasses.
  const head = group(root, 0, 11.5, 0);
  box(head, 2.6, 1.2, 2.6, LOOK.skin, 0, 0.3, 0);
  box(head, 6.4, 6.2, 6.0, LOOK.skin, 0, 3.9, 0);
  box(head, 6.5, 1.0, 0.3, LOOK.beard, 0, 1.3, 2.95, 0);
  box(head, 2.6, 0.6, 0.3, LOOK.beard, 0, 2.0, 2.95, 0);
  box(head, 0.3, 2.3, 2.6, LOOK.beard, -3.1, 1.95, 1.75, 0);
  box(head, 0.3, 2.3, 2.6, LOOK.beard, 3.1, 1.95, 1.75, 0);
  box(head, 2.5, 0.38, 0.32, LOOK.beard, 0, 3.1, 2.96, 0);
  box(head, 1.3, 0.34, 0.34, LOOK.lip, 0, 2.55, 2.97, 0);
  const mouth = group(head, 0, 2.4, 3.0); // hangs from the lip and opens downward
  box(mouth, 1.25, 0.8, 0.3, LOOK.mouth, 0, -0.4, 0, 0);
  box(mouth, 0.95, 0.24, 0.32, LOOK.teeth, 0, -0.13, 0, 0);
  mouth.scale.y = 0.001;
  const eyes = [box(head, 0.75, 0.8, 0.2, LOOK.eye, -1.55, 4.5, 3.02, 0), box(head, 0.75, 0.8, 0.2, LOOK.eye, 1.55, 4.5, 3.02, 0)];
  const brows = [box(head, 1.7, 0.3, 0.22, LOOK.beard, -1.55, 5.75, 3.03, 0), box(head, 1.7, 0.3, 0.22, LOOK.beard, 1.55, 5.75, 3.03, 0)];
  function lens(cx) {
    const y = 4.5, z = 3.24, w = 2.4, h = 1.8, t = 0.24;
    box(head, w, t, 0.2, LOOK.frame, cx, y + h / 2, z, 0);
    box(head, w, t, 0.2, LOOK.frame, cx, y - h / 2, z, 0);
    box(head, t, h + t, 0.2, LOOK.frame, cx - w / 2, y, z, 0);
    box(head, t, h + t, 0.2, LOOK.frame, cx + w / 2, y, z, 0);
  }
  lens(-1.55);
  lens(1.55);
  box(head, 0.75, 0.24, 0.2, LOOK.frame, 0, 4.8, 3.24, 0);
  box(head, 0.2, 0.24, 3.3, LOOK.frame, -3.32, 4.9, 1.7, 0);
  box(head, 0.2, 0.24, 3.3, LOOK.frame, 3.32, 4.9, 1.7, 0);

  // The ghutra: fixed over the crown, and three loose lengths that swing a beat behind the head.
  box(head, 7.6, 2.3, 7.2, LOOK.robe, 0, 7.75, -0.3);
  box(head, 7.6, 0.6, 0.7, LOOK.robe, 0, 6.5, 3.3);
  const drapeR = group(head, -3.85, 7.0, -0.7), drapeL = group(head, 3.85, 7.0, -0.7), drapeB = group(head, 0, 7.0, -3.9);
  box(drapeR, 1.15, 8.0, 5.4, LOOK.robe, 0, -4.0, 0);
  box(drapeL, 1.15, 8.0, 5.4, LOOK.robe, 0, -4.0, 0);
  box(drapeB, 7.6, 9.6, 1.3, LOOK.robe, 0, -4.8, 0);
  box(head, 6.2, 0.45, 6.2, LOOK.agal, 0, 9.05, -0.4, 0.08); // the agal, a doubled black cord
  box(head, 5.9, 0.45, 5.9, LOOK.agal, 0, 9.55, -0.4, 0.08);
  box(head, 4.5, 0.5, 4.5, LOOK.robe, 0, 9.6, -0.4, 0);

  // What he is doing right now, and what he drifts back to.
  let t = 0, last = 0, raf = 0, running = false;
  let walking = false, talking = false, spin = 0, air = 0, pointUntil = 0, waveUntil = 0, blinkAt = 2.5;
  let act = "", actUntil = 0, nextAct = 6, lookedAt = 0, lag = 0, jaw = 0;
  const look = { x: 0, y: 0 };
  const ease = (a, b, k) => a + (b - a) * k;
  const smooth = (x) => x * x * (3 - 2 * x);

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    t += dt;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing
    const busy = walking || spin > 0 || t < pointUntil || t < waveUntil;

    // Small things he does on his own when nothing else is going on: he checks his watch,
    // pushes his glasses up, shifts his weight, or looks around.
    if (!busy && !talking && !act && t > nextAct) {
      const idle = t - lookedAt > 4 ? ["watch", "glasses", "shift", "around"] : ["watch", "glasses", "shift"];
      act = idle[Math.floor(Math.random() * idle.length)];
      actUntil = t + (act === "around" ? 2.6 : act === "shift" ? 2.2 : 1.7);
    }
    if (act && (t > actUntil || busy || talking)) { act = ""; nextAct = t + 5 + Math.random() * 6; }

    // Breathing, and a blink every few seconds.
    const breath = Math.sin(t * 2.1);
    body.scale.y = 1 + 0.012 * breath;
    let headY = 11.5 + 0.12 * breath;
    if (t > blinkAt) { eyes.forEach((e) => (e.scale.y = 0.12)); if (t > blinkAt + 0.13) { eyes.forEach((e) => (e.scale.y = 1)); blinkAt = t + 2.2 + Math.random() * 3; } }

    // Where he is looking: at the pointer, unless a small act takes his eyes somewhere else.
    let hx = look.x * 0.55, hp = look.y * 0.22, ex = look.x, ey = look.y;
    if (act === "watch") { hx = 0.5; hp = 0.34; ex = 0.9; ey = 0.9; }
    if (act === "around") { hx = Math.sin((t - (actUntil - 2.6)) * 2.4) * 0.6; ex = hx * 1.5; hp = -0.05; }
    if (talking) { hp += Math.sin(t * 5.3) * 0.045; headY += Math.abs(Math.sin(t * 5.3)) * 0.08; }
    head.rotation.y = ease(head.rotation.y, hx, k * 0.6);
    head.rotation.x = ease(head.rotation.x, hp, k * 0.6);
    head.position.y = headY;
    eyes[0].position.x = ease(eyes[0].position.x, -1.55 + ex * 0.3, k);
    eyes[1].position.x = ease(eyes[1].position.x, 1.55 + ex * 0.3, k);
    eyes.forEach((e) => (e.position.y = ease(e.position.y, 4.5 - ey * 0.2, k)));
    const lift = talking || t < pointUntil || act === "around" ? 0.22 : 0;
    brows.forEach((b) => (b.position.y = ease(b.position.y, 5.75 + lift, k)));

    // Talking: the mouth opens and closes in uneven beats, like speech.
    const beat = talking ? Math.max(0, Math.sin(t * 19) * 0.6 + Math.sin(t * 7.3) * 0.4) : 0;
    jaw = ease(jaw, beat, k * 1.6);
    mouth.scale.y = Math.max(0.001, jaw);

    // The whole figure: a full turn while he is in the air, a lean when he shifts his weight.
    if (spin > 0) spin = Math.max(0, spin - dt / 0.5);
    const turn = spin > 0 ? (1 - smooth(1 - spin)) * Math.PI * 2 : 0;
    root.rotation.y = YAW + look.x * 0.18 + turn;
    let lean = 0, bob = 0;
    if (walking) { lean = Math.sin(t * 11) * 0.05; bob = Math.abs(Math.cos(t * 11)) * 0.5; }
    if (act === "shift") lean = Math.sin((t - (actUntil - 2.2)) * 2.85) * 0.06;
    root.rotation.z = ease(root.rotation.z, lean, k);
    root.position.y = ease(root.position.y, bob, k * 1.5);
    root.scale.y = ease(root.scale.y, 1, k * 1.4);

    // The loose cloth follows the head a beat late, and lifts when he jumps or walks.
    lag = ease(lag, head.rotation.y + root.rotation.y, k * 0.22);
    const trail = Math.max(-0.5, Math.min(0.5, lag - (head.rotation.y + root.rotation.y)));
    const flare = air * 0.5 + (walking ? Math.abs(Math.sin(t * 11)) * 0.12 : 0);
    drapeR.rotation.z = ease(drapeR.rotation.z, -flare - trail * 0.25, k);
    drapeL.rotation.z = ease(drapeL.rotation.z, flare - trail * 0.25, k);
    drapeR.rotation.x = drapeL.rotation.x = ease(drapeR.rotation.x, trail * 0.5, k);
    drapeB.rotation.x = ease(drapeB.rotation.x, flare * 0.9 + Math.abs(trail) * 0.4, k);

    // Arms: swing while walking, one out toward the screen, the other up for a wave or to the glasses.
    let rx = 0, lx = 0, rz = -0.06, lz = 0.06;
    if (walking) { const s = Math.sin(t * 11); rx = s * 0.75; lx = -s * 0.75; }
    if (talking && t >= pointUntil) { lx = -0.5 + Math.sin(t * 6.1) * 0.16; lz = 0.3 + Math.sin(t * 4.3) * 0.1; rx = -0.12 + Math.sin(t * 5) * 0.06; }
    if (act === "watch") { lx = -1.25; lz = -0.5; }
    if (act === "glasses") { rx = -2.5; rz = 0.52; hp = 0.1; }
    if (t < pointUntil) { lz = 1.08 + Math.sin(t * 7) * 0.07; lx = -0.25 + (talking ? Math.sin(t * 9) * 0.08 : 0); }
    if (t < waveUntil) { rz = -2.55 + Math.sin(t * 13) * 0.3; rx = 0; }
    if (air > 0.05 && t >= pointUntil && t >= waveUntil) { rz = -0.9 * air; lz = 0.9 * air; }
    armR.rotation.x = ease(armR.rotation.x, rx, k);
    armL.rotation.x = ease(armL.rotation.x, lx, k);
    armR.rotation.z = ease(armR.rotation.z, rz, k * 0.9);
    armL.rotation.z = ease(armL.rotation.z, lz, k * 0.9);

    renderer.render(scene, cam);
  }

  function resize() {
    const w = canvas.clientWidth || 200, h = canvas.clientHeight || 216;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const half = 12.1;
    cam.top = half; cam.bottom = -half;
    cam.left = (-half * w) / h; cam.right = (half * w) / h;
    cam.updateProjectionMatrix();
  }
  function start() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  renderer.render(scene, cam);
  return {
    start, stop, resize,
    walk(on) { walking = on; },
    talk(on) { talking = on; },
    hop() { spin = 1; root.scale.y = 0.86; },      // the page lifts him; here he crouches, then turns once
    air(v) { air = v; },                             // 0 on the ground, 1 at the top of a jump
    point(seconds = 1.3) { pointUntil = t + seconds; },
    wave(seconds = 1.4) { waveUntil = t + seconds; },
    look(x, y) { look.x = Math.max(-1, Math.min(1, x)); look.y = Math.max(-1, Math.min(1, y)); lookedAt = t; }
  };
}
