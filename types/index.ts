export type InputMode = "text" | "pdf";

export interface FieldState {
  mode: InputMode;
  text: string;
  file: File | null;
  pdfB64: string | null;
  dragging: boolean;
}

export interface TailorFormState {
  resume: FieldState;
  job: FieldState;
  output: string;
  loading: boolean;
  error: string;
  copied: boolean;
  paymentSuccess: boolean;
  showPayModal: boolean;
  canSubmit: boolean;
}

export interface TailorFormActions {
  setResumeText: (text: string) => void;
  setJobText: (text: string) => void;
  setResumeMode: (mode: InputMode) => void;
  setJobMode: (mode: InputMode) => void;
  setResumeDragging: (v: boolean) => void;
  setJobDragging: (v: boolean) => void;
  handleResumeFile: (file: File | undefined) => Promise<void>;
  handleJobFile: (file: File | undefined) => Promise<void>;
  handleDrop: (e: React.DragEvent, type: "resume" | "job") => Promise<void>;
  handleSubmit: () => Promise<void>;
  handlePay: () => void;
  handleCopy: () => void;
  setShowPayModal: (v: boolean) => void;
}
