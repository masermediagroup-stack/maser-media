"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { ContactFlow } from "@/components/ContactFlow";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/#work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/#about" },
] as const;

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

type Props = { entrance?: boolean };

export function LiquidNav({ entrance }: Props) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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

  return (
    <>
      <motion.nav
        className="liquid-nav"
        aria-label="Primary navigation"
        initial={entrance ? { y: -36, opacity: 0 } : false}
        animate={entrance ? { y: 0, opacity: 1 } : false}
        transition={entrance ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <div className="liquid-nav-bubble">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="liquid-nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        <button type="button" className="liquid-nav-contact" onClick={() => setContactOpen(true)}>
          Contact
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
              className="liquid-nav-backdrop"
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
              className="liquid-nav-drawer"
              initial={{ x: reduceMotion ? 0 : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: reduceMotion ? 0 : "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                ref={drawerCloseRef}
                type="button"
                className="liquid-nav-drawer-contact"
                onClick={() => {
                  setOpen(false);
                  setContactOpen(true);
                }}
              >
                Contact
              </button>
              {NAV_ITEMS.map((item) => (
                <Link key={item.label} href={item.href} className="liquid-nav-drawer-link" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
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

