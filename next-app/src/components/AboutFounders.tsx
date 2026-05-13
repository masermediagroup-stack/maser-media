'use client';

import { useState } from 'react';
import Image from 'next/image';

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
    name: 'Founder A',
    role: 'Design + Direction',
    headshot: '/assets/about/founder-1.jpg',
    bio: [
      "Graphic design first, business builder by habit. Years of pushing brand systems, decks, and launch surfaces for companies that needed their story to land in seconds.",
      "Came out of the Paradox content team — two people, every asset, every week — and built the muscle for shipping creative work that actually moves a brand forward.",
    ],
  },
  {
    name: 'Founder B',
    role: 'Strategy + Storytelling',
    headshot: '/assets/about/founder-2.jpg',
    bio: [
      "Storytelling and creative direction with a soft spot for the offer underneath the design. Spends as much time on what to say as on how it looks.",
      "Same Paradox roots — running the visual-content guides, the campaign frames, and the day-to-day of a two-person creative team that had to actually deliver.",
    ],
  },
];

export function AboutFounders() {
  return (
    <section className="mm-about-founders mm-section" aria-labelledby="about-founders-heading">
      <div className="mm-about-founders__inner">
        <header className="mm-about-founders__manifesto">
          <p className="mm-kicker">The honest version</p>
          <h2 id="about-founders-heading">
            A small team with nothing but time, building in the open.
          </h2>
          <p>
            Two creatives with different backgrounds — graphic design, business building, storytelling, creative
            direction — who got tired of watching agencies leave clients behind. So we made our own crew.
          </p>
          <p>
            Striving to evolve in this new AI-world while keeping humans first. We work as one team from kickoff to
            launch, same hands the whole way through.
          </p>
        </header>

        <div className="mm-about-founders__grid" role="list">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>

        <footer className="mm-about-founders__outro">
          <p>
            Less &ldquo;professional&rdquo;, more relatable. The work still has to be sharp — we just don&rsquo;t think
            you should need a punk attitude to get there.
          </p>
        </footer>
      </div>
    </section>
  );
}

function FounderCard({ founder }: { founder: Founder }) {
  const [hasImage, setHasImage] = useState(true);
  const initials = founder.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="mm-founder-card" role="listitem">
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
    </article>
  );
}
