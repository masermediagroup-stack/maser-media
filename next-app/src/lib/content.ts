/**
 * MASER MEDIA — All site content lives here.
 * Edit this file to add or change anything. No HTML editing required.
 */

export interface SiteConfig {
  title: string;
  logo: string;
  logoLight: string;
  logoAlt: string;
  navCta: string;
}

export interface HeroConfig {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
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
  image: string | null;
  link: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

export interface CtaConfig {
  title: string;
  subtitle: string;
  button: { text: string; href: string };
}

export interface PlaygroundConfig {
  title: string;
  subtitle: string;
  tags: string[];
}

export interface LayersStripConfig {
  lines: string[];
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
    items: ServiceItem[];
  };
  playground: PlaygroundConfig;
  layersStrip: LayersStripConfig;
  work: {
    title: string;
    items: WorkItem[];
  };
  testimonials: {
    title: string;
    items: TestimonialItem[];
  };
  cta: CtaConfig;
  footer: FooterConfig;
}

export const CONTENT: Content = {
  // ─── Site & Nav ───────────────────────────────────────────────────
  site: {
    title: "Maser Media — Creative Agency",
    logo: "/assets/logo-cloud-white.png",
    logoLight: "/assets/logo-bold-blue.png",
    logoAlt: "Maser Media",
    navCta: "Get in Touch",
  },

  // ─── Hero ─────────────────────────────────────────────────────────
  hero: {
    badge: "Agency for brands that move.",
    title: "We craft brands and experiences that",
    titleHighlight: "convert.",
    subtitle: "Design & creative studio for startups and brands that need to ship fast, look credible, and stand out.",
    primaryCta: { text: "View Work", href: "#work" },
    secondaryCta: { text: "Book Call", href: "#contact" },
    pillNav: {
      showWork: { text: "View Work", href: "#work" },
      bookCall: { text: "Book a Call", href: "#contact" },
    },
  },

  // ─── Clients (logos or names) ──────────────────────────────────────
  clients: {
    label: "Trusted by brands building real products:",
    items: [
      { name: "Client 1", logo: null },
      { name: "Client 2", logo: null },
      { name: "Client 3", logo: null },
      { name: "Client 4", logo: null },
      { name: "Client 5", logo: null },
      { name: "Client 6", logo: null },
    ],
  },

  // ─── Services ─────────────────────────────────────────────────────
  services: {
    title: "What we do.",
    items: [
      {
        title: "Brand",
        items: ["Brand Strategy", "Logo & Identity", "Brand Guidelines", "Visual Systems"],
      },
      {
        title: "Design",
        items: ["Web Design", "UI/UX", "Pitch Decks", "Marketing Assets"],
      },
      {
        title: "Digital",
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
    title: "We do cool things for people on the internet.",
    subtitle:
      "Serious strategy, playful execution. This is where brand, design, and digital crash together into work people actually care about.",
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
      "Fun to work with",
    ],
  },

  // ─── Layers strip (under footer) ────────────────────────────────────
  layersStrip: {
    lines: [
      "YES WE CAN. YES WE SHIP.",
      "LAYERS OF STRATEGY. LAYERS OF CRAFT.",
      "PROFESSIONAL ON PAPER. FUN ON THE INTERNET.",
    ],
  },

  // ─── Work / Portfolio ─────────────────────────────────────────────
  work: {
    title: "Selected work.",
    items: [
      {
        title: "Project Name",
        category: "Brand Identity",
        description: "Short description of the project.",
        image: null,
        link: "#",
      },
      {
        title: "Miller More Handi Work",
        category: "Web Design",
        description: "Web design for Expert Service Remodeler.",
        image: null,
        link: "https://millermorehandiwork.com",
      },
      {
        title: "Project Name",
        category: "Campaign",
        description: "Short description of the project.",
        image: null,
        link: "#",
      },
    ],
  },

  // ─── Testimonials ─────────────────────────────────────────────────
  testimonials: {
    title: "What clients say.",
    items: [
      {
        quote: "Working with Maser Media was a game-changer. They understood our vision and delivered beyond expectations.",
        name: "Client Name",
        role: "Role, Company",
      },
      {
        quote: "Fast, creative, and strategic. They turned our ideas into a brand that resonates.",
        name: "Client Name",
        role: "Role, Company",
      },
      {
        quote: "Professional, responsive, and the quality speaks for itself. Highly recommend.",
        name: "Client Name",
        role: "Role, Company",
      },
    ],
  },

  // ─── CTA ──────────────────────────────────────────────────────────
  cta: {
    title: "Let's make something unforgettable.",
    subtitle: "Tell us about your project. We'll show you how we can help.",
    button: { text: "Book a Call", href: "mailto:hello@masermedia.com" },
  },

  // ─── Footer ───────────────────────────────────────────────────────
  footer: {
    nav: [
      { text: "Services", href: "#services" },
      { text: "Work", href: "#work" },
      { text: "Contact", href: "#contact" },
    ],
    copyright: "Maser Media Group. All rights reserved.",
  },
};
