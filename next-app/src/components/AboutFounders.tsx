'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CONTENT } from '@/lib/content';
import { ScrollReveal } from '@/components/ScrollReveal';

interface Founder {
  /** Full name displayed under the headshot. Replace placeholders when real names are confirmed. */
  name: string;
  /** Short one-liner role / focus. */
  role: string;
  /** Public-relative path to the headshot (`/assets/about/...`). If the file is missing, an initials avatar is shown instead. */
  headshot: string;
  /** Two short paragraphs of bio copy. */
  bio: [string, string];
}

const FOUNDERS: Founder[] = [
  {
    name: 'Tyler Vea',
    role: 'Design + Direction',
    headshot: '/assets/about/tyler-vea.jpg',
    bio: [
      "Graphic design first, business builder by habit. Years of pushing brand systems, decks, and launch surfaces for companies that needed their story to land in seconds.",
      "Came out of the Paradox content team - two people, every asset, every week - and built the muscle for shipping creative work that actually moves a brand forward.",
    ],
  },
  {
    name: 'Grayson Maser',
    role: 'Strategy + Storytelling',
    headshot: '/assets/about/grayson-maser.jpg',
    bio: [
      "Storytelling and creative direction with a soft spot for the offer underneath the design. Spends as much time on what to say as on how it looks.",
      "Same Paradox roots - running the visual-content guides, the campaign frames, and the day-to-day of a two-person creative team that had to actually deliver.",
    ],
  },
];

export function AboutFounders() {
  const { foundersOutro } = CONTENT.aboutPage;

  return (
    <section className="mm-about-founders mm-section" aria-label="Founders">
      <div className="mm-about-founders__inner">
        <div className="mm-about-founders__grid" role="list">
          {FOUNDERS.map((founder, index) => (
            <FounderCard key={founder.name} founder={founder} revealDelay={index * 0.1} />
          ))}
        </div>

        <ScrollReveal as="footer" className="mm-about-founders__outro" variant="fade" amount={0.35}>
          <p>{foundersOutro}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FounderCard({ founder, revealDelay }: { founder: Founder; revealDelay: number }) {
  const [hasImage, setHasImage] = useState(Boolean(founder.headshot));
  const initials = founder.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollReveal
      as="article"
      className="mm-founder-card"
      role="listitem"
      variant="fade"
      delay={revealDelay}
      amount={0.28}
    >
      <div className="mm-founder-card__portrait">
        {hasImage ? (
          <Image
            src={founder.headshot}
            alt={`Portrait of ${founder.name}`}
            width={520}
            height={520}
            sizes="(max-width: 720px) 80vw, 360px"
            onError={() => setHasImage(false)}
            priority={false}
          />
        ) : (
          <span className="mm-founder-card__portrait-fallback" aria-hidden>
            {initials}
          </span>
        )}
      </div>
      <div className="mm-founder-card__body">
        <h3 className="mm-founder-card__name">{founder.name}</h3>
        <p className="mm-founder-card__role">{founder.role}</p>
        {founder.bio.map((paragraph, index) => (
          <p key={index} className="mm-founder-card__bio">
            {paragraph}
          </p>
        ))}
      </div>
    </ScrollReveal>
  );
}
