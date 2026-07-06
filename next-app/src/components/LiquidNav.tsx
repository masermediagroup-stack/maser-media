"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronRight, Menu, X } from "lucide-react";
import { ContactFlow } from "@/components/ContactFlow";
import { OPEN_CONTACT_MODAL_EVENT } from "@/lib/contactModalEvents";

const NAV_ITEMS = [
  { label: "OUR WORK", href: "/work" },
  { label: "ABOUT US", href: "/about" },
] as const;

/** Match `.liquid-nav-bubble` / drawer breakpoint in `globals.css`. */
const NAV_NARROW_MAX_PX = 920;
/** Same default as Lightswind `MorphingNavigation` — compact pill after this scroll. */
const MORPH_SCROLL_THRESHOLD = 100;

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

/** Ease-out–heavy cubic-bezier for expand flip (matches gentler bar morph feel). */
const LIQUID_NAV_FLIP_EASE = [0.16, 1, 0.3, 1] as const;
const LIQUID_NAV_FLIP_DURATION = 0.5;
/** Stagger between logo → links → contact (~70ms). */
const LIQUID_NAV_FLIP_STAGGER = 0.072;

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

type Props = { entrance?: boolean; introReady?: boolean };

export function LiquidNav({ entrance, introReady = !entrance }: Props) {
  const reduceMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [morphCompact, setMorphCompact] = useState(false);
  /** Increments when leaving morph on wide viewports (batched with `morphCompact` in scroll) so flip runs on first paint. */
  const [expandFlipNonce, setExpandFlipNonce] = useState(0);

  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /** Mirrors `morphCompact` for scroll handler (avoids nested setState + strict double-invoke). */
  const morphCompactRef = useRef(morphCompact);

  useEffect(() => {
    morphCompactRef.current = morphCompact;
  }, [morphCompact]);

  useEffect(() => {
    const onOpenFromApp = () => setContactOpen(true);
    window.addEventListener(OPEN_CONTACT_MODAL_EVENT, onOpenFromApp);
    return () => window.removeEventListener(OPEN_CONTACT_MODAL_EVENT, onOpenFromApp);
  }, []);

  useEffect(() => {
    if (!open && !contactOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (contactOpen) setContactOpen(false);
        else if (open) setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, contactOpen]);

  /* Scroll-lock */
  useEffect(() => {
    document.body.style.overflow = open || contactOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, contactOpen]);

  /* Wide layout hint + Lightswind-style morph on wide viewports after scroll */
  useEffect(() => {
    const onResize = () => {
      setIsNarrow(window.innerWidth <= NAV_NARROW_MAX_PX);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsScrolled(y > 20);
        const nextCompact = !isNarrow && y >= MORPH_SCROLL_THRESHOLD;
        const prevCompact = morphCompactRef.current;
        if (prevCompact && !nextCompact && !isNarrow) {
          setExpandFlipNonce((n) => n + 1);
        }
        if (prevCompact && !nextCompact) {
          setOpen(false);
        }
        morphCompactRef.current = nextCompact;
        setMorphCompact(nextCompact);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isNarrow]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || reduceMotion) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (coarsePointer) return;

    let cancelled = false;
    let cleanup = () => {};

    const run = async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !navRef.current) return;

      const targets = Array.from(
        navRef.current.querySelectorAll<HTMLElement>(".liquid-nav-link, .liquid-nav-contact"),
      );
      const cleanups: Array<() => void> = [];

      targets.forEach((target) => {
        const setX = gsap.quickTo(target, "x", { duration: 0.38, ease: "power3.out" });
        const setY = gsap.quickTo(target, "y", { duration: 0.38, ease: "power3.out" });

        const onPointerMove = (event: PointerEvent) => {
          const rect = target.getBoundingClientRect();
          const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
          const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
          setX(Math.max(-8, Math.min(8, dx)));
          setY(Math.max(-8, Math.min(8, dy)));
        };

        const onPointerLeave = () => {
          setX(0);
          setY(0);
        };

        target.addEventListener("pointermove", onPointerMove, { passive: true });
        target.addEventListener("pointerleave", onPointerLeave);
        target.addEventListener("blur", onPointerLeave);

        cleanups.push(() => {
          target.removeEventListener("pointermove", onPointerMove);
          target.removeEventListener("pointerleave", onPointerLeave);
          target.removeEventListener("blur", onPointerLeave);
          gsap.set(target, { x: 0, y: 0, clearProps: "transform" });
        });
      });

      cleanup = () => {
        cleanups.forEach((cleanupTarget) => cleanupTarget());
      };
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduceMotion]);

  /* Focus management — drawer */
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      drawerCloseRef.current?.focus();
    } else {
      (triggerRef.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  /* Focus management — modal */
  useEffect(() => {
    if (contactOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      modalCloseRef.current?.focus();
    } else {
      (triggerRef.current as HTMLElement | null)?.focus?.();
    }
  }, [contactOpen]);

  /* Focus trap — modal */
  useEffect(() => {
    if (!contactOpen) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;
      const items = getFocusable(modalRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [contactOpen]);

  /* Focus trap — drawer */
  useEffect(() => {
    if (!open) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;
      const items = getFocusable(drawerRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [open]);

  const morphing = morphCompact && !isNarrow;
  const fullscreenMenuOpen = open && (morphing || isNarrow);
  const fullscreenClipOrigin = isNarrow
    ? "calc(100% - 2.125rem) 2.125rem"
    : "50% 3.1rem";
  const closedFullscreenClip = `circle(0px at ${fullscreenClipOrigin})`;
  const openFullscreenClip = `circle(150% at ${fullscreenClipOrigin})`;

  /** After first wide expand-from-morph (`expandFlipNonce`), play 3D flip; `prefers-reduced-motion` skips rotation. */
  const flipFromMorphExit = expandFlipNonce > 0 && !reduceMotion;
  const flipInitial = flipFromMorphExit ? { opacity: 0, rotateX: -55 } : false;
  const flipAnimate = { opacity: 1, rotateX: 0 };
  const flipTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          delay,
          duration: LIQUID_NAV_FLIP_DURATION,
          ease: LIQUID_NAV_FLIP_EASE,
        };
  const navHiddenForIntro = entrance && (!hydrated || !introReady);

  return (
    <>
      <motion.nav
        ref={navRef}
        className={`liquid-nav${isScrolled && !morphing ? " liquid-nav--expanded" : ""}${morphing ? " liquid-nav--morph" : ""}`}
        aria-label="Primary navigation"
        initial={entrance ? { y: -36, opacity: 0 } : false}
        animate={navHiddenForIntro ? { y: -36, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={
          entrance ? { duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }
        }
      >
        <div className="liquid-nav-bubble-shell">
          <div className="liquid-nav-bubble">
            <motion.div
              className="liquid-nav-bubble-wide"
              style={{
                perspective: reduceMotion ? undefined : 1000,
              }}
            >
              <Link href="/#hero" className="liquid-nav-logo" aria-label="Maser Media hero">
                <motion.span
                  className="liquid-nav-flip-inner"
                  initial={flipInitial}
                  animate={flipAnimate}
                  transition={flipTransition(0)}
                  style={{ transformOrigin: "50% 0%" }}
                >
                  <Image
                    src="/assets/MaserMedia-White-SVG_1.svg"
                    alt=""
                    width={120}
                    height={32}
                    className="liquid-nav-logo-img"
                    priority
                  />
                </motion.span>
              </Link>
              <div className="liquid-nav-bubble-main" inert={morphing ? true : undefined}>
                {NAV_ITEMS.map((item, index) => (
                  <Link key={item.label} href={item.href} className="liquid-nav-link">
                    <motion.span
                      className="liquid-nav-flip-inner"
                      initial={flipInitial}
                      animate={flipAnimate}
                      transition={flipTransition(0.04 + (index + 1) * LIQUID_NAV_FLIP_STAGGER)}
                      style={{ transformOrigin: "50% 0%" }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
                <button type="button" className="liquid-nav-contact liquid-nav-contact--inline mm-tactile-button" onClick={() => setContactOpen(true)}>
                  <motion.span
                    className="liquid-nav-flip-inner"
                    initial={flipInitial}
                    animate={flipAnimate}
                    transition={flipTransition(0.04 + (NAV_ITEMS.length + 1) * LIQUID_NAV_FLIP_STAGGER)}
                    style={{ transformOrigin: "50% 0%" }}
                  >
                    <ArrowRight className="liquid-contact-arrow" size={18} aria-hidden />
                    <span className="liquid-contact-text">Contact</span>
                  </motion.span>
                </button>
              </div>
              <button
                type="button"
                className="liquid-nav-bubble-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-nav-drawer"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
              </button>
            </motion.div>
          </div>
        </div>

        <button type="button" className="liquid-nav-contact liquid-nav-contact--mobile mm-tactile-button" onClick={() => setContactOpen(true)}>
          <ArrowRight className="liquid-contact-arrow" size={18} aria-hidden />
          <span className="liquid-contact-text">Contact</span>
        </button>

        <button
          type="button"
          className="liquid-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className={`liquid-nav-backdrop${morphing ? " liquid-nav-backdrop--morph" : ""}`}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              aria-label="Close menu"
            />
            <motion.aside
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              layout={false}
              className={
                fullscreenMenuOpen
                  ? "liquid-nav-drawer liquid-nav-drawer--fullscreen"
                  : "liquid-nav-drawer"
              }
              initial={
                fullscreenMenuOpen
                  ? {
                      opacity: reduceMotion ? 1 : 0,
                      clipPath: reduceMotion ? openFullscreenClip : closedFullscreenClip,
                    }
                  : { x: reduceMotion ? 0 : "100%" }
              }
              animate={
                fullscreenMenuOpen
                  ? { opacity: 1, clipPath: openFullscreenClip }
                  : { x: 0 }
              }
              exit={
                fullscreenMenuOpen
                  ? {
                      opacity: reduceMotion ? 1 : 0,
                      clipPath: reduceMotion ? openFullscreenClip : closedFullscreenClip,
                    }
                  : { x: reduceMotion ? 0 : "100%" }
              }
              transition={{
                duration: reduceMotion ? 0 : fullscreenMenuOpen ? 0.95 : 0.3,
                ease: fullscreenMenuOpen ? [0.25, 0.46, 0.45, 0.94] : [0.22, 1, 0.36, 1],
              }}
            >
              <button
                ref={drawerCloseRef}
                type="button"
                className="liquid-nav-drawer-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={2} aria-hidden />
              </button>
              {fullscreenMenuOpen ? (
                <div className="liquid-nav-drawer-fs-inner">
                  <Link
                    href="/#hero"
                    className="liquid-nav-drawer-fs-logo"
                    aria-label="Maser Media hero"
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src="/assets/MaserMedia-White-SVG_1.svg"
                      alt=""
                      width={120}
                      height={32}
                      className="liquid-nav-drawer-fs-logo-img"
                    />
                  </Link>
                  <div className="liquid-nav-drawer-fs-links">
                    {NAV_ITEMS.map((item, index) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="liquid-nav-drawer-link liquid-nav-drawer-link--fullscreen"
                        onClick={() => setOpen(false)}
                        style={{
                          transitionDelay: reduceMotion ? "0s" : `${0.22 + index * 0.08}s`,
                        }}
                      >
                        <ChevronRight
                          className="liquid-nav-fs-inline-arrow"
                          aria-hidden
                          strokeWidth={2.25}
                        />
                        <span className="liquid-nav-fs-link-label">{item.label}</span>
                      </Link>
                    ))}
                    <button
                      type="button"
                      className="liquid-nav-drawer-contact liquid-nav-drawer-contact--fullscreen mm-tactile-button"
                      style={{
                        transitionDelay: reduceMotion ? "0s" : `${0.22 + NAV_ITEMS.length * 0.08}s`,
                      }}
                      onClick={() => {
                        setOpen(false);
                        setContactOpen(true);
                      }}
                    >
                      <span className="liquid-nav-fs-link-label">Contact</span>
                      <ArrowUpRight className="liquid-contact-arrow" size={18} aria-hidden />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.label} href={item.href} className="liquid-nav-drawer-link" onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="liquid-nav-drawer-contact mm-tactile-button"
                    onClick={() => {
                      setOpen(false);
                      setContactOpen(true);
                    }}
                  >
                    Contact
                    <ArrowUpRight className="liquid-contact-arrow" size={15} aria-hidden />
                  </button>
                </>
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {contactOpen ? (
          <>
            <motion.button
              type="button"
              className="liquid-nav-backdrop"
              onClick={() => setContactOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              aria-label="Close contact form"
            />
            <motion.section
              ref={modalRef}
              className="liquid-contact-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-flow-title"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                ref={modalCloseRef}
                type="button"
                className="liquid-contact-modal-close"
                onClick={() => setContactOpen(false)}
                aria-label="Close contact flow"
              >
                <X size={18} aria-hidden />
              </button>
              <ContactFlow />
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
