import { describe, expect, it } from "vitest";
import {
  uploadAcceptAttribute,
  uploadFormatsLabel,
  validateUpload,
} from "@/lib/uploads";

function file(name: string, bytes: number[] | string, type = "") {
  const body = typeof bytes === "string" ? new TextEncoder().encode(bytes) : new Uint8Array(bytes);
  return new File([body], name, { type });
}

const PDF = "%PDF-1.7\n";
const ZIP = [0x50, 0x4b, 0x03, 0x04, 0, 0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0];
const JPG = [0xff, 0xd8, 0xff, 0xe0, 0];
const TIFF_LE = [0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0];
const TIFF_BE = [0x4d, 0x4d, 0x00, 0x2a, 0, 0, 0, 8];
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

describe("validateUpload - every format in the IFTA specification", () => {
  const accepted: Array<[string, File]> = [
    ["PDF", file("a.pdf", PDF, "application/pdf")],
    ["DOCX", file("a.docx", ZIP, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")],
    ["XLSX", file("a.xlsx", ZIP, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")],
    ["CSV (Excel MIME from Windows)", file("a.csv", "a,b\n1,2\n", "application/vnd.ms-excel")],
    ["CSV (no MIME)", file("a.csv", "a,b\n1,2\n")],
    ["TXT", file("a.txt", "hello", "text/plain")],
    ["XML", file("a.xml", '<?xml version="1.0"?><a/>', "text/xml")],
    ["XML (application/xml)", file("a.xml", "<a/>", "application/xml")],
    ["JPG", file("a.jpg", JPG, "image/jpeg")],
    ["JPEG", file("a.JPEG", JPG, "image/jpeg")],
    ["PNG", file("a.png", PNG, "image/png")],
    ["TIFF little-endian", file("a.tiff", TIFF_LE, "image/tiff")],
    ["TIF big-endian", file("a.tif", TIFF_BE)],
    ["ZIP", file("a.zip", ZIP, "application/x-zip-compressed")],
    ["legacy DOC", file("a.doc", OLE, "application/msword")],
    ["legacy XLS", file("a.xls", OLE, "application/vnd.ms-excel")],
  ];

  it.each(accepted)("accepts %s", async (_label, upload) => {
    const result = await validateUpload(upload);
    expect(result.ok).toBe(true);
  });

  it("returns a canonical content type instead of trusting the browser", async () => {
    const result = await validateUpload(file("a.csv", "a,b", "application/vnd.ms-excel"));
    expect(result).toMatchObject({ ok: true, contentType: "text/csv" });
  });
});

describe("validateUpload - rejections", () => {
  it("rejects unsupported extensions", async () => {
    expect(await validateUpload(file("run.exe", [0x4d, 0x5a, 0]))).toEqual({ ok: false, reason: "type" });
    expect(await validateUpload(file("page.html", "<html>"))).toEqual({ ok: false, reason: "type" });
    expect(await validateUpload(file("logo.svg", "<svg/>"))).toEqual({ ok: false, reason: "type" });
  });

  it("rejects files whose contents do not match the extension", async () => {
    expect(await validateUpload(file("fake.pdf", [0x4d, 0x5a, 0, 0]))).toEqual({ ok: false, reason: "content" });
    expect(await validateUpload(file("fake.png", JPG))).toEqual({ ok: false, reason: "content" });
    expect(await validateUpload(file("fake.txt", [0x68, 0x00, 0x69]))).toEqual({ ok: false, reason: "content" });
    expect(await validateUpload(file("fake.xml", "not xml"))).toEqual({ ok: false, reason: "content" });
  });

  it("rejects a declared MIME type that contradicts the extension", async () => {
    expect(await validateUpload(file("a.pdf", PDF, "image/png"))).toEqual({ ok: false, reason: "type" });
  });

  it("rejects empty and oversized files", async () => {
    expect(await validateUpload(file("a.pdf", ""))).toEqual({ ok: false, reason: "empty" });
    expect(await validateUpload(file("a.pdf", PDF), { maxBytes: 3 })).toEqual({ ok: false, reason: "size" });
  });

  it("limits identity documents to PDF and images", async () => {
    expect(await validateUpload(file("id.tiff", TIFF_LE), { scope: "identity" })).toMatchObject({ ok: true });
    expect(await validateUpload(file("id.docx", ZIP), { scope: "identity" })).toEqual({ ok: false, reason: "type" });
    expect(await validateUpload(file("id.zip", ZIP), { scope: "identity" })).toEqual({ ok: false, reason: "type" });
  });
});

describe("UI helpers", () => {
  it("lists every spec format in the accept attribute", () => {
    const accept = uploadAcceptAttribute("documents").split(",");
    for (const extension of [".docx", ".xlsx", ".csv", ".txt", ".xml", ".jpg", ".png", ".tif", ".tiff", ".zip"]) {
      expect(accept).toContain(extension);
    }
  });

  it("describes formats in plain language", () => {
    expect(uploadFormatsLabel("identity")).toBe("PDF, JPG, PNG or TIFF");
  });
});
