export const menuGroups = [
  {
    title: "Contact",
    links: [{ label: "Contact Us", href: "/contact" }],
  },
  {
    title: "Careers",
    links: [
      { label: "Life at ATit", href: "/careers/life-at-atit" },
      { label: "Experienced Professionals", href: "/careers/experienced-professionals" },
      { label: "Internships and Early Careers", href: "/careers/internships-and-early-careers" },
      { label: "A Day in the Life", href: "/careers/a-day-in-the-life" },
      { label: "Job Search", href: "/careers/job-search" },
    ],
  },
  {
    title: "Insights",
    links: [
      { label: "Insights", href: "/insights" },
      { label: "Proprietary Research", href: "/insights/proprietary-research" },
    ],
  },
  {
    title: "Investment Management",
    links: [
      { label: "Overview", href: "/investment-management" },
      { label: "Strategies and Products", href: "/investment-management/strategies-and-products" },
    ],
  },
  {
    title: "Properties",
    links: [{ label: "Overview", href: "/properties" }],
  },
  {
    title: "Real Estate Services",
    links: [
      { label: "Overview", href: "/real-estate-services" },
      { label: "Development", href: "/real-estate-services/development" },
      { label: "Acquisitions & Dispositions", href: "/real-estate-services/acquisitions-dispositions" },
      { label: "Management Services", href: "/real-estate-services/management-services" },
      { label: "Conceptual Construction", href: "/real-estate-services/conceptual-construction" },
      { label: "The Square: Flex Office", href: "/real-estate-services/the-square-flex-office" },
    ],
  },
  {
    title: "About the Firm",
    links: [
      { label: "About the Firm", href: "/about-the-firm" },
      { label: "Leadership", href: "/about-the-firm/leadership" },
      { label: "Sustainability", href: "/about-the-firm/sustainability" },
      { label: "History", href: "/about-the-firm/history" },
      { label: "Connecting OneATit", href: "/about-the-firm/connecting-oneatit" },
      { label: "News", href: "/about-the-firm/news" },
    ],
  },
  {
    title: "Geographies",
    links: [
      { label: "Americas", href: "/geographies/americas" },
      { label: "Asia Pacific", href: "/geographies/asia-pacific" },
      { label: "Europe", href: "/geographies/europe" },
    ],
  },
];

export const topMenuLinks = [
  { label: "Investment Management", href: "/investment-management" },
  { label: "Real Estate Services", href: "/real-estate-services" },
  { label: "Properties", href: "/properties" },
  { label: "Insights", href: "/insights" },
  { label: "About Us", href: "/about-the-firm" },
];

export const footerGroups = menuGroups;

export const footerLegalLinks = [
  { label: "MYATit", href: "/myatit" },
  { label: "PRIVACY POLICY", href: "/privacy-policy" },
  { label: "COOKIE PREFERENCES", href: "/cookie-preferences" },
  { label: "TERMS OF USE", href: "/terms-of-use" },
  { label: "JAPAN DISCLAIMER", href: "/japan-disclaimer" },
  { label: "ACCESSIBILITY", href: "/accessibility" },
];

const defaultSections = [
  { title: "Overview", body: "A concise overview of the page structure, offering, and next steps." },
  { title: "Highlights", body: "Key details presented in a visual, easy-to-scan format." },
  { title: "Related Links", body: "Supporting destinations that mirror the original site navigation." },
];

