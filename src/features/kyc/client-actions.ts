"use server";

import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server";
import { CLIENT_KYC_QUESTIONS } from "@/features/kyc/client-questionnaire";
import { getR2Client, getR2Configuration } from "@/lib/r2";
import {
  CLIENT_KYC_DOCUMENT_LABELS,
  addClientKycDocuments,
  getClientKycSubmission,
  hasClientKycDocument,
  saveClientKycAnswers,
  submitClientKycForReview,
  type ClientKycDocumentType,
} from "@/repositories/client-kyc-repository";
import { getClientKycAccess, notifyKycSubmitted } from "@/repositories/request-onboarding-repository";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const allowedDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

async function requireClientKycUser() {
  const principal = await getCurrentUser();

  if (!principal) {
    redirect("/sign-in");
  }

  if (!principal.roleKeys.includes("client") && !principal.roleKeys.includes("client_representative")) {
    redirect("/access-blocked");
  }

  if (!(await getClientKycAccess(principal.id))) {
    redirect("/client/kyc?error=locked");
  }

  return principal;
}

async function uploadKycDocumentsToStorage(userId: string, files: Array<{ file: File; documentType: ClientKycDocumentType }>) {
  if (files.length === 0) return [];

  const configuration = getR2Configuration();
  return Promise.all(files.map(async ({ file, documentType }) => {
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-") || `${documentType}-document`;
    const key = `kyc/${userId}/${documentType}/${randomUUID()}-${filename}`;
    await getR2Client().send(new PutObjectCommand({
      Bucket: configuration.bucketName,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ContentDisposition: `attachment; filename="${filename}"`,
      Metadata: { documentType, documentLabel: CLIENT_KYC_DOCUMENT_LABELS[documentType] },
    }));

    return { r2Key: key, filename, contentType: file.type, size: file.size, documentType };
  }));
}

export async function saveClientKycQuestionnaireAction(formData: FormData) {
  const principal = await requireClientKycUser();
  const answers: Record<string, string> = {};

  for (const question of CLIENT_KYC_QUESTIONS) {
    if (question.kind === "repeatable-group") {
      const entries: Array<Record<string, string>> = [];
      const grouped = new Map<number, Record<string, string>>();

      for (const [name, value] of formData.entries()) {
        if (typeof name !== "string") continue;
        const match = name.match(new RegExp(`^${question.id}__(\\d+)__(.+)$`));
        if (!match) continue;

        const [, indexText, fieldId] = match;
        const entryIndex = Number(indexText);
        const entry = grouped.get(entryIndex) ?? {};
        entry[fieldId] = String(value).trim();
        grouped.set(entryIndex, entry);
      }

      const sortedEntries = Array.from(grouped.entries())
        .sort(([left], [right]) => left - right)
        .map(([, entry]) => entry)
        .filter((entry) => Object.values(entry).some((item) => item.trim().length > 0));

      answers[question.id] = JSON.stringify(sortedEntries);
      continue;
    }

    answers[question.id] = String(formData.get(question.id) ?? "").trim();
  }

  const uploads = [
    { field: "document-id_front_back", documentType: "identity_card" as const },
    { field: "document-passport_bio_page", documentType: "passport_bio_page" as const },
    { field: "document-kra_pin_certificate", documentType: "tax_pin" as const },
    { field: "document-passport_photo", documentType: "passport_photo" as const },
    { field: "document-proof_of_address", documentType: "proof_of_address" as const },
    { field: "document-business_registration_documents", documentType: "business_registration_documents" as const },
    { field: "document-ownership_documents", documentType: "ownership_documents" as const },
    { field: "document-authorisation_documents", documentType: "authorisation_documents" as const },
    { field: "document-certificate_of_incorporation", documentType: "certificate_of_incorporation" as const },
    { field: "document-cr12_or_ownership_record", documentType: "cr12_or_ownership_record" as const },
    { field: "document-business_licence", documentType: "business_licence" as const },
    { field: "document-board_resolution", documentType: "board_resolution" as const },
    { field: "document-latest_annual_return", documentType: "latest_annual_return" as const },
    { field: "document-financial_statements", documentType: "financial_statements" as const },
    { field: "document-business_address_proof", documentType: "business_address_proof" as const },
  ].flatMap(({ field, documentType }) => {
    const value = formData.get(field);
    return value instanceof File && value.size > 0 ? [{ file: value, documentType }] : [];
  });

  await saveClientKycAnswers(principal.id, answers);

  if (uploads.length > 0) {
    const storedDocuments = await uploadKycDocumentsToStorage(principal.id, uploads);
    await addClientKycDocuments(principal.id, storedDocuments);
  }

  redirect("/client/kyc/questionnaire?saved=1");
}

