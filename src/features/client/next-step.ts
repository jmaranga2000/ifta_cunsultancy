/**
 * Works out the single most useful thing a client should do next, and where
 * they are in the IFTA journey, so the dashboard never leaves an ordinary
 * user guessing what to click.
 */

export type ClientJourneyInput = {
  /** Statuses of the client's engagement requests (rejected ones excluded). */
  requestStatuses: string[];
  kycOpen: boolean;
  kycStatus: "draft" | "submitted" | "under_review" | "changes_requested" | "approved" | null;
  lettersAwaitingSignature: number;
  activeEngagements: number;
  completedEngagements: number;
  unpaidInvoices: number;
};

export type ClientNextStep = {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  tone: "action" | "waiting" | "done";
};

export type JourneyStage = {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
};

const REVIEW_STATUSES = new Set(["admin_review", "quotation_requested", "quotation_preparing", "clarification"]);

export function getClientNextStep(input: ClientJourneyInput): ClientNextStep {
  const hasRequests = input.requestStatuses.length > 0;

  if (input.lettersAwaitingSignature > 0) {
    return {
      key: "sign-letter",
      title: "Sign your engagement letter",
      description: "Your engagement letter is ready. Read it and sign online to start the work.",
      href: "/client/engagement-letters",
      cta: "Open letter",
      tone: "action",
    };
  }

  if (input.requestStatuses.includes("quotation_sent")) {
    return {
      key: "review-quotation",
      title: "Review your quotation",
      description: "IFTA has sent you a price for the work. Accept it to move forward.",
      href: "/client/quotations",
      cta: "View quotation",
      tone: "action",
    };
  }

  if (input.kycOpen && (input.kycStatus === "draft" || input.kycStatus === null)) {
    return {
      key: "complete-kyc",
      title: "Verify your identity",
      description: "IFTA needs a few details and documents about you or your business before work can begin.",
      href: "/client/kyc",
      cta: "Start verification",
      tone: "action",
    };
  }

  if (input.kycOpen && input.kycStatus === "changes_requested") {
    return {
      key: "fix-kyc",
      title: "Update your verification documents",
      description: "IFTA asked for a change to what you sent. Open it to see what needs fixing.",
      href: "/client/kyc",
      cta: "See what to fix",
      tone: "action",
    };
  }

  if (input.kycOpen && (input.kycStatus === "submitted" || input.kycStatus === "under_review")) {
    return {
      key: "kyc-review",
      title: "We are checking your documents",
      description: "Nothing for you to do right now. We will notify you as soon as the review is finished.",
      href: "/client/kyc",
      cta: "View status",
      tone: "waiting",
    };
  }

  if (input.unpaidInvoices > 0) {
    return {
      key: "pay-invoice",
      title: input.unpaidInvoices === 1 ? "You have an invoice to pay" : `You have ${input.unpaidInvoices} invoices to pay`,
      description: "Pay by M-Pesa, bank transfer or card, then enter the reference so we can confirm it.",
      href: "/client/payments/new",
      cta: "Record payment",
      tone: "action",
    };
  }

  if (input.activeEngagements > 0) {
    return {
      key: "work-in-progress",
      title: "Your work is in progress",
      description: "Follow progress, share documents and message your IFTA team from your engagement.",
      href: "/client/engagements",
      cta: "View progress",
      tone: "waiting",
    };
  }

  if (input.requestStatuses.some((status) => REVIEW_STATUSES.has(status)) || input.requestStatuses.includes("approved")) {
    return {
      key: "request-review",
      title: "IFTA is reviewing your request",
      description: "We will contact you soon about the next step. You do not need to do anything now.",
      href: "/client/engagements",
      cta: "View request",
      tone: "waiting",
    };
  }

  if (input.completedEngagements > 0 && !hasRequests) {
    return {
      key: "all-done",
      title: "Everything is complete",
      description: "Your finished work and records are stored safely in your archive.",
      href: "/client/archive",
      cta: "Open archive",
      tone: "done",
    };
  }

  return {
    key: "choose-service",
    title: "Choose a service to get started",
    description: "Browse what IFTA offers, add it to your cart and send your request in a few clicks.",
    href: "/client/services",
    cta: "Browse services",
    tone: "action",
  };
}

export function getClientJourney(input: ClientJourneyInput): JourneyStage[] {
  const hasRequest = input.requestStatuses.length > 0 || input.activeEngagements > 0 || input.completedEngagements > 0;
  const reviewed = input.requestStatuses.some((status) => ["approved", "converted"].includes(status)) || input.activeEngagements > 0 || input.completedEngagements > 0 || input.kycOpen;
  const verified = input.kycStatus === "approved" || input.activeEngagements > 0 || input.completedEngagements > 0;
  const signed = (input.activeEngagements > 0 || input.completedEngagements > 0) && input.lettersAwaitingSignature === 0;
  const working = input.activeEngagements > 0 || input.completedEngagements > 0;

  const done = [hasRequest, reviewed, verified, signed, working];
  const labels: Array<[string, string]> = [
    ["request", "Send your request"],
    ["review", "IFTA reviews it"],
    ["verify", "Verify your identity"],
    ["sign", "Sign the engagement letter"],
    ["work", "Work begins"],
  ];
  const firstOpen = done.findIndex((value) => !value);

  return labels.map(([key, label], index) => ({
    key,
    label,
    state: firstOpen === -1 || index < firstOpen ? "done" : index === firstOpen ? "current" : "upcoming",
  }));
}