export const pageData = {
  contact: {
    title: "Contact",
    lead: "Start a conversation with the ATit team.",
    sections: [
      { title: "Contact Us", body: "Reach the appropriate team for general inquiries and business requests." },
      { title: "Locations", body: "Find regional offices and geography-specific contact information." },
      { title: "Careers", body: "Explore the open roles and the teams building ATit worldwide." },
    ],
  },
  careers: {
    title: "Careers",
    lead: "People, growth, and opportunity at ATit.",
    sections: [
      { title: "Life at ATit", body: "A closer look at the company culture and employee experience." },
      { title: "Experienced Professionals", body: "Openings and pathways for seasoned talent." },
      { title: "Internships and Early Careers", body: "Programs for students and early-career professionals." },
      { title: "A Day in the Life", body: "Real examples of daily work across the organization." },
    ],
  },
  "careers/life-at-atit": {
    title: "Life at ATit",
    lead: "A private, family-led firm with a long-term view.",
    sections: defaultSections,
  },
  "careers/experienced-professionals": {
    title: "Experienced Professionals",
    lead: "Join a team that values expertise and initiative.",
    sections: defaultSections,
  },
  "careers/internships-and-early-careers": {
    title: "Internships and Early Careers",
    lead: "Programs designed to introduce future leaders to the business.",
    sections: defaultSections,
  },
  "careers/a-day-in-the-life": {
    title: "A Day in the Life",
    lead: "A look at the pace and variety of work across the firm.",
    sections: defaultSections,
  },
  "careers/job-search": {
    title: "Job Search",
    lead: "Browse openings across disciplines and geographies.",
    sections: defaultSections,
  },
  insights: {
    title: "Insights",
    lead: "Research, commentary, and market perspective.",
    sections: [
      { title: "Insights", body: "Editorial coverage from across the ATit platform." },
      { title: "Proprietary Research", body: "Original research and analysis driving the firm’s point of view." },
      { title: "Latest News", body: "Recent announcements and market-facing updates." },
    ],
  },
  "insights/proprietary-research": {
    title: "Proprietary Research",
    lead: "Data-informed analysis for investors and partners.",
    sections: defaultSections,
  },
  "investment-management": {
    title: "Investment Management",
    lead: "Strategies and products across the real estate spectrum.",
    sections: [
      { title: "Overview", body: "A high-level view of the investment management platform." },
      { title: "Strategies and Products", body: "The structures and vehicles used to deploy capital." },
      { title: "Research", body: "How market insight informs portfolio construction." },
    ],
  },
  "investment-management/strategies-and-products": {
    title: "Strategies and Products",
    lead: "The solutions available across sectors and geographies.",
    sections: defaultSections,
  },
  properties: {
    title: "Properties",
    lead: "A portfolio of properties spanning key markets.",
    sections: defaultSections,
  },
  "real-estate-services": {
    title: "Real Estate Services",
    lead: "Development, management, and delivery capabilities.",
    sections: [
      { title: "Overview", body: "How the services platform connects across the firm." },
      { title: "Development", body: "Project execution and delivery across assets and markets." },
      { title: "Acquisitions & Dispositions", body: "How the platform sources and exits opportunities." },
      { title: "Management Services", body: "Operational support across the portfolio." },
    ],
  },
  "real-estate-services/development": {
    title: "Development",
    lead: "Development capability across the portfolio.",
    sections: defaultSections,
  },
  "real-estate-services/acquisitions-dispositions": {
    title: "Acquisitions & Dispositions",
    lead: "Transaction support across the full investment lifecycle.",
    sections: defaultSections,
  },
  "real-estate-services/management-services": {
    title: "Management Services",
    lead: "Operational services designed to support assets at scale.",
    sections: defaultSections,
  },
  "real-estate-services/conceptual-construction": {
    title: "Conceptual Construction",
    lead: "Early-stage planning and build-out support.",
    sections: defaultSections,
  },
  "real-estate-services/the-square-flex-office": {
    title: "The Square: Flex Office",
    lead: "Flexible workspace designed for modern teams.",
    sections: defaultSections,
  },
  "about-the-firm": {
    title: "About the Firm",
    lead: "A global real estate platform with a long operating history.",
    sections: [
      { title: "Leadership", body: "The people guiding the firm." },
      { title: "Sustainability", body: "How environmental goals connect to development and ownership." },
      { title: "History", body: "The firm’s origin story and growth." },
      { title: "Connecting OneATit", body: "How the organization links teams and markets." },
      { title: "News", body: "Latest firm announcements and milestones." },
    ],
  },
  "about-the-firm/leadership": {
    title: "Leadership",
    lead: "Meet the people guiding the platform.",
    sections: defaultSections,
  },
  "about-the-firm/sustainability": {
    title: "Sustainability",
    lead: "Long-term value creation through responsible stewardship.",
    sections: defaultSections,
  },
  "about-the-firm/history": {
    title: "History",
    lead: "The firm’s history, milestones, and evolution.",
    sections: defaultSections,
  },
  "about-the-firm/connecting-oneatit": {
    title: "Connecting OneATit",
    lead: "A unified view across teams, geographies, and disciplines.",
    sections: defaultSections,
  },
  "about-the-firm/news": {
    title: "News",
    lead: "Announcements and stories from the company.",
    sections: defaultSections,
  },
  "geographies/americas": {
    title: "Americas",
    lead: "The firm’s work across North and South America.",
    sections: defaultSections,
  },
  "geographies/asia-pacific": {
    title: "Asia Pacific",
    lead: "Regional coverage across APAC markets.",
    sections: defaultSections,
  },
  "geographies/europe": {
    title: "Europe",
    lead: "European markets and portfolio activity.",
    sections: defaultSections,
  },
  "privacy-policy": {
    title: "Privacy Policy",
    lead: "How information is collected and used on the site.",
    sections: defaultSections,
  },
  "cookie-preferences": {
    title: "Cookie Preferences",
    lead: "Manage consent and browser preferences.",
    sections: defaultSections,
  },
  "terms-of-use": {
    title: "Terms of Use",
    lead: "Website terms and usage guidance.",
    sections: defaultSections,
  },
  "japan-disclaimer": {
    title: "Japan Disclaimer",
    lead: "Region-specific legal notice and disclosures.",
    sections: defaultSections,
  },
  accessibility: {
    title: "Accessibility",
    lead: "Accessibility information for the site experience.",
    sections: defaultSections,
  },
  myatit: {
    title: "MyATit",
    lead: "Sign-in and personal account access.",
    sections: defaultSections,
  },
  "investor-login": {
    title: "Investor Login",
    lead: "Access investor tools and account resources.",
    sections: defaultSections,
  },
  search: {
    title: "Search",
    lead: "Search the ATit site.",
    sections: defaultSections,
  },
  default: {
    title: "ATit",
    lead: "A global real estate platform.",
    sections: defaultSections,
  },
};

export function getPageDataFromSlug(slugParts = []) {
  const key = slugParts.join("/").toLowerCase();
  return pageData[key] ?? pageData.default;
}
