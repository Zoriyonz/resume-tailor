"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ResumeForm from "@/components/ResumeForm";
import OutputSection from "@/components/OutputSection";
import PayModal from "@/components/PayModal";
import Footer from "@/components/Footer";
import { useTailorForm } from "@/lib/useTailorForm";

export default function HomePage() {
  const { state, actions } = useTailorForm();
  const { resume, job, output, loading, error, copied, paymentSuccess, showPayModal, canSubmit } =
    state;

  return (
    <>
      <div className="grain" />

      {showPayModal && (
        <PayModal onClose={() => actions.setShowPayModal(false)} onPay={actions.handlePay} />
      )}

      <div className="app">
        <Header />
        <Hero />
        <div className="divider" />

        <ResumeForm
          resumeField={resume}
          jobField={job}
          error={error}
          canSubmit={canSubmit}
          loading={loading}
          paymentSuccess={paymentSuccess}
          onResumeTextChange={actions.setResumeText}
          onResumeModeChange={actions.setResumeMode}
          onResumeDraggingChange={actions.setResumeDragging}
          onResumeFileChange={actions.handleResumeFile}
          onResumeDrop={(e) => actions.handleDrop(e, "resume")}
          onJobTextChange={actions.setJobText}
          onJobModeChange={actions.setJobMode}
          onJobDraggingChange={actions.setJobDragging}
          onJobFileChange={actions.handleJobFile}
          onJobDrop={(e) => actions.handleDrop(e, "job")}
          onSubmit={actions.handleSubmit}
        />

        <OutputSection
          output={output}
          loading={loading}
          copied={copied}
          onCopy={actions.handleCopy}
        />

        <Footer />
      </div>
    </>
  );
}
