/**
 * MASER MEDIA — All site content lives here.
 * Edit this file to add or change anything. No HTML editing required.
 */

export interface SiteConfig {
  title: string;
  logo: string;
  /** Matches the PNG’s pixel dimensions (used by next/image for aspect ratio) */
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
  /** Single supporting paragraph under the headline */
  lead: string;
  trustStrip: string[];
  trustedBy: {
    prefix: string;
    rotatingWords: string[];
    /** Full claim for screen readers (static, no rotation spam) */
    ariaLabel: string;
  };
  /** When set, shows logo above hero headline (optional asset) */
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
}

export interface ServiceItem {
  title: string;
  items: string[];
}

export interface WorkItem {
  title: string;
  category: string;
  description: string;
  outcome: string;
  timeframe: string;
  role: string;
  image: string | null;
  link: string;
}

export interface TestimonialCarouselItem {
  quote: string;
  name: string;
  role: string;
  /** Optional image URL; null uses a gradient placeholder */
  avatar: string | null;
  /** 1–5, default 5 */
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
  primaryButton: { text: string; href: string };
  secondaryButton: { text: string; href: string };
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
    categories: string[];
    items: WorkItem[];
  };
  testimonials: TestimonialsConfig;
  cta: CtaConfig;
  footer: FooterConfig;
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    plans: {
      name: string;
      summary: string;
      bestFor: string;
      cadence: string;
      price: string;
      bullets: string[];
      primaryCta: { text: string; href: string };
      secondaryCta: { text: string; href: string };
      featured?: boolean;
    }[];
  };
}

