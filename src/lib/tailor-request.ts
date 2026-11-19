/**
 * Request handling for /api/tailor: input validation and construction of the
 * Anthropic message content. Kept free of Next.js imports so it can be unit tested.
 */

/** Marker the client puts in front of a base64 PDF to distinguish it from pasted text. */
export const PDF_PREFIX = "__PDF__";

/** Maximum characters of pasted text per field. */
export const MAX_TEXT_CHARS = 60_000;

/** Maximum base64 characters per PDF field (about 10 MB of binary). */
export const MAX_PDF_BASE64_CHARS = 14_000_000;

export const SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization specialist.

Your job is to rewrite a resume so it matches a specific job description.

FORMATTING RULES:
- Section headers in ALL CAPS (EXPERIENCE, EDUCATION, SKILLS, SUMMARY, etc.)
- Each bullet point on its own line starting with •
- Keep contact info at the top exactly as provided
- Consistent date formatting (e.g. Jan 2022 – Mar 2024)
- One blank line between sections
- Role/company name on its own line, date on the next line

ATS OPTIMIZATION:
- Mirror the exact keywords and phrases from the job description where they truthfully apply
- Include the job title from the posting naturally in the summary
- Add skills from the job description to the skills section only if the resume already evidences them

CONTENT:
- Achievement-focused bullets with strong action verbs, never "Responsible for" or "Helped"
- Rewrite the summary to speak directly to this job

TRUTHFULNESS RULES (highest priority):
- Never invent employers, job titles, dates, degrees, certifications, tools or responsibilities
- Never add a number or metric that is not already in the original resume; keep every figure exactly as written
- You may reorder, rephrase and emphasise what is there, but every claim must be supported by the original resume

OUTPUT: Return ONLY the resume. No commentary, no intro text.`;

export type ContentBlock =
  | {
      type: "document";
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    }
  | { type: "text"; text: string };

export interface TailorInput {
  resume: string;
  jobDescription: string;
}

export type ValidationResult = { ok: true; value: TailorInput } | { ok: false; error: string };

export function isPdfString(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PDF_PREFIX);
}

/** Strips a data-URL prefix and whitespace, converts URL-safe base64 and restores padding. */
export function normalizeBase64(b64: string): string {
  let s = (b64 || "").trim();
  s = s.replace(/^data:application\/pdf;base64,/, "");
  s = s.replace(/\s+/g, "");
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

/** Throws unless the decoded bytes start with the %PDF- magic number. */
export function assertValidPdfBase64(b64: string, label: string): void {
  let buf: Buffer;
  try {
    buf = Buffer.from(b64, "base64");
  } catch {
    throw new Error(`${label}: Invalid base64 data (server could not decode).`);
  }
  const head = buf.subarray(0, 5).toString("utf8");
  if (head !== "%PDF-") {
    throw new Error(`${label}: Not a valid PDF (missing %PDF- header).`);
  }
}

function validateField(
  value: unknown,
  label: string,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: `${label} is required.` };
  }
  const limit = isPdfString(value) ? MAX_PDF_BASE64_CHARS + PDF_PREFIX.length : MAX_TEXT_CHARS;
  if (value.length > limit) {
    return { ok: false, error: `${label} is too large.` };
  }
  return { ok: true, value };
}

export function validateTailorInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const { resume, jobDescription } = body as Record<string, unknown>;
  const resumeCheck = validateField(resume, "Resume");
  if (!resumeCheck.ok) return resumeCheck;
  const jobCheck = validateField(jobDescription, "Job description");
  if (!jobCheck.ok) return jobCheck;
  return { ok: true, value: { resume: resumeCheck.value, jobDescription: jobCheck.value } };
}

export function buildContent(data: string, label: string): ContentBlock[] {
  if (isPdfString(data)) {
    const b64 = normalizeBase64(data.slice(PDF_PREFIX.length));
    assertValidPdfBase64(b64, label);
    return [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
      { type: "text", text: `The above document is the ${label}.` },
    ];
  }
  return [{ type: "text", text: `${label}:\n\n${data}` }];
}

export function buildMessageContent(input: TailorInput): ContentBlock[] {
  return [
    ...buildContent(input.resume, "candidate's current resume"),
    { type: "text", text: "\n---\n" },
    ...buildContent(input.jobDescription, "job description they are applying to"),
    { type: "text", text: "\n---\n\nPlease tailor the resume to this job description." },
  ];
}
