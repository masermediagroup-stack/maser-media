'use client';

import { use, useEffect, useState } from 'react';
import {
  GalaxyBackground,
  PageLoader,
  Nav,
  Hero,
  PillNav,
  Clients,
  Services,
  CrashPlayground,
  Work,
  Testimonials,
  PricingPlans,
  Cta,
  Footer,
} from '@/components';

export default function Home({
  params,
  searchParams,
}: {
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  use(params ?? Promise.resolve({}));
  use(searchParams ?? Promise.resolve({}));
  const [loaderRevealed, setLoaderRevealed] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('loader-active');

    // Reveal loader after page load
    const timer = setTimeout(() => {
      setLoaderRevealed(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (loaderRevealed) {
      const timer = setTimeout(() => {
        document.body.classList.remove('loader-active');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loaderRevealed]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('loader-active');
    };
  }, []);

  // Scroll animation observer for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '-40px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <GalaxyBackground />
      <PageLoader />
      <Nav />
      <main>
        <Hero />
        <Clients />
        <Services />
        <CrashPlayground />
        <Work />
        <Testimonials />
        <PricingPlans />
        <Cta />
        <Footer />
      </main>
      <PillNav />
    </>
  );
}
