'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { AriaRole, ReactNode } from 'react';

type ScrollRevealVariant = 'fade' | 'blur';

const variantMotion = {
  fade: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
  blur: {
    hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
} as const;

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  p: motion.p,
  span: motion.span,
  li: motion.li,
} as const;

type ScrollRevealTag = keyof typeof motionTags;

export type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  delay?: number;
  amount?: number;
  as?: ScrollRevealTag;
  role?: AriaRole;
  id?: string;
};

export function ScrollReveal({
  children,
  className = '',
  variant = 'fade',
  delay = 0,
  amount = 0.22,
  as = 'div',
  role,
  id,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const Tag = motionTags[as];
  const StaticTag = as;

  if (reduceMotion) {
    return (
      <StaticTag className={className} role={role} id={id}>
        {children}
      </StaticTag>
    );
  }

  return (
    <Tag
      className={className}
      role={role}
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={variantMotion[variant]}
      transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Tag>
  );
}
