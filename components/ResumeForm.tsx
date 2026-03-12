"use client";
import { useRef } from "react";
import { FieldState, InputMode } from "@/types";

interface FieldInputProps {
  label: string;
  placeholder: string;
  icon: string;
  uploadedLabel: string;
  field: FieldState;
  onTextChange: (text: string) => void;
  onModeChange: (mode: InputMode) => void;
  onDraggingChange: (v: boolean) => void;
  onFileChange: (file: File | undefined) => Promise<void>;
  onDrop: (e: React.DragEvent) => Promise<void>;
}

function FieldInput({ label, placeholder, icon, uploadedLabel, field, onTextChange, onModeChange, onDraggingChange, onFileChange, onDrop }: FieldInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="field">
      <label>{label} <span>*</span></label>
      <div className="input-toggle">
        <button className={`toggle-btn ${field.mode === "text" ? "active" : ""}`} onClick={() => onModeChange("text")}>Paste Text</button>
        <button className={`toggle-btn ${field.mode === "pdf" ? "active" : ""}`} onClick={() => onModeChange("pdf")}>Upload PDF</button>
      </div>
      {field.mode === "text" ? (
        <textarea placeholder={placeholder} value={field.text} onChange={e => onTextChange(e.target.value)} />
      ) : (
        <>
          <input type="file" accept=".pdf" ref={fileRef} className="upload-input" onChange={e => onFileChange(e.target.files?.[0])} />
          <div
            className={`upload-zone ${field.dragging ? "dragging" : ""} ${field.file ? "has-file" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); onDraggingChange(true); }}
            onDragLeave={() => onDraggingChange(false)}
            onDrop={onDrop}
          >
            <div className="upload-icon">{field.file ? "✅" : icon}</div>
            {field.file ? (
              <div className="upload-text">
                <strong>{field.pdfB64 ? uploadedLabel : "Processing PDF..."}</strong>
                <span className="upload-filename">{field.file.name}</span>
              </div>
            ) : (
              <div className="upload-text"><strong>Drop PDF here or click to browse</strong>.pdf files only</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface ResumeFormProps {
  resumeField: FieldState;
  jobField: FieldState;
  error: string;
  canSubmit: boolean;
  loading: boolean;
  paymentSuccess: boolean;
  onResumeTextChange: (text: string) => void;
  onResumeModeChange: (mode: InputMode) => void;
  onResumeDraggingChange: (v: boolean) => void;
  onResumeFileChange: (file: File | undefined) => Promise<void>;
  onResumeDrop: (e: React.DragEvent) => Promise<void>;
  onJobTextChange: (text: string) => void;
  onJobModeChange: (mode: InputMode) => void;
  onJobDraggingChange: (v: boolean) => void;
  onJobFileChange: (file: File | undefined) => Promise<void>;
  onJobDrop: (e: React.DragEvent) => Promise<void>;
  onSubmit: () => Promise<void>;
}

export default function ResumeForm({
  resumeField, jobField, error, canSubmit, loading, paymentSuccess,
  onResumeTextChange, onResumeModeChange, onResumeDraggingChange, onResumeFileChange, onResumeDrop,
  onJobTextChange, onJobModeChange, onJobDraggingChange, onJobFileChange, onJobDrop,
  onSubmit,
}: ResumeFormProps) {
  return (
    <>
      {paymentSuccess && !loading && (
        <div className="success-banner">✓ Payment confirmed — tailoring your resume now...</div>
      )}
      <div className="form-grid">
        <FieldInput
          label="Your Current Resume" placeholder={"Paste your full resume here...\n\nJohn Smith\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."}
          icon="📄" uploadedLabel="Resume uploaded" field={resumeField}
          onTextChange={onResumeTextChange} onModeChange={onResumeModeChange}
          onDraggingChange={onResumeDraggingChange} onFileChange={onResumeFileChange} onDrop={onResumeDrop}
        />
        <FieldInput
          label="Job Description" placeholder={"Paste the full job posting here...\n\nSenior Software Engineer\nWe're looking for...\n\nRequirements:\n- 3+ years experience..."}
          icon="📋" uploadedLabel="Job description uploaded" field={jobField}
          onTextChange={onJobTextChange} onModeChange={onJobModeChange}
          onDraggingChange={onJobDraggingChange} onFileChange={onJobFileChange} onDrop={onJobDrop}
        />
      </div>
      <div className="pricing-bar">
        <div className="pricing-info"><strong>AI Resume Tailor</strong> — one-time payment, instant PDF</div>
        <div className="price-tag">$2 <span>/ resume</span></div>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-main" onClick={onSubmit} disabled={!canSubmit}>
        {loading ? "Tailoring your resume..." : "Tailor My Resume for $2 →"}
      </button>
    </>
  );
}
