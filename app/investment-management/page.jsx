"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { topMenuLinks } from "../../lib/site-data";

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

function IconMenuBars({ className = "" }) {
  return (
    <span className={className} aria-hidden="true">
      <i />
      <i />
    </span>
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

const metrics = [
  { value: "$91.7B", label: "ATit Assets Under Management", note: "1" },
  { value: "107.2M SF", label: "Operating Third-Party Property-Level Services", note: "2" },
  { value: "65", label: "Strategic Investment Vehicles", note: "3" },
  { value: "300+", label: "Institutions", note: "4" },
  { value: "700+", label: "High-Net-Worth Individuals", note: "4" },
  { value: "170,000+", label: "Retail Investors", note: "4" },
];

export default function InvestmentManagementPage() {
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
        <Link href="/" className="brand brand--image" aria-label="ATit home">
          <Image src="/logo.webp" alt="ATit" width={294} height={258} priority className="brand__logo brand__logo--topbar" />
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
        <button type="button" className="menuToggle" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          <span>MENU</span>
          <IconMenuBars className="menuToggle__bars" />
        </button>
      </header>

      <main className="imPage">
        <section className="imHero shell">
          <Scene variant="lobby" />
          <h1>Our passion for real estate is the secret to your success</h1>
          <a className="btn btn--red imHero__cta" href="#overview">
            <span>A Message from our Global CIO</span>
            <IconArrow className="icon icon--arrow" />
          </a>
        </section>

        <section className="shell imOverview" id="overview">
          <p className="eyebrow eyebrow--red">ATit Investment Management</p>
          <div className="rule" />
          <h2>Creating value through innovative real estate strategies for 69 years.</h2>
          <p>
            ATit has a holistic approach to real estate investment management that creates a
            distinct advantage for our investors. Sophisticated trend analysis, unmatched local market
            knowledge, and deep operational expertise allow us to swiftly capitalize on opportunities and
            optimize every aspect of real estate to create the most value possible.
          </p>
        </section>

        <section className="shell imMetrics">
          {metrics.map((metric) => (
            <article key={metric.label} className="imMetric">
              <div className="imMetric__value">
                {metric.value.startsWith("$") ? <span>$</span> : null}
                {metric.value.replace(/^\$/, "")}
              </div>
              <div className="imMetric__label">
                {metric.label} <sup>{metric.note}</sup>
              </div>
            </article>
          ))}
          <p className="imMetrics__notes">
              <sup>1</sup> Includes both the global ATit organization and RIA AUM as of December 31, 2025
            <br />
            <sup>2</sup> Includes 409 properties as of December 31, 2025
            <br />
            <sup>3</sup> Of these 65 investment vehicles, 34 are currently active.
            <br />
            <sup>4</sup> Represents the total number of investors in active and completed vehicles.
          </p>
        </section>

        <section className="imBand">
          <div className="shell imBand__content">
            <Scene variant="portrait" />
            <div className="imBand__panel">
              <p className="imBand__eyebrow">Investment Management Group</p>
              <h2>We strive to be the best investor for our investors.</h2>
              <div className="rule rule--center" />
            </div>
          </div>
        </section>

        <section className="imBreath shell">
          <Scene variant="tower" />
          <div className="imBreath__panel">
            <h2>Building a better world</h2>
            <div className="rule rule--center" />
            <p>
              As a world leader in sustainability and innovation, we are proud to partner with investors to
              improve the built environment and contribute to better cities.
            </p>
          </div>
        </section>

        <section className="shell imOpportunity">
          <p className="eyebrow eyebrow--red">A Breadth of Opportunity</p>
          <div className="rule" />
          <h2>We invest across the real estate spectrum to create strategies for your specific investment needs.</h2>

          <article className="imCard">
            <div className="imCard__title">Asset Class Experience</div>
            <Scene variant="asset" />
            <div className="imCard__body">
              <div className="imCard__location">
                <span>Talisman</span>
                <span>Redmond, WA</span>
              </div>
              <div className="imCard__grid">
                <div><span>Office</span><strong>369M+</strong></div>
                <div><span>Industrial & Logistics</span><strong>175M+</strong></div>
                <div><span>Living/Housing</span><strong>96M+</strong></div>
                <div><span>Retail</span><strong>42M+</strong></div>
                <div><span>Sports</span><strong>3.9M+</strong></div>
              </div>
            </div>
          </article>

          <article className="imCard imCard--alt">
            <div className="imCard__title">Investment Risk Profile</div>
            <Scene variant="street" />
            <div className="imCard__body">
              <div className="imCard__location">
                <span>KØBMAGERGADE 7</span>
                <span>COPENHAGEN, DENMARK</span>
              </div>
            </div>
          </article>
        </section>

        <section className="shell imDeep">
          <h2>We believe deep involvement makes us different.</h2>
          <div className="rule" />
          <div className="imDeep__list">
            <div>
              <h3>Exclusive access through long-term relationships</h3>
              <p>
                With 4,630 real estate professionals operating locally in 430 cities across 30 countries,
                our strong local relationships have been forged over decades, which we believe provides us
                with superior access to deal flow all over the world.
              </p>
            </div>
            <div>
              <h3>Alignment with investors</h3>
              <p>
                We co-invest alongside our partners, setting the stage for mutual success. And our employee
                partner compensation depends on it; we only do well when you do.
              </p>
            </div>
            <div>
              <h3>Hands-on execution</h3>
              <p>
                We are not a capital allocator. We are a global investment manager and local operator,
                directly executing our real estate strategies on the ground to better control outcomes.
              </p>
            </div>
            <div>
              <h3>Being an operator makes us a better investor</h3>
              <p>
                With hands-on experience over 69 years, we believe we know development and management better
                than anyone else in the industry. We believe that enables us to make uniquely informed
                decisions to create value and maximize income.
              </p>
            </div>
            <p className="imDeep__note">1 As of December 31, 2025</p>
          </div>
          <Scene variant="workstation" />
        </section>
      </main>

      {menuMounted ? (
        <div
          className={`menuOverlay${menuOpen ? "" : " menuOverlay--closing"}`}
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
