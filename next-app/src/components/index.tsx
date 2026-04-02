'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BriefcaseBusiness, ChevronDown, ChevronUp, House, Menu, Tag, X } from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { useSectionJump } from '@/lib/useSectionJump';
import { HeroShaderGradient } from './HeroShaderGradient';
import { HeroParticles } from './HeroParticles';
import { CrashPlayground } from './CrashPlayground';

type EntranceProps = { entrance?: boolean };

const NAV_TOP_THRESHOLD_PX = 48;

export function Nav({ entrance }: EntranceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  /** Logo + hamburger share visibility: top of page, scroll-up, or menu open */
  const [mobileChromeVisible, setMobileChromeVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const prevMenuOpenRef = useRef(false);
  const { pathname, handleSectionJump } = useSectionJump();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    lastScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (menuOpen) {
        lastScrollYRef.current = y;
        return;
      }
      const last = lastScrollYRef.current;
      const atTop = y <= NAV_TOP_THRESHOLD_PX;
      const scrollingUp = y < last;
      lastScrollYRef.current = y;
      setMobileChromeVisible(atTop || scrollingUp);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Closing the menu re-runs this effect; a naive onScroll() would set y === last and
    // hide chrome immediately. Keep logo + toggle visible until the user scrolls down.
    if (prevMenuOpenRef.current && !menuOpen) {
      const y = window.scrollY;
      lastScrollYRef.current = y;
      setMobileChromeVisible(true);
    } else {
      onScroll();
    }
    prevMenuOpenRef.current = menuOpen;
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const chromeHidden = !menuOpen && !mobileChromeVisible;

  return (
    <>
      <motion.nav
        className={`nav${menuOpen ? ' nav--menu-open' : ''}`}
        id="nav"
        initial={entrance ? { y: '-100%' } : false}
        animate={entrance ? { y: 0 } : false}
        transition={entrance ? { duration: 0.58, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <Link
          href="/"
          className={`nav-logo${chromeHidden ? ' nav-mobile-chrome--hidden' : ''}`}
          onClick={closeMenu}
          tabIndex={chromeHidden ? -1 : undefined}
          aria-hidden={chromeHidden ? true : undefined}
        >
          <Image
            src={CONTENT.site.logo}
            alt={CONTENT.site.logoAlt}
            width={CONTENT.site.logoWidth}
            height={CONTENT.site.logoHeight}
            className="logo-img nav-logo-wordmark"
            priority
          />
        </Link>
        <div className="nav-bar-actions">
          <button
            type="button"
            className={`nav-menu-toggle${chromeHidden ? ' nav-mobile-chrome--hidden' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            tabIndex={chromeHidden ? -1 : 0}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="nav-menu-toggle-icon" aria-hidden /> : <Menu className="nav-menu-toggle-icon" aria-hidden />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              key="nav-mobile-backdrop"
              type="button"
              className="nav-mobile-backdrop"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={closeMenu}
            />
            <motion.div
              key="nav-mobile-panel"
              id="nav-mobile-menu"
              className="nav-mobile-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: reduceMotion ? 0 : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : '100%' }}
              transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav className="nav-mobile-panel-inner" aria-label="Primary navigation">
                <div className="nav-mobile-menu-block">
                  <Link
                    href="/"
                    className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/' ? 'is-active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span className="premium-btn__inner">
                      <House className="side-rail-link-icon" aria-hidden="true" />
                      <span className="premium-btn__label">Home</span>
                    </span>
                  </Link>
                  <Link
                    href="/#work"
                    className="side-rail-link premium-btn premium-btn--ghost"
                    onClick={(e) => {
                      handleSectionJump('work')(e);
                      closeMenu();
                    }}
                  >
                    <span className="premium-btn__inner">
                      <BriefcaseBusiness className="side-rail-link-icon" aria-hidden="true" />
                      <span className="premium-btn__label">Projects</span>
                    </span>
                  </Link>
                  <Link
                    href="/pricing"
                    className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/pricing' ? 'is-active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span className="premium-btn__inner">
                      <Tag className="side-rail-link-icon" aria-hidden="true" />
                      <span className="premium-btn__label">Pricing</span>
                    </span>
                  </Link>
                </div>
                <div className="nav-mobile-menu-block nav-mobile-menu-actions" aria-label="Contact">
                  <Link
                    href={CONTENT.site.primaryCta.href}
                    className="side-rail-action premium-btn premium-btn--secondary"
                    onClick={(e) => {
                      handleSectionJump('contact')(e);
                      closeMenu();
                    }}
                  >
                    <span className="premium-btn__inner">
                      <span className="premium-btn__label">{CONTENT.site.primaryCta.text}</span>
                    </span>
                  </Link>
                  <a href={CONTENT.site.secondaryCta.href} className="side-rail-action premium-btn premium-btn--secondary" onClick={closeMenu}>
                    <span className="premium-btn__inner">
                      <span className="premium-btn__label">{CONTENT.site.secondaryCta.text}</span>
                    </span>
                  </a>
                  <Link
                    href={CONTENT.site.startProjectCta.href}
                    className="side-rail-action premium-btn premium-btn--secondary"
                    onClick={(e) => {
                      handleSectionJump('contact')(e);
                      closeMenu();
                    }}
                  >
                    <span className="premium-btn__inner">
                      <span className="premium-btn__label">{CONTENT.site.startProjectCta.text}</span>
                    </span>
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function SideRail({ entrance }: EntranceProps) {
  const { pathname, handleSectionJump } = useSectionJump();

  return (
    <motion.aside
      className="side-rail"
      aria-label="Site"
      initial={entrance ? { x: '-100%' } : false}
      animate={entrance ? { x: 0 } : false}
      transition={entrance ? { duration: 0.64, delay: 0.02, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      <nav className="side-rail-nav" aria-label="Primary navigation">
        <Link href="/" className="side-rail-logo">
          <Image
            src={CONTENT.site.logo}
            alt={CONTENT.site.logoAlt}
            width={CONTENT.site.logoWidth}
            height={CONTENT.site.logoHeight}
            className="logo-img"
          />
        </Link>
        <div className="side-rail-body">
          <div className="side-rail-menu">
            <Link
              href="/"
              className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/' ? 'is-active' : ''}`}
            >
              <span className="premium-btn__inner">
                <House className="side-rail-link-icon" aria-hidden="true" />
                <span className="premium-btn__label">Home</span>
              </span>
            </Link>
            <Link
              href="/#work"
              className="side-rail-link premium-btn premium-btn--ghost"
              onClick={handleSectionJump('work')}
            >
              <span className="premium-btn__inner">
                <BriefcaseBusiness className="side-rail-link-icon" aria-hidden="true" />
                <span className="premium-btn__label">Projects</span>
              </span>
            </Link>
            <Link
              href="/pricing"
              className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/pricing' ? 'is-active' : ''}`}
            >
              <span className="premium-btn__inner">
                <Tag className="side-rail-link-icon" aria-hidden="true" />
                <span className="premium-btn__label">Pricing</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="side-rail-actions" aria-label="Contact">
          <Link
            href={CONTENT.site.primaryCta.href}
            className="side-rail-action premium-btn premium-btn--secondary"
            onClick={handleSectionJump('contact')}
          >
            <span className="premium-btn__inner">
              <span className="premium-btn__label">{CONTENT.site.primaryCta.text}</span>
            </span>
          </Link>
          <a href={CONTENT.site.secondaryCta.href} className="side-rail-action premium-btn premium-btn--secondary">
            <span className="premium-btn__inner">
              <span className="premium-btn__label">{CONTENT.site.secondaryCta.text}</span>
            </span>
          </a>
          <Link
            href={CONTENT.site.startProjectCta.href}
            className="side-rail-action premium-btn premium-btn--secondary"
            onClick={handleSectionJump('contact')}
          >
            <span className="premium-btn__inner">
              <span className="premium-btn__label">{CONTENT.site.startProjectCta.text}</span>
            </span>
          </Link>
        </div>
      </nav>
    </motion.aside>
  );
}

export function Hero({ entrance }: EntranceProps) {
  const soften = Boolean(entrance);
  const reduceMotion = useReducedMotion();
  const [curtainDone, setCurtainDone] = useState(false);
  const heroLogo = CONTENT.hero.heroLogo;
  const logoVars = heroLogo
    ? ({
        '--hero-logo-ratio': `${heroLogo.width} / ${heroLogo.height}`,
      } as CSSProperties)
    : undefined;

  return (
    <header className={`hero hero--logo-centered${soften ? ' hero--entrance' : ''}`}>
      {/* Shader stack stays static — not inside page-translate; avoids blocky sliding canvas */}
      <div className="hero-bg" aria-hidden="true">
        <HeroShaderGradient />
      </div>
      <HeroParticles />
      {soften ? (
        <motion.div
          className={`hero-load-curtain${curtainDone ? ' hero-load-curtain--done' : ''}`}
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setCurtainDone(true)}
        />
      ) : null}
      <motion.div
        className="hero-content hero-content--logo-centered"
        initial={
          soften
            ? {
                opacity: 0,
                y: 18,
                ...(reduceMotion === true ? {} : { filter: 'blur(14px)' }),
              }
            : {
                opacity: 0,
                scale: 0.98,
                ...(reduceMotion === true ? {} : { filter: 'blur(12px)' }),
              }
        }
        animate={
          soften
            ? {
                opacity: 1,
                y: 0,
                ...(reduceMotion === true ? {} : { filter: 'blur(0px)' }),
              }
            : {
                opacity: 1,
                scale: 1,
                ...(reduceMotion === true ? {} : { filter: 'blur(0px)' }),
              }
        }
        transition={
          soften
            ? { duration: 0.78, delay: 0.42, ease: [0.22, 1, 0.36, 1] }
            : { duration: 1.1, ease: 'easeOut' }
        }
      >
        {heroLogo ? (
          <div className="hero-logo-stage" style={logoVars}>
            <div className="hero-brand hero-brand--center" aria-hidden="true">
              <div className="hero-brand__light hero-brand__light--core" aria-hidden="true" />
              <div className="hero-brand__light hero-brand__light--seep" aria-hidden="true" />
            </div>
            <div className="hero-copy-frame">
              {soften ? (
                <h1 className="hero-title hero-title--story" id="hero-title">
                  <span className="hero-title__primary">{CONTENT.hero.storyTitle}</span>
                </h1>
              ) : (
                <motion.h1
                  className="hero-title hero-title--story"
                  id="hero-title"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                >
                  <span className="hero-title__primary">{CONTENT.hero.storyTitle}</span>
                </motion.h1>
              )}
              <Image
                src={heroLogo.src}
                alt={heroLogo.alt}
                width={heroLogo.width}
                height={heroLogo.height}
                className="hero-copy-logo"
                priority
              />
              <p className="hero-badge" id="hero-badge">
                {CONTENT.hero.badge}
              </p>
              <p className="hero-lead" id="hero-subtitle">
                {CONTENT.hero.lead}
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}

export function PillNav({ entrance }: EntranceProps) {
  return (
    <motion.nav
      className="pill-nav"
      aria-label="Quick actions"
      initial={entrance ? { y: '120%', opacity: 0 } : false}
      animate={entrance ? { y: 0, opacity: 1 } : false}
      transition={entrance ? { duration: 0.52, delay: 0.28, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      <a href={CONTENT.hero.pillNav.showWork.href} className="pill-nav-item premium-btn premium-btn--ghost">
        <span className="premium-btn__inner">
          <span className="premium-btn__label">{CONTENT.hero.pillNav.showWork.text}</span>
        </span>
      </a>
      <div className="pill-nav-divider" />
      <a href={CONTENT.hero.pillNav.bookCall.href} className="pill-nav-item premium-btn premium-btn--ghost">
        <span className="premium-btn__inner">
          <span className="premium-btn__label">{CONTENT.hero.pillNav.bookCall.text}</span>
        </span>
      </a>
    </motion.nav>
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
  const [activeService, setActiveService] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const onToggleService = (title: string) => {
    if (activeService === title) {
      setActiveService(null);
      return;
    }
    setActiveService(title);
  };

  return (
    <section className="services scroll-animate" id="services">
      <div className="services-layout">
        <div className="services-copy">
          <motion.h2
            className="section-title"
            id="services-title"
            initial={reduceMotion ? { y: 0 } : { y: 36 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.45, margin: '0px 0px -10% 0px' }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: reduceMotion ? 0 : 0.04,
            }}
          >
            {CONTENT.services.title}
          </motion.h2>
          {CONTENT.services.subtitle ? <p className="services-subtitle">{CONTENT.services.subtitle}</p> : null}
        </div>
        <div
          className="services-accordion"
          id="services-grid"
          data-state={activeService ? 'expanded' : 'idle'}
          aria-label="Service categories"
        >
          <ul className="services-categories">
            {CONTENT.services.items.map((svc) => {
              const isActive = activeService === svc.title;
              const isDimmed = Boolean(activeService) && !isActive;
              const slug = svc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const panelId = `service-panel-${slug}`;
              const buttonId = `service-button-${slug}`;

              return (
                <li key={svc.title} className={`service-item${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}>
                  <button
                    id={buttonId}
                    type="button"
                    className="service-trigger"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onClick={() => onToggleService(svc.title)}
                    disabled={isDimmed}
                  >
                    <span className="service-trigger-text">{svc.title}</span>
                    <span className="service-trigger-arrow-wrap" aria-hidden="true">
                      <ChevronDown className={`service-trigger-arrow service-trigger-arrow-down${isActive ? ' is-hidden' : ''}`} size={18} />
                      <ChevronUp className={`service-trigger-arrow service-trigger-arrow-up${isActive ? ' is-visible' : ''}`} size={18} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.div
                        key={panelId}
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="service-panel"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: 0,
                          transition: {
                            duration: reduceMotion ? 0.12 : 0.2,
                            ease: [0.4, 0, 1, 1],
                          },
                        }}
                        transition={{
                          duration: reduceMotion ? 0.16 : 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <p className="service-panel-lines">
                          {svc.items.map((line, lineIndex) => (
                            <span key={`${svc.title}-${lineIndex}`} className="service-panel-line">
                              {line}
                            </span>
                          ))}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { CrashPlayground };
export function Work() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projectIndex, setProjectIndex] = useState(0);
  const filteredProjects = useMemo(
    () => CONTENT.work.items.filter((project) => activeCategory === 'All' || project.category === activeCategory),
    [activeCategory]
  );

  useEffect(() => {
    setProjectIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    setProjectIndex((i) => Math.min(i, Math.max(0, filteredProjects.length - 1)));
  }, [filteredProjects.length]);

  const project = filteredProjects[projectIndex];

  return (
    <section className="work scroll-animate" id="work">
      <h2 className="section-title" id="work-title">
        {CONTENT.work.title}
      </h2>
      <p className="work-subtitle">{CONTENT.work.subtitle}</p>
      <div className="work-tabs" aria-label="Project categories">
        {CONTENT.work.categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              className={`work-tab premium-btn premium-btn--chip ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="premium-btn__inner">
                <span className="premium-btn__label">{category}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="work-showcase">
        <div
          className="work-grid"
          id="work-grid"
          role="region"
          aria-roledescription="carousel"
          aria-label="Projects in the selected category"
        >
          {filteredProjects.length === 0 ? (
            <p className="work-empty">No projects match this category yet.</p>
          ) : project ? (
            <a
              key={`${project.title}-${projectIndex}`}
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
                <dl className="work-card-meta">
                  <div>
                    <dt>Outcome</dt>
                    <dd>{project.outcome}</dd>
                  </div>
                  <div>
                    <dt>Timeline</dt>
                    <dd>{project.timeframe}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                </dl>
              </div>
            </a>
          ) : null}
        </div>
        {filteredProjects.length > 1 ? (
          <nav className="work-dots" aria-label="Switch project">
            {filteredProjects.map((p, i) => (
              <button
                key={`${p.title}-${i}`}
                type="button"
                className={`work-dot ${i === projectIndex ? 'is-active' : ''}`}
                onClick={() => setProjectIndex(i)}
                aria-label={`Show project: ${p.title}`}
                aria-current={i === projectIndex ? true : undefined}
              />
            ))}
          </nav>
        ) : null}
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
      <motion.a
        href={CONTENT.cta.primaryButton.href}
        className="premium-btn premium-btn--primary"
        id="cta-button"
      >
        <span className="premium-btn__inner">
          <span className="premium-btn__label">{CONTENT.cta.primaryButton.text}</span>
        </span>
      </motion.a>
      <a href={CONTENT.cta.secondaryButton.href} className="cta-secondary-link">
        {CONTENT.cta.secondaryButton.text}
      </a>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer scroll-animate">
      <div className="footer-content">
        <Link href="/" className="footer-logo">
          <Image
            src={CONTENT.site.logo}
            alt={CONTENT.site.logoAlt}
            width={CONTENT.site.logoWidth}
            height={CONTENT.site.logoHeight}
            className="logo-img"
            id="footer-logo"
            style={{ objectFit: 'contain' }}
          />
        </Link>
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

export * from './PricingPlans';
export { GalaxyBackground } from './GalaxyBackground';
export { TestimonialsCarousel as Testimonials } from './TestimonialsCarousel';

