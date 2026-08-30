/**
 * MASER MEDIA - site content.
 * Keep rendered hero changes in the Hero component, not here.
 */

export interface SiteConfig {
  title: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  logoAlt: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  startProjectCta: { text: string; href: string };
}

export interface HeroConfig {
  layout?: 'centered' | 'editorial';
  badge: string;
  storyTitle: string;
  storyHighlight: string;
  lead: string;
  trustStrip: string[];
  trustedBy?: {
    prefix: string;
    rotatingWords: string[];
    ariaLabel: string;
  };
  heroLogo?: { src: string; alt: string; width: number; height: number };
  asciiLogo?: {
    enabled?: boolean;
    charset?: string;
    density?: number;
    speed?: number;
    colorMode?: 'grayscale' | 'matrix' | 'amber' | 'sepia' | 'cool-blue' | 'neon' | 'custom';
    customColor?: string;
    interactive?: boolean;
  };
  pillNav: {
    showWork: { text: string; href: string };
    bookCall: { text: string; href: string };
  };
}

export interface ClientItem {
  name: string;
  logo: string | null;
  href?: string;
}

export interface ServiceItem {
  title: string;
  /** One-line pillar lede. Item rows are titles only. */
  lede: string;
  items: {
    label: string;
  }[];
}

export interface WorkItem {
  title: string;
  /** Optional two-line card heading (line 1 + line 2). */
  titleLines?: readonly [string, string];
  description: string;
  image: string | null;
  link: string;
  tags?: string[];
  /** Homepage stacked card layout: white panel + logo (no cover image). */
  cardLayout?: 'cover' | 'logo-panel';
  /** Client logo for `logo-panel` cards (right-aligned on white). */
  logo?: string;
  /** Intrinsic logo dimensions (transparent PNG) for `next/image` sizing. */
  logoWidth?: number;
  logoHeight?: number;
  /** Optional card modifier for logo-panel framing. */
  cardVariant?: 'main-street' | 'miller-more';
}

export interface TestimonialCarouselItem {
  quote: string;
  name: string;
  role: string;
  /** Client logo shown bottom-right on the card. */
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
  /** Render logo as neutral ink (no brand color). */
  logoMonochrome?: boolean;
  rating?: number;
}

export interface TestimonialsConfig {
  eyebrow: string;
  title: string;
  prevLabel: string;
  nextLabel: string;
  items: TestimonialCarouselItem[];
}

export interface CtaConfig {
  title: string;
  subtitle: string;
  contactButtonLabel: string;
}

export interface PlaygroundConfig {
  title: string;
  subtitle: string;
  tags: string[];
}

export interface FooterConfig {
  nav: { text: string; href: string }[];
  copyright: string;
}

export interface Content {
  site: SiteConfig;
  hero: HeroConfig;
  clients: {
    label: string;
    items: ClientItem[];
    supportingLabel: string;
    categories: string[];
  };
  services: {
    title: string;
    subtitle?: string;
    items: ServiceItem[];
  };
  playground: PlaygroundConfig;
  work: {
    title: string;
    subtitle: string;
    viewAllLabel: string;
    items: WorkItem[];
  };
  testimonials: TestimonialsConfig;
  trust: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: {
      title: string;
      text: string;
    }[];
  };
  whyMaserMedia: {
    title: string;
    subtitle: string;
    pullQuote: string;
    items: {
      id: string;
      title: string;
      text: string;
      icon: 'direct' | 'system' | 'launch';
      variant: 'hero' | 'accent' | 'card';
    }[];
  };
  cta: CtaConfig;
  faqs: {
    title: string;
    items: {
      question: string;
      answer: string;
    }[];
  };
  footer: FooterConfig;
  aboutPage: {
    title: string;
    lead: string;
    foundersOutro: string;
  };
  workPage: {
    title: string;
    lead: string;
  };
}

