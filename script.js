/**
 * Maser Media — Renders content from content.js and handles interactions.
 * Edit content.js to add or change site content.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONTENT === 'undefined') return;

  const c = CONTENT;

  // Page title
  document.title = c.site.title;

  // Nav
  const navLogo = document.getElementById('nav-logo');
  if (navLogo) {
    navLogo.src = c.site.logo;
    navLogo.alt = c.site.logoAlt;
  }
  const navCta = document.getElementById('nav-cta');
  if (navCta) {
    navCta.textContent = c.site.navCta;
  }

  // Hero
  setText('hero-badge', c.hero.badge);
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = `${c.hero.title} <span class="highlight">${c.hero.titleHighlight}</span>`;
  }
  setText('hero-subtitle', c.hero.subtitle);
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.innerHTML = `
      <a href="${c.hero.primaryCta.href}" class="btn btn-primary">${c.hero.primaryCta.text}</a>
      <a href="${c.hero.secondaryCta.href}" class="btn btn-secondary">${c.hero.secondaryCta.text}</a>
    `;
  }

  // Clients
  setText('clients-label', c.clients.label);
  const clientsGrid = document.getElementById('clients-grid');
  if (clientsGrid) {
    clientsGrid.innerHTML = c.clients.items.map(item =>
      item.logo
        ? `<div class="client-logo"><img src="${item.logo}" alt="${item.name}"></div>`
        : `<div class="client-logo">${item.name}</div>`
    ).join('');
  }

  // Services
  setText('services-title', c.services.title);
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid) {
    servicesGrid.innerHTML = c.services.items.map(svc => `
      <div class="service-card">
        <h3>${svc.title}</h3>
        <ul>${svc.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  // Work
  setText('work-title', c.work.title);
  const workGrid = document.getElementById('work-grid');
  if (workGrid) {
    workGrid.innerHTML = c.work.items.map(project => {
      const imgStyle = project.image
        ? `background: url(${project.image}) center/cover;`
        : 'background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);';
      return `
        <a href="${project.link}" class="work-card">
          <div class="work-card-image" style="${imgStyle}"></div>
          <div class="work-card-content">
            <span class="work-card-category">${project.category}</span>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
          </div>
        </a>
      `;
    }).join('');
  }

  // Testimonials
  setText('testimonials-title', c.testimonials.title);
  const testimonialsGrid = document.getElementById('testimonials-grid');
  if (testimonialsGrid) {
    testimonialsGrid.innerHTML = c.testimonials.items.map(t => `
      <blockquote class="testimonial">
        <p>"${t.quote}"</p>
        <footer>
          <strong>${t.name}</strong>
          <span>${t.role}</span>
        </footer>
      </blockquote>
    `).join('');
  }

  // CTA
  setText('cta-title', c.cta.title);
  setText('cta-subtitle', c.cta.subtitle);
  const ctaButton = document.getElementById('cta-button');
  if (ctaButton) {
    ctaButton.textContent = c.cta.button.text;
    ctaButton.href = c.cta.button.href;
  }

  // Footer
  const footerLogo = document.getElementById('footer-logo');
  if (footerLogo) {
    footerLogo.src = c.site.logo;
    footerLogo.alt = c.site.logoAlt;
  }
  const footerNav = document.getElementById('footer-nav');
  if (footerNav) {
    footerNav.innerHTML = c.footer.nav.map(n =>
      `<a href="${n.href}">${n.text}</a>`
    ).join('');
  }
  setText('footer-copy', `© ${c.footer.copyright}`);

  // ─── Utilities ────────────────────────────────────────────────────
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Nav background on scroll
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 50);
    });
  }

  // ─── Scroll-triggered blur fade-in ──────────────────────────────────────
  const scrollAnimateEls = document.querySelectorAll('.scroll-animate');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  scrollAnimateEls.forEach((el) => scrollObserver.observe(el));

  // ─── Theme toggle ──────────────────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.addEventListener('change', () => {
      const theme = themeToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }

  // ─── Hero particles (mouse-reactive) ───────────────────────────────────
  initHeroParticles();
});

function initHeroParticles() {
  const canvas = document.getElementById('hero-particles');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animationId;

  const PARTICLE_COUNT = 80;
  const MOUSE_RADIUS = 120;
  const MOUSE_STRENGTH = 0.08;

  function resize() {
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    if (particles.length === 0) createParticles();
  }

  function createParticles() {
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
  }

  function animate() {
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
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
  animate();
}
