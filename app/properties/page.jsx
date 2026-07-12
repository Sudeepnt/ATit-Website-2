import { Scene, SiteShell } from "../../components/site-shell";

const propertyTypes = [
  "Office",
  "Industrial & Logistics",
  "Living/Housing",
  "Retail",
  "Mixed Use",
  "Hospitality",
  "Medical/Biotech",
  "Arts & Culture",
];

const roles = [
  "Asset Manager",
  "Acquisition",
  "Developer",
  "Development Manager",
  "Owner",
  "Property Manager",
  "Redeveloper",
];

const featuredPlaces = [
  { name: "CityCenterDC", place: "Washington, DC", type: "Mixed Use", variant: "city" },
  { name: "Hudson Square Properties", place: "New York, NY", type: "Office", variant: "workstation" },
  { name: "The SQ Collection", place: "Global Flex Office", type: "Flexible Workspace", variant: "street" },
];

export default function PropertiesPage() {
  return (
    <SiteShell>
      <main className="sectionPage">
        <section className="sectionHero shell">
          <div className="sectionHero__media">
            <Scene variant="workstation" />
          </div>
          <div className="sectionHero__copy">
            <p className="eyebrow eyebrow--red">Properties</p>
            <h1>Our diversified real estate presence around the world.</h1>
            <p className="sectionHero__lead">
              The live ATit properties page is a searchable catalog. This version recreates that
              structure with filter blocks, role taxonomy, and a curated set of featured assets.
            </p>
          </div>
        </section>

        <section className="shell filterLayout">
          <aside className="filterPanel">
            <h2>Filter</h2>
            <div className="rule rule--short" />
            <div className="filterPanel__group">
              <h3>Type</h3>
              <ul>
                {propertyTypes.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </div>
            <div className="filterPanel__group">
              <h3>ATit&apos;s Role</h3>
              <ul>
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
            <div className="filterPanel__group">
              <h3>Country / City</h3>
              <p>United States, Germany, Greater China, United Kingdom, India, and more.</p>
            </div>
          </aside>

          <div className="propertyResults">
            {featuredPlaces.map((property) => (
              <article key={property.name} className="propertyCard">
                <Scene variant={property.variant} />
                <div className="propertyCard__body">
                  <p className="propertyCard__type">{property.type}</p>
                  <h3>{property.name}</h3>
                  <p>{property.place}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
