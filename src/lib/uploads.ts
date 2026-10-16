/**
 * Central upload rules for the IFTA portal.
 *
 * Every upload form and server action should use this module so the formats
 * accepted in the UI always match what the server enforces.
 *
 * Supported formats (per the IFTA workflow specification):
 *   Text-based : DOCX, XLSX, CSV, TXT, XML (plus legacy DOC, XLS and PDF)
 *   Images     : JPG, PNG, TIFF
 *   Archives   : ZIP
 */

export type UploadScope = "documents" | "identity";

type Signature = "pdf" | "jpeg" | "png" | "tiff" | "zip" | "ole" | "text" | "xml";

type UploadFormat = {
  key: string;
  label: string;
  extensions: string[];
  /** First entry is the canonical type stored with the file. */
  mimeTypes: string[];
  signature: Signature;
  scopes: UploadScope[];
};

const BOTH: UploadScope[] = ["documents", "identity"];
const DOCUMENTS_ONLY: UploadScope[] = ["documents"];

export const UPLOAD_FORMATS: readonly UploadFormat[] = [
  { key: "pdf", label: "PDF", extensions: ["pdf"], mimeTypes: ["application/pdf"], signature: "pdf", scopes: BOTH },
  {
    key: "docx",
    label: "Word",
    extensions: ["docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    signature: "zip",
    scopes: DOCUMENTS_ONLY,
  },
  { key: "doc", label: "Word", extensions: ["doc"], mimeTypes: ["application/msword"], signature: "ole", scopes: DOCUMENTS_ONLY },
  {
    key: "xlsx",
    label: "Excel",
    extensions: ["xlsx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    signature: "zip",
    scopes: DOCUMENTS_ONLY,
  },
  { key: "xls", label: "Excel", extensions: ["xls"], mimeTypes: ["application/vnd.ms-excel"], signature: "ole", scopes: DOCUMENTS_ONLY },
  {
    key: "csv",
    label: "CSV",
    extensions: ["csv"],
    // Windows browsers frequently label CSV files as Excel or plain text.
    mimeTypes: ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"],
    signature: "text",
    scopes: DOCUMENTS_ONLY,
  },
  { key: "txt", label: "TXT", extensions: ["txt"], mimeTypes: ["text/plain"], signature: "text", scopes: DOCUMENTS_ONLY },
  { key: "xml", label: "XML", extensions: ["xml"], mimeTypes: ["text/xml", "application/xml"], signature: "xml", scopes: DOCUMENTS_ONLY },
  { key: "jpg", label: "JPG", extensions: ["jpg", "jpeg"], mimeTypes: ["image/jpeg", "image/pjpeg"], signature: "jpeg", scopes: BOTH },
  { key: "png", label: "PNG", extensions: ["png"], mimeTypes: ["image/png"], signature: "png", scopes: BOTH },
  { key: "tiff", label: "TIFF", extensions: ["tif", "tiff"], mimeTypes: ["image/tiff"], signature: "tiff", scopes: BOTH },
  {
    key: "zip",
    label: "ZIP",
    extensions: ["zip"],
    mimeTypes: ["application/zip", "application/x-zip-compressed", "multipart/x-zip"],
    signature: "zip",
    scopes: DOCUMENTS_ONLY,
  },
];

/** Browsers send these when they do not recognise the file type. */
const UNKNOWN_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);

export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type UploadFailureReason = "empty" | "size" | "type" | "content";

export type UploadValidation =
  | { ok: true; contentType: string; extension: string; formatKey: string }
  | { ok: false; reason: UploadFailureReason };

function formatsForScope(scope: UploadScope) {
  return UPLOAD_FORMATS.filter((format) => format.scopes.includes(scope));
}

/** Value for the HTML `accept` attribute, e.g. ".pdf,.docx,.xlsx". */
export function uploadAcceptAttribute(scope: UploadScope = "documents") {
  return formatsForScope(scope)
    .flatMap((format) => format.extensions.map((extension) => `.${extension}`))
    .join(",");
}

/** Friendly list for help text, e.g. "PDF, Word, Excel, CSV, TXT, XML, JPG, PNG, TIFF or ZIP". */
export function uploadFormatsLabel(scope: UploadScope = "documents") {
  const labels = [...new Set(formatsForScope(scope).map((format) => format.label))];
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}

export function formatMegabytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** One sentence for forms: "PDF, Word ... Maximum 10 MB." */
export function uploadHelpText(scope: UploadScope = "documents", maxBytes = DEFAULT_MAX_UPLOAD_BYTES) {
  return `${uploadFormatsLabel(scope)}. Maximum ${formatMegabytes(maxBytes)} per file.`;
}

export function fileExtension(name: string) {
  const match = /\.([A-Za-z0-9]+)$/.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function hasSignature(bytes: Uint8Array, signature: Signature) {
  switch (signature) {
    case "pdf": {
      // The PDF header may be preceded by a few bytes of junk.
      const head = new TextDecoder("latin1").decode(bytes.subarray(0, 1024));
      return head.includes("%PDF-");
    }
    case "jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "tiff":
      return startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a]);
    case "zip":
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
    case "ole":
      return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case "text":
    case "xml": {
      const hasUtf16Bom = startsWith(bytes, [0xff, 0xfe]) || startsWith(bytes, [0xfe, 0xff]);
      if (!hasUtf16Bom && bytes.includes(0)) return false; // binary data pretending to be text
      if (signature === "text") return true;
      const text = new TextDecoder("utf-8").decode(bytes.subarray(0, 512)).replace(/^\uFEFF/, "").trimStart();
      return hasUtf16Bom || text.startsWith("<");
    }
  }
}

