import { useEffect, useRef } from 'react';

/**
 * BinaryRain — Hacker-style Matrix falling binary & ambient particle canvas.
 * Features:
 *  - Multi-depth 0 & 1 rain (foreground with neon glow, midground, and deep background)
 *  - Subtle floating ambient binary particles drifting in the background
 *  - requestAnimationFrame loop with strict cleanup
 *  - High-DPI support (devicePixelRatio, capped at 2 for performance)
 *  - Performance-optimized for mobile (fewer columns & particles, 30fps throttle)
 *  - Complete pause on document.hidden (saves battery & CPU)
 *  - Full prefers-reduced-motion support
 */
export default function BinaryRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = null;
    let paused = false;
    let W = 0;
    let H = 0;
    let drops = [];
    let particles = [];
    let lastTime = 0;

    const isMobile = () => window.innerWidth < 768;

    function bit() {
      return Math.random() > 0.5 ? '1' : '0';
    }

    // ── Setup Dimensions & Entities ──────────────────────────────────────────
    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = isMobile();
      const colWidth = mobile ? 28 : 20;
      const numCols = Math.max(1, Math.floor(W / colWidth));

      // Rain drops with 3 depth layers (bg, mid, fg)
      drops = Array.from({ length: numCols }, (_, i) => {
        const depth = Math.random(); // < 0.25 bg, 0.25 - 0.75 mid, > 0.75 fg
        let layer = 'mid';
        let fontSize = 13;
        let speed = 0.5 + Math.random() * 0.8;
        let opacity = 0.45;

        if (depth < 0.25) {
          layer = 'bg';
          fontSize = 11;
          speed = 0.25 + Math.random() * 0.4;
          opacity = 0.22;
        } else if (depth > 0.75) {
          layer = 'fg';
          fontSize = 15;
          speed = 0.8 + Math.random() * 1.2;
          opacity = 0.7;
        }

        const length = 10 + Math.floor(Math.random() * 18);
        return {
          x: i * colWidth + (colWidth - fontSize) / 2,
          y: (Math.random() * -H) / fontSize,
          speed,
          layer,
          fontSize,
          opacity,
          bright: layer === 'fg' && Math.random() > 0.6,
          char: bit(),
          length,
          chars: Array.from({ length }, bit),
        };
      });

      // Subtle drifting ambient particles (12 on mobile, 22 on desktop)
      const numParticles = mobile ? 10 : 20;
      particles = Array.from({ length: numParticles }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.1, // slight upward drift
        char: bit(),
        size: 10 + Math.random() * 4,
        alpha: 0.12 + Math.random() * 0.25,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    }

    // ── Animation Loop ───────────────────────────────────────────────────────
    function draw(ts) {
      if (paused) return;

      const targetInterval = isMobile() ? 36 : 18; // ~28-30fps on mobile, 55-60fps desktop
      const delta = ts - lastTime;
      if (delta < targetInterval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastTime = ts;

      // Dark fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
      ctx.fillRect(0, 0, W, H);

      // 1. Draw subtle drifting ambient particles
      ctx.textBaseline = 'middle';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulsePhase));
        ctx.font = `${Math.round(p.size)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(0, 255, 65, ${currentAlpha.toFixed(2)})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      // 2. Draw falling binary rain
      ctx.textBaseline = 'top';
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const headY = d.y * d.fontSize;
        ctx.font = `${d.fontSize}px "JetBrains Mono", monospace`;

        // Trail characters
        for (let j = d.length; j >= 1; j--) {
          const trailY = headY - j * d.fontSize;
          if (trailY < -d.fontSize || trailY > H) continue;

          const progress = 1 - j / d.length;
          const alpha = progress * d.opacity;
          if (alpha < 0.02) continue;

          const charIndex = Math.abs(Math.floor(d.y - j)) % d.chars.length;
          const c = d.chars[charIndex];

          if (d.bright && j <= 2) {
            ctx.fillStyle = `rgba(130, 255, 180, ${alpha * 1.2})`;
          } else if (d.layer === 'fg') {
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(0, 180, 50, ${alpha})`;
          }
          ctx.fillText(c, d.x, trailY);
        }

        // Head character
        if (headY >= -d.fontSize && headY <= H + d.fontSize) {
          if (d.bright) {
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#f0fff4';
          } else if (d.layer === 'fg') {
            ctx.shadowColor = '#00ff41';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#80ffaa';
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(0, 220, 60, ${d.opacity * 1.4})`;
          }
          ctx.fillText(d.char, d.x, headY);
          ctx.shadowBlur = 0;
        }

        // Mutate head & trail occasionally
        if (Math.random() > 0.88) d.char = bit();
        if (Math.random() > 0.95) {
          const ri = Math.floor(Math.random() * d.chars.length);
          d.chars[ri] = bit();
        }

        // Step down
        d.y += d.speed;

        // Reset column
        if (d.y * d.fontSize > H + d.length * d.fontSize) {
          d.y = (Math.random() * -25);
          d.char = bit();
          if (Math.random() > 0.8) {
            d.speed = (d.layer === 'fg' ? 0.8 : d.layer === 'bg' ? 0.3 : 0.5) + Math.random() * 0.8;
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    // ── Visibility & Resize ──────────────────────────────────────────────────
    function onVisibility() {
      if (document.hidden) {
        paused = true;
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        paused = false;
        lastTime = 0;
        rafId = requestAnimationFrame(draw);
      }
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId);
        setup();
        if (!paused) rafId = requestAnimationFrame(draw);
      }, 180);
    }

    setup();
    rafId = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="blh-rain"
      aria-hidden="true"
      role="presentation"
    />
  );
}
