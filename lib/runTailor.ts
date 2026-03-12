export async function runTailor(resume: string, jobDescription: string): Promise<string> {
  const response = await fetch("/api/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, jobDescription }),
  });
  const data = await response.json() as { result?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? "";
}
