"use client";
import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a08; --surface: #111110; --border: #222220;
    --accent: #c8f050; --text: #f0ede6; --muted: #666660; --radius: 4px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; min-height: 100vh; overflow-x: hidden; }
  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 128px;
  }
  .app { max-width: 960px; margin: 0 auto; padding: 0 24px; }
  .header { padding: 40px 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .hero { padding: 64px 0 40px; }
  .hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 68px); font-weight: 800; line-height: 1.0; letter-spacing: -2px; margin-bottom: 20px; }
  .hero h1 em { color: var(--accent); font-style: normal; }
  .hero p { font-size: 14px; color: var(--muted); max-width: 480px; line-height: 1.7; margin-bottom: 32px; }
  .steps { display: flex; gap: 24px; flex-wrap: wrap; }
  .step { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
  .step-num { width: 20px; height: 20px; border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--accent); flex-shrink: 0; }
  .divider { height: 1px; background: var(--border); margin: 40px 0; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media(max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
  .field label { display: block; font-size: 11px; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
  .field label span { color: var(--accent); margin-left: 4px; }
  .input-toggle { display: flex; gap: 6px; margin-bottom: 10px; }
  .toggle-btn { font-size: 11px; padding: 4px 12px; border-radius: 2px; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: 'DM Mono', monospace; transition: all 0.15s; letter-spacing: 0.05em; }
  .toggle-btn.active { background: var(--accent); color: #0a0a08; border-color: var(--accent); font-weight: 600; }
  textarea { width: 100%; height: 220px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.6; padding: 16px; resize: vertical; transition: border-color 0.2s; outline: none; }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: #333330; }
  .upload-zone { width: 100%; height: 220px; background: var(--surface); border: 2px dashed var(--border); border-radius: var(--radius); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; gap: 10px; }
  .upload-zone:hover, .upload-zone.dragging { border-color: var(--accent); background: #0d120a; }
  .upload-zone.has-file { border-color: var(--accent); border-style: solid; }
  .upload-icon { font-size: 28px; }
  .upload-text { font-size: 12px; color: var(--muted); text-align: center; line-height: 1.6; }
  .upload-text strong { color: var(--accent); display: block; margin-bottom: 2px; font-size: 13px; }
  .upload-filename { font-size: 11px; color: var(--accent); margin-top: 4px; display: block; }
  .upload-input { display: none; }
  .pricing-bar { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .pricing-info { font-size: 13px; color: var(--muted); }
  .pricing-info strong { color: var(--text); font-size: 15px; }
  .price-tag { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--accent); }
  .price-tag span { font-size: 14px; color: var(--muted); font-family: 'DM Mono', monospace; font-weight: 300; }
  .btn-main { width: 100%; background: var(--accent); color: #0a0a08; border: none; border-radius: var(--radius); font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; padding: 16px 32px; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
  .btn-main:hover { opacity: 0.9; }
  .btn-main:active { transform: scale(0.99); }
  .btn-main:disabled { opacity: 0.4; cursor: not-allowed; }
  .output-section { margin-top: 40px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .output-label { font-size: 11px; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .output-label::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .output-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn-copy { background: transparent; border: 1px solid var(--border); color: var(--muted); font-family: 'DM Mono', monospace; font-size: 12px; padding: 7px 14px; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
  .btn-copy:hover { border-color: var(--accent); color: var(--accent); }
  .btn-download { background: var(--accent); color: #0a0a08; border: none; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; padding: 7px 16px; border-radius: var(--radius); cursor: pointer; transition: opacity 0.15s; letter-spacing: 0.02em; }
  .btn-download:hover { opacity: 0.85; }
  .output-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; max-height: 500px; overflow-y: auto; }
  .output-box::-webkit-scrollbar { width: 4px; }
  .output-box::-webkit-scrollbar-thumb { background: var(--border); }
  .loading-state { text-align: center; padding: 60px 20px; animation: fadeUp 0.3s ease; }
  .spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-state p { color: var(--muted); font-size: 13px; }
  .error-msg { background: #1a0808; border: 1px solid #400; border-radius: var(--radius); padding: 12px 16px; font-size: 13px; color: #ff6b6b; margin-bottom: 12px; }
  .success-banner { background: #0a1a08; border: 1px solid #2a4a20; border-radius: var(--radius); padding: 12px 16px; font-size: 13px; color: var(--accent); margin-bottom: 12px; text-align: center; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 36px; max-width: 440px; width: 100%; animation: slideUp 0.25s ease; }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  .modal h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
  .modal p { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .modal-price { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: var(--accent); margin-bottom: 4px; }
  .modal-desc { font-size: 12px; color: var(--muted); margin-bottom: 28px; }
  .modal-features { margin-bottom: 28px; }
  .modal-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); padding: 6px 0; border-bottom: 1px solid var(--border); }
  .modal-feature:last-child { border: none; }
  .modal-feature::before { content: '✓'; color: var(--accent); font-weight: bold; }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel { flex: 1; background: transparent; border: 1px solid var(--border); color: var(--muted); font-family: 'DM Mono', monospace; font-size: 13px; padding: 12px; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
  .btn-cancel:hover { border-color: var(--muted); color: var(--text); }
  .btn-pay { flex: 2; background: var(--accent); color: #0a0a08; border: none; border-radius: var(--radius); font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; padding: 12px; cursor: pointer; transition: opacity 0.15s; }
  .btn-pay:hover { opacity: 0.9; }
  .footer { padding: 40px 0; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; margin-top: 60px; flex-wrap: wrap; gap: 12px; }
  .footer p { font-size: 11px; color: var(--muted); }
`;

function downloadAsPDF(text) {
  const lines = text.split("\n");
  let headerLines = [];
  let sections = [];
  let currentSection = null;
  let parsingHeader = true;

  const SECTION_KEYWORDS = ["EXPERIENCE", "EDUCATION", "SKILLS", "SUMMARY", "OBJECTIVE", "CERTIFICATIONS", "PROJECTS", "AWARDS", "PUBLICATIONS", "LANGUAGES", "INTERESTS", "VOLUNTEER", "REFERENCES", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE"];

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

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const headerHtml = headerLines.map((l, i) => {
    if (i === 0) return `<h1 class="name">${esc(l)}</h1>`;
    return `<p class="contact">${esc(l)}</p>`;
  }).join("");

  const sectionsHtml = sections.map(sec => {
    let body = "";
    let inList = false;
    let firstNonBullet = true;

    for (const l of sec.lines) {
      const isBullet = l.startsWith("•") || l.startsWith("-") || l.startsWith("▸");
      if (isBullet) {
        if (!inList) { body += `<ul>`; inList = true; }
        body += `<li>${esc(l.replace(/^[•\-▸]\s*/, ""))}</li>`;
      } else {
        if (inList) { body += `</ul>`; inList = false; }
        if (firstNonBullet) {
          body += `<p class="role-line">${esc(l)}</p>`;
          firstNonBullet = false;
        } else {
          const isDate = /\d{4}/.test(l) || /present/i.test(l) || /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(l);
          body += `<p class="${isDate ? "date-line" : "body-line"}">${esc(l)}</p>`;
          if (!isDate) firstNonBullet = true;
        }
      }
    }
    if (inList) body += `</ul>`;

    return `<div class="section">
      ${sec.title ? `<div class="sec-header"><span class="sec-title">${esc(sec.title)}</span></div>` : ""}
      <div class="sec-body">${body}</div>
    </div>`;
  }).join("");

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

  .role-line { font-weight:600; font-size:10.5pt; color:#0a0a0a; margin-bottom:1px; word-break:break-word; overflow-wrap:break-word; }
  .date-line { font-size:9.5pt; color:#666; margin-bottom:4px; font-style:italic; }
  .body-line { font-size:10pt; color:#2a2a2a; margin-bottom:2px; word-break:break-word; overflow-wrap:break-word; }

  ul { list-style:none; padding-left:0; margin:4px 0 8px 0; }
  li {
    padding-left:16px; position:relative; margin-bottom:4px;
    font-size:10pt; line-height:1.55; color:#2a2a2a;
    word-break:break-word; overflow-wrap:break-word;
  }
  li::before { content:'▸'; position:absolute; left:0; color:#666; font-size:7.5pt; top:3px; }

  @media print {
    body { -webkit-print-color-adjust:exact; }
    .page { padding:30px 40px; }
    @page { margin:12mm 15mm; size:A4; }
  }
</style></head><body>
<div class="page">
  <div class="resume-header">${headerHtml}</div>
  ${sectionsHtml}
</div>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

export default function App() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [resumeMode, setResumeMode] = useState("text");
  const [jobMode, setJobMode] = useState("text");

  const [resumeFile, setResumeFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);

  const [resumePdfB64, setResumePdfB64] = useState(null);
  const [jobPdfB64, setJobPdfB64] = useState(null);

  const [resumeDragging, setResumeDragging] = useState(false);
  const [jobDragging, setJobDragging] = useState(false);

  const resumeFileRef = useRef();
  const jobFileRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      const pendingResume = localStorage.getItem("pending_resume");
      const pendingJob = localStorage.getItem("pending_job");
      if (pendingResume && pendingJob) {
        setResume(pendingResume);
        setJobDesc(pendingJob);
        setPaymentSuccess(true);
        localStorage.removeItem("pending_resume");
        localStorage.removeItem("pending_job");
        runTailor(pendingResume, pendingJob);
      } else {
        setError("Session expired — paste your resume and job description again.");
      }
    }
  }, []);

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const buf = reader.result; // ArrayBuffer
          const bytes = new Uint8Array(buf);

          // Validate PDF magic header: %PDF-
          const magic = String.fromCharCode(...bytes.slice(0, 5));
          if (magic !== "%PDF-") {
            reject(new Error(`Not a valid PDF (missing %PDF- header). Got: "${magic}"`));
            return;
          }

          // Convert bytes -> base64 safely (chunked)
          let binary = "";
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const b64 = btoa(binary);
          resolve(b64);
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsArrayBuffer(file);
    });
  }

  async function handleResumeFileChange(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a .pdf file."); return; }

    setError("");
    setResumeFile(file);
    setResumePdfB64(null); // force “ready” to re-compute

    try {
      const b64 = await readFileAsBase64(file);
      setResumePdfB64(b64);
    } catch (e) {
      setResumeFile(null);
      setResumePdfB64(null);
      setError(e.message || "Invalid PDF.");
    }
  }

  async function handleJobFileChange(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a .pdf file."); return; }

    setError("");
    setJobFile(file);
    setJobPdfB64(null);

    try {
      const b64 = await readFileAsBase64(file);
      setJobPdfB64(b64);
    } catch (e) {
      setJobFile(null);
      setJobPdfB64(null);
      setError(e.message || "Invalid PDF.");
    }
  }

  async function runTailor(r, j) {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: r, jobDescription: j })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.result);
    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    let resumeData = resume;
    let jobData = jobDesc;

    if (resumeMode === "pdf") {
      if (!resumeFile || !resumePdfB64) { setError("Please upload your resume PDF."); return; }
      resumeData = "__PDF__" + resumePdfB64;
    } else if (resumeData.trim().length < 50) {
      setError("Please paste your resume."); return;
    }

    if (jobMode === "pdf") {
      if (!jobFile || !jobPdfB64) { setError("Please upload the job description PDF."); return; }
      jobData = "__PDF__" + jobPdfB64;
    } else if (jobData.trim().length < 50) {
      setError("Please paste the job description."); return;
    }

    if (resumeMode === "text") localStorage.setItem("pending_resume", resumeData);
    if (jobMode === "text") localStorage.setItem("pending_job", jobData);

    runTailor(resumeData, jobData);
    // setShowPayModal(true); // LIVE
  }

  function handlePay() {
    window.location.href = "https://buy.stripe.com/dRmaEX2ye7CseWlg1G1wY00";
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDrop(e, type) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    if (type === "resume") {
      setResumeDragging(false);
      await handleResumeFileChange(file);
    } else {
      setJobDragging(false);
      await handleJobFileChange(file);
    }
  }

  const canSubmit = !loading && (
    (resumeMode === "text" ? resume.trim().length > 50 : (!!resumeFile && !!resumePdfB64)) &&
    (jobMode === "text" ? jobDesc.trim().length > 50 : (!!jobFile && !!jobPdfB64))
  );

  return (
    <>
      <style>{styles}</style>
      <div className="grain" />

      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-price">$2</div>
            <div className="modal-desc">one-time · instant result</div>
            <h2>Tailor This Resume</h2>
            <p>Our AI will rewrite your resume to perfectly match this job — ATS-optimized and delivered as a beautiful PDF.</p>
            <div className="modal-features">
              <div className="modal-feature">Keyword-matched to the job description</div>
              <div className="modal-feature">ATS-optimized language & phrasing</div>
              <div className="modal-feature">Reordered to highlight what matters</div>
              <div className="modal-feature">Download as beautiful PDF — ready to submit</div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn-pay" onClick={handlePay}>Pay $2 & Tailor →</button>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        <header className="header">
          <div className="logo">resume<span>.</span>tailor</div>
        </header>

        <section className="hero">
          <h1>Land the job.<br /><em>Not the trash pile.</em></h1>
          <p>Upload or paste your resume and the job description. Our AI rewrites it to perfectly match the role — download as a beautiful PDF, ready to submit.</p>
          <div className="steps">
            <div className="step"><div className="step-num">1</div>Upload or paste resume</div>
            <div className="step"><div className="step-num">2</div>Upload or paste job post</div>
            <div className="step"><div className="step-num">3</div>Pay $2, download PDF</div>
          </div>
        </section>

        <div className="divider" />

        {paymentSuccess && !output && !loading && (
          <div className="success-banner">✓ Payment confirmed — tailoring your resume now...</div>
        )}

        <div className="form-grid">
          <div className="field">
            <label>Your Current Resume <span>*</span></label>
            <div className="input-toggle">
              <button className={`toggle-btn ${resumeMode === "text" ? "active" : ""}`} onClick={() => setResumeMode("text")}>Paste Text</button>
              <button className={`toggle-btn ${resumeMode === "pdf" ? "active" : ""}`} onClick={() => setResumeMode("pdf")}>Upload PDF</button>
            </div>
            {resumeMode === "text" ? (
              <textarea placeholder={"Paste your full resume here...\n\nJohn Smith\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."} value={resume} onChange={e => setResume(e.target.value)} />
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf"
                  ref={resumeFileRef}
                  className="upload-input"
                  onChange={e => handleResumeFileChange(e.target.files?.[0])}
                />
                <div
                  className={`upload-zone ${resumeDragging ? "dragging" : ""} ${resumeFile ? "has-file" : ""}`}
                  onClick={() => resumeFileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setResumeDragging(true); }}
                  onDragLeave={() => setResumeDragging(false)}
                  onDrop={e => handleDrop(e, "resume")}
                >
                  <div className="upload-icon">{resumeFile ? "✅" : "📄"}</div>
                  {resumeFile
                    ? (
                      <div className="upload-text">
                        <strong>{resumePdfB64 ? "Resume uploaded" : "Processing PDF..."}</strong>
                        <span className="upload-filename">{resumeFile.name}</span>
                      </div>
                    )
                    : <div className="upload-text"><strong>Drop PDF here or click to browse</strong>.pdf files only</div>}
                </div>
              </>
            )}
          </div>

          <div className="field">
            <label>Job Description <span>*</span></label>
            <div className="input-toggle">
              <button className={`toggle-btn ${jobMode === "text" ? "active" : ""}`} onClick={() => setJobMode("text")}>Paste Text</button>
              <button className={`toggle-btn ${jobMode === "pdf" ? "active" : ""}`} onClick={() => setJobMode("pdf")}>Upload PDF</button>
            </div>
            {jobMode === "text" ? (
              <textarea placeholder={"Paste the full job posting here...\n\nSenior Software Engineer\nWe're looking for...\n\nRequirements:\n- 3+ years experience..."} value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf"
                  ref={jobFileRef}
                  className="upload-input"
                  onChange={e => handleJobFileChange(e.target.files?.[0])}
                />
                <div
                  className={`upload-zone ${jobDragging ? "dragging" : ""} ${jobFile ? "has-file" : ""}`}
                  onClick={() => jobFileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setJobDragging(true); }}
                  onDragLeave={() => setJobDragging(false)}
                  onDrop={e => handleDrop(e, "job")}
                >
                  <div className="upload-icon">{jobFile ? "✅" : "📋"}</div>
                  {jobFile
                    ? (
                      <div className="upload-text">
                        <strong>{jobPdfB64 ? "Job description uploaded" : "Processing PDF..."}</strong>
                        <span className="upload-filename">{jobFile.name}</span>
                      </div>
                    )
                    : <div className="upload-text"><strong>Drop PDF here or click to browse</strong>.pdf files only</div>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pricing-bar">
          <div className="pricing-info"><strong>AI Resume Tailor</strong> — one-time payment, instant PDF</div>
          <div className="price-tag">$2 <span>/ resume</span></div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="btn-main" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? "Tailoring your resume..." : "Tailor My Resume for $2 →"}
        </button>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Rewriting your resume...<br />This takes about 15 seconds.</p>
          </div>
        )}

        {output && !loading && (
          <div className="output-section">
            <div className="output-header">
              <div className="output-label">Ready</div>
              <div className="output-actions">
                <button className="btn-copy" onClick={handleCopy}>{copied ? "✓ Copied!" : "Copy text"}</button>
                <button className="btn-download" onClick={() => downloadAsPDF(output)}>⬇ Download PDF</button>
              </div>
            </div>
            <div className="output-box">{output}</div>
          </div>
        )}

        <footer className="footer">
          <p>© 2026 resume.tailor</p>
        </footer>
      </div>
    </>
  );
}