export const runtime = "nodejs";

export async function POST(request) {
    const { resume, jobDescription } = await request.json();

    const key = (process.env.ANTHROPIC_API_KEY || "").trim();
    if (!key) {
        return Response.json(
            { error: "ANTHROPIC_API_KEY is missing. Restart dev server after setting .env.local." },
            { status: 500 }
        );
    }

    const systemPrompt = `You are an elite resume writer and ATS optimization specialist with 15+ years of experience helping candidates land jobs at top companies.

Your job is to rewrite a resume to perfectly match a specific job description.

FORMATTING RULES:
- Section headers in ALL CAPS (EXPERIENCE, EDUCATION, SKILLS, SUMMARY, etc.)
- Each bullet point on its own line starting with •
- Keep contact info at the top exactly as provided
- Consistent date formatting (e.g. Jan 2022 – Mar 2024)
- One blank line between sections
- Role/company name on its own line, date on the next line

ATS OPTIMIZATION:
- Mirror the EXACT keywords and phrases from the job description
- Include the job title from the posting naturally in the summary
- Add relevant skills from the job description to the skills section

CONTENT:
- Achievement-focused bullets with metrics where possible
- Strong action verbs — never "Responsible for" or "Helped"
- Rewrite the summary to speak directly to this job

OUTPUT: Return ONLY the resume. No commentary, no intro text.`;

    const isPdfString = (v) => typeof v === "string" && v.startsWith("__PDF__");

    const normalizeB64 = (b64) => {
        let s = (b64 || "").trim();
        // If someone ever sends a data URL by mistake, strip it.
        s = s.replace(/^data:application\/pdf;base64,/, "");
        // Remove whitespace/newlines
        s = s.replace(/\s+/g, "");
        // base64url -> base64 (defensive)
        s = s.replace(/-/g, "+").replace(/_/g, "/");
        // fix padding
        const pad = s.length % 4;
        if (pad) s += "=".repeat(4 - pad);
        return s;
    };

    const assertValidPdfBase64 = (b64, label) => {
        let buf;
        try {
            buf = Buffer.from(b64, "base64");
        } catch {
            throw new Error(`${label}: Invalid base64 data (server could not decode).`);
        }
        const head = buf.subarray(0, 5).toString("utf8");
        if (head !== "%PDF-") {
            // This is the exact failure you saw: "Sarah" etc.
            throw new Error(`${label}: Not a valid PDF (missing %PDF- header). Got: "${head}"`);
        }
    };

    function buildContent(data, label) {
        if (isPdfString(data)) {
            const rawB64 = normalizeB64(data.slice("__PDF__".length));

            // Fail fast with a useful message
            assertValidPdfBase64(rawB64, label);

            return [
                {
                    type: "document",
                    source: {
                        type: "base64",
                        media_type: "application/pdf",
                        data: rawB64, // IMPORTANT: RAW base64 only (no data: prefix)
                    },
                },
                { type: "text", text: `The above document is the ${label}.` },
            ];
        }

        const safeText = typeof data === "string" ? data : JSON.stringify(data ?? "");
        return [{ type: "text", text: `${label}:\n\n${safeText}` }];
    }

    let resumeContent, jobContent;
    try {
        resumeContent = buildContent(resume, "candidate's current resume");
        jobContent = buildContent(jobDescription, "job description they are applying to");
    } catch (e) {
        return Response.json({ error: e.message }, { status: 400 });
    }

    const messageContent = [
        ...resumeContent,
        { type: "text", text: "\n---\n" },
        ...jobContent,
        { type: "text", text: "\n---\n\nPlease tailor the resume to this job description." },
    ];

    const usesPDF = isPdfString(resume) || isPdfString(jobDescription);

    const headers = {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        ...(usesPDF ? { "anthropic-beta": "pdfs-2024-09-25" } : {}),
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: messageContent }],
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const msg = data?.error?.message || "Unknown API error";
        return Response.json({ error: msg, raw: data }, { status: response.status });
    }

    const textOut = data?.content?.find((c) => c.type === "text")?.text ?? "";
    return Response.json({ result: textOut });
}