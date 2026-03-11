'use client';

import React from 'react';
import { motion } from 'motion/react';

const CheckIcon = ({ light = false }: { light?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }} color={light ? '#FFFFFF' : 'var(--color-text)'}>
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity={0.15} />
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeOpacity={light ? 1 : 0.5} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PricingPlans() {
  return (
    <motion.section
      className="scroll-animate"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 53,
        padding: '120px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-display), system-ui, sans-serif',
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Hero headline - spans full width above the 3 options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 7vw, 100px)',
              fontWeight: 550,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--color-text)',
              maxWidth: 900,
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>Ship fast.</span>
            <br />
            <span>Look credible.</span>
            <br />
            <span>Stand out.</span>
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
              fontWeight: 350,
              maxWidth: 700,
            }}
          >
            Two ways to work with us. Speed, quality, and zero runaround.
          </p>
        </div>
      </div>

      {/* 3-tier cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {/* Strategy Call */}
        <motion.div
          style={{
            flex: '1 1 320px',
            minWidth: 0,
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 32,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                Strategy Call
              </h3>
              <p style={{ margin: 0, fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.25 }}>
                A focused session to unblock your next move.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Live audit of your product, funnel, or brand.',
                'Prioritized quick wins you can implement immediately.',
                'Clear recommendation on Retainer vs Project fit.',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <CheckIcon />
                  <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--color-text-muted)', lineHeight: 1.25 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64, gap: 24, width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-text)' }}>Free</span>
              </div>
            </div>
            <motion.a
              href="#contact"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 32,
                padding: '16px 40px',
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
                width: '75%',
                minWidth: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              Book Strategy Call
            </motion.a>
          </div>
        </motion.div>

        {/* Project */}
        <motion.div
          style={{
            flex: '1 1 320px',
            minWidth: 0,
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 32,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.02 }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                Project
              </h3>
              <p style={{ margin: 0, fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.25 }}>
                One goal. One timeline. Done right.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Scoped, quoted, and delivered in 2-4 weeks flat',
                'Custom code, not cookie-cutter templates',
                'Launch-ready assets that drive real results',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <CheckIcon />
                  <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--color-text-muted)', lineHeight: 1.25 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64, gap: 24, width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-text)' }}>$850</span>
              </div>
            </div>
            <motion.a
              href="#contact"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 32,
                padding: '16px 40px',
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
                width: '75%',
                minWidth: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              Book Call
            </motion.a>
          </div>
        </motion.div>

        {/* Retainer (featured) */}
        <motion.div
          style={{
            flex: '1 1 320px',
            minWidth: 0,
            background: 'radial-gradient(ellipse 80% 150% at 20% 0%, var(--color-accent) 0%, var(--color-accent-dark) 50%, var(--color-accent-darker) 100%)',
            borderRadius: 32,
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            color: '#FFFFFF',
            boxSizing: 'border-box',
          }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.04 }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Retainer
              </h3>
              <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.25 }}>
                Ongoing execution. Relentless output.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Design, craft and strategy — no bottlenecks',
                'You scale, we keep up — month after month',
                'Built to move fast and hit deadlines, period',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <CheckIcon light />
                  <span style={{ fontSize: 16, fontWeight: 300, color: '#FFFFFF', lineHeight: 1.25 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64, gap: 24, width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 600 }}>$2k</span>
                <span style={{ fontSize: 16, opacity: 0.9, paddingBottom: 4 }}>/month</span>
              </div>
            </div>
            <motion.a
              href="#contact"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-accent)',
                border: 'none',
                borderRadius: 32,
                padding: '16px 40px',
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
                width: '75%',
                minWidth: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              Book Call
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
