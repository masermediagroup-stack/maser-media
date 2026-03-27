'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, House, Tag } from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';
import { HeroGodRays } from './HeroGodRays';
import { HeroParticles } from './HeroParticles';
import { CrashPlayground } from './CrashPlayground';

type EntranceProps = { entrance?: boolean };

const TRUSTED_ROTATE_MS = 3200;

function HeroTrustedBy() {
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  const useStaticWord = mounted && prefersReducedMotion === true;
  const { prefix, rotatingWords, ariaLabel } = CONTENT.hero.trustedBy;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion === true || rotatingWords.length <= 1) return;
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, TRUSTED_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, rotatingWords.length]);

  const currentWord = rotatingWords[wordIndex] ?? rotatingWords[0] ?? '';

  return (
    <p className="hero-trusted-by" aria-label={ariaLabel}>
      <span className="hero-trusted-by__prefix">{prefix}</span>{' '}
      {useStaticWord ? (
        <span className="hero-trusted-by__word">{rotatingWords[0]}</span>
      ) : (
        <span className="hero-trusted-by__slot" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentWord}
              className="hero-trusted-by__word"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentWord}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </p>
  );
}

export function Nav({ entrance }: EntranceProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`nav ${scrolled ? 'nav-scrolled' : ''}`}
      id="nav"
      initial={entrance ? { y: '-100%' } : false}
      animate={entrance ? { y: 0 } : false}
      transition={entrance ? { duration: 0.58, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      <Link href="/" className="nav-logo">
        <Image
          src="/assets/logo-maser-favicon-transparent.png"
          alt="Maser Media icon"
          width={40}
          height={40}
          className="logo-img nav-logo-icon"
          priority
        />
      </Link>
      <div className="nav-cta-wrap">
        <a href={CONTENT.site.secondaryCta.href} className="nav-secondary-cta">
          {CONTENT.site.secondaryCta.text}
        </a>
        <motion.a
          href={CONTENT.site.primaryCta.href}
          className="nav-cta premium-btn premium-btn--primary"
          id="nav-cta"
        >
          <span className="premium-btn__label">{CONTENT.site.primaryCta.text}</span>
        </motion.a>
      </div>
    </motion.nav>
  );
}

export function SideRail({ entrance }: EntranceProps) {
  const pathname = usePathname();
  const handleSectionJump = (sectionId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    // Keep same-page section jumps smooth without persisting a hash in URL.
    if (pathname !== '/') return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    const needsTemporaryTabIndex = !section.hasAttribute('tabindex');
    if (needsTemporaryTabIndex) {
      section.setAttribute('tabindex', '-1');
    }
    section.focus({ preventScroll: true });
    if (needsTemporaryTabIndex) {
      section.removeAttribute('tabindex');
    }
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };

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
            width={112}
            height={30}
            className="logo-img"
          />
        </Link>
        <div className="side-rail-body">
          <div className="side-rail-menu">
            <Link href="/" className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/' ? 'is-active' : ''}`}>
              <House className="side-rail-link-icon" aria-hidden="true" />
              <span className="premium-btn__label">Home</span>
            </Link>
            <Link href="/#work" className="side-rail-link premium-btn premium-btn--ghost" onClick={handleSectionJump('work')}>
              <BriefcaseBusiness className="side-rail-link-icon" aria-hidden="true" />
              <span className="premium-btn__label">Projects</span>
            </Link>
            <Link
              href="/pricing"
              className={`side-rail-link premium-btn premium-btn--ghost ${pathname === '/pricing' ? 'is-active' : ''}`}
            >
              <Tag className="side-rail-link-icon" aria-hidden="true" />
              <span className="premium-btn__label">Pricing</span>
            </Link>
          </div>
        </div>
        <div className="side-rail-actions" aria-label="Contact">
          <Link
            href={CONTENT.site.primaryCta.href}
            className="side-rail-action premium-btn premium-btn--secondary"
            onClick={handleSectionJump('contact')}
          >
            <span className="premium-btn__label">{CONTENT.site.primaryCta.text}</span>
          </Link>
          <a href={CONTENT.site.secondaryCta.href} className="side-rail-action premium-btn premium-btn--secondary">
            <span className="premium-btn__label">{CONTENT.site.secondaryCta.text}</span>
          </a>
          <Link
            href={CONTENT.site.startProjectCta.href}
            className="side-rail-action premium-btn premium-btn--secondary"
            onClick={handleSectionJump('contact')}
          >
            <span className="premium-btn__label">{CONTENT.site.startProjectCta.text}</span>
          </Link>
        </div>
      </nav>
    </motion.aside>
  );
}

