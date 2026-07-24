"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerGroups, footerLegalLinks, getPageDataFromSlug, menuGroups } from "../../lib/site-data";

function IconArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function IconSocialLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 9h3.2v10H5zM6.6 4.5A1.6 1.6 0 1 1 6.6 8a1.6 1.6 0 0 1 0-3.5Zm4.6 4.5h3.1v1.4h.1c.4-.8 1.5-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V19h-3.2v-4.8c0-1.2 0-2.8-1.7-2.8s-1.9 1.3-1.9 2.7V19h-3.2z" fill="currentColor" />
    </svg>
  );
}

function IconSocialInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function IconSocialFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 8.5V7.2c0-.7.5-1.2 1.2-1.2H17V3h-1.9C12.9 3 11 4.9 11 7.1v1.4H9v3h2v7h3v-7h2.3l.6-3H14Z" fill="currentColor" />
    </svg>
  );
}

function IconSocialX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 4 7.8 9.7L3.7 20h2.3l6.3-5.3L16.5 20H20l-8-10L19.7 4h-2.3l-5.7 4.7L8.3 4H4Z" fill="currentColor" />
    </svg>
  );
}

function IconSocialYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 9.2 15 12l-4 2.8V9.2Z" fill="currentColor" />
    </svg>
  );
}

export default function MenuPage() {
  const pathname = usePathname() || "/";
  const slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const page = getPageDataFromSlug(slug ? slug.split("/") : []);

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
        <Link href="#menu" className="menuToggle" aria-label="Open menu section">
          <span className="menuToggle__bars" aria-hidden="true">
            <i />
          </span>
          <span className="menuToggle__label">MENU</span>
          <span className="menuToggle__bars" aria-hidden="true">
            <i />
          </span>
        </Link>
      </header>

      <main>
        <section className="shell menuPageHero">
          <p className="eyebrow eyebrow--red">Menu</p>
          <h1>{page.title}</h1>
          <p className="lede">{page.lead}</p>
          <div className="hero__actions">
            <Link className="btn btn--red" href="/">
              <span>Back Home</span>
              <IconArrow className="icon icon--arrow" />
            </Link>
          </div>
        </section>

        <section className="shell menuPageGrid">
          {page.sections.map((section) => (
            <article className="menuPageCard" key={section.title}>
              <h2>{section.title}</h2>
              <div className="rule" />
              <p>{section.body}</p>
              <Link className="menuPageCard__link" href={page.sections[0]?.href || "#menu"}>
                Explore
                <IconArrow className="icon icon--arrow" />
              </Link>
            </article>
          ))}
        </section>

        <section className="menuOverlay menuOverlay--static">
          <div className="menuOverlay__top shell">
            <Link href="/" className="brand brand--image" aria-label="ATit home">
              <Image src="/logo.webp" alt="ATit" width={368} height={322} priority className="brand__logo" />
            </Link>
            <Link href="/" className="menuToggle menuToggle--close">
              <span className="menuToggle__bars" aria-hidden="true">
                <i />
              </span>
              <span className="menuToggle__label">MENU</span>
              <span className="menuToggle__bars" aria-hidden="true">
                <i />
              </span>
            </Link>
          </div>

          <div className="shell menuOverlay__content">
            {menuGroups.map((group) => (
              <section key={group.title} className="menuGroup">
                <h3>{group.title}</h3>
                <div className="menuGroup__rule" />
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="menuOverlay__bottom">
              <div className="footer__legal">
                {footerLegalLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="footer__socials" aria-label="Social media links">
                <a href="/" aria-label="LinkedIn"><IconSocialLinkedIn /></a>
                <a href="/" aria-label="Instagram"><IconSocialInstagram /></a>
                <a href="/" aria-label="Facebook"><IconSocialFacebook /></a>
                <a href="/" aria-label="X"><IconSocialX /></a>
                <a href="/" aria-label="YouTube"><IconSocialYouTube /></a>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
