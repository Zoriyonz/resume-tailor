"use client";
import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a08;
    --surface: #111110;
    --border: #222220;
    --accent: #c8f050;
    --text: #f0ede6;
    --muted: #666660;
    --radius: 4px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 128px;
  }

  .app { max-width: 960px; margin: 0 auto; padding: 0 24px; }

  .header {
    padding: 40px 0 20px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }

  .hero { padding: 64px 0 40px; }
  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 6vw, 68px);
    font-weight: 800; line-height: 1.0;
    letter-spacing: -2px; margin-bottom: 20px;
  }
  .hero h1 em { color: var(--accent); font-style: normal; }
  .hero p { font-size: 14px; color: var(--muted); max-width: 480px; line-height: 1.7; margin-bottom: 32px; }
  .steps { display: flex; gap: 24px; flex-wrap: wrap; }
  .step { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
  .step-num {
    width: 20px; height: 20px; border: 1px solid var(--border); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: var(--accent); flex-shrink: 0;
  }

  .divider { height: 1px; background: var(--border); margin: 40px 0; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media(max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }

  .field label {
    display: block; font-size: 11px; letter-spacing: 0.1em;
    color: var(--muted); text-transform: uppercase; margin-bottom: 8px;
  }
  .field label span { color: var(--accent); margin-left: 4px; }

  textarea {
    width: 100%; height: 260px; background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--radius);
    color: var(--text); font-family: 'DM Mono', monospace;
    font-size: 12px; line-height: 1.6; padding: 16px;
    resize: vertical; transition: border-color 0.2s; outline: none;
  }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: #333330; }

  .pricing-bar {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
  }
  .pricing-info { font-size: 13px; color: var(--muted); }
  .pricing-info strong { color: var(--text); font-size: 15px; }
  .price-tag { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--accent); }
  .price-tag span { font-size: 14px; color: var(--muted); font-family: 'DM Mono', monospace; font-weight: 300; }

  .btn-main {
    width: 100%; background: var(--accent); color: #0a0a08;
    border: none; border-radius: var(--radius);
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    letter-spacing: 0.02em; padding: 16px 32px; cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .btn-main:hover { opacity: 0.9; }
  .btn-main:active { transform: scale(0.99); }
  .btn-main:disabled { opacity: 0.4; cursor: not-allowed; }

  .output-section { margin-top: 40px; animation: fadeUp 0.4s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  .output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .output-label {
    font-size: 11px; letter-spacing: 0.1em; color: var(--accent);
    text-transform: uppercase; display: flex; align-items: center; gap: 8px;
  }
  .output-label::before {
    content: ''; display: block; width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); animation: pulse 1.5s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

  .btn-copy {
    background: transparent; border: 1px solid var(--border); color: var(--muted);
    font-family: 'DM Mono', monospace; font-size: 12px; padding: 6px 14px;
    border-radius: var(--radius); cursor: pointer; transition: all 0.2s;
  }
  .btn-copy:hover { border-color: var(--accent); color: var(--accent); }

  .output-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px;
    font-size: 13px; line-height: 1.8; white-space: pre-wrap;
    max-height: 500px; overflow-y: auto;
  }
  .output-box::-webkit-scrollbar { width: 4px; }
  .output-box::-webkit-scrollbar-thumb { background: var(--border); }

  .loading-state { text-align: center; padding: 60px 20px; animation: fadeUp 0.3s ease; }
  .spinner {
    width: 32px; height: 32px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.7s linear infinite; margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-state p { color: var(--muted); font-size: 13px; }

  .error-msg {
    background: #1a0808; border: 1px solid #400; border-radius: var(--radius);
    padding: 12px 16px; font-size: 13px; color: #ff6b6b; margin-bottom: 12px;
  }

  .success-banner {
    background: #0a1a08; border: 1px solid #2a4a20; border-radius: var(--radius);
    padding: 12px 16px; font-size: 13px; color: var(--accent);
    margin-bottom: 12px; text-align: center;
  }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 20px; animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 36px; max-width: 440px; width: 100%;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  .modal h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
  .modal p { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .modal-price { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: var(--accent); margin-bottom: 4px; }
  .modal-desc { font-size: 12px; color: var(--muted); margin-bottom: 28px; }
  .modal-features { margin-bottom: 28px; }
  .modal-feature {
    display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted);
    padding: 6px 0; border-bottom: 1px solid var(--border);
  }
  .modal-feature:last-child { border: none; }
  .modal-feature::before { content: '✓'; color: var(--accent); font-weight: bold; }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel {
    flex: 1; background: transparent; border: 1px solid var(--border); color: var(--muted);
    font-family: 'DM Mono', monospace; font-size: 13px; padding: 12px;
    border-radius: var(--radius); cursor: pointer; transition: all 0.2s;
  }
  .btn-cancel:hover { border-color: var(--muted); color: var(--text); }
  .btn-pay {
    flex: 2; background: var(--accent); color: #0a0a08; border: none;
    border-radius: var(--radius); font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 14px; padding: 12px; cursor: pointer; transition: opacity 0.15s;
  }
  .btn-pay:hover { opacity: 0.9; }

  .footer {
    padding: 40px 0; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 60px; flex-wrap: wrap; gap: 12px;
  }
  .footer p { font-size: 11px; color: var(--muted); }
`;

export default function App() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
        setError("Session expired — paste your resume and job description again and click the button.");
      }
    }
  }, []);

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

  //function handleSubmit() {
  //  if (!resume.trim() || !jobDesc.trim()) {
  //    setError("Please paste both your resume and the job description.");
  //    return;
  //  }
  //  setError("");
  //  setShowPayModal(true);
  // }

  function handleSubmit() {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please paste both your resume and the job description.");
      return;
    }
    setError("");
    runTailor(resume, jobDesc); // skip payment for testing
    // setShowPayModal(true); // uncomment when done testing
  }
  function handlePay() {
    localStorage.setItem("pending_resume", resume);
    localStorage.setItem("pending_job", jobDesc);
    window.location.href = "https://buy.stripe.com/dRmaEX2ye7CseWlg1G1wY00";
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canSubmit = resume.trim().length > 50 && jobDesc.trim().length > 50;

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
            <p>Our tailors will rewrite your resume to match this specific job — optimized for ATS keywords and human readers.</p>
            <div className="modal-features">
              <div className="modal-feature">Keyword-matched to the job description</div>
              <div className="modal-feature">ATS-optimized language & phrasing</div>
              <div className="modal-feature">Reordered to highlight what matters</div>
              <div className="modal-feature">Ready to copy & paste instantly</div>
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
          <p>Paste your resume and the job description. Our AI rewrites your resume to perfectly match the role — keywords, tone, and everything ATS systems care about.</p>
          <div className="steps">
            <div className="step"><div className="step-num">1</div>Paste your resume</div>
            <div className="step"><div className="step-num">2</div>Paste the job post</div>
            <div className="step"><div className="step-num">3</div>Pay $2, get tailored resume</div>
          </div>
        </section>

        <div className="divider" />

        {paymentSuccess && !output && !loading && (
          <div className="success-banner">✓ Payment confirmed — tailoring your resume now...</div>
        )}

        <div className="form-grid">
          <div className="field">
            <label>Your Current Resume <span>*</span></label>
            <textarea
              placeholder={"Paste your full resume here...\n\nJohn Smith\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."}
              value={resume}
              onChange={e => setResume(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Job Description <span>*</span></label>
            <textarea
              placeholder={"Paste the full job posting here...\n\nSenior Software Engineer\nWe're looking for...\n\nRequirements:\n- 3+ years experience..."}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="pricing-bar">
          <div className="pricing-info">
            <strong>AI Resume Tailor</strong> — one-time payment, instant result
          </div>
          <div className="price-tag">$2 <span>/ resume</span></div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="btn-main" onClick={handleSubmit} disabled={!canSubmit || loading}>
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
              <div className="output-label">Tailored Resume Ready</div>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "Copy to clipboard"}
              </button>
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