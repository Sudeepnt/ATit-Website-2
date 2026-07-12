import { Scene, SiteShell } from "../../components/site-shell";

const glance = [
  "$91.7B assets under management",
  "107.2M SF operating third-party property-level services",
  "4,638 team members worldwide",
  "30 countries in which Hines operates",
  "65 strategic investment vehicles since 1993",
  "69 years of operations since 1957",
];

const principles = [
  "The Hines Standard is the benchmark for value creation, integrity, service, and quality.",
  "Products and services are held to the highest standard appropriate to the mission.",
  "Employees are the clearest expression of the brand and its most valuable asset.",
  "A culture of respect, contribution, and accountability drives long-term performance.",
];

export default function AboutTheFirmPage() {
  return (
    <SiteShell>
      <main className="sectionPage">
        <section className="sectionHero shell">
          <div className="sectionHero__media">
            <Scene variant="portrait" />
          </div>
          <div className="sectionHero__copy">
            <p className="eyebrow eyebrow--red">About the Firm</p>
            <h1>A leading global real estate investment manager.</h1>
            <p className="sectionHero__lead">
              Hines owns and operates a large global portfolio across property types on behalf of a
              diverse group of institutional and private wealth clients.
            </p>
          </div>
        </section>

        <section className="shell sectionBody">
          <div className="sectionIntro">
            <div className="rule" />
            <h2>Built to invest, develop, and manage at scale.</h2>
            <p>
              This page mirrors the live Hines about route by combining company overview copy,
              headline operating metrics, and principle-driven brand language in one long-form
              editorial layout.
            </p>
          </div>

          <div className="glanceGrid">
            {glance.map((item) => (
              <div key={item} className="glanceGrid__item">
                {item}
              </div>
            ))}
          </div>

          <div className="featureSplit featureSplit--reverse">
            <Scene variant="tower" />
            <div className="featureSplit__copy">
              <p className="eyebrow eyebrow--red">Our Vision</p>
              <h3>Be the best investor, partner, and manager in the world.</h3>
              <p>
                The live Hines page pairs its company scale with a direct statement of purpose.
                This recreation does the same and uses a restrained editorial treatment instead of
                turning the page into a marketing collage.
              </p>
            </div>
          </div>

          <div className="principlesBlock">
            <h2>Guiding Principles</h2>
            <div className="rule" />
            <ol className="principlesBlock__list">
              {principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
