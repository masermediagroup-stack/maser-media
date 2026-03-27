'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CONTENT } from '@/lib/content';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';

const SLIDE_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

function StarRow({ count = 5, muted }: { count?: number; muted?: boolean }) {
  return (
    <div className={`testimonial-stars ${muted ? 'testimonial-stars--muted' : ''}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="testimonial-star">
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const { eyebrow, title, prevLabel, nextLabel, items } = CONTENT.testimonials;
  const n = items.length;
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  const reduceMotionMotion = mounted && prefersReducedMotion === true;
  const headingId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const prevIdx = (activeIndex - 1 + n) % n;
  const nextIdx = (activeIndex + 1) % n;

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % n);
  }, [n]);

  useEffect(() => {
    if (prefersReducedMotion === true) return;
    const id = window.setInterval(goNext, 7000);
    return () => window.clearInterval(id);
  }, [goNext, prefersReducedMotion]);

  if (n === 0) return null;

  const progress = ((activeIndex + 1) / n) * 100;

  return (
    <motion.section
      className="testimonials-carousel scroll-animate"
      id="testimonials"
      aria-labelledby={headingId}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="testimonials-carousel-inner">
        <header className="testimonials-carousel-header">
          <p className="testimonials-carousel-eyebrow">{eyebrow}</p>
          <h2 className="testimonials-carousel-title" id={headingId}>
            {title}
          </h2>
        </header>

        <div
          className="testimonials-carousel-track"
          role="region"
          aria-roledescription="carousel"
          aria-label={title}
        >
          <SideCard
            item={items[prevIdx]}
            position="left"
            onActivate={() => setActiveIndex(prevIdx)}
          />
          <div className="testimonial-card testimonial-card--active testimonial-card--center" aria-current="true">
            <span className="testimonial-card-quote-icon" aria-hidden>
              &ldquo;
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                className="testimonial-card-body"
                initial={reduceMotionMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotionMotion ? undefined : { opacity: 0, y: -10 }}
                transition={SLIDE_TRANSITION}
              >
                <p className="testimonial-card-text">{items[activeIndex].quote}</p>
                <div className="testimonial-card-footer">
                  <div className="testimonial-card-meta">
                    {items[activeIndex].avatar ? (
                      <Image
                        src={items[activeIndex].avatar}
                        alt=""
                        width={44}
                        height={44}
                        className="testimonial-card-avatar"
                      />
                    ) : (
                      <div
                        className={`testimonial-card-avatar testimonial-card-avatar--placeholder testimonial-card-avatar--tone-${activeIndex % 4}`}
                        aria-hidden
                      />
                    )}
                    <div className="testimonial-card-who">
                      <strong className="testimonial-card-name">{items[activeIndex].name}</strong>
                      <span className="testimonial-card-role">{items[activeIndex].role}</span>
                    </div>
                  </div>
                  <StarRow count={items[activeIndex].rating ?? 5} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <SideCard
            item={items[nextIdx]}
            position="right"
            onActivate={() => setActiveIndex(nextIdx)}
          />
        </div>

        <nav className="testimonials-carousel-nav" aria-label="Testimonial slides">
          <button
            type="button"
            className="testimonials-carousel-btn testimonials-carousel-btn--muted premium-btn premium-btn--secondary"
            onClick={goPrev}
          >
            <span className="premium-btn__label">{prevLabel}</span>
          </button>
          <div
            className="testimonials-carousel-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={n}
            aria-valuenow={activeIndex + 1}
            aria-label={`Slide ${activeIndex + 1} of ${n}`}
          >
            <div className="testimonials-carousel-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            className="testimonials-carousel-btn testimonials-carousel-btn--primary premium-btn premium-btn--primary"
            onClick={goNext}
          >
            <span className="premium-btn__label">{nextLabel}</span>
          </button>
        </nav>
      </div>
    </motion.section>
  );
}

function SideCard({
  item,
  position,
  onActivate,
}: {
  item: (typeof CONTENT.testimonials.items)[0];
  position: 'left' | 'right';
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      className={`testimonial-card testimonial-card--inactive testimonial-card--${position} premium-btn premium-btn--card`}
      onClick={onActivate}
      aria-label={`Show testimonial from ${item.name}`}
    >
      <span className="testimonial-card-quote-icon" aria-hidden>
        &ldquo;
      </span>
      <div className="testimonial-card-body">
        <p className="testimonial-card-text">{item.quote}</p>
        <div className="testimonial-card-footer">
          <div className="testimonial-card-meta">
            {item.avatar ? (
              <Image src={item.avatar} alt="" width={40} height={40} className="testimonial-card-avatar" />
            ) : (
              <div className="testimonial-card-avatar testimonial-card-avatar--placeholder" aria-hidden />
            )}
            <div className="testimonial-card-who">
              <strong className="testimonial-card-name">{item.name}</strong>
              <span className="testimonial-card-role">{item.role}</span>
            </div>
          </div>
          <StarRow count={item.rating ?? 5} muted />
        </div>
      </div>
    </button>
  );
}
