import { describe, expect, it } from "vitest";
import { CLIENT_KYC_QUESTIONS } from "./client-questionnaire";

describe("client KYC questionnaire", () => {
  it("includes the expanded customer, business, compliance, and document sections", () => {
    const ids = CLIENT_KYC_QUESTIONS.map((question) => question.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "customer_type",
        "full_legal_name",
        "date_of_birth",
        "nationality",
        "national_id",
        "kra_pin",
        "phone_number",
        "email_address",
        "physical_address",
        "postal_address",
        "country",
        "source_of_income",
        "registered_business_name",
        "business_registration_number",
        "business_type",
        "date_of_registration",
        "directors_owners_beneficiaries",
        "purpose_of_registration",
        "compliance_risk_questions",
      ]),
    );
  });

  it("treats the customer image field as a real image upload field", () => {
    const customerImageQuestion = CLIENT_KYC_QUESTIONS.find((question) => question.id === "customer_image");

    expect(customerImageQuestion).toBeDefined();
    expect(customerImageQuestion?.kind).toBe("file");
  });
});
