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

  function init() {
    const bug = document.createElement('img');
    bug.src = BUG_NORMAL_SRC;
    bug.alt = 'bug';
    bug.draggable = false; // stop native image drag interfering with clicks
    bug.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${BUG_SIZE}px;
      height: ${BUG_SIZE}px;
      z-index: 9998;
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

    // --- Stain: a rounded 5-7 point star (smoothed, no sharp tips) + 2-4 dots ---
    const stain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stain.setAttribute('viewBox', '0 0 44 44');
    stain.setAttribute('width', String(STAIN_SIZE));
    stain.setAttribute('height', String(STAIN_SIZE));
    stain.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9997; /* just beneath the bug */
      pointer-events: none;
      opacity: 0;
      overflow: visible;
      transform: translate3d(-9999px, -9999px, 0);
      transition: opacity ${STAIN_FADE_MS}ms ease;
    `;
    stain.innerHTML = `
      <defs>
        <radialGradient id="stainGrad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#8FCE9E"/>
          <stop offset="55%" stop-color="#4C8F5A"/>
          <stop offset="100%" stop-color="#2E5E38"/>
        </radialGradient>
      </defs>
      <path id="stainBlob" fill="url(#stainGrad)" d=""/>
      <circle id="stainDot0" fill="url(#stainGrad)" cx="0" cy="0" r="1"/>
      <circle id="stainDot1" fill="url(#stainGrad)" cx="0" cy="0" r="1"/>
      <circle id="stainDot2" fill="url(#stainGrad)" cx="0" cy="0" r="1"/>
      <circle id="stainDot3" fill="url(#stainGrad)" cx="0" cy="0" r="1"/>
    `;
    document.body.appendChild(stain);

    const blobPath = stain.querySelector('#stainBlob');
    const dots = [0, 1, 2, 3].map((i) => stain.querySelector(`#stainDot${i}`));

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
    let running = true; // controls whether the rAF loop is active

    window.addEventListener('resize', () => {
      boundsX = Math.max(0, window.innerWidth - BUG_SIZE);
      boundsY = Math.max(0, window.innerHeight - BUG_SIZE);
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    }, { passive: true });

    // Pause the animation loop when the tab isn't visible (saves CPU/battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        requestAnimationFrame(move);
      }
    });

    const pickSpeed = () => Math.random() * 1.2 + 0.4;
    const pickPause = () => Math.floor(Math.random() * 100 + 40);

    // Squish Event Handler
    bug.addEventListener('click', (e) => {
      if (isSquished) return;
      e.stopPropagation();

      isSquished = true;

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
        stain.style.opacity = '0';
      }, STAIN_VISIBLE_MS);

      // Respawn only once the stain has fully faded out
      setTimeout(() => {
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
      bug.src = BUG_NORMAL_SRC;
      bug.style.transition = 'opacity 0.5s ease';
      bug.style.opacity = '0.6';
    }

    function move() {
      if (!running) return; // rAF loop stopped while tab hidden

      // Stop moving if bug is squished
      if (isSquished) {
        requestAnimationFrame(move);
        return;
      }

      if (paused) {
        if (--pauseTimer <= 0) {
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

      if (distSq < FLEE_RADIUS_SQ) {
        const fleeAngle = Math.atan2(dy, dx);
        angle = fleeAngle + (Math.random() - 0.5) * 0.5;
        speed = pickSpeed() * 2;
      }

      x += Math.cos(angle) * speed;
      y += Math.sin(angle) * speed;

      let bounced = false;

      if (x <= 0) { x = 0; angle = Math.PI - angle; bounced = true; }
      else if (x >= boundsX) { x = boundsX; angle = Math.PI - angle; bounced = true; }

      if (y <= 0) { y = 0; angle = -angle; bounced = true; }
      else if (y >= boundsY) { y = boundsY; angle = -angle; bounced = true; }

      if (bounced) speed = pickSpeed();

      const deg = (angle * 180 / Math.PI) + 90;
      bug.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${deg}deg)`;

      if (Math.random() < 0.01) angle += (Math.random() - 0.5) * 1.2;
      if (Math.random() < 0.008) speed = pickSpeed() * 0.3;
      if (Math.random() < 0.003) {
        paused = true;
        pauseTimer = pickPause();
      }

      requestAnimationFrame(move);
    }

    speed = pickSpeed();
    move();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();