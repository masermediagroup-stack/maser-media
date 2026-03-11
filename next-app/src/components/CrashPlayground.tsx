'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CONTENT } from '@/lib/content';

const floatVariant = {
  initial: { opacity: 0, y: 16, rotate: 0 },
  animate: (index: number) => ({
    opacity: 1,
    y: [16, -6, 4, -4, 0],
    rotate: [0, 2, -1, 1, 0],
    transition: {
      duration: 10 + index * 0.5,
      repeat: Infinity,
      repeatType: 'mirror' as const,
      ease: 'easeInOut' as const,
      delay: index * 0.08,
    },
  }),
};

export function CrashPlayground() {
  const shouldReduceMotion = useReducedMotion();
  const tags = CONTENT.playground.tags;

  return (
    <motion.section
      className="playground-section scroll-animate"
      id="playground"
      aria-label="Internet playground"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
    >
      <div className="playground-inner">
        <div className="playground-header">
          <p className="playground-eyebrow">Crash-style internet lab</p>
          <h2 className="section-title playground-title">{CONTENT.playground.title}</h2>
          <p className="playground-subtitle">{CONTENT.playground.subtitle}</p>
        </div>
        <div className="playground-stage" aria-hidden="true">
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              className="playground-tile"
              custom={index}
              initial={shouldReduceMotion ? { opacity: 0, y: 12 } : 'initial'}
              animate={shouldReduceMotion ? { opacity: 1, y: 0 } : 'animate'}
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

