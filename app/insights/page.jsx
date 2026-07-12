import Link from "next/link";
import { Scene, SiteShell } from "../../components/site-shell";

const atitInsightItems = [
  {
    title: "2026 Global Investment Outlook",
    subtitle: "A New Flight Path for Real Estate",
    variant: "airport",
  },
  {
    title: "2025 Mid-Year Global Investment Outlook",
    subtitle: "Finding Opportunity in the Midst of Uncertainty",
    variant: "glass",
  },
  {
    title: "2025 Global Living Reimagined",
    subtitle: "What is reshaping housing markets worldwide?",
    variant: "portrait",
  },
];

const perspectives = [
  {
    title: "How Energy Could Rewire Real Asset Performance",
    body: "Energy's role in real asset pricing and management.",
    variant: "containers",
  },
  {
    title: "Better Together",
    body: "Where infrastructure and real estate converge.",
    variant: "meeting",
  },
  {
    title: "Real Assets in the Age of Supply Shocks",
    body: "Strategic commentary on the present buy moment.",
    variant: "city",
  },
];

export default function InsightsPage() {
  return (
    <SiteShell>
      <main className="sectionPage">
        <section className="sectionHero shell">
          <div className="sectionHero__media">
            <Scene variant="containers" />
          </div>
          <div className="sectionHero__copy">
            <p className="eyebrow eyebrow--red">Insights</p>
            <h1>Discover topics impacting real estate, cities, and communities.</h1>
            <p className="sectionHero__lead">
              The live page is organized around flagship outlooks and ongoing perspectives. This
              route follows that model and keeps the editorial hierarchy clear.
            </p>
          </div>
        </section>

        <section className="shell editorialBlock">
          <div className="sectionIntro">
            <div className="rule" />
            <h2>ATit Insights</h2>
            <p>
              Forward-looking analysis and deeper thought leadership across industries, sectors,
              geographies, and market cycles.
            </p>
          </div>

          <div className="storyGrid storyGrid--wide">
            {atitInsightItems.map((item) => (
              <article key={item.title} className="storyCard">
                <Scene variant={item.variant} />
                <div className="storyCard__body">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="shell editorialBlock">
          <div className="sectionIntro">
            <div className="rule" />
            <h2>Perspectives</h2>
            <p>
              Strategic commentary from subject matter experts designed to inform decision-making.
            </p>
          </div>

          <div className="cardMatrix cardMatrix--compact">
            {perspectives.map((item) => (
              <article key={item.title} className="sectionCard">
                <Scene variant={item.variant} />
                <div className="sectionCard__body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="sectionActions">
            <Link className="btn btn--red" href="/insights/proprietary-research">
              <span>Explore Research</span>
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
