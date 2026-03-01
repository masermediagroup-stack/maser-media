'use client';

import { useEffect, useRef } from 'react';

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    let mouse = { x: null as number | null, y: null as number | null };
    let animationId: number;

    const PARTICLE_COUNT = 80;
    const MOUSE_RADIUS = 120;
    const MOUSE_STRENGTH = 0.08;

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (particles.length === 0) createParticles();
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speed: 0.002 + Math.random() * 0.003,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Gentle drift toward base position
        p.vx += (p.baseX - p.x) * 0.002;
        p.vy += (p.baseY - p.y) * 0.002;

        // Mouse influence (soft repulsion / attraction)
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

        // Wrap edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -0.5;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -0.5;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(16, 164, 255, 0.4)' : 'rgba(0, 151, 245, 0.35)';
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      resize();
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-particles"
      id="hero-particles"
      aria-hidden="true"
    />
  );
}
