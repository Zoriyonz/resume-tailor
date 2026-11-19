"use client";
import { downloadAsPDF } from "@/lib/pdf";

interface OutputSectionProps {
  output: string;
  loading: boolean;
  copied: boolean;
  onCopy: () => void;
}

export default function OutputSection({ output, loading, copied, onCopy }: OutputSectionProps) {
  return (
    <>
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>
            Rewriting your resume...
            <br />
            This takes about 15 seconds.
          </p>
        </div>
      )}
      {output && !loading && (
        <div className="output-section">
          <div className="output-header">
            <div className="output-label">Ready</div>
            <div className="output-actions">
              <button className="btn-copy" onClick={onCopy}>
                {copied ? "✓ Copied!" : "Copy text"}
              </button>
              <button className="btn-download" onClick={() => downloadAsPDF(output)}>
                ⬇ Download PDF
              </button>
            </div>
          </div>
          <div className="output-box">{output}</div>
        </div>
      )}
    </>
  );
}
