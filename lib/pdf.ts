const SECTION_KEYWORDS = [
  "EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "OBJECTIVE",
  "CERTIFICATIONS", "PROJECTS", "AWARDS", "PUBLICATIONS", "LANGUAGES",
  "INTERESTS", "VOLUNTEER", "REFERENCES", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE",
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSectionHtml(lines: string[]): string {
  let body = "";
  let inList = false;
  let firstNonBullet = true;

  for (const line of lines) {
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("▸");
    if (isBullet) {
      if (!inList) { body += "<ul>"; inList = true; }
      body += `<li>${escapeHtml(line.replace(/^[•\-▸]\s*/, ""))}</li>`;
    } else {
      if (inList) { body += "</ul>"; inList = false; }
      if (firstNonBullet) {
        body += `<p class="role-line">${escapeHtml(line)}</p>`;
        firstNonBullet = false;
      } else {
        const isDate = /\d{4}/.test(line) || /present/i.test(line) ||
          /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(line);
        body += `<p class="${isDate ? "date-line" : "body-line"}">${escapeHtml(line)}</p>`;
        if (!isDate) firstNonBullet = true;
      }
    }
  }
  if (inList) body += "</ul>";
  return body;
}

export function downloadAsPDF(text: string): void {
  const lines = text.split("\n");
  const headerLines: string[] = [];
  const sections: Array<{ title: string; lines: string[] }> = [];
  let currentSection: { title: string; lines: string[] } | null = null;
  let parsingHeader = true;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if (parsingHeader) parsingHeader = false; continue; }
    const upper = trimmed.toUpperCase();
    const isSection = SECTION_KEYWORDS.some(k => upper === k || upper === k + ":");
    if (isSection) {
      parsingHeader = false;
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed.replace(/:$/, "").toUpperCase(), lines: [] };
    } else if (parsingHeader) {
      headerLines.push(trimmed);
    } else {
      if (!currentSection) currentSection = { title: "", lines: [] };
      currentSection.lines.push(trimmed);
    }
  }
  if (currentSection) sections.push(currentSection);

  const headerHtml = headerLines.map((l, i) =>
    i === 0 ? `<h1 class="name">${escapeHtml(l)}</h1>` : `<p class="contact">${escapeHtml(l)}</p>`
  ).join("");

  const sectionsHtml = sections.map(sec => `<div class="section">
    ${sec.title ? `<div class="sec-header"><span class="sec-title">${escapeHtml(sec.title)}</span></div>` : ""}
    <div class="sec-body">${buildSectionHtml(sec.lines)}</div>
  </div>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',Arial,sans-serif; font-size:10.5pt; color:#1c1c1c; background:white; }
  .page { max-width:760px; margin:0 auto; padding:52px 60px; }
  .resume-header { text-align:center; padding-bottom:18px; margin-bottom:22px; border-bottom:2.5px solid #111; }
  .name { font-size:24pt; font-weight:700; letter-spacing:-0.3px; color:#0a0a0a; margin-bottom:7px; line-height:1.1; }
  .contact { font-size:9pt; color:#555; margin-top:2px; line-height:1.5; }
  .sec-header { display:flex; align-items:center; margin-bottom:7px; margin-top:2px; }
  .sec-title { font-size:8pt; font-weight:700; letter-spacing:0.14em; color:#111; text-transform:uppercase; white-space:nowrap; padding-right:10px; }
  .sec-header::after { content:''; flex:1; height:1px; background:#bbb; }
  .sec-body { padding-left:0; }
  .section { margin-bottom:16px; }
  .role-line { font-weight:600; font-size:10.5pt; color:#0a0a0a; margin-bottom:1px; word-break:break-word; }
  .date-line { font-size:9.5pt; color:#666; margin-bottom:4px; font-style:italic; }
  .body-line { font-size:10pt; color:#2a2a2a; margin-bottom:2px; word-break:break-word; }
  ul { list-style:none; padding-left:0; margin:4px 0 8px 0; }
  li { padding-left:16px; position:relative; margin-bottom:4px; font-size:10pt; line-height:1.55; color:#2a2a2a; word-break:break-word; }
  li::before { content:'▸'; position:absolute; left:0; color:#666; font-size:7.5pt; top:3px; }
  @media print { body { -webkit-print-color-adjust:exact; } .page { padding:30px 40px; } @page { margin:12mm 15mm; size:A4; } }
</style></head><body>
<div class="page">
  <div class="resume-header">${headerHtml}</div>
  ${sectionsHtml}
</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
