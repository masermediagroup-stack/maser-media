'use client';

import { motion } from 'motion/react';
import { CONTENT } from '@/lib/content';

export function LayersStrip() {
  const lines = CONTENT.layersStrip.lines;

  return (
    <motion.section
      className="layers-strip scroll-animate"
      aria-label="Layers of strategy and creativity"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="layers-strip-inner">
        {lines.map((text, index) => (
          <div key={index} className={`layers-row layers-row-${index % 3}`}>
            <div className="layers-row-track">
              <span className="layers-text">{text}</span>
              <span className="layers-text layers-text-ghost">{text}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

