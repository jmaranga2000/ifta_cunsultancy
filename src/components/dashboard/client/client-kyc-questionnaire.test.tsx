import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientKycQuestionnaire } from "./client-kyc-questionnaire";

describe("ClientKycQuestionnaire", () => {
  it("does not render the documents upload section", () => {
    const submission = {
      answers: {},
      questionnaire: { answered: 0, total: 1, complete: false },
      documents: [],
      status: "draft",
      submittedAt: null,
    } as any;

    const html = renderToStaticMarkup(<ClientKycQuestionnaire saved={false} submission={submission} />);

    expect(html).not.toContain("Upload the supporting evidence");
    expect(html).not.toContain("Documents");
  });
});
