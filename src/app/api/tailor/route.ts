import { MODEL } from "@/lib/constants";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import {
  SYSTEM_PROMPT,
  buildMessageContent,
  isPdfString,
  validateTailorInput,
} from "@/lib/tailor-request";

export const runtime = "nodejs";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const limiter = createRateLimiter(10, 60 * 60 * 1000);

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message: string };
}

export async function POST(request: Request): Promise<Response> {
  if (!limiter.check(clientIp(request))) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  if (!key) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is missing. Restart the dev server after setting .env.local." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = validateTailorInput(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  let messageContent;
  try {
    messageContent = buildMessageContent(parsed.value);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }

  const usesPdf = isPdfString(parsed.value.resume) || isPdfString(parsed.value.jobDescription);
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      ...(usesPdf ? { "anthropic-beta": "pdfs-2024-09-25" } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    }),
  });

  const data = (await response.json()) as AnthropicResponse;
  if (!response.ok) {
    return Response.json(
      { error: data.error?.message ?? "Unknown API error" },
      { status: response.status },
    );
  }

  const text = data.content?.find((block) => block.type === "text")?.text ?? "";
  return Response.json({ result: text });
}
