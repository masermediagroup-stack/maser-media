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
  trustedBy: {
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
}

export interface ServiceItem {
  title: string;
  items: {
    label: string;
    description: string;
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
  /** Optional card modifier for cover framing (helm = scale + translateX). */
  cardVariant?: 'helm' | 'main-street' | 'miller-more';
}

export interface TestimonialCarouselItem {
  quote: string;
  name: string;
  role: string;
  avatar: string | null;
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
    storyHighlight: "HERE WE ARE.",
    lead: "We work as one integrated studio so your story, visuals, and site stay aligned from first sketch to launch - fewer handoffs, clearer outcomes.",
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
      { name: "Harbor Lane Bakery", logo: null },
      { name: "Summit Auto Detail", logo: null },
      { name: "Riverside Dental Studio", logo: null },
    ],
    supportingLabel: "",
    categories: [],
  },

  services: {
    title: "Serious Craft. Playful Energy.",
    subtitle:
      "Strategy, identity, websites, launch content, and motion shaped as one system, so the brand feels clear the first time people see it and sharper every time they come back.",
    items: [
      {
        title: "Brand",
        items: [
          {
            label: "Brand Strategy",
            description: "Clarify the audience, offer, and point of view so every launch decision has a reason behind it.",
          },
          {
            label: "Logo & Identity",
            description: "Create a recognizable identity system that feels distinct, trustworthy, and easy to use everywhere.",
          },
          {
            label: "Visual Systems",
            description: "Build the design rules, assets, and guidelines that keep web, social, decks, and campaigns aligned.",
          },
        ],
      },
      {
        title: "Web",
        items: [
          {
            label: "Web Design",
            description: "Design websites and landing pages that make the offer clear, credible, and easy to act on.",
          },
          {
            label: "UI/UX",
            description: "Tighten flows, hierarchy, and interactions so people know where they are and what to do next.",
          },
          {
            label: "Pitch Decks",
            description: "Turn the story into a focused deck that helps buyers, partners, or investors understand the value quickly.",
          },
          {
            label: "E-commerce",
            description: "Shape storefront experiences that make products easier to browse, compare, and buy.",
          },
        ],
      },
      {
        title: "Digital",
        items: [
          {
            label: "Photography",
            description: "Produce image systems that make the brand feel specific, current, and unmistakably yours.",
          },
          {
            label: "Video",
            description: "Create filmed, edited, and motion-led assets that explain the offer and hold attention across platforms.",
          },
          {
            label: "Strategic Marketing",
            description: "Turn goals, audience, offer, and channels into a practical plan so campaigns move with intent.",
          },
          {
            label: "Creative AD Management",
            description: "Manage paid creative from concept through iteration, keeping hooks, visuals, landing pages, and performance signals connected.",
          },
          {
            label: "SEO",
            description: "Improve site structure, page copy, and content signals so search engines understand the work and the right people can find it.",
          },
          {
            label: "Content Marketing",
            description: "Build articles, emails, social posts, and campaign assets around one message so the brand stays visible between launches.",
          },
          {
            label: "Email Marketing",
            description: "Create segmented email campaigns with sharper copy, stronger calls to action, and reporting that shows what people respond to.",
          },
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
    subtitle: "A live list. It changes as we build.",
    items: [
      {
        title: "Miller More Handiwork",
        description:
          "A website build focused on gathering local clients for home improvement and handiwork services. - showing off a professional portfolio",
        image: null,
        logo: "/assets/miller-more-logo-clean.png",
        logoWidth: 1077,
        logoHeight: 597,
        cardLayout: "logo-panel",
        link: "https://millermorehandiwork.com",
        tags: ["Local services", "Lead capture", "Web build"],
        cardVariant: "miller-more",
      },
      {
        title: "Main Street Pub & Grub",
        description:
          "A neighborhood pub deserved an identity as welcoming as the room itself. We built the brand foundation - logo system, typography, and color.",
        image: null,
        logo: "/assets/main-street-logo-clean.png",
        logoWidth: 1326,
        logoHeight: 625,
        cardLayout: "logo-panel",
        link: "/work/main-street-pub-grub",
        tags: ["Brand identity", "Logo system", "Hospitality"],
        cardVariant: "main-street",
      },
      {
        title: "Helm In-House SAAS",
        titleLines: ["Helm", "In-House SAAS"],
        description:
          "A tool we are building ourselves to support how creative studios run client work.",
        image: null,
        logo: "/assets/helm-logo-clean.png",
        logoWidth: 794,
        logoHeight: 796,
        cardLayout: "logo-panel",
        link: "/work/helm-in-house-saas",
        tags: ["Internal build", "SaaS", "In progress"],
        cardVariant: "helm",
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
        quote: "Quote pending - kind words from the Miller More team coming soon.",
        name: "Miller More Handiwork",
        role: "Local home services, client since launch",
        avatar: "/assets/testimonial-avatar-01.svg",
        rating: 5,
      },
      {
        quote: "Quote pending - hand-off from the Main Street Pub & Grub crew on the way.",
        name: "Main Street Pub & Grub",
        role: "Hospitality, brand and web partner",
        avatar: "/assets/testimonial-avatar-02.svg",
        rating: 5,
      },
      {
        quote: "Quote pending - sharing notes from Arpit shortly.",
        name: "Arpit",
        role: "Founder, partner brand",
        avatar: "/assets/testimonial-avatar-03.svg",
        rating: 5,
      },
    ],
  },

  whyMaserMedia: {
    title: "Why Maser Media",
    subtitle:
      "Maser Media is built for companies, startups, and brands that need a polished brand presence without slow layers.",
    pullQuote: "One studio. Clear decisions. Launch-ready work.",
    items: [
      {
        id: "direct",
        title: "Direct communication",
        text: "You work close to the people making the decisions and the work, so feedback stays visible and turns into progress quickly.",
        icon: "direct",
        variant: "hero",
      },
      {
        id: "system",
        title: "One connected system",
        text: "Brand, website, content, and launch assets share one point of view, so the final experience feels aligned instead of stitched together.",
        icon: "system",
        variant: "card",
      },
      {
        id: "launch",
        title: "Built for launch pressure",
        text: "Every sprint is scoped around clear decisions, realistic timelines, reusable assets, and what your team needs to send next.",
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