export async function uploadClientKycReplacementAction(formData: FormData) {
  const principal = await requireClientKycUser();
  const submission = await getClientKycSubmission(principal.id);
  const inputs: Array<{ field: string; type: ClientKycDocumentType; required: boolean }> = [
    { field: "identityDocument", type: "identity_card", required: true },
    { field: "taxPinDocument", type: "tax_pin", required: true },
    { field: "addressDocument", type: "proof_of_address", required: true },
    { field: "passportPhotoDocument", type: "passport_photo", required: false },
    { field: "passportBioPageDocument", type: "passport_bio_page", required: false },
    { field: "businessRegistrationDocument", type: "business_registration_documents", required: false },
    { field: "ownershipDocument", type: "ownership_documents", required: false },
    { field: "authorisationDocument", type: "authorisation_documents", required: false },
    { field: "incorporationDocument", type: "certificate_of_incorporation", required: false },
    { field: "cr12Document", type: "cr12_or_ownership_record", required: false },
    { field: "businessLicenceDocument", type: "business_licence", required: false },
    { field: "boardResolutionDocument", type: "board_resolution", required: false },
    { field: "annualReturnDocument", type: "latest_annual_return", required: false },
    { field: "financialStatementsDocument", type: "financial_statements", required: false },
    { field: "businessAddressDocument", type: "business_address_proof", required: false },
  ];
  const uploads = inputs.flatMap((input) => {
    const value = formData.get(input.field);
    return value instanceof File && value.size > 0 ? [{ ...input, file: value }] : [];
  });

  for (const input of inputs.filter((item) => item.required)) {
    const included = uploads.some((upload) => upload.type === input.type);
    if (!included && !hasClientKycDocument(submission, input.type)) {
      redirect(`/client/kyc/upload-replacement?error=${input.type === "identity_card" ? "identity-required" : "tax-required"}`);
    }
  }
  if (uploads.length === 0) redirect("/client/kyc/upload-replacement?error=missing-file");
  if (uploads.some((upload) => upload.file.size > MAX_DOCUMENT_SIZE)) {
    redirect("/client/kyc/upload-replacement?error=file-too-large");
  }
  if (uploads.some((upload) => !allowedDocumentTypes.has(upload.file.type))) {
    redirect("/client/kyc/upload-replacement?error=unsupported-file");
  }

  try {
    const storedDocuments = await uploadKycDocumentsToStorage(principal.id, uploads.map(({ file, type }) => ({ file, documentType: type })));
    await addClientKycDocuments(principal.id, storedDocuments);
  } catch (error) {
    console.error("Unable to upload the client KYC documents.", error);
    redirect("/client/kyc/upload-replacement?error=upload-failed");
  }

  redirect("/client/kyc?uploaded=1");
}

export async function submitClientKycForReviewAction() {
  const principal = await requireClientKycUser();
  const result = await submitClientKycForReview(principal.id);

  if (!result.submitted) {
    redirect(`/client/kyc?error=${result.reason === "missing-required-documents" ? "required-documents" : "complete-questionnaire"}`);
  }

  if (result.reason === "submitted") {
    try {
      await notifyKycSubmitted(principal.id, principal);
    } catch (error) {
      // The KYC record is already safely submitted; a notification failure must not undo it.
      console.error("Unable to send KYC review notifications.", error);
    }
  }

  redirect(`/client/kyc?submitted=1${result.documentsMissing ? "&documents=missing" : ""}`);
}
