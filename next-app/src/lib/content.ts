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
  description: string;
  image: string | null;
  link: string;
  tags?: string[];
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
  cta: CtaConfig;
  faqs: {
    title: string;
    items: {
      question: string;
      answer: string;
    }[];
  };
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
  site: {
    title: "Maser Media - Creative Agency",
    logo: "/assets/logo-maser-cloud-white-transparent.png",
    logoWidth: 1024,
    logoHeight: 519,
    logoAlt: "Maser Media",
    primaryCta: { text: "Book a call", href: "/contact" },
    secondaryCta: { text: "Send a message", href: "mailto:hello@masermedia.com" },
    startProjectCta: { text: "Start project", href: "/contact" },
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
      bookCall: { text: "Book a call", href: "/contact" },
    },
  },

  clients: {
    label: "They Trust Us",
    items: [
      { name: "Miller More Handiwork", logo: null },
      { name: "Paradox Customs", logo: null },
      { name: "Main Street Pub & Grub", logo: null },
      { name: "Cat Eye Construction", logo: null },
    ],
    supportingLabel: "",
    categories: [],
  },

  services: {
    title: "Serious Craft. Playful Energy.",
    subtitle:
      "Strategy, identity, websites, launch content, and motion built together so the brand feels clear from first impression to the follow-up.",
    items: [
      {
        title: "Brand",
        items: [
          {
            label: "Brand Strategy",
            description: "Clarify positioning, audience, and message so every launch decision has a sharper reason behind it.",
          },
          {
            label: "Logo & Identity",
            description: "Create a recognizable identity system that makes the brand easier to remember and easier to trust.",
          },
          {
            label: "Visual Systems",
            description: "Build a flexible design language and practical guidelines that keep the brand consistent across web, social, decks, and campaigns.",
          },
        ],
      },
      {
        title: "Web",
        items: [
          {
            label: "Web Design",
            description: "Shape websites and landing pages that make the offer clear, credible, and easier to act on.",
          },
          {
            label: "UI/UX",
            description: "Improve flows, hierarchy, and interaction patterns so users can move with less friction.",
          },
          {
            label: "Pitch Decks",
            description: "Turn the story into a focused deck that helps buyers, partners, or investors understand the value fast.",
          },
          {
            label: "E-commerce",
            description: "Create storefront experiences that make products easier to browse, compare, and buy.",
          },
        ],
      },
      {
        title: "Digital",
        items: [
          {
            label: "Photography",
            description: "Produce image systems that make the brand feel specific, current, and ownable.",
          },
          {
            label: "Video",
            description: "Filming, shooting, and motion assets that explain, sell, and hold attention across platforms.",
          },
          {
            label: "Strategic Marketing",
            description: "Turn goals, audience, offer, and channels into a focused plan so campaigns move with intent instead of guesswork.",
          },
          {
            label: "Creative AD Management",
            description: "Manage paid creative from concept to iteration, keeping hooks, visuals, landing pages, and performance signals connected.",
          },
          {
            label: "SEO",
            description: "Improve site structure, page copy, and content signals so search engines can understand the work and the right people can find it.",
          },
          {
            label: "Content Marketing",
            description: "Build useful articles, emails, social posts, and campaign assets around one clear message so the brand stays visible between launches.",
          },
          {
            label: "Email Marketing",
            description: "Create segmented email campaigns with sharper copy, stronger calls to action, and reporting that shows what people actually respond to.",
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
          "A website build focused on gathering local clients for home improvement and handiwork services.",
        image: null,
        link: "https://millermorehandiwork.com",
        tags: ["Local services", "Lead capture", "Web build"],
      },
      {
        title: "Helm - In-House PM SAAS",
        description:
          "A tool we are building ourselves to support how creative studios run client work. Description and link to come.",
        image: null,
        link: "/contact",
        tags: ["Internal build", "SaaS", "In progress"],
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
        quote: "Quote pending — kind words from the Miller More team coming soon.",
        name: "Miller More Handiwork",
        role: "Local home services, client since launch",
        avatar: null,
        rating: 5,
      },
      {
        quote: "Quote pending — hand-off from the Main Street Pub & Grub crew on the way.",
        name: "Main Street Pub & Grub",
        role: "Hospitality, brand and web partner",
        avatar: null,
        rating: 5,
      },
      {
        quote: "Quote pending — sharing notes from Arpit shortly.",
        name: "Arpit",
        role: "Founder, partner brand",
        avatar: null,
        rating: 5,
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

  footer: {
    nav: [
      { text: "Home", href: "/" },
      { text: "Work", href: "/work" },
      { text: "Pricing", href: "/pricing" },
      { text: "About", href: "/about" },
      { text: "Contact", href: "/contact" },
    ],
    copyright: "Maser Media Group. All rights reserved.",
  },

  pricing: {
    eyebrow: "Simple plans",
    title: "Simple ways to start.",
    subtitle: "Choose a focused sprint or ongoing creative support. Both are built around direct communication and visible progress.",
    plans: [
      {
        name: "Project",
        summary: "One clear goal, scoped tightly.",
        bestFor: "Best for: launches, redesigns, and one-off initiatives.",
        cadence: "Delivery rhythm: scoped kickoff, weekly progress, clean launch handoff.",
        price: "Quoted",
        bullets: [
          "Scoped and quoted before production starts",
          "Custom design and build, not cookie-cutter templates",
          "Launch-ready assets for outreach, sales, and campaigns",
        ],
        primaryCta: { text: "Book Call", href: "/contact" },
        secondaryCta: { text: "Email", href: "mailto:hello@masermedia.com" },
      },
      {
        name: "Retainer",
        summary: "Ongoing creative execution.",
        bestFor: "Best for: teams shipping regularly across web, product, and campaign work.",
        cadence: "Delivery rhythm: active queue, recurring check-ins, continuous iteration.",
        price: "$2k/month",
        bullets: [
          "Design, web, content, and strategy in one active queue",
          "Recurring check-ins with direct communication",
          "Built for teams that keep launching and improving",
        ],
        primaryCta: { text: "Book Call", href: "/contact" },
        secondaryCta: { text: "Email", href: "mailto:hello@masermedia.com" },
        featured: true,
      },
    ],
  },
};
