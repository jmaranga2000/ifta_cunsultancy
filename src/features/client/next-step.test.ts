import { describe, expect, it } from "vitest";
import { getClientJourney, getClientNextStep, type ClientJourneyInput } from "@/features/client/next-step";

const base: ClientJourneyInput = {
  requestStatuses: [],
  kycOpen: false,
  kycStatus: null,
  lettersAwaitingSignature: 0,
  activeEngagements: 0,
  completedEngagements: 0,
  unpaidInvoices: 0,
};

describe("getClientNextStep", () => {
  it("sends brand new clients to the service catalogue", () => {
    expect(getClientNextStep(base)).toMatchObject({ key: "choose-service", href: "/client/services", tone: "action" });
  });

  it("waits quietly while IFTA reviews a request", () => {
    expect(getClientNextStep({ ...base, requestStatuses: ["admin_review"] })).toMatchObject({ key: "request-review", tone: "waiting" });
  });

  it("asks the client to review a sent quotation", () => {
    expect(getClientNextStep({ ...base, requestStatuses: ["quotation_sent"] })).toMatchObject({ key: "review-quotation", href: "/client/quotations" });
  });

  it("walks through KYC states", () => {
    const open = { ...base, requestStatuses: ["approved"], kycOpen: true };
    expect(getClientNextStep({ ...open, kycStatus: "draft" })).toMatchObject({ key: "complete-kyc", tone: "action" });
    expect(getClientNextStep({ ...open, kycStatus: "changes_requested" })).toMatchObject({ key: "fix-kyc", tone: "action" });
    expect(getClientNextStep({ ...open, kycStatus: "under_review" })).toMatchObject({ key: "kyc-review", tone: "waiting" });
  });

  it("puts signing ahead of everything else", () => {
    expect(getClientNextStep({ ...base, kycOpen: true, kycStatus: "draft", unpaidInvoices: 2, lettersAwaitingSignature: 1 }).key).toBe("sign-letter");
  });

  it("prompts payment once work is active and an invoice is open", () => {
    expect(getClientNextStep({ ...base, activeEngagements: 1, unpaidInvoices: 1 })).toMatchObject({ key: "pay-invoice", href: "/client/payments/new" });
    expect(getClientNextStep({ ...base, activeEngagements: 1, unpaidInvoices: 3 }).title).toBe("You have 3 invoices to pay");
  });

  it("reports progress while work is active", () => {
    expect(getClientNextStep({ ...base, activeEngagements: 2 })).toMatchObject({ key: "work-in-progress", tone: "waiting" });
  });

  it("points finished clients to the archive", () => {
    expect(getClientNextStep({ ...base, completedEngagements: 1 })).toMatchObject({ key: "all-done", tone: "done" });
  });
});

describe("getClientJourney", () => {
  const states = (input: ClientJourneyInput) => getClientJourney(input).map((stage) => stage.state);

  it("starts with the first step current", () => {
    expect(states(base)).toEqual(["current", "upcoming", "upcoming", "upcoming", "upcoming"]);
  });

  it("moves forward as a request is submitted and approved", () => {
    expect(states({ ...base, requestStatuses: ["admin_review"] })).toEqual(["done", "current", "upcoming", "upcoming", "upcoming"]);
    expect(states({ ...base, requestStatuses: ["approved"], kycOpen: true, kycStatus: "draft" })).toEqual(["done", "done", "current", "upcoming", "upcoming"]);
  });

  it("marks everything done once work has begun", () => {
    expect(states({ ...base, activeEngagements: 1 })).toEqual(["done", "done", "done", "done", "done"]);
  });
});