export const CONTENT: Content = {
  // ─── Site & Nav ───────────────────────────────────────────────────
  site: {
    title: "Maser Media — Creative Agency",
    // Same transparent asset as hero — logo-cloud-white.png had a solid fill behind the wordmark
    logo: "/assets/logo-maser-cloud-white-transparent.png",
    logoWidth: 1024,
    logoHeight: 519,
    logoAlt: "Maser Media",
    primaryCta: { text: "Book a call", href: "/contact" },
    secondaryCta: { text: "Send a message", href: "mailto:hello@masermedia.com" },
    startProjectCta: { text: "Start project", href: "/contact" },
  },

  // ─── Hero ─────────────────────────────────────────────────────────
  hero: {
    layout: 'editorial',
    badge: "One crew. Brand, product, and web.",
    storyTitle: "Need one creative team?",
    storyHighlight: "HERE WE ARE.",
    lead: "We work as one integrated studio so your story, visuals, and site stay aligned from first sketch to launch—fewer handoffs, clearer outcomes.",
    trustStrip: ["Startups shipping fast", "Service brands going digital", "Founder-led products"],
    trustedBy: {
      prefix: "Trusted by 1k+",
      rotatingWords: ["founders", "teams", "brands"],
      ariaLabel: "Trusted by over one thousand founders, teams, and brands",
    },
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
      showWork: { text: "View work", href: "/#work" },
      bookCall: { text: "Book a call", href: "/contact" },
    },
  },

  // ─── Clients (logos or names) ──────────────────────────────────────
  clients: {
    label: "Trusted by teams that care about craft and conversion:",
    items: [
      { name: "Miller More Handiwork", logo: null },
      { name: "Local service brands", logo: null },
      { name: "Early-stage SaaS teams", logo: null },
      { name: "Founder-led eCommerce", logo: null },
      { name: "Marketing consultants", logo: null },
      { name: "Growth agencies", logo: null },
    ],
  },

  // ─── Services ─────────────────────────────────────────────────────
  services: {
    title: "Serious Craft. Playful Energy.",
    subtitle: "",
    items: [
      {
        title: "Brand",
        items: ["Brand Strategy", "Logo & Identity", "Brand Guidelines", "Visual Systems"],
      },
      {
        title: "Product",
        items: ["Web Design", "UI/UX", "Pitch Decks", "Marketing Assets"],
      },
      {
        title: "Web",
        items: ["Websites", "Landing Pages", "E-commerce", "Portfolios"],
      },
      {
        title: "Content",
        items: ["Photography", "Video", "Illustration", "Animation"],
      },
    ],
  },

  // ─── Internet Playground / Crash-style section ──────────────────────
  playground: {
    title: "We build with teams, not around them.",
    subtitle:
      "Our process is collaborative and direct. Fewer handoffs, tighter loops, stronger outcomes.",
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

  // ─── Work / Portfolio ─────────────────────────────────────────────
  work: {
    title: "Projects that shipped with clarity.",
    subtitle: "Browse by outcome focus and see the role we played, timeline, and business impact.",
    categories: ["All", "Website", "Branding", "Product", "Motion"],
    items: [
      {
        title: "Miller More Handiwork",
        category: "Website",
        description: "Rebuilt their site around service clarity, local trust, and clean lead capture.",
        outcome: "Clearer service narrative and stronger lead intent from homepage traffic.",
        timeframe: "3 weeks",
        role: "Brand + Web design + Build",
        image: null,
        link: "https://millermorehandiwork.com",
      },
      {
        title: "Riverlight Studio",
        category: "Website",
        description: "Portfolio and inquiry flow for a creative studio—fast loads, case-study clarity, and one clear CTA.",
        outcome: "Higher inquiry quality and less back-and-forth before the first call.",
        timeframe: "4 weeks",
        role: "Web design + Build",
        image: null,
        link: "/#contact",
      },
      {
        title: "Northline Tools",
        category: "Website",
        description: "Product-led marketing site with sharper positioning, spec comparison, and distributor-ready pages.",
        outcome: "Stronger self-serve discovery for buyers comparing options online.",
        timeframe: "5 weeks",
        role: "UX + Web + Content",
        image: null,
        link: "/#contact",
      },
      {
        title: "Founder Product Narrative Sprint",
        category: "Branding",
        description: "Positioned a founder-led product with a tighter story and conversion-oriented messaging.",
        outcome: "Stronger positioning for investor and customer conversations.",
        timeframe: "10 days",
        role: "Narrative strategy + identity system",
        image: null,
        link: "/#contact",
      },
      {
        title: "SaaS Landing Refresh",
        category: "Product",
        description: "Redesigned onboarding and pricing story for faster buyer confidence.",
        outcome: "Cleaner flow from first impression to pricing action.",
        timeframe: "2 weeks",
        role: "UI/UX + conversion copy",
        image: null,
        link: "/#contact",
      },
      {
        title: "Launch Motion Kit",
        category: "Motion",
        description: "Created reusable motion assets for product updates, social, and launch pages.",
        outcome: "Consistent launch quality across channels without extra production drag.",
        timeframe: "2 weeks",
        role: "Motion direction + asset library",
        image: null,
        link: "/#contact",
      },
    ],
  },

  // ─── Testimonials (carousel — edit copy here) ─────────────────────
  testimonials: {
    eyebrow: "TESTIMONIALS",
    title: "Loved by you",
    prevLabel: "Prev",
    nextLabel: "Next",
    items: [
      {
        quote:
          "Maser Media is the real deal. They took our half-formed product story and turned it into a brand and site we actually want to share. Deadlines were clear and delivery felt like one team, not five vendors.",
        name: "Rachel Kim",
        role: "Co-founder, Lumina Health",
        avatar: null,
        rating: 5,
      },
      {
        quote:
          "We finally stopped explaining the same thing to three different designers. One crew, one standard—our launch assets and web experience finally match how we talk in the room.",
        name: "Marcus Webb",
        role: "CEO, Northline Tools",
        avatar: null,
        rating: 5,
      },
      {
        quote:
          "Fast, opinionated, and kind. They pushed back when our copy was vague and celebrated when we landed on something sharp. That’s the kind of creative partner you want before a raise.",
        name: "Priya Desai",
        role: "Founder, Ledgerline",
        avatar: null,
        rating: 5,
      },
      {
        quote:
          "Our old site looked fine but didn’t convert. The new flow and messaging made the value obvious in seconds. Leads are up and we’re not embarrassed to send the link anymore.",
        name: "Jordan Ellis",
        role: "Head of Growth, Fieldcraft",
        avatar: null,
        rating: 5,
      },
      {
        quote:
          "They treat the work like it’s their own. Responsive, detail-oriented, and weirdly calm under pressure. If you need creative that ships without drama, start here.",
        name: "Sam Okonkwo",
        role: "Partner, Riverlight Studio",
        avatar: null,
        rating: 5,
      },
    ],
  },

  // ─── CTA ──────────────────────────────────────────────────────────
  cta: {
    title: "Need a team that can think and execute?",
    subtitle: "Choose the path that fits your style. We reply fast and move faster once aligned.",
    primaryButton: { text: "Book a call", href: "/contact" },
    secondaryButton: { text: "Send a message", href: "mailto:hello@masermedia.com" },
  },

  // ─── Footer ───────────────────────────────────────────────────────
  footer: {
    nav: [
      { text: "Home", href: "/" },
      { text: "Projects", href: "/#work" },
      { text: "Pricing", href: "/pricing" },
      { text: "About", href: "/#about" },
      { text: "Contact", href: "/contact" },
    ],
    copyright: "Maser Media Group. All rights reserved.",
  },
  pricing: {
    eyebrow: "Simple plans",
    title: "Pricing that helps you decide quickly.",
    subtitle: "Choose a scoped project or ongoing retainer, both with direct communication and clear delivery.",
    plans: [
      {
        name: "Project",
        summary: "One goal. One timeline. Done right.",
        bestFor: "Best for: launches, redesigns, and one-off initiatives.",
        cadence: "Delivery rhythm: scoped kickoff, weekly updates, launch handoff.",
        price: "Quoted",
        bullets: [
          "Scoped, quoted, and delivered in 2-4 weeks flat.",
          "Custom code, not cookie-cutter templates",
          "Launch ready assets that will drive real results",
        ],
        primaryCta: { text: "Book Call", href: "/contact" },
        secondaryCta: { text: "Email", href: "mailto:hello@masermedia.com" },
      },
      {
        name: "Retainer",
        summary: "Ongoing execution. Relentless output.",
        bestFor: "Best for: teams shipping regularly across web, product, and campaign work.",
        cadence: "Delivery rhythm: active queue, recurring check-ins, continuous iteration.",
        price: "$2k/month",
        bullets: [
          "Design, dev and strategy - no bottlenecks",
          "You scale, we keep up - month after month",
          "Built to move fast and hit deadlines, period",
        ],
        primaryCta: { text: "Book Call", href: "/contact" },
        secondaryCta: { text: "Email", href: "mailto:hello@masermedia.com" },
        featured: true,
      },
    ],
  },
};
