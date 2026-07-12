import { Scene, SiteShell } from "../../../components/site-shell";

const vehicles = [
  {
    region: "Americas",
    title: "Hines U.S. Property Partners",
    meta: "Core / Core-Plus | Open-ended",
    body: "A diversified vehicle focused on high-quality living, industrial, office, mixed-use, and select niche sectors through research-led portfolio construction.",
  },
  {
    region: "Europe",
    title: "European Core and Core-Plus Strategies",
    meta: "Open-ended and closed-end formats",
    body: "Structured to capture durable demand, stronger pricing clarity, and selective redevelopment opportunity across major gateway markets.",
  },
  {
    region: "Asia Pacific",
    title: "Regional Growth Strategies",
    meta: "Sector and market selective",
    body: "Targeted exposure to logistics, mixed-use, and next-generation urban product where local operating insight is a genuine edge.",
  },
];

export default function StrategiesAndProductsPage() {
  return (
    <SiteShell>
      <main className="sectionPage">
        <section className="sectionHero shell">
          <div className="sectionHero__media">
            <Scene variant="asset" />
          </div>
          <div className="sectionHero__copy">
            <p className="eyebrow eyebrow--red">Investment Management</p>
            <h1>Strategies and Products</h1>
            <p className="sectionHero__lead">
              Hines uses a range of strategies to pursue acquisition and development opportunities
              across property types, geographies, and risk profiles.
            </p>
          </div>
        </section>

        <section className="shell sectionBody">
          <div className="statFeature">
            <div className="statFeature__value">$99.8B</div>
            <div className="statFeature__label">Total Equity as of December 31, 2025</div>
          </div>

          <div className="sectionIntro">
            <div className="rule" />
            <h2>Institutional Vehicles</h2>
            <p>
              The source page enumerates products by geography and format. This version preserves
              that product-led hierarchy while keeping the route readable in a single scan.
            </p>
          </div>

          <div className="vehicleList">
            {vehicles.map((vehicle) => (
              <article key={vehicle.title} className="vehicleCard">
                <p className="vehicleCard__region">{vehicle.region}</p>
                <h3>{vehicle.title}</h3>
                <p className="vehicleCard__meta">{vehicle.meta}</p>
                <p>{vehicle.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
