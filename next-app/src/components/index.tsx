'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CONTENT } from '@/lib/content';
import { HeroParticles } from './HeroParticles';

export function PageLoader() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`page-loader ${revealed ? 'revealed' : ''}`}
      id="page-loader"
      aria-hidden={revealed ? 'true' : 'false'}
    >
      <div className="loader-panel loader-panel-left" />
      <div className="loader-panel loader-panel-right" />
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initialize theme
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');

    // Listen for custom theme change events
    const handleThemeChange = (e: CustomEvent<{ isDark: boolean }>) => {
      setIsDark(e.detail.isDark);
    };

    window.addEventListener('themechange' as any, handleThemeChange as any);
    return () => window.removeEventListener('themechange' as any, handleThemeChange as any);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`} id="nav">
      <a href="/" className="nav-logo">
        <Image
          src={isDark ? CONTENT.site.logo : CONTENT.site.logoLight}
          alt={CONTENT.site.logoAlt}
          width={120}
          height={32}
          className="logo-img"
          priority
        />
      </a>
      <a href="#contact" className="nav-cta" id="nav-cta">
        {CONTENT.site.navCta}
      </a>
    </nav>
  );
}

export function Hero() {
  return (
    <header className="hero" ref={heroRef => {
      if (heroRef) {
        (heroRef as HTMLDivElement).dataset.hero = 'true';
      }
    }}>
      <div className="hero-bg" aria-hidden="true" />
      <HeroParticles />
      <div className="hero-content">
        <p className="hero-badge" id="hero-badge">
          {CONTENT.hero.badge}
        </p>
        <h1 className="hero-title" id="hero-title">
          {CONTENT.hero.title} <span className="highlight">{CONTENT.hero.titleHighlight}</span>
        </h1>
        <p className="hero-subtitle" id="hero-subtitle">
          {CONTENT.hero.subtitle}
        </p>
        <div className="hero-cta" id="hero-cta">
          <a href={CONTENT.hero.primaryCta.href} className="btn btn-primary">
            {CONTENT.hero.primaryCta.text}
          </a>
          <a href={CONTENT.hero.secondaryCta.href} className="btn btn-secondary">
            {CONTENT.hero.secondaryCta.text}
          </a>
        </div>
      </div>
    </header>
  );
}

export function PillNav() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsDark(!isDark);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { isDark: !isDark } 
    }));
  };

  return (
    <nav className="pill-nav" aria-label="Primary navigation">
      <a href={CONTENT.hero.pillNav.showWork.href} className="pill-nav-item">
        {CONTENT.hero.pillNav.showWork.text}
      </a>
      <div className="pill-nav-divider" />
      <button
        className="pill-nav-theme"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        type="button"
      >
        {isDark ? (
          <span className="pill-nav-theme-icon pill-nav-sun">☀️</span>
        ) : (
          <span className="pill-nav-theme-icon pill-nav-moon">🌙</span>
        )}
      </button>
      <div className="pill-nav-divider" />
      <a href={CONTENT.hero.pillNav.bookCall.href} className="pill-nav-item">
        {CONTENT.hero.pillNav.bookCall.text}
      </a>
    </nav>
  );
}

export function Clients() {
  return (
    <section className="clients scroll-animate" aria-label="Trusted by">
      <p className="clients-label" id="clients-label">
        {CONTENT.clients.label}
      </p>
      <div className="clients-grid" id="clients-grid">
        {CONTENT.clients.items.map((item, index) => (
          <div key={index} className="client-logo">
            {item.logo ? (
              <Image src={item.logo} alt={item.name} width={120} height={40} />
            ) : (
              item.name
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="services scroll-animate" id="services">
      <h2 className="section-title" id="services-title">
        {CONTENT.services.title}
      </h2>
      <div className="services-grid" id="services-grid">
        {CONTENT.services.items.map((svc, index) => (
          <div key={index} className="service-card">
            <h3>{svc.title}</h3>
            <ul>
              {svc.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section className="work scroll-animate" id="work">
      <h2 className="section-title" id="work-title">
        {CONTENT.work.title}
      </h2>
      <div className="work-grid" id="work-grid">
        {CONTENT.work.items.map((project, index) => (
          <a
            key={index}
            href={project.link}
            className="work-card"
            target={project.link.startsWith('http') ? '_blank' : undefined}
            rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <div
              className="work-card-image"
              style={
                project.image
                  ? { background: `url(${project.image}) center/cover` }
                  : { background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)' }
              }
            />
            <div className="work-card-content">
              <span className="work-card-category">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="testimonials scroll-animate">
      <h2 className="section-title" id="testimonials-title">
        {CONTENT.testimonials.title}
      </h2>
      <div className="testimonials-grid" id="testimonials-grid">
        {CONTENT.testimonials.items.map((t, index) => (
          <blockquote key={index} className="testimonial">
            <p>&quot;{t.quote}&quot;</p>
            <footer>
              <strong>{t.name}</strong>
              <span>{t.role}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="cta scroll-animate" id="contact">
      <h2 className="cta-title" id="cta-title">
        {CONTENT.cta.title}
      </h2>
      <p className="cta-subtitle" id="cta-subtitle">
        {CONTENT.cta.subtitle}
      </p>
      <a href={CONTENT.cta.button.href} className="btn btn-primary btn-large" id="cta-button">
        {CONTENT.cta.button.text}
      </a>
    </section>
  );
}

export function Footer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');

    // Listen for custom theme change events
    const handleThemeChange = (e: CustomEvent<{ isDark: boolean }>) => {
      setIsDark(e.detail.isDark);
    };

    window.addEventListener('themechange' as any, handleThemeChange as any);
    return () => window.removeEventListener('themechange' as any, handleThemeChange as any);
  }, []);

  return (
    <footer className="footer scroll-animate">
      <div className="footer-content">
        <a href="/" className="footer-logo">
          <Image
            src={isDark ? CONTENT.site.logo : CONTENT.site.logoLight}
            alt={CONTENT.site.logoAlt}
            width={112}
            height={28}
            className="logo-img"
            id="footer-logo"
            style={{ objectFit: 'contain' }}
          />
        </a>
        <nav className="footer-nav" id="footer-nav">
          {CONTENT.footer.nav.map((n, index) => (
            <a key={index} href={n.href}>
              {n.text}
            </a>
          ))}
        </nav>
        <p className="footer-copy" id="footer-copy">
          © {CONTENT.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
