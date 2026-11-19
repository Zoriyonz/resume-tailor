import { describe, expect, it } from "vitest";

import {
  MAX_TEXT_CHARS,
  PDF_PREFIX,
  assertValidPdfBase64,
  buildContent,
  buildMessageContent,
  isPdfString,
  normalizeBase64,
  validateTailorInput,
} from "./tailor-request";

const pdfB64 = Buffer.from("%PDF-1.7 fake body").toString("base64");

describe("validateTailorInput", () => {
  it("accepts pasted text for both fields", () => {
    const result = validateTailorInput({ resume: "my resume", jobDescription: "the job" });
    expect(result).toEqual({
      ok: true,
      value: { resume: "my resume", jobDescription: "the job" },
    });
  });

  it("rejects non-object bodies", () => {
    expect(validateTailorInput(null)).toMatchObject({ ok: false });
    expect(validateTailorInput("text")).toMatchObject({ ok: false });
  });

  it("rejects missing, empty and non-string fields", () => {
    expect(validateTailorInput({ jobDescription: "x" })).toMatchObject({ ok: false });
    expect(validateTailorInput({ resume: "  ", jobDescription: "x" })).toMatchObject({ ok: false });
    expect(validateTailorInput({ resume: 42, jobDescription: "x" })).toMatchObject({ ok: false });
    expect(validateTailorInput({ resume: "x", jobDescription: null })).toMatchObject({ ok: false });
  });

  it("rejects text over the size limit", () => {
    const huge = "a".repeat(MAX_TEXT_CHARS + 1);
    expect(validateTailorInput({ resume: huge, jobDescription: "x" })).toMatchObject({
      ok: false,
      error: "Resume is too large.",
    });
  });

  it("allows a PDF payload larger than the text limit", () => {
    const bigPdf = PDF_PREFIX + "A".repeat(MAX_TEXT_CHARS + 10);
    expect(validateTailorInput({ resume: bigPdf, jobDescription: "x" })).toMatchObject({
      ok: true,
    });
  });
});

describe("PDF helpers", () => {
  it("detects the PDF marker", () => {
    expect(isPdfString(PDF_PREFIX + "abc")).toBe(true);
    expect(isPdfString("plain text")).toBe(false);
    expect(isPdfString(undefined)).toBe(false);
  });

  it("normalizes data URLs, whitespace, URL-safe characters and padding", () => {
    expect(normalizeBase64("data:application/pdf;base64,QUJD\n")).toBe("QUJD");
    expect(normalizeBase64("a-b_")).toBe("a+b/");
    expect(normalizeBase64("QUI")).toBe("QUI=");
  });

  it("accepts bytes that start with %PDF- and rejects anything else", () => {
    expect(() => assertValidPdfBase64(pdfB64, "resume")).not.toThrow();
    const notPdf = Buffer.from("hello world").toString("base64");
    expect(() => assertValidPdfBase64(notPdf, "resume")).toThrow(/Not a valid PDF/);
  });
});

describe("buildContent / buildMessageContent", () => {
  it("wraps text in a labelled text block", () => {
    expect(buildContent("hello", "resume")).toEqual([{ type: "text", text: "resume:\n\nhello" }]);
  });

  it("turns a PDF into a document block followed by a caption", () => {
    const blocks = buildContent(PDF_PREFIX + pdfB64, "resume");
    expect(blocks[0]).toMatchObject({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfB64 },
    });
    expect(blocks[1]).toEqual({ type: "text", text: "The above document is the resume." });
  });

  it("rejects a PDF-marked string that is not a PDF", () => {
    const notPdf = Buffer.from("not a pdf").toString("base64");
    expect(() => buildContent(PDF_PREFIX + notPdf, "resume")).toThrow();
  });

  it("assembles resume, separator, job description and instruction in order", () => {
    const blocks = buildMessageContent({ resume: "R", jobDescription: "J" });
    expect(blocks.map((b) => (b.type === "text" ? b.text : b.type))).toEqual([
      "candidate's current resume:\n\nR",
      "\n---\n",
      "job description they are applying to:\n\nJ",
      "\n---\n\nPlease tailor the resume to this job description.",
    ]);
  });
});