/**
 * Validate an uploaded file by extension, declared MIME type, size and the
 * actual file header, so renaming `virus.exe` to `report.pdf` is rejected.
 * The returned `contentType` is canonical and safe to store.
 */
export async function validateUpload(
  file: File,
  options: { scope?: UploadScope; maxBytes?: number } = {},
): Promise<UploadValidation> {
  const scope = options.scope ?? "documents";
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;

  if (!file.size) return { ok: false, reason: "empty" };
  if (file.size > maxBytes) return { ok: false, reason: "size" };

  const extension = fileExtension(file.name);
  const format = formatsForScope(scope).find((candidate) => candidate.extensions.includes(extension));
  if (!format) return { ok: false, reason: "type" };

  const declared = file.type.trim().toLowerCase();
  if (!UNKNOWN_MIME_TYPES.has(declared) && !format.mimeTypes.includes(declared)) {
    return { ok: false, reason: "type" };
  }

  const head = new Uint8Array(await file.slice(0, 8192).arrayBuffer());
  if (!hasSignature(head, format.signature)) return { ok: false, reason: "content" };

  return { ok: true, contentType: format.mimeTypes[0], extension, formatKey: format.key };
}

/** Plain-language message for an upload failure. */
export function uploadFailureMessage(reason: UploadFailureReason, scope: UploadScope = "documents", maxBytes = DEFAULT_MAX_UPLOAD_BYTES) {
  switch (reason) {
    case "empty":
      return "That file looks empty. Please choose a file and try again.";
    case "size":
      return `That file is too large. Please choose a file under ${formatMegabytes(maxBytes)}.`;
    case "type":
      return `That file type is not supported. Please upload ${uploadFormatsLabel(scope)}.`;
    case "content":
      return "That file could not be read. It may be damaged or saved with the wrong extension. Please re-save it and try again.";
  }
}

/**
 * Only formats every browser renders safely may be opened inline. Everything
 * else (XML, TXT, CSV, ZIP, Office files) must always download, because XML
 * and text served inline can execute script in some browsers.
 */
export function canPreviewInline(contentType: string | null | undefined) {
  const type = (contentType ?? "").toLowerCase();
  return type === "application/pdf" || type === "image/jpeg" || type === "image/png";
}
