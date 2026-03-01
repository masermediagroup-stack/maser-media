/**
 * MASER MEDIA — All site content lives here.
 * Edit this file to add or change anything. No HTML editing required.
 */

const CONTENT = {
  // ─── Site & Nav ───────────────────────────────────────────────────
  site: {
    title: "Maser Media — Creative Agency",
    logo: "assets/logo-cloud-white.png",
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
  },

  // ─── Clients (logos or names) ──────────────────────────────────────
  clients: {
    label: "Trusted by brands building real products:",
    items: [
      { name: "Client 1", logo: null },  // Add "assets/clients/client1.png" for image
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

  // ─── Work / Portfolio ─────────────────────────────────────────────
  work: {
    title: "Selected work.",
    items: [
      {
        title: "Project Name",
        category: "Brand Identity",
        description: "Short description of the project.",
        image: null,  // "assets/work/project1.jpg" — or null for gradient placeholder
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
    title: "Let's create something together.",
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
