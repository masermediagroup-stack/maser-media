'use client';

import { useEffect, useRef } from 'react';

const STAR_COUNT = 300;
const WHITE_STAR_COUNT = 80;
const PARTICLE_COUNT = 60;
const PLANET_COUNT = 3;
const MOUSE_RADIUS = 150;
const MOUSE_STRENGTH = 0.06;

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.body.classList.add('galaxy-active');

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; size: number; baseOpacity: number; twinklePhase: number; parallax: number; isWhite: boolean }[] = [];
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      size: number;
      speed: number;
    }[] = [];
    let planets: { x: number; y: number; radius: number; orbitRadius: number; orbitSpeed: number; angle: number }[] = [];

    const mouse = { x: null as number | null, y: null as number | null };
    let animationId: number;
    let scrollY = 0;
    let reducedMotion = false;

    const checkReducedMotion = () => {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (stars.length === 0) initStars();
      if (particles.length === 0) initParticles();
      if (planets.length === 0) initPlanets();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < STAR_COUNT + WHITE_STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.3,
          baseOpacity: 0.3 + Math.random() * 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          parallax: 0.3 + Math.random() * 0.7,
          isWhite: i >= STAR_COUNT,
        });
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.4,
          speed: 0.0015 + Math.random() * 0.002,
        });
      }
    };

    const initPlanets = () => {
      planets = [];
      const centers = [
        { cx: canvas.width * 0.2, cy: canvas.height * 0.3 },
        { cx: canvas.width * 0.75, cy: canvas.height * 0.6 },
        { cx: canvas.width * 0.5, cy: canvas.height * 0.85 },
      ];
      for (let i = 0; i < PLANET_COUNT; i++) {
        const orbitRadius = 40 + Math.random() * 60;
        planets.push({
          x: centers[i].cx,
          y: centers[i].cy,
          radius: 4 + Math.random() * 6,
          orbitRadius,
          orbitSpeed: reducedMotion ? 0 : 0.0003 + Math.random() * 0.0005,
          angle: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawBase = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      if (isDark) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.3, '#0d1520');
        gradient.addColorStop(0.7, '#0a0f18');
        gradient.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const blob1 = ctx.createRadialGradient(
          canvas.width * 0.2,
          canvas.height * 0.3,
          0,
          canvas.width * 0.2,
          canvas.height * 0.3,
          canvas.width * 0.6
        );
        blob1.addColorStop(0, 'rgba(16, 164, 255, 0.08)');
        blob1.addColorStop(1, 'transparent');
        ctx.fillStyle = blob1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const blob2 = ctx.createRadialGradient(
          canvas.width * 0.8,
          canvas.height * 0.7,
          0,
          canvas.width * 0.8,
          canvas.height * 0.7,
          canvas.width * 0.5
        );
        blob2.addColorStop(0, 'rgba(0, 101, 163, 0.06)');
        blob2.addColorStop(1, 'transparent');
        ctx.fillStyle = blob2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const blob1 = ctx.createRadialGradient(
          canvas.width * 0.3,
          canvas.height * 0.2,
          0,
          canvas.width * 0.3,
          canvas.height * 0.2,
          canvas.width * 0.5
        );
        blob1.addColorStop(0, 'rgba(0, 151, 245, 0.04)');
        blob1.addColorStop(1, 'transparent');
        ctx.fillStyle = blob1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const drawStars = (time: number) => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const blueStarColor = isDark ? 'rgba(16, 164, 255, ' : 'rgba(0, 101, 163, ';
      const whiteStarColor = isDark ? 'rgba(255, 255, 255, ' : 'rgba(255, 255, 255, ';
      const blueMaxOpacity = isDark ? 0.6 : 0.25;
      const whiteMaxOpacity = isDark ? 0.5 : 0.35;

      stars.forEach((s) => {
        const parallaxOffset = scrollY * s.parallax * 0.1;
        const y = ((s.y + parallaxOffset) % (canvas.height + 100)) - 50;
        if (y < -10 || y > canvas.height + 10) return;

        const twinkle = reducedMotion ? 1 : 0.6 + 0.4 * Math.sin(time * 0.002 + s.twinklePhase);
        const maxOpacity = s.isWhite ? whiteMaxOpacity : blueMaxOpacity;
        const opacity = Math.min(maxOpacity, s.baseOpacity * twinkle);
        ctx.beginPath();
        ctx.arc(s.x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = (s.isWhite ? whiteStarColor : blueStarColor) + opacity + ')';
        ctx.fill();
      });
    };

    const drawParticles = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const particleColor = isDark ? 'rgba(16, 164, 255, 0.35)' : 'rgba(0, 151, 245, 0.2)';

      particles.forEach((p) => {
        if (!reducedMotion) {
          p.vx += (p.baseX - p.x) * 0.002;
          p.vy += (p.baseY - p.y) * 0.002;

          if (mouse.x !== null && mouse.y !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
              const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
              p.vx += (dx / dist) * force * MOUSE_STRENGTH;
              p.vy += (dy / dist) * force * MOUSE_STRENGTH;
            }
          }

          p.vx *= 0.95;
          p.vy *= 0.95;
          p.x += p.vx;
          p.y += p.vy;

          p.x = (p.x + canvas.width) % canvas.width;
          p.y = (p.y + canvas.height) % canvas.height;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });
    };

    const drawPlanets = (time: number) => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const planetColor = isDark ? 'rgba(0, 151, 245, 0.15)' : 'rgba(0, 101, 163, 0.08)';

      const centers = [
        { cx: canvas.width * 0.2, cy: canvas.height * 0.3 },
        { cx: canvas.width * 0.75, cy: canvas.height * 0.6 },
        { cx: canvas.width * 0.5, cy: canvas.height * 0.85 },
      ];

      planets.forEach((pl, i) => {
        if (!reducedMotion) {
          pl.angle += pl.orbitSpeed;
        }
        const cx = centers[i].cx;
        const cy = centers[i].cy;
        const px = cx + Math.cos(pl.angle) * pl.orbitRadius;
        const py = cy + Math.sin(pl.angle) * pl.orbitRadius;

        const glow = ctx.createRadialGradient(px, py, 0, px, py, pl.radius * 4);
        glow.addColorStop(0, planetColor);
        glow.addColorStop(0.5, 'rgba(0, 151, 245, 0.05)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, pl.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, pl.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(16, 164, 255, 0.25)' : 'rgba(0, 101, 163, 0.15)';
        ctx.fill();
      });
    };

    const animate = (time: number = 0) => {
      drawBase();
      drawStars(time);
      drawParticles();
      drawPlanets(time);
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      resize();
    };

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionMedia.addEventListener('change', checkReducedMotion);

    checkReducedMotion();
    resize();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      document.body.classList.remove('galaxy-active');
      reducedMotionMedia.removeEventListener('change', checkReducedMotion);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="galaxy-background"
      id="galaxy-background"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
