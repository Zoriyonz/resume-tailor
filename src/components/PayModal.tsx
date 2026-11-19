"use client";

interface PayModalProps {
  onClose: () => void;
  onPay: () => void;
}

export default function PayModal({ onClose, onPay }: PayModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-price">$2</div>
        <div className="modal-desc">one-time · instant result</div>
        <h2>Tailor This Resume</h2>
        <p>
          Our AI will rewrite your resume to perfectly match this job — ATS-optimized and delivered
          as a beautiful PDF.
        </p>
        <div className="modal-features">
          <div className="modal-feature">Keyword-matched to the job description</div>
          <div className="modal-feature">ATS-optimized language &amp; phrasing</div>
          <div className="modal-feature">Reordered to highlight what matters</div>
          <div className="modal-feature">Download as beautiful PDF — ready to submit</div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-pay" onClick={onPay}>
            Pay $2 &amp; Tailor →
          </button>
        </div>
      </div>
    </div>
  );
}
