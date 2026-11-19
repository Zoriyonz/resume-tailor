"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OutputSection from "@/components/OutputSection";
import { runTailor } from "@/lib/runTailor";

type PageState = "loading" | "done" | "error";

export default function SuccessPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function run() {
      const pendingResume = localStorage.getItem("pending_resume");
      const pendingJob = localStorage.getItem("pending_job");

      if (!pendingResume || !pendingJob) {
        setError("Session expired — paste your resume and job description again.");
        setPageState("error");
        return;
      }

      localStorage.removeItem("pending_resume");
      localStorage.removeItem("pending_job");

      try {
        setOutput(await runTailor(pendingResume, pendingJob));
        setPageState("done");
      } catch (err) {
        setError("Something went wrong: " + (err as Error).message);
        setPageState("error");
      }
    }
    void run();
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="app">
      <div className="grain" />
      <Header />
      <div style={{ paddingTop: "40px" }}>
        {pageState === "loading" && (
          <>
            <div className="success-banner">✓ Payment confirmed — tailoring your resume now...</div>
            <OutputSection output="" loading={true} copied={false} onCopy={() => {}} />
          </>
        )}
        {pageState === "error" && (
          <>
            <div className="error-msg">{error}</div>
            <Link
              href="/"
              className="btn-main"
              style={{
                display: "inline-block",
                textDecoration: "none",
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              ← Try again
            </Link>
          </>
        )}
        {pageState === "done" && (
          <>
            <div className="success-banner">✓ Your tailored resume is ready!</div>
            <OutputSection output={output} loading={false} copied={copied} onCopy={handleCopy} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
