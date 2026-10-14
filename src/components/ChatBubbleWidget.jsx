import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import LeadCaptureForm from "./LeadCaptureForm";

// Opening copy differs per page; the rest of the flow is shared.
const COPY = {
  scenarios: {
    prompts: ["Can't find your use case?", "Want to share other pain points?"],
    heading: "We're Listening!",
    fieldLabel: "Your Issue",
  },
  tools: {
    prompts: ["Didn't find the right tool?", "Curious how to combine these tools for the biggest impact?"],
    heading: "Let's Work It Out Together!",
    fieldLabel: "Tell us what you're trying to solve",
  },
};

export default function ChatBubbleWidget({ variant = "scenarios", autoOpenDelayMs = 10000, openAfterScrollBottom = false }) {
  const copy = COPY[variant] ?? COPY.scenarios;
  const [stage, setStage] = useState("closed"); // closed | issue | contactAsk | contactForm | declined | thanks
  const [issueText, setIssueText] = useState("");

  useEffect(() => {
    let timer;
    const openIfClosed = () => setStage((prev) => (prev === "closed" ? "issue" : prev));
    const isAtPageBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

    const scheduleOpen = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(openIfClosed, autoOpenDelayMs);
    };

    const handleScroll = () => {
      if (isAtPageBottom()) {
        window.removeEventListener("scroll", handleScroll);
        scheduleOpen();
      }
    };

    if (openAfterScrollBottom) {
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      scheduleOpen();
    }

    // Other components (e.g. the AI tool drawer) can open the chat directly.
    const openFromEvent = () => setStage("issue");
    window.addEventListener("raeco:open-chat", openFromEvent);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("raeco:open-chat", openFromEvent);
    };
  }, [autoOpenDelayMs, openAfterScrollBottom]);

  const isOpen = stage !== "closed";

  return (
    <>
      {/* Trigger stays bottom-right; the panel itself is a centered modal so it
          can't be missed or mistaken for a small corner toast. */}
      <button
        type="button"
        onClick={() => setStage((prev) => (prev === "closed" ? "issue" : "closed"))}
        aria-label="Open feedback chat"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-[0_8px_24px_rgba(25,52,160,0.35)]"
      >
        <MessageSquare size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,24,38,0.45)] p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setStage("closed");
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-[480px] rounded-3xl bg-white p-9 shadow-[0_30px_80px_rgba(25,52,160,0.35)]"
            >
            <button
              type="button"
              onClick={() => setStage("closed")}
              aria-label="Close"
              className="absolute right-3 top-3 text-[var(--color-ink)]/40 hover:text-[var(--color-ink)]"
            >
              <X size={16} />
            </button>

            {stage === "issue" && (
              <div className="flex flex-col gap-4">
                <p className="font-body text-lg text-[var(--color-brand)]">
                  {copy.prompts.map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
                <p className="font-body text-2xl font-extrabold text-[var(--color-brand)]">
                  {copy.heading}
                </p>
                <div>
                  <p className="font-body text-sm text-[var(--color-brand)]">{copy.fieldLabel}</p>
                  <textarea
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-[var(--color-hairline)] p-2 font-body text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-brand)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStage("contactAsk")}
                  className="self-center rounded-lg bg-[var(--color-brand)] px-8 py-2 font-body text-sm font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            )}

            {stage === "contactAsk" && (
              <div className="flex flex-col gap-4">
                <p className="font-body text-lg text-[var(--color-brand)]">
                  Would you like us to contact you{" "}
                  <span className="font-extrabold">once we find a solution?</span>
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("contactForm")}
                    className="flex-1 rounded-lg bg-[var(--color-brand)] px-4 py-2 font-body text-sm font-semibold text-white"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("declined")}
                    className="flex-1 rounded-lg bg-[var(--color-brand)] px-4 py-2 font-body text-sm font-semibold text-white"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}

            {stage === "contactForm" && (
              <LeadCaptureForm
                title="Leave your details"
                submitLabel="Submit"
                onSubmit={() => {
                  setStage("thanks");
                }}
              />
            )}

            {stage === "declined" && (
              <p className="font-body text-base text-[var(--color-brand)]">
                No problem. You can reach out anytime.
              </p>
            )}

            {stage === "thanks" && (
              <p className="font-body text-base text-[var(--color-brand)]">
                Got it! We&apos;ll work on a solution promptly.
              </p>
            )}
          </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
