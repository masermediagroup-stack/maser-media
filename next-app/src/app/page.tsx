'use client';

import { useEffect, useState } from 'react';
import {
  PageLoader,
  Nav,
  Hero,
  PillNav,
  Clients,
  Services,
  Work,
  Testimonials,
  Cta,
  Footer,
} from '@/components';

export default function Home() {
  const [loaderRevealed, setLoaderRevealed] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // Reveal loader after page load
    const timer = setTimeout(() => {
      setLoaderRevealed(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaderRevealed) {
      const timer = setTimeout(() => {
        document.body.classList.remove('loader-active');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loaderRevealed]);

  // Smooth scroll handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        const href = target.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageLoader />
      <Nav />
      <main>
        <Hero />
        <PillNav />
        <Clients />
        <Services />
        <Work />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
