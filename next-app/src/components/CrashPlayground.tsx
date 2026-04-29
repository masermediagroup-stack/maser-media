'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTENT } from '@/lib/content';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';
import { ShineBorder } from '@/registry/magicui/shine-border';

const pillEnterVariant = {
  initial: {
    opacity: 0,
    y: 28,
    scale: 0.92,
    rotate: -2,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.75,
      ease: 'easeOut' as const,
    },
  },
};

const GLITCH_WORDS = ['people', 'companies', 'startups', 'creators', 'founders', 'teams'];

/** White + soft white + `--color-accent` (#10A4FF) only — OKLCH gradient avoids sRGB cyan between stops */
const SHINE_COLORS = [
  '#FFFFFF',
  '#10A4FF',
  '#F5F9FF',
  '#10A4FF',
  '#FFFFFF',
  '#F7FAFF',
  '#10A4FF',
  '#FFFFFF',
];

type TiltNode = HTMLElement & { __playgroundTiltRaf?: number };

function handlePlaygroundTiltMove(event: ReactPointerEvent<HTMLElement>, enabled: boolean) {
  if (!enabled || event.pointerType !== 'mouse') return;

  const node = event.currentTarget as TiltNode;
  const rect = node.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * 7;
  const rotateX = (0.5 - y) * 6;

  if (node.__playgroundTiltRaf) {
    window.cancelAnimationFrame(node.__playgroundTiltRaf);
  }

  node.__playgroundTiltRaf = window.requestAnimationFrame(() => {
    node.style.setProperty('--playground-pointer-x', `${Math.round(x * 100)}%`);
    node.style.setProperty('--playground-pointer-y', `${Math.round(y * 100)}%`);
    node.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
  });
}

function handlePlaygroundTiltLeave(event: ReactPointerEvent<HTMLElement>, enabled: boolean) {
  if (!enabled) return;
  const node = event.currentTarget as TiltNode;
  if (node.__playgroundTiltRaf) {
    window.cancelAnimationFrame(node.__playgroundTiltRaf);
  }
  node.style.transform = '';
  node.style.removeProperty('--playground-pointer-x');
  node.style.removeProperty('--playground-pointer-y');
}

export function CrashPlayground() {
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  const tilesReduced = mounted && prefersReducedMotion === true;
  const tags = CONTENT.playground.tags;
  const [wordIndex, setWordIndex] = useState(0);
  const [tagIndex, setTagIndex] = useState(0);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const currentTag = tags[tagIndex] ?? tags[0];

  const tiltInteractive = mounted && prefersReducedMotion !== true;

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
  const pillShouldAnimate = hasEnteredView && !tilesReduced;

  const advanceTag = () => {
    setTagIndex((i) => (i + 1) % tags.length);
  };

  return (
    <motion.section
      className="playground-section"
      id="about"
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
        <div className="playground-stage" ref={stageRef}>
          <div
            className="playground-tag-tilt-host"
            onPointerMove={(e) => handlePlaygroundTiltMove(e, tiltInteractive)}
            onPointerLeave={(e) => handlePlaygroundTiltLeave(e, tiltInteractive)}
          >
            <motion.div
              className="playground-tag-card"
              initial={tilesReduced ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : 'initial'}
              animate={
                tilesReduced
                  ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                  : pillShouldAnimate
                    ? 'animate'
                    : 'initial'
              }
              variants={pillEnterVariant}
            >
              <ShineBorder
                borderWidth={2}
                duration={9}
                hueSafe
                shineColor={SHINE_COLORS}
                className="shine-border-magic--playground"
                aria-hidden="true"
              />
              <button
                type="button"
                className="playground-tag-cycle-btn"
                onClick={advanceTag}
                aria-label={`${currentTag}. Service ${tagIndex + 1} of ${tags.length}. Activate to see the next.`}
              >
                <span className="playground-tag-cycle-inner">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentTag}
                      className="playground-tag-cycle-label"
                      initial={tilesReduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={tilesReduced ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      {currentTag}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
