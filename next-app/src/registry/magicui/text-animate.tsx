'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ElementType } from 'react';

type TextAnimateProps = {
  children: string;
  animation?: 'fadeIn';
  by?: 'line';
  as?: ElementType;
  className?: string;
};

export function TextAnimate({
  children,
  animation = 'fadeIn',
  by = 'line',
  as: Component = 'p',
  className,
}: TextAnimateProps) {
  const reduceMotion = useReducedMotion();

  if (animation !== 'fadeIn' || by !== 'line') {
    return <Component className={className}>{children}</Component>;
  }

  const lines = children
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Component className={className}>
      {lines.map((line, index) => (
        reduceMotion ? (
          <span key={`${line}-${index}`} style={{ display: 'block' }}>
            {line}
          </span>
        ) : (
          <motion.span
            key={`${line}-${index}`}
            style={{ display: 'block' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.05,
            }}
          >
            {line}
          </motion.span>
        )
      ))}
    </Component>
  );
}

