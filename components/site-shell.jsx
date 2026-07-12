"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { footerGroups, footerLegalLinks, topMenuLinks } from "../lib/site-data";

function IconClose({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 5 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMenuBars({ className = "" }) {
  return (
    <span className={className} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

function SocialLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 9h3.2v10H5zM6.6 4.5A1.6 1.6 0 1 1 6.6 8a1.6 1.6 0 0 1 0-3.5Zm4.6 4.5h3.1v1.4h.1c.4-.8 1.5-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V19h-3.2v-4.8c0-1.2 0-2.8-1.7-2.8s-1.9 1.3-1.9 2.7V19h-3.2z" fill="currentColor" />
    </svg>
  );
}

function SocialInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function SocialFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 8.5V7.2c0-.7.5-1.2 1.2-1.2H17V3h-1.9C12.9 3 11 4.9 11 7.1v1.4H9v3h2v7h3v-7h2.3l.6-3H14Z" fill="currentColor" />
    </svg>
  );
}

function SocialX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 4 7.8 9.7L3.7 20h2.3l6.3-5.3L16.5 20H20l-8-10L19.7 4h-2.3l-5.7 4.7L8.3 4H4Z" fill="currentColor" />
    </svg>
  );
}

function SocialYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 9.2 15 12l-4 2.8V9.2Z" fill="currentColor" />
    </svg>
  );
}

const menuLinks = [
  ...topMenuLinks,
  { label: "Careers", href: "/careers" },
  { label: "Investor Login", href: "/investor-login" },
];

export function Scene({ variant }) {
  return (
    <div className={`scene scene--${variant}`} aria-hidden="true">
      <span className="scene__a" />
      <span className="scene__b" />
      <span className="scene__c" />
      <span className="scene__d" />
    </div>
  );
}

export function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    let timer;
    if (menuOpen) {
      setMenuMounted(true);
    } else if (menuMounted) {
      timer = window.setTimeout(() => setMenuMounted(false), 620);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [menuOpen, menuMounted]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="page" id="top">
      <header className="topbar shell">
        <Link href="/" className="brand brand--image" aria-label="Hines home">
          <Image src="/logo.webp" alt="Hines" width={368} height={322} priority className="brand__logo" />
        </Link>
        <nav className="desktopNav" aria-label="Primary">
          <Link href="/investment-management" className="desktopNav__link desktopNav__link--bold">
            Investment Management
          </Link>
          <Link href="/real-estate-services" className="desktopNav__link desktopNav__link--bold">
            Real Estate Services
          </Link>
          <Link href="/properties" className="desktopNav__link desktopNav__link--bold">
            Properties
          </Link>
          <Link href="/insights" className="desktopNav__link desktopNav__link--bold">
            Insights
          </Link>
          <span className="desktopNav__divider" aria-hidden="true" />
          <Link href="/about-the-firm" className="desktopNav__link desktopNav__link--about">
            About Us
          </Link>
        </nav>
        <button
          type="button"
          className="menuToggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span>MENU</span>
          <IconMenuBars className="menuToggle__bars" />
        </button>
      </header>

      {children}

      <footer className="footer">
        <div className="shell footer__grid">
          {footerGroups.map((group) => (
            <section key={group.title} className="footer__group">
              <h3>{group.title}</h3>
              <div className="footer__rule" />
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="shell footer__bottom">
          <div className="footer__legal">
            {footerLegalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="footer__socials" aria-label="Social media links">
            <a href="#top" aria-label="LinkedIn"><SocialLinkedIn /></a>
            <a href="#top" aria-label="Instagram"><SocialInstagram /></a>
            <a href="#top" aria-label="Facebook"><SocialFacebook /></a>
            <a href="#top" aria-label="X"><SocialX /></a>
            <a href="#top" aria-label="YouTube"><SocialYouTube /></a>
          </div>
        </div>
      </footer>

      {menuMounted ? (
        <div
          className={`menuOverlay${menuOpen ? "" : " menuOverlay--closing"}`}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="menuOverlay__top shell">
            <Link href="/" className="brand brand--image" aria-label="Hines home">
              <Image src="/logo.webp" alt="Hines" width={368} height={322} priority className="brand__logo" />
            </Link>
            <button type="button" className="menuClose" aria-label="Close menu" onClick={closeMenu}>
              <IconClose className="menuClose__icon" />
            </button>
          </div>

          <div className="shell menuOverlay__simple">
            <nav className="menuOverlay__list" aria-label="Primary">
              {menuLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMenu} className="menuOverlay__link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
