import Link from "next/link";
import { Scene, SiteShell } from "../../components/site-shell";

const sectors = [
  "Office 201M+ square feet",
  "Industrial & Logistics 87M+ square feet",
  "Retail 18M+ square feet",
  "Living / Housing 80M+ square feet",
  "Multifamily 66,002+ units across 211 projects",
  "Hospitality 10M+ square feet",
];

const capabilities = [
  {
    title: "Development",
    body: "Projects are shaped from the inside out, with underwriting, design coordination, leasing strategy, and long-horizon execution handled as one operating discipline.",
    variant: "city",
  },
  {
    title: "Management Services",
    body: "Property operations, engineering, placemaking, and tenant experience are treated as value creation tools, not just back-office support.",
    variant: "meeting",
  },
  {
    title: "Acquisitions & Dispositions",
    body: "Local market access and integrated operating data sharpen decision making before a deal, during a hold period, and at exit.",
    variant: "airport",
  },
];

export default function RealEstateServicesPage() {
  return (
    <SiteShell>
      <main className="sectionPage">
        <section className="sectionHero shell">
          <div className="sectionHero__media">
            <Scene variant="city" />
          </div>
          <div className="sectionHero__copy">
            <p className="eyebrow eyebrow--red">Real Estate Services</p>
            <h1>Global Real Estate Platform</h1>
            <p className="sectionHero__lead">
              ATit real estate services add value for clients and partners through development,
              redevelopment, property management, engineering, and local operating expertise.
            </p>
          </div>
        </section>

        <section className="shell sectionBody">
          <div className="sectionIntro">
            <div className="rule" />
            <h2>The difference is in execution.</h2>
            <p>
              Successful assets are built from a combination of design discipline, operating rigor,
              smarter technology, and market-specific judgment. This page mirrors the ATit
              structure by emphasizing platform depth, signature mixed-use work, and a sector-by-sector
              track record.
            </p>
          </div>

          <div className="featureSplit">
            <div className="featureSplit__copy">
              <p className="eyebrow eyebrow--red">Featured Project</p>
              <h3>The Evolution of Live, Work, Play</h3>
              <p>
                CityCenterDC in Washington stands in for the kind of mixed-use district ATit uses
                to express the brand: a dense urban destination where retail, workplace, hospitality,
                and public life are composed as one system.
              </p>
              <Link className="btn btn--red" href="/properties">
                <span>View Property</span>
              </Link>
            </div>
            <Scene variant="glass" />
          </div>
        </section>

        <section className="sectionBand">
          <div className="shell">
            <p className="eyebrow">Our Real Estate Track Record</p>
            <div className="sectionBand__grid">
              {sectors.map((item) => (
                <div key={item} className="sectionBand__item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shell cardMatrix">
          {capabilities.map((capability) => (
            <article key={capability.title} className="sectionCard">
              <Scene variant={capability.variant} />
              <div className="sectionCard__body">
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
