(() => {
  // Prevent double-injection (e.g. script included twice by mistake)
  if (window.__bugWidgetLoaded) return;
  window.__bugWidgetLoaded = true;

  const BUG_SIZE = 20;
  const HALF_BUG = BUG_SIZE / 2;
  const BUG_NORMAL_SRC = '/assets/img/bug.svg';
  const FLEE_RADIUS = 150;
  const FLEE_RADIUS_SQ = FLEE_RADIUS * FLEE_RADIUS;
  const STAIN_SIZE = 37; // rendered px size
  const STAIN_VISIBLE_MS = 2500; // how long the stain stays before fading
  const STAIN_FADE_MS = 700;
  const BASE_FRAME_MS = 1000 / 60; // reference frame length; all motion is scaled relative to this
  const MAX_DT = 4; // clamp so resuming from a hidden/throttled tab doesn't cause a big jump
  // Tune these if the bug ever overlaps a fixed navbar or modal on your site —
  // it's deliberately high so it stays clickable everywhere it wanders.
  const BUG_Z_INDEX = 9998;
  const STAIN_Z_INDEX = 9997;

  function init() {
    const bug = document.createElement('img');
    bug.src = BUG_NORMAL_SRC;
    bug.alt = '';
    bug.setAttribute('aria-hidden', 'true');
    bug.draggable = false; // stop native image drag interfering with clicks
    bug.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${BUG_SIZE}px;
      height: ${BUG_SIZE}px;
      z-index: ${BUG_Z_INDEX};
      pointer-events: auto; /* Enable clicking */
      opacity: 0.6;
      filter: grayscale(0.3);
      will-change: transform, opacity;
      transform-origin: center center;
      cursor: pointer;
      transition: opacity 0.5s ease;
      -webkit-user-drag: none;
      user-select: none;
    `;
    document.body.appendChild(bug);

    const widgetId = Math.random().toString(36).slice(2, 9); // avoids id collisions with other elements on the page

    // --- Stain: a rounded 5-7 point star (smoothed, no sharp tips) + 2-4 dots ---
    const stain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stain.setAttribute('viewBox', '0 0 44 44');
    stain.setAttribute('width', String(STAIN_SIZE));
    stain.setAttribute('height', String(STAIN_SIZE));
    stain.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: ${STAIN_Z_INDEX}; /* just beneath the bug */
      pointer-events: none;
      opacity: 0;
      overflow: visible;
      transform-origin: center center;
      transform: translate3d(-9999px, -9999px, 0);
      transition: opacity ${STAIN_FADE_MS}ms ease;
    `;
    stain.innerHTML = `
      <defs>
        <radialGradient id="stainGrad-${widgetId}" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#8FCE9E"/>
          <stop offset="55%" stop-color="#4C8F5A"/>
          <stop offset="100%" stop-color="#2E5E38"/>
        </radialGradient>
      </defs>
      <path id="stainBlob-${widgetId}" fill="url(#stainGrad-${widgetId})" d=""/>
      <circle id="stainDot0-${widgetId}" fill="url(#stainGrad-${widgetId})" cx="0" cy="0" r="1"/>
      <circle id="stainDot1-${widgetId}" fill="url(#stainGrad-${widgetId})" cx="0" cy="0" r="1"/>
      <circle id="stainDot2-${widgetId}" fill="url(#stainGrad-${widgetId})" cx="0" cy="0" r="1"/>
      <circle id="stainDot3-${widgetId}" fill="url(#stainGrad-${widgetId})" cx="0" cy="0" r="1"/>
    `;
    document.body.appendChild(stain);

    // If the asset is missing, don't leave a broken-image icon crawling the page
    bug.addEventListener('error', () => {
      destroyed = true;
      running = false;
      bug.remove();
      stain.remove();
    });

    const blobPath = stain.querySelector(`#stainBlob-${widgetId}`);
    const dots = [0, 1, 2, 3].map((i) => stain.querySelector(`#stainDot${i}-${widgetId}`));

    let stainTimer = null;
    const CX = 22, CY = 22;

    // Smooth a closed ring of points into a rounded outline using
    // Catmull-Rom -> cubic Bezier conversion, so star points come out
    // as soft rounded bumps rather than sharp spikes.
    function smoothClosedPath(points) {
      const n = points.length;
      let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `;
      for (let i = 0; i < n; i++) {
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
      }
      return d + 'Z';
    }

    // Build a rounded 5-7 point star: alternating far/near points around the
    // center, smoothed so the tips are soft bumps instead of sharp spikes.
    function randomizeStain() {
      const starPoints = 5 + Math.floor(Math.random() * 3); // 5, 6, or 7
      const totalPoints = starPoints * 2;
      const points = [];
      for (let i = 0; i < totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
        const isTip = i % 2 === 0;
        const radius = isTip
          ? 11 + Math.random() * 3  // outer tip
          : 5 + Math.random() * 2;  // inner valley
        points.push([CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]);
      }
      blobPath.setAttribute('d', smoothClosedPath(points));

      const dotCount = 2 + Math.floor(Math.random() * 3); // 2-4
      dots.forEach((dot, i) => {
        if (i >= dotCount) {
          dot.setAttribute('r', '0');
          return;
        }
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 8;
        dot.setAttribute('cx', (CX + dist * Math.cos(angle)).toFixed(1));
        dot.setAttribute('cy', (CY + dist * Math.sin(angle)).toFixed(1));
        dot.setAttribute('r', (1 + Math.random() * 1.5).toFixed(1));
      });
    }

    let boundsX = Math.max(0, window.innerWidth - BUG_SIZE);
    let boundsY = Math.max(0, window.innerHeight - BUG_SIZE);

    let x = Math.random() * boundsX;
    let y = Math.random() * boundsY;
    let angle = Math.random() * Math.PI * 2;
    let speed = 0;
    let paused = false;
    let pauseTimer = 0;
    let isSquished = false;
    let mouseX = -1000;
    let mouseY = -1000;
    let wasFleeing = false; // tracks flee state so speed resets reliably when it ends
    let running = true; // controls whether the rAF loop is active
    let destroyed = false; // true once the widget has been torn down (e.g. missing asset)
    let lastTimestamp = null; // used to compute delta time between frames

    window.addEventListener('resize', () => {
      boundsX = Math.max(0, window.innerWidth - BUG_SIZE);
      boundsY = Math.max(0, window.innerHeight - BUG_SIZE);
      x = Math.min(x, boundsX);
      y = Math.min(y, boundsY);
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // relatedTarget is null only when the pointer has left the browser
    // window entirely (as opposed to moving between elements inside it),
    // which is a more reliable signal than document-level mouseleave.
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) {
        mouseX = -1000;
        mouseY = -1000;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) {
        mouseX = touch.clientX;
        mouseY = touch.clientY;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      mouseX = -1000;
      mouseY = -1000;
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
      mouseX = -1000;
      mouseY = -1000;
    }, { passive: true });

    // Pause the animation loop when the tab isn't visible (saves CPU/battery)
    document.addEventListener('visibilitychange', () => {
      if (destroyed) return;
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        lastTimestamp = null; // avoid a huge delta on the first frame back
        requestAnimationFrame(move);
      }
    });

    const pickSpeed = () => Math.random() * 1.2 + 0.4;
    const pickPause = () => Math.random() * 1700 + 650; // ms, ~same feel as the old 40-140 frame range

    // Squish Event Handler
    bug.addEventListener('click', (e) => {
      if (isSquished) return;
      e.stopPropagation();

      isSquished = true;
      bug.style.pointerEvents = 'none'; // stop the invisible bug from blocking clicks

      // Hide the bug instantly, no squish/fade animation
      bug.style.transition = 'none';
      bug.style.opacity = '0';

      // Leave an irregular stain behind, centered under the bug, with random
      // shape/dots/rotation so repeated squishes don't look identical
      randomizeStain();
      const stainScale = 0.85 + Math.random() * 0.4;
      const stainRotation = Math.random() * 360;
      const stainX = x + HALF_BUG - STAIN_SIZE / 2;
      const stainY = y + HALF_BUG - STAIN_SIZE / 2;

      if (stainTimer) clearTimeout(stainTimer);
      stain.style.transition = 'none'; // snap into place without fading in
      stain.style.transform =
        `translate3d(${stainX}px, ${stainY}px, 0) rotate(${stainRotation}deg) scale(${stainScale})`;
      stain.style.opacity = '0.5';
      // Force reflow so the next opacity change actually transitions
      void stain.getBoundingClientRect();
      stain.style.transition = `opacity ${STAIN_FADE_MS}ms ease`;

      stainTimer = setTimeout(() => {
        if (destroyed) return;
        stain.style.opacity = '0';
      }, STAIN_VISIBLE_MS);

      // Respawn only once the stain has fully faded out
      setTimeout(() => {
        if (destroyed) return;
        respawn();
      }, STAIN_VISIBLE_MS + STAIN_FADE_MS);
    });

    function respawn() {
      x = Math.random() * boundsX;
      y = Math.random() * boundsY;
      angle = Math.random() * Math.PI * 2;
      speed = pickSpeed();
      paused = false;
      isSquished = false;
      bug.style.pointerEvents = 'auto'; // re-enable clicking on the respawned bug
      bug.src = BUG_NORMAL_SRC;
      bug.style.transition = 'opacity 0.5s ease';
      bug.style.opacity = '0.6';
    }

    function move(timestamp) {
      if (!running) return; // rAF loop stopped while tab hidden

      // Elapsed time since the last frame, expressed as a multiple of one
      // "standard" 60fps frame. dt === 1 at 60fps, ~0.5 at 120fps, ~2 at 30fps,
      // so motion speed no longer depends on the display's refresh rate.
      let dt = 1;
      let deltaMs = BASE_FRAME_MS;
      if (lastTimestamp !== null) {
        deltaMs = timestamp - lastTimestamp;
        dt = Math.min(deltaMs / BASE_FRAME_MS, MAX_DT);
      }
      lastTimestamp = timestamp;

      // Stop moving if bug is squished
      if (isSquished) {
        requestAnimationFrame(move);
        return;
      }

      if (paused) {
        pauseTimer -= deltaMs;
        if (pauseTimer <= 0) {
          paused = false;
          speed = pickSpeed();
        }
        requestAnimationFrame(move);
        return;
      }

      const bugCx = x + HALF_BUG;
      const bugCy = y + HALF_BUG;

      const dx = bugCx - mouseX;
      const dy = bugCy - mouseY;
      const distSq = dx * dx + dy * dy;

      const isFleeingNow = distSq < FLEE_RADIUS_SQ;
      if (isFleeingNow) {
        const fleeAngle = Math.atan2(dy, dx);
        angle = fleeAngle + (Math.random() - 0.5) * 0.5;
        speed = pickSpeed() * 2;
      } else if (wasFleeing) {
        // Just stopped fleeing this frame — reset to normal cruising speed
        // regardless of what value the boosted speed happened to land on.
        speed = pickSpeed();
      }
      wasFleeing = isFleeingNow;

      x += Math.cos(angle) * speed * dt;
      y += Math.sin(angle) * speed * dt;

      let bounced = false;

      if (x <= 0) { x = 0; angle = Math.PI - angle; bounced = true; }
      else if (x >= boundsX) { x = boundsX; angle = Math.PI - angle; bounced = true; }

      if (y <= 0) { y = 0; angle = -angle; bounced = true; }
      else if (y >= boundsY) { y = boundsY; angle = -angle; bounced = true; }

      if (bounced) speed = pickSpeed();

      const deg = (angle * 180 / Math.PI) + 90;
      bug.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${deg}deg)`;

      // Probabilities are scaled by dt so they land at roughly the same
      // rate per second regardless of frame rate (e.g. a 0.01/frame chance
      // at 60fps becomes proportionally smaller per-frame at 120fps, but
      // the same per-second chance).
      if (Math.random() < 0.01 * dt) angle += (Math.random() - 0.5) * 1.2;
      if (Math.random() < 0.008 * dt) speed = pickSpeed() * 0.3;
      if (Math.random() < 0.003 * dt) {
        paused = true;
        pauseTimer = pickPause();
      }

      requestAnimationFrame(move);
    }

    speed = pickSpeed();
    requestAnimationFrame(move);
  }

  const prefersReducedMotion = () =>
    !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  // If reduced motion is preferred, the widget is simply not injected —
  // it's decorative and non-essential, so this is the correct fix rather
  // than trying to build a "reduced" version of a wandering animation.
})();