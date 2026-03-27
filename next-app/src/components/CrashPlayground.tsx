'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTENT } from '@/lib/content';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';

const floatVariant = {
  // Tiles start "off" somewhere around the canvas and swipe into place
  initial: (index: number) => {
    const angleDeg = (index * 37) % 360;
    const angle = (angleDeg * Math.PI) / 180;
    const radius = 160 + (index % 4) * 24;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      opacity: 0,
      x,
      y,
      scale: 0.85,
      rotate: (index % 8) - 4,
    };
  },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.9 + (index % 5) * 0.08,
      ease: 'easeOut' as const,
      delay: index * 0.06,
    },
  }),
};

const GLITCH_WORDS = ['people', 'companies', 'startups', 'creators', 'founders', 'teams'];

export function CrashPlayground() {
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  const tilesReduced = mounted && prefersReducedMotion === true;
  const tags = CONTENT.playground.tags;
  const [wordIndex, setWordIndex] = useState(0);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      },
    );

    observer.observe(stageRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion === true) return;

    const id = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % GLITCH_WORDS.length);
    }, 2600);

    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const currentWord = GLITCH_WORDS[wordIndex];
  const tilesShouldAnimate = hasEnteredView && !tilesReduced;

  return (
    <motion.section
      className="playground-section"
      id="playground"
      aria-label="Internet playground"
      initial={{ opacity: 0, y: 24 }}
      animate={hasEnteredView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="playground-inner">
        <div className="playground-header">
          <h2 className="section-title playground-title">
            <span className="playground-title-lead">We do cool things for</span>
            <span className="playground-glitch-line">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {currentWord}
                </motion.span>
              </AnimatePresence>
            </span>
          </h2>
        </div>
        <div className="playground-stage" aria-hidden="true" ref={stageRef}>
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              className="playground-tile"
              custom={index}
              initial={tilesReduced ? { opacity: 1, x: 0, y: 0 } : 'initial'}
              animate={
                tilesReduced
                  ? { opacity: 1, x: 0, y: 0 }
                  : tilesShouldAnimate
                  ? 'animate'
                  : 'initial'
              }
              variants={floatVariant}
              whileHover={{ scale: 1.06, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{tag}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