export const CONTENT: Content = {
  site: {
    title: "Maser Media - Creative Agency",
    logo: "/assets/logo-maser-cloud-white-transparent.png",
    logoWidth: 1024,
    logoHeight: 519,
    logoAlt: "Maser Media",
    primaryCta: { text: "Book a call", href: "#open-contact" },
    secondaryCta: { text: "Send a message", href: "mailto:hello@masermedia.com" },
    startProjectCta: { text: "Start project", href: "#open-contact" },
  },

  hero: {
    layout: 'editorial',
    badge: "One crew. Brand, product, and web.",
    storyTitle: "Need one creative team?",
    storyHighlight: "Here we are.",
    lead: "Fewer handoffs. Clearer outcomes.",
    trustStrip: ["Startups shipping fast", "Service brands going digital", "Founder-led products"],
    heroLogo: {
      src: "/assets/logo-maser-cloud-white-transparent.png",
      alt: "Maser Media",
      width: 1024,
      height: 519,
    },
    asciiLogo: {
      enabled: false,
      charset: " .,:;i1tfLCG08@",
      density: 1,
      speed: 0.75,
      colorMode: "cool-blue",
      customColor: "#f4f7ff",
      interactive: true,
    },
    pillNav: {
      showWork: { text: "View work", href: "/work" },
      bookCall: { text: "Book a call", href: "#open-contact" },
    },
  },

  clients: {
    label: "They Trust Us",
    items: [
      { name: "Miller More Handiwork", logo: null },
      { name: "Paradox Customs", logo: null },
      { name: "Main Street Pub & Grub", logo: null },
      { name: "Cat Eye Construction", logo: null },
      { name: "319Junk", logo: null, href: "https://319junk.com" },
    ],
    supportingLabel: "",
    categories: [],
  },

  services: {
    title: "Serious Craft. Playful Energy.",
    items: [
      {
        title: "Brand",
        lede: "The story, the mark, and the rules so the site and the campaign don’t split later.",
        items: [
          { label: "Brand strategy" },
          { label: "Logo & identity" },
          { label: "Visual systems" },
        ],
      },
      {
        title: "Web",
        lede: "Pages that make the offer obvious and still look like you.",
        items: [
          { label: "Web design" },
          { label: "UI/UX" },
          { label: "Pitch decks" },
          { label: "E-commerce" },
        ],
      },
      {
        title: "Digital",
        lede: "Photo, film, and the campaigns that keep people seeing you after the site ships.",
        items: [
          { label: "Photography" },
          { label: "Video" },
          { label: "Marketing strategy" },
          { label: "Paid ads" },
          { label: "SEO" },
          { label: "Content" },
          { label: "Email" },
        ],
      },
    ],
  },

  playground: {
    title: "Fast communication. Senior taste. No vendor maze.",
    subtitle:
      "Maser Media works close to the decision maker, keeps feedback loops short, and turns scattered ideas into launch-ready brand, web, and content systems.",
    tags: [
      "Brand strategy",
      "Launch campaigns",
      "Web & product design",
      "Content systems",
      "Funnels that convert",
      "Creative direction",
      "Landing pages",
      "Storytelling",
      "Internet experiments",
      "Optimizations",
      "Cool things online",
      "One team ownership",
    ],
  },

  work: {
    title: "Our Work",
    subtitle: "Launches we've shaped with founders, local brands, and teams who needed one crew.",
    viewAllLabel: "See the work",
    items: [
      {
        title: "Miller More Handiwork",
        description:
          "A portfolio-forward site for a local handyman brand—built to turn search traffic into booked jobs.",
        image: null,
        logo: "/assets/miller-more-logo-clean.png",
        logoWidth: 1077,
        logoHeight: 597,
        cardLayout: "logo-panel",
        link: "https://millermorehandiwork.com",
        tags: ["UI/UX", "SEO", "Web build"],
        cardVariant: "miller-more",
      },
      {
        title: "Main Street Pub & Grub",
        description:
          "A neighborhood pub identity as welcoming as the room itself—logo system, typography, and color built to travel across menu, signage, and launch.",
        image: null,
        logo: "/assets/main-street-logo-clean.png",
        logoWidth: 1326,
        logoHeight: 625,
        cardLayout: "logo-panel",
        link: "/work/main-street-pub-grub",
        tags: ["Brand identity", "Logo system", "Hospitality"],
        cardVariant: "main-street",
      },
    ],
  },

  testimonials: {
    eyebrow: "",
    title: "Loved by you",
    prevLabel: "Prev",
    nextLabel: "Next",
    items: [
      {
        quote: "Helped me get my website running, and were collaborative through the entire process. Grateful for their creativity & turnaround.",
        name: "Miller More Handiwork",
        role: "Local home services, client since launch",
        logo: "/assets/miller-more-logo-clean.png",
        logoWidth: 1077,
        logoHeight: 597,
        rating: 5,
      },
      {
        quote: "Extremely grateful for Tyler & Grayson's hard work on getting the project perfect for us!",
        name: "Main Street Pub & Grub",
        role: "Hospitality, brand and web partner",
        logo: "/assets/main-street-logo-clean.png",
        logoWidth: 1326,
        logoHeight: 625,
        rating: 5,
      },
      {
        quote: "Relaxed, hyper-adaptive, always got the work done; and done well.",
        name: "Arpit",
        role: "Founder, Paradox Customs",
        logo: "/assets/paradox-customs-logo.png",
        logoWidth: 1200,
        logoHeight: 400,
        logoMonochrome: true,
        rating: 5,
      },
    ],
  },

  whyMaserMedia: {
    title: "Why it's us",
    subtitle: "Tyler on the look. Grayson on the story. Same two people the whole way.",
    pullQuote: "Two creatives. Tired of watching shops drop the ball.",
    items: [
      {
        id: "direct",
        title: "You talk to us.",
        text: "Feedback hits the people making it.",
        icon: "direct",
        variant: "hero",
      },
      {
        id: "system",
        title: "One job.",
        text: "Brand, site, and launch stay together.",
        icon: "system",
        variant: "card",
      },
      {
        id: "launch",
        title: "Ready to send.",
        text: "We scope for what you need next week.",
        icon: "launch",
        variant: "accent",
      },
    ],
  },

  trust: {
    eyebrow: "Why Maser Media",
    title: "Built as the response to clients being let down.",
    subtitle:
      "Maser Media was created as a biproduct of two creatives seeing other companies let clients down. We strive to be the change in the industry that accelerates businesses in organic and vibrant ways.",
    items: [
      {
        title: "Small team, fast loops",
        text: "You work close to the people doing the thinking and making, so feedback does not disappear into a chain of handoffs.",
      },
      {
        title: "Brand and web together",
        text: "Strategy, identity, content, and site execution stay aligned, which keeps the final experience from feeling stitched together.",
      },
      {
        title: "Built for launch pressure",
        text: "The work is scoped around clear decisions, realistic timelines, and assets that are ready for outreach, campaigns, and sales conversations.",
      },
    ],
  },

  cta: {
    title: "Build your future with us",
    subtitle: "",
    contactButtonLabel: "Start a project",
  },

  faqs: {
    title: "Questions before we start",
    items: [
      {
        question: "Who is Maser Media for?",
        answer: "Companies, startups, local service brands, and founder-led teams that need brand, web, content, or motion work to feel sharper and ship quickly.",
      },
      {
        question: "Can you work locally and remotely?",
        answer: "Yes. The studio is built for direct communication whether the client is local or across the world.",
      },
      {
        question: "Do we need a finished brief?",
        answer: "No. Bring the goal, the deadline, and what feels unclear. We can help shape the brief before design and build work begins.",
      },
      {
        question: "What can be ready first?",
        answer: "A focused landing page, refreshed homepage, pitch deck, visual identity pass, or launch asset kit can usually move fastest.",
      },
    ],
  },

  aboutPage: {
    title: "Two creatives, tired of seeing people fall short.",
    lead:
      "Brand, web, and launch as one studio | same crew, no handoffs.",
    foundersOutro:
      "Less “professional”, more relatable. The work still has to be sharp - we just don’t think you should need a punk attitude to get there.",
  },

  workPage: {
    title: "Proof that clarity can still feel cinematic.",
    lead:
      "A focused look at the launch surfaces we shape: websites, product stories, identities, and digital systems.",
  },

  footer: {
    nav: [
      { text: "Home", href: "/" },
      { text: "Work", href: "/work" },
      { text: "About", href: "/about" },
      { text: "Contact", href: "#open-contact" },
    ],
    copyright: "Maser Media Group. All rights reserved.",
  },
};
