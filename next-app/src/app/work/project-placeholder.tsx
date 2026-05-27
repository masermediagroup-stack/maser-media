'use client';

import Link from 'next/link';
import { InnerPageMain } from '@/components';

type ProjectPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
};

export function ProjectPlaceholderPage({ eyebrow, title, summary }: ProjectPlaceholderPageProps) {
  return (
    <InnerPageMain>
      <div className="mm-project-placeholder">
      <section className="mm-project-placeholder__hero" aria-labelledby="project-title">
        <div className="mm-project-placeholder__copy">
          <p className="mm-project-placeholder__eyebrow">{eyebrow}</p>
          <h1 id="project-title">{title}</h1>
          <p className="mm-project-placeholder__summary">{summary}</p>
        </div>
      </section>

      <section className="mm-project-placeholder__viewport" aria-label={`${title} project details`}>
        <div className="mm-project-placeholder__panel">
          <p className="mm-project-placeholder__eyebrow">Project viewport</p>
          <h2>Case study content coming soon.</h2>
        </div>
      </section>

      <footer className="mm-project-placeholder__footer">
        <Link href="/work#main-content">Back to work</Link>
      </footer>
      </div>
    </InnerPageMain>
  );
}
