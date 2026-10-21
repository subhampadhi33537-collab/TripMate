/**
 * TripMate AI — 3D Solar System Background
 * Renders an animated solar system on a full-screen canvas.
 * Planets orbit the Sun with a 3-D perspective tilt effect.
 */

(function () {
  "use strict";

  const canvas = document.getElementById("solarCanvas");
  const ctx = canvas.getContext("2d");

  /* ── Resize ──────────────────────────────────────────────────── */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  /* ── Starfield ───────────────────────────────────────────────── */
  const STAR_COUNT = 320;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.2,
    alpha: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.003,
    twinkleDir: Math.random() > 0.5 ? 1 : -1,
  }));

  /* ── Nebula clouds ───────────────────────────────────────────── */
  const NEBULAE = [
    { cx: 0.12, cy: 0.18, rx: 220, ry: 110, color: "rgba(56,189,248,0.045)" },
    { cx: 0.85, cy: 0.12, rx: 200, ry: 100, color: "rgba(168,85,247,0.05)" },
    { cx: 0.5,  cy: 0.82, rx: 260, ry: 100, color: "rgba(20,184,166,0.04)" },
    { cx: 0.22, cy: 0.75, rx: 180, ry:  90, color: "rgba(99,102,241,0.04)" },
    { cx: 0.78, cy: 0.65, rx: 200, ry: 100, color: "rgba(236,72,153,0.035)" },
  ];

  /* ── Solar System Data ───────────────────────────────────────── */
  // orbitRx / orbitRy are base ellipse radii (scaled by canvas size at runtime)
  // tilt  — how 3-D-tilted the orbital plane looks (0=flat, 1=edge-on)
  // speed — radians per second
  const PLANETS = [
    {
      name: "Mercury",
      color: "#b5b5b5",
      glow: "rgba(181,181,181,0.6)",
      radius: 7,
      orbitRx: 0.13,
      orbitRy: 0.048,
      tilt: 0.72,
      speed: 1.1,
      angle: 0,
      rings: false,
    },
    {
      name: "Venus",
      color: "#e8cda0",
      glow: "rgba(232,205,160,0.7)",
      radius: 11,
      orbitRx: 0.195,
      orbitRy: 0.070,
      tilt: 0.70,
      speed: 0.82,
      angle: 1.0,
      rings: false,
    },
    {
      name: "Earth",
      color: "#4fa3e0",
      glow: "rgba(79,163,224,0.75)",
      radius: 12,
      orbitRx: 0.265,
      orbitRy: 0.095,
      tilt: 0.68,
      speed: 0.65,
      angle: 2.5,
      rings: false,
      moon: true,
    },
    {
      name: "Mars",
      color: "#c1440e",
      glow: "rgba(193,68,14,0.7)",
      radius: 9,
      orbitRx: 0.338,
      orbitRy: 0.121,
      tilt: 0.66,
      speed: 0.52,
      angle: 4.0,
      rings: false,
    },
    {
      name: "Jupiter",
      color: "#c88b3a",
      glow: "rgba(200,139,58,0.6)",
      radius: 26,
      orbitRx: 0.445,
      orbitRy: 0.160,
      tilt: 0.63,
      speed: 0.30,
      angle: 0.5,
      rings: false,
      bands: true,
    },
    {
      name: "Saturn",
      color: "#e4d191",
      glow: "rgba(228,209,145,0.55)",
      radius: 22,
      orbitRx: 0.560,
      orbitRy: 0.200,
      tilt: 0.61,
      speed: 0.21,
      angle: 3.2,
      rings: true,
    },
    {
      name: "Uranus",
      color: "#7de8e8",
      glow: "rgba(125,232,232,0.6)",
      radius: 16,
      orbitRx: 0.660,
      orbitRy: 0.236,
      tilt: 0.59,
      speed: 0.14,
      angle: 1.8,
      rings: false,
    },
    {
      name: "Neptune",
      color: "#5b7fde",
      glow: "rgba(91,127,222,0.65)",
      radius: 15,
      orbitRx: 0.750,
      orbitRy: 0.268,
      tilt: 0.57,
      speed: 0.10,
      angle: 5.0,
      rings: false,
    },
  ];

  /* Asteroid belt */
  const ASTEROIDS = Array.from({ length: 110 }, () => {
    const a = Math.random() * Math.PI * 2;
    const spread = 0.015;
    return {
      baseRx: 0.385 + (Math.random() - 0.5) * spread,
      baseRy: 0.138 + (Math.random() - 0.5) * spread * 0.35,
      tilt: 0.645,
      angle: a,
      speed: (Math.random() * 0.22 + 0.25) * (Math.random() > 0.5 ? 1 : -1),
      r: Math.random() * 2.2 + 0.5,
      alpha: Math.random() * 0.5 + 0.25,
    };
  });

  /* ── Helper: project ellipse ─────────────────────────────────── */
  function project(cx, cy, rx, ry, tilt, angle) {
    // x is along the ellipse major axis, y is foreshortened by tilt
    const rawX = Math.cos(angle) * rx;
    const rawY = Math.sin(angle) * ry * tilt;
    return { x: cx + rawX, y: cy + rawY };
  }

  /* ── Draw: starfield ─────────────────────────────────────────── */
  function drawStars(dt) {
    stars.forEach((s) => {
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha >= 1)   { s.alpha = 1;   s.twinkleDir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.twinkleDir =  1; }
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    });
  }

  /* ── Draw: nebulae ───────────────────────────────────────────── */
  function drawNebulae() {
    NEBULAE.forEach((n) => {
      const grd = ctx.createRadialGradient(
        n.cx * canvas.width, n.cy * canvas.height, 0,
        n.cx * canvas.width, n.cy * canvas.height, Math.max(n.rx, n.ry)
      );
      grd.addColorStop(0, n.color);
      grd.addColorStop(1, "transparent");
      ctx.save();
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(
        n.cx * canvas.width,
        (n.cy * canvas.height) / (n.ry / n.rx),
        n.rx, 0, Math.PI * 2
      );
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Draw: orbit ring ────────────────────────────────────────── */
  function drawOrbit(cx, cy, rx, ry, tilt) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry * tilt, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  /* ── Draw: planet ────────────────────────────────────────────── */
  function drawPlanet(p, pos) {
    const { x, y } = pos;
    const r = p.radius;

    // Outer glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
    glow.addColorStop(0, p.glow);
    glow.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Saturn rings (behind planet body)
    if (p.rings) {
      drawSaturnRings(x, y, r);
    }

    // Planet body gradient
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.08, x, y, r);
    grad.addColorStop(0, lighten(p.color, 60));
    grad.addColorStop(0.55, p.color);
    grad.addColorStop(1, darken(p.color, 55));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Jupiter bands
    if (p.bands) {
      drawJupiterBands(x, y, r);
    }

    // Specular highlight
    const hl = ctx.createRadialGradient(x - r * 0.28, y - r * 0.3, 0, x - r * 0.28, y - r * 0.3, r * 0.55);
    hl.addColorStop(0, "rgba(255,255,255,0.28)");
    hl.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hl;
    ctx.fill();

    // Earth's moon
    if (p.moon) {
      const moonAngle = Date.now() * 0.002;
      const mx = x + Math.cos(moonAngle) * (r + 12);
      const my = y + Math.sin(moonAngle) * (r + 12) * 0.45;
      const moonGrad = ctx.createRadialGradient(mx - 1, my - 1, 0.5, mx, my, 3.5);
      moonGrad.addColorStop(0, "#e8e8e8");
      moonGrad.addColorStop(1, "#888");
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();
    }
  }

  /* ── Draw: Saturn rings ──────────────────────────────────────── */
  function drawSaturnRings(x, y, r) {
    const rings = [
      { rx: r * 1.55, ry: r * 0.32, alpha: 0.28, w: r * 0.5 },
      { rx: r * 1.9,  ry: r * 0.38, alpha: 0.18, w: r * 0.28 },
    ];
    rings.forEach(({ rx, ry, alpha, w }) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(220,200,140,${alpha})`;
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── Draw: Jupiter bands ─────────────────────────────────────── */
  function drawJupiterBands(x, y, r) {
    const bandColors = [
      "rgba(210,160,90,0.22)",
      "rgba(255,220,150,0.15)",
      "rgba(180,110,50,0.18)",
    ];
    const offsets = [-r * 0.35, 0, r * 0.36];
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    offsets.forEach((oy, i) => {
      ctx.fillStyle = bandColors[i];
      ctx.fillRect(x - r, y + oy - r * 0.22, r * 2, r * 0.44);
    });
    ctx.restore();
  }

  /* ── Draw: Sun ───────────────────────────────────────────────── */
  function drawSun(cx, cy, t) {
    const r = Math.min(canvas.width, canvas.height) * 0.055;

    // Outer corona pulse
    const pulse = 1 + Math.sin(t * 1.2) * 0.06;
    const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.8 * pulse);
    corona.addColorStop(0,   "rgba(255,220,80,0.45)");
    corona.addColorStop(0.3, "rgba(255,140,30,0.22)");
    corona.addColorStop(0.65,"rgba(255,80,10,0.08)");
    corona.addColorStop(1,   "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3.8 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    // Mid glow
    const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
    mid.addColorStop(0,   "rgba(255,255,200,0.9)");
    mid.addColorStop(0.5, "rgba(255,180,30,0.6)");
    mid.addColorStop(1,   "transparent");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2, 0, Math.PI * 2);
    ctx.fillStyle = mid;
    ctx.fill();

    // Sun body
    const body = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
    body.addColorStop(0, "#fff7c0");
    body.addColorStop(0.45, "#ffdd44");
    body.addColorStop(0.85, "#ff8c00");
    body.addColorStop(1, "#cc4400");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    // Solar flares (simple spikes)
    const flareCount = 8;
    for (let i = 0; i < flareCount; i++) {
      const fa = (i / flareCount) * Math.PI * 2 + t * 0.3;
      const fLen = r * (1.35 + Math.sin(t * 1.8 + i) * 0.18);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(fa);
      const fg = ctx.createLinearGradient(r * 0.9, 0, fLen, 0);
      fg.addColorStop(0, "rgba(255,200,50,0.55)");
      fg.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(r * 0.9, -2.5);
      ctx.lineTo(fLen, 0);
      ctx.lineTo(r * 0.9,  2.5);
      ctx.closePath();
      ctx.fillStyle = fg;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Draw: asteroid belt ─────────────────────────────────────── */
  function drawAsteroids(cx, cy, dt) {
    ASTEROIDS.forEach((a) => {
      a.angle += a.speed * dt;
      const rx = a.baseRx * Math.min(canvas.width, canvas.height);
      const ry = a.baseRy * Math.min(canvas.width, canvas.height);
      const pos = project(cx, cy, rx, ry, a.tilt, a.angle);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,170,160,${a.alpha})`;
      ctx.fill();
    });
  }

  /* ── Colour helpers ──────────────────────────────────────────── */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }
  function lighten(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
  }
  function darken(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
  }

  /* ── Animation loop ──────────────────────────────────────────── */
  let last = null;

  function draw(timestamp) {
    if (!last) last = timestamp;
    const dt = Math.min((timestamp - last) / 1000, 0.05); // seconds, capped
    last = timestamp;
    const t = timestamp / 1000;

    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Deep space background
    ctx.fillStyle = "#00001a";
    ctx.fillRect(0, 0, W, H);

    // Nebulae
    drawNebulae();

    // Stars
    drawStars(dt);

    // Solar system origin — slightly left of center, upper-center
    const cx = W * 0.5;
    const cy = H * 0.52;

    // Use the larger dimension so orbits always fill the screen generously
    const scale = Math.max(W, H) * 0.72;

    // Orbit rings (draw all first so planets appear on top)
    PLANETS.forEach((p) => {
      const rx = p.orbitRx * scale;
      const ry = p.orbitRy * scale;
      drawOrbit(cx, cy, rx, ry, p.tilt);
    });

    // Asteroid belt
    drawAsteroids(cx, cy, dt);

    // Sun
    drawSun(cx, cy, t);

    // Planets — sort by "depth" (y position) so closer ones render on top
    const planetPositions = PLANETS.map((p) => {
      p.angle += p.speed * dt;
      const rx = p.orbitRx * scale;
      const ry = p.orbitRy * scale;
      const pos = project(cx, cy, rx, ry, p.tilt, p.angle);
      return { p, pos };
    });

    // Paint planets that are "behind" the sun first (sin angle < 0), then rest
    const behind = planetPositions.filter(({ p }) => Math.sin(p.angle) < 0);
    const infront = planetPositions.filter(({ p }) => Math.sin(p.angle) >= 0);
    [...behind, ...infront].forEach(({ p, pos }) => drawPlanet(p, pos));

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