export function Hero({ entrance }: EntranceProps) {
  const soften = Boolean(entrance);
  const [curtainDone, setCurtainDone] = useState(false);
  const heroLayout = CONTENT.hero.layout ?? 'centered';
  const isEditorial = heroLayout === 'editorial';

  return (
    <header className={`hero${soften ? ' hero--entrance' : ''}${isEditorial ? ' hero--editorial' : ''}`}>
      {/* Shader stack stays static — not inside page-translate; avoids blocky sliding canvas */}
      <div className="hero-bg" aria-hidden="true">
        <HeroGodRays />
      </div>
      <HeroParticles />
      <div className="hero-text-shadow" aria-hidden="true" />
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
        className={`hero-content${isEditorial ? ' hero-content--editorial' : ''}`}
        initial={soften ? { opacity: 0, y: 18 } : { opacity: 0, scale: 0.8 }}
        animate={soften ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
        transition={
          soften
            ? { duration: 0.62, delay: 0.48, ease: [0.22, 1, 0.36, 1] }
            : { duration: 1.4, ease: 'easeOut' }
        }
      >
        {CONTENT.hero.heroLogo ? (
          <div
            className={`hero-brand${isEditorial ? ' hero-brand--editorial' : ''}`}
            style={
              CONTENT.hero.heroLogo
                ? ({
                    '--hero-logo-ratio': `${CONTENT.hero.heroLogo.width} / ${CONTENT.hero.heroLogo.height}`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <Image
              src={CONTENT.hero.heroLogo.src}
              alt={CONTENT.hero.heroLogo.alt}
              width={CONTENT.hero.heroLogo.width}
              height={CONTENT.hero.heroLogo.height}
              className="hero-brand__img"
              priority
            />
          </div>
        ) : null}
        <p className="hero-badge" id="hero-badge">
          {CONTENT.hero.badge}
        </p>
        {soften ? (
          <h1 className="hero-title" id="hero-title">
            {CONTENT.hero.storyTitle}
            <br />
            <span className="highlight">{CONTENT.hero.storyHighlight}</span>
          </h1>
        ) : (
          <motion.h1
            className="hero-title"
            id="hero-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          >
            {CONTENT.hero.storyTitle}
            <br />
            <span className="highlight">{CONTENT.hero.storyHighlight}</span>
          </motion.h1>
        )}
        <HeroTrustedBy />
        <p className="hero-lead" id="hero-subtitle">
          {CONTENT.hero.lead}
        </p>
        <div className="hero-trust-strip" aria-label="proof points">
          {CONTENT.hero.trustStrip.map((item) => (
            <span key={item} className="hero-trust-pill">
              {item}
            </span>
          ))}
        </div>
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
        <span className="premium-btn__label">{CONTENT.hero.pillNav.showWork.text}</span>
      </a>
      <div className="pill-nav-divider" />
      <a href={CONTENT.hero.pillNav.bookCall.href} className="pill-nav-item premium-btn premium-btn--ghost">
        <span className="premium-btn__label">{CONTENT.hero.pillNav.bookCall.text}</span>
      </a>
    </motion.nav>
  );
}

export function Clients() {
  return (
    <motion.section
      className="clients scroll-animate"
      aria-label="Trusted by"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
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
    </motion.section>
  );
}

export function Services() {
  return (
    <motion.section
      className="services scroll-animate"
      id="services"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
    >
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
    </motion.section>
  );
}

export { CrashPlayground };
export function Work() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filteredProjects = useMemo(
    () => CONTENT.work.items.filter((project) => activeCategory === 'All' || project.category === activeCategory),
    [activeCategory]
  );

  return (
    <motion.section
      className="work scroll-animate"
      id="work"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
    >
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
              <span className="premium-btn__label">{category}</span>
            </button>
          );
        })}
      </div>
      <div className="work-grid" id="work-grid">
        {filteredProjects.map((project, index) => (
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
        ))}
      </div>
    </motion.section>
  );
}

export function Cta() {
  return (
    <motion.section
      className="cta scroll-animate"
      id="contact"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="cta-title" id="cta-title">
        {CONTENT.cta.title}
      </h2>
      <p className="cta-subtitle" id="cta-subtitle">
        {CONTENT.cta.subtitle}
      </p>
      <motion.a
        href={CONTENT.cta.primaryButton.href}
        className="btn btn-primary btn-large premium-btn premium-btn--primary"
        id="cta-button"
      >
        <span className="premium-btn__label">{CONTENT.cta.primaryButton.text}</span>
      </motion.a>
      <a href={CONTENT.cta.secondaryButton.href} className="cta-secondary-link">
        {CONTENT.cta.secondaryButton.text}
      </a>
    </motion.section>
  );
}

export function Footer() {
  return (
    <motion.footer
      className="footer scroll-animate"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="footer-content">
        <Link href="/" className="footer-logo">
          <Image
            src={CONTENT.site.logo}
            alt={CONTENT.site.logoAlt}
            width={112}
            height={28}
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
    </motion.footer>
  );
}

export * from './PricingPlans';
export { GalaxyBackground } from './GalaxyBackground';
export { TestimonialsCarousel as Testimonials } from './TestimonialsCarousel';

