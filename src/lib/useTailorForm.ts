"use client";
import { useState, useRef, RefObject } from "react";
import { InputMode, FieldState, TailorFormState, TailorFormActions } from "@/types";
import { STRIPE_URL, BYPASS_STRIPE } from "@/lib/constants";
import { runTailor } from "@/lib/runTailor";

function makeField(mode: InputMode = "text"): FieldState {
  return { mode, text: "", file: null, pdfB64: null, dragging: false };
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        const magic = String.fromCharCode(...Array.from(bytes.slice(0, 5)));
        if (magic !== "%PDF-") {
          reject(new Error(`Not a valid PDF (missing %PDF- header). Got: "${magic}"`));
          return;
        }
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunkSize)));
        }
        resolve(btoa(binary));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

export interface UseTailorFormReturn {
  state: TailorFormState;
  actions: TailorFormActions;
  resumeFileRef: RefObject<HTMLInputElement | null>;
  jobFileRef: RefObject<HTMLInputElement | null>;
  triggerTailor: (r: string, j: string) => Promise<void>;
}

export function useTailorForm(): UseTailorFormReturn {
  const [resume, setResume] = useState<FieldState>(makeField());
  const [job, setJob] = useState<FieldState>(makeField());
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const jobFileRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    !loading &&
    (resume.mode === "text" ? resume.text.trim().length > 50 : !!resume.file && !!resume.pdfB64) &&
    (job.mode === "text" ? job.text.trim().length > 50 : !!job.file && !!job.pdfB64);

  async function triggerTailor(r: string, j: string) {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await runTailor(r, j);
      setOutput(result);
    } catch (err) {
      setError("Something went wrong: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(
    file: File | undefined,
    setter: React.Dispatch<React.SetStateAction<FieldState>>,
  ) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a .pdf file.");
      return;
    }
    setError("");
    setter((prev) => ({ ...prev, file, pdfB64: null }));
    try {
      const b64 = await readFileAsBase64(file);
      setter((prev) => ({ ...prev, pdfB64: b64 }));
    } catch (e) {
      setter((prev) => ({ ...prev, file: null, pdfB64: null }));
      setError((e as Error).message || "Invalid PDF.");
    }
  }

  async function handleSubmit() {
    setError("");
    let resumeData = resume.text;
    let jobData = job.text;

    if (resume.mode === "pdf") {
      if (!resume.file || !resume.pdfB64) {
        setError("Please upload your resume PDF.");
        return;
      }
      resumeData = "__PDF__" + resume.pdfB64;
    } else if (resumeData.trim().length < 50) {
      setError("Please paste your resume.");
      return;
    }

    if (job.mode === "pdf") {
      if (!job.file || !job.pdfB64) {
        setError("Please upload the job description PDF.");
        return;
      }
      jobData = "__PDF__" + job.pdfB64;
    } else if (jobData.trim().length < 50) {
      setError("Please paste the job description.");
      return;
    }

    if (BYPASS_STRIPE) {
      await triggerTailor(resumeData, jobData);
      return;
    }

    // Stash both inputs (text, or "__PDF__" + base64) so they survive the Stripe redirect.
    try {
      localStorage.setItem("pending_resume", resumeData);
      localStorage.setItem("pending_job", jobData);
    } catch {
      setError("That input is too large to keep through checkout. Try pasting the text instead.");
      return;
    }

    setShowPayModal(true);
  }

  const state: TailorFormState = {
    resume,
    job,
    output,
    loading,
    error,
    copied,
    paymentSuccess,
    showPayModal,
    canSubmit,
  };

  const actions: TailorFormActions = {
    setResumeText: (text) => setResume((prev) => ({ ...prev, text })),
    setJobText: (text) => setJob((prev) => ({ ...prev, text })),
    setResumeMode: (mode) => setResume((prev) => ({ ...prev, mode })),
    setJobMode: (mode) => setJob((prev) => ({ ...prev, mode })),
    setResumeDragging: (v) => setResume((prev) => ({ ...prev, dragging: v })),
    setJobDragging: (v) => setJob((prev) => ({ ...prev, dragging: v })),
    handleResumeFile: (f) => handleFileChange(f, setResume),
    handleJobFile: (f) => handleFileChange(f, setJob),
    handleDrop: async (e, type) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || file.type !== "application/pdf") return;
      if (type === "resume") {
        setResume((prev) => ({ ...prev, dragging: false }));
        await handleFileChange(file, setResume);
      } else {
        setJob((prev) => ({ ...prev, dragging: false }));
        await handleFileChange(file, setJob);
      }
    },
    handleSubmit,
    handlePay: () => {
      window.location.href = STRIPE_URL;
    },
    handleCopy: () => {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    setShowPayModal: (v) => {
      setShowPayModal(v);
      if (v) setPaymentSuccess(false);
    },
  };

  return { state, actions, resumeFileRef, jobFileRef, triggerTailor };
}
