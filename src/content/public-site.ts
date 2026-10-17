export const publicNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Client Portal", href: "/client-portal" },
  { label: "AI Research", href: "/ai-research" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    id: "tax-advisory",
    title: "Tax advisory and compliance",
    href: "/services#tax-advisory",
    summary:
      "KRA assessment reviews, objections, reconciliations, compliance planning and tax-risk notes.",
    inclusions: ["Assessment review", "Compliance calendar", "Advisory response pack"],
    bestFor: "Businesses with KRA assessments, regular filings or big tax decisions.",
    outcome: "A clear position, an action plan and a response timeline.",
  },
  {
    id: "financial-reporting",
    title: "Financial reporting and analysis",
    href: "/services#financial-reporting",
    summary:
      "Management accounts, financial analysis and reporting reviews.",
    inclusions: ["Reporting review", "Financial analysis", "Management insights"],
    bestFor: "Businesses that want clearer numbers and better decisions.",
    outcome: "Clear findings, reliable reports and practical advice.",
  },
  {
    id: "finance-process",
    title: "Finance process consulting",
    href: "/services#finance-process",
    summary:
      "Controls, reporting, payment reconciliation and billing reviews.",
    inclusions: ["Control review", "Payment reconciliation", "Reporting pack"],
    bestFor: "Finance teams that want stronger controls and clearer reporting.",
    outcome: "A ranked improvement plan with clear findings.",
  },
] as const;

export const pricingOptions = [
  {
    name: "Advisory request",
    price: "From KES 15,000",
    description: "Best for a focused opinion, a short review and clear next steps.",
    cadence: "Per engagement request",
    features: ["Defined question and deliverable", "Named reviewer", "Written recommendation"],
    featured: false,
  },
  {
    name: "Managed engagement",
    price: "Custom quotation",
    description: "Best for ID-verified work in several stages with a dedicated team.",
    cadence: "Scoped after admin review",
    features: ["Structured onboarding", "Secure document workspace", "Milestone-based delivery"],
    featured: true,
  },
  {
    name: "Retainer workspace",
    price: "Monthly terms",
    description: "Best for ongoing tax and finance advice with shared documents and reports.",
    cadence: "Monthly or quarterly",
    features: ["Recurring advisory capacity", "Priority workflow", "Periodic management reporting"],
    featured: false,
  },
] as const;

export const workflowSteps = [
  "Browse services",
  "Add to engagement cart",
  "Checkout and account setup",
  "Admin review",
  "KYC and document review",
  "Engagement letter",
  "Active workspace",
  "Invoice, completion and archive",
] as const;

export const researchFeatures = [
  {
    title: "Engagement-scoped research",
    description: "Tax and finance research stays linked to the client's engagement and team.",
  },
  {
    title: "Source-aware working notes",
    description: "Staff can keep references, assumptions and review notes beside the analysis.",
  },
  {
    title: "Controlled client summaries",
    description: "Early research stays separate from the work approved for the client.",
  },
  {
    title: "Auditable usage",
    description: "Permissions and activity records keep AI use under control.",
  },
] as const;
