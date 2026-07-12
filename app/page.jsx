"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { footerGroups, footerLegalLinks, topMenuLinks } from "../lib/site-data";

const services = [
  "Investment Management",
  "Acquisitions",
  "Development Management",
  "Management Services",
];

const news = [
  {
    title: 'ATit Views Prime European Offices as "Strong Buy" Amid Clear Bifurcation',
    date: "May 5, 2026",
    variant: "large",
  },
  {
    title: "CIBC SQUARE’s 141 Bay Street Achieves Full Lease Up In Downtown Toronto",
    date: "February 17, 2026",
    variant: "small",
  },
  {
    title: "ATit 2026 Outlook: Global Real Estate Stabilizes and Enters a New Growth Cycle",
    date: "January 6, 2026",
    variant: "small",
  },
];

const stories = [
  {
    title: "How Energy Could Rewire Real Asset Performance",
    body: "Energy’s role in real asset pricing and management",
    variant: "glass",
  },
  {
    title: "Better Together",
    body: "Where Infrastructure and Real Estate Converge",
    variant: "airport",
  },
  {
    title: "Real Assets in the Age of Supply Shocks",
    body: "Why This Is a Buy Moment",
    variant: "containers",
  },
];

function IconArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 5 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPlay({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.5 16 12l-6 3.5V8.5Z" fill="currentColor" />
    </svg>
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

function Scene({ variant }) {
  return (
    <div className={`scene scene--${variant}`} aria-hidden="true">
      <span className="scene__a" />
      <span className="scene__b" />
      <span className="scene__c" />
      <span className="scene__d" />
    </div>
  );
}

export default function Page() {
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
        <a href="#home" className="brand brand--image" aria-label="ATit home">
          <Image src="/logo.webp" alt="ATit" width={368} height={322} priority className="brand__logo" />
        </a>

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
          <span className="menuToggle__bars" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <main id="home">
        <section className="shell intro">
          <p className="eyebrow eyebrow--red">About Hines</p>
          <div className="rule" />
          <h2>
            Invested in Land.
            <br />
            Invested in You.
          </h2>
          <p className="intro__lede">
            ATit Capital operates at the intersection of people, capital, and land in India. We
            bring mission-aligned partners together to acquire, develop, and operate real estate
            assets that unlock neighborhoods, shape cities, and compound value over time.
          </p>

          <div className="intro__cta">
            <a className="btn btn--red btn--wide" href="#stories">
              <IconPlay className="icon icon--play" />
              <span>A Message from our Global CIO</span>
            </a>
          </div>

          <div className="stats">
            <div className="stats__card stats__card--large">
              <div className="stats__value"><span>$</span>91.7B</div>
              <div className="stats__label">ATit Assets Under Management <sup>1</sup></div>
            </div>

            <div className="stats__card stats__card--large">
              <div className="stats__value">107.2M SF</div>
              <div className="stats__label">Operating Third-Party Property-Level Services <sup>2</sup></div>
            </div>

            <div className="stats__miniRow">
              <div className="stats__mini">
                <div className="stats__miniValue">30</div>
                <div className="stats__miniLabel">Countries</div>
              </div>
              <div className="stats__mini">
                <div className="stats__miniValue">69</div>
                <div className="stats__miniLabel">Years of Experience</div>
              </div>
            </div>

            <p className="footnotes">
              <sup>1</sup> Includes both the global ATit organization and RIA AUM as of December 31, 2025
              <br />
              <sup>2</sup> Includes 420 properties as of December 31, 2025
            </p>
          </div>
        </section>

        <section className="valueBand">
          <div className="shell">
            <h2>We seek to create value for investors across the real estate spectrum.</h2>
            <div className="serviceList">
              {services.map((service) => (
                <a key={service} href="#stories" className="serviceList__item">
                  <span>{service}</span>
                  <IconArrow className="icon icon--arrow" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="shell news">
          <div className="sectionHeader">
            <h3>Latest News</h3>
          </div>

          <div className="newsList">
            {news.map((item) => (
              <article
                key={item.title}
                className={`newsItem${item.variant === "large" ? " newsItem--featured" : ""}`}
              >
                <div className="newsItem__copy">
                  <h4>{item.title}</h4>
                  <p>{item.date}</p>
                </div>
                <div className="newsItem__visual" aria-hidden="true">
                  <Scene variant={item.variant === "large" ? "city" : item.title.includes("Toronto") ? "glass" : "airport"} />
                  <span className="newsItem__arrow">
                    <IconArrow className="icon icon--arrow" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="news__cta">
            <a className="btn btn--red" href="#stories">
              <span>View All News</span>
              <IconArrow className="icon icon--arrow" />
            </a>
          </div>
        </section>

        <section className="featureGroup shell">
          <article className="featureCard featureCard--dark">
            <Scene variant="city" />
            <div className="featureCard__body">
              <h3>ATit Private Wealth Solutions</h3>
              <div className="rule rule--center" />
              <p>Dedicated to providing a suite of offerings designed to meet individual investors’ needs</p>
              <a className="btn btn--red" href="#stories">
                <span>Learn More</span>
                <IconArrow className="icon icon--arrow" />
              </a>
            </div>
          </article>

          <article className="featureCard featureCard--red">
            <Scene variant="meeting" />
            <div className="featureCard__body featureCard__body--light">
              <h3>Life at ATit</h3>
              <div className="rule rule--center" />
              <p>When you join ATit, you&apos;re joining a private, family led firm with a rich history of transformative work in our communities</p>
              <a className="btn btn--light" href="#stories">
                <span>Read More</span>
                <IconArrow className="icon icon--arrow" />
              </a>
            </div>
          </article>
        </section>

        <section className="shell stories" id="stories">
          <h2>Transforming Real Estate</h2>
          <div className="rule rule--short" />

          <div className="storyGrid">
            {stories.map((story) => (
              <article key={story.title} className="storyCard">
                <Scene variant={story.variant} />
                <div className="storyCard__body">
                  <h3>{story.title}</h3>
                  <p>{story.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="stories__cta">
            <a className="btn btn--red btn--small" href="#top">
              <span>View All</span>
            </a>
          </div>
        </section>

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
              <a href="#home" aria-label="LinkedIn"><SocialLinkedIn /></a>
              <a href="#home" aria-label="Instagram"><SocialInstagram /></a>
              <a href="#home" aria-label="Facebook"><SocialFacebook /></a>
              <a href="#home" aria-label="X"><SocialX /></a>
              <a href="#home" aria-label="YouTube"><SocialYouTube /></a>
            </div>
          </div>
        </footer>
      </main>

      {menuMounted ? (
        <div
          className={`menuOverlay${menuOpen ? "" : " menuOverlay--closing"}`}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="menuOverlay__top shell">
            <Link href="/" className="brand brand--image" aria-label="ATit home">
              <Image src="/logo.webp" alt="ATit" width={368} height={322} priority className="brand__logo" />
            </Link>
            <button type="button" className="menuClose" aria-label="Close menu" onClick={closeMenu}>
              <IconClose className="menuClose__icon" />
            </button>
          </div>

          <div className="shell menuOverlay__simple">
            <nav className="menuOverlay__list" aria-label="Primary">
              {topMenuLinks.map((link) => (
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
