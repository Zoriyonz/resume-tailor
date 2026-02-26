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

    // Normalize base64: remove whitespace/newlines and ensure it's pure base64 chars.
    const normalizeB64 = (b64) =>
        b64
            .replace(/^data:application\/pdf;base64,/, "")
            .replace(/\s+/g, "");

    function buildContent(data, label) {
        if (isPdfString(data)) {
            const rawB64 = normalizeB64(data.substring("__PDF__".length));

            // IMPORTANT: Anthropic PDF beta works reliably with a data URL
            const dataUrl = `data:application/pdf;base64,${rawB64}`;

            return [
                {
                    type: "document",
                    source: {
                        type: "base64",
                        media_type: "application/pdf",
                        data: dataUrl, // <-- key fix: include data URL prefix
                    },
                },
                { type: "text", text: `The above document is the ${label}.` },
            ];
        }

        // Plain text fallback
        const safeText = typeof data === "string" ? data : JSON.stringify(data ?? "");
        return [{ type: "text", text: `${label}:\n\n${safeText}` }];
    }

    const resumeContent = buildContent(resume, "candidate's current resume");
    const jobContent = buildContent(jobDescription, "job description they are applying to");

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