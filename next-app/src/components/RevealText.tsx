'use client';

import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { TITLE_DISSOLVE_VIEWPORT } from '@/lib/stickyHeader';

export function RevealText({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.035,
  amount = 0.45,
  replay = false,
  blur = true,
  singleLine = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
  replay?: boolean;
  blur?: boolean;
  singleLine?: boolean;
}) {
  const parts = useMemo(() => text.split(/(\s+)/).filter(Boolean), [text]);
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const revealClassName = [
    'mm-reveal-text',
    singleLine ? 'mm-reveal-text--single-line' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (reduceMotion) {
    return <span className={revealClassName}>{text}</span>;
  }

  return (
    <motion.span
      className={revealClassName}
      initial="hidden"
      animate={replay ? controls : undefined}
      whileInView={replay ? undefined : 'show'}
      onViewportEnter={replay ? () => void controls.start('show') : undefined}
      onViewportLeave={replay ? () => void controls.start('hidden') : undefined}
      viewport={{ once: !replay, ...(replay ? TITLE_DISSOLVE_VIEWPORT : { amount }) }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      aria-label={text}
    >
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return (
            <span className="mm-reveal-space" aria-hidden key={`space-${index}`}>
              {part}
            </span>
          );
        }

        return (
          <motion.span
            className={`mm-reveal-word ${wordClassName}`}
            variants={{
              hidden: blur
                ? { opacity: 0.14, y: 16, filter: 'blur(4px)' }
                : { opacity: 0.14, y: 16 },
              show: blur
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            key={`${part}-${index}`}
            aria-hidden
          >
            {part}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

/** Short section titles stay one row (word stagger, no vertical stack). */
const SECTION_TITLE_SINGLE_LINE_MAX_WORDS = 5;

export function SectionTitleReveal({
  text,
  className = '',
  wordClassName = '',
  singleLine,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  singleLine?: boolean;
}) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const forceSingleLine = singleLine ?? wordCount <= SECTION_TITLE_SINGLE_LINE_MAX_WORDS;

  return (
    <RevealText
      text={text}
      className={className}
      wordClassName={wordClassName}
      stagger={0.045}
      amount={0.62}
      replay
      singleLine={forceSingleLine}
    />
  );
}

export function FlipText({
  text,
  className = '',
  stagger = 0.04,
  replay = false,
}: {
  text: string;
  className?: string;
  stagger?: number;
  replay?: boolean;
}) {
  const parts = text.split(/(\s+)/);
  const controls = useAnimationControls();

  return (
    <motion.span
      className={`mm-flip-text ${className}`}
      initial="hidden"
      animate={replay ? controls : undefined}
      whileInView={replay ? undefined : 'show'}
      onViewportEnter={replay ? () => void controls.start('show') : undefined}
      onViewportLeave={replay ? () => void controls.start('hidden') : undefined}
      viewport={{ once: !replay, ...(replay ? TITLE_DISSOLVE_VIEWPORT : { amount: 0.65 }) }}
      aria-label={text}
    >
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span aria-hidden key={`space-${index}`}> </span>;
        }

        return (
          <motion.span
            className="mm-flip-text__word"
            variants={{
              hidden: { opacity: 0, y: 18, rotateX: -86 },
              show: { opacity: 1, y: 0, rotateX: 0 },
            }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: index * stagger }}
            key={`${part}-${index}`}
            aria-hidden
          >
            {part}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
