'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { HeroShaderGradient } from './HeroShaderGradient';
import { HeroParticles } from './HeroParticles';
import { CrashPlayground } from './CrashPlayground';
import { LiquidNav } from './LiquidNav';

type EntranceProps = { entrance?: boolean };

export function Nav({ entrance }: EntranceProps) {
  return <LiquidNav entrance={entrance} />;
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
    const id = window.setTimeout(() => setProjectIndex(0), 0);
    return () => clearTimeout(id);
  }, [activeCategory]);

  useEffect(() => {
    const id = window.setTimeout(
      () => setProjectIndex((i) => Math.min(i, Math.max(0, filteredProjects.length - 1))),
      0,
    );
    return () => clearTimeout(id);
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

