import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, MessageSquare } from "lucide-react";
import ToolLogo from "./ToolLogo";
import stakeholders from "../../data/stakeholders.json";
import phases from "../../data/phases.json";
import { INDUSTRY_LABELS, getIndustryColor } from "../../lib/taskVisuals";

const stakeholderLabel = Object.fromEntries(stakeholders.map((s) => [s.id, s.label]));
const phaseLabel = Object.fromEntries(phases.map((p) => [p.id, p.label]));

function Section({ title, children }) {
  return (
    <section className="border-t border-[var(--color-hairline)] py-5">
      <h3 className="font-body text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Chip({ children }) {
  return (
    <span className="rounded-full bg-[var(--color-paper-dim)] px-3 py-1 font-body text-xs font-medium text-[var(--color-ink)]/75">
      {children}
    </span>
  );
}

export default function ToolDrawer({ tool, useCases, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const facts = [
    ["Solution type", tool.solutionTypes.join(", ")],
    ["Deployment", tool.deploymentModels.join(", ")],
    ["Used in phases", tool.phases.map((p) => phaseLabel[p]).join(", ")],
  ].filter(([, v]) => v);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex justify-end bg-[rgba(20,24,38,0.35)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={tool.name}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full w-full max-w-[520px] flex-col bg-white shadow-[-24px_0_60px_rgba(25,52,160,0.18)]"
      >
        <header className="flex items-start gap-4 px-7 pb-5 pt-7">
          <ToolLogo tool={tool} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="font-body text-2xl font-bold leading-tight text-[var(--color-ink)]">{tool.name}</h2>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {tool.industries.map((ind) => (
                <span key={ind} className="flex items-center gap-1.5 font-body text-xs text-[var(--color-ink)]/65">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: getIndustryColor(ind) }} />
                  {INDUSTRY_LABELS[ind]}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-[var(--color-ink)]/45 hover:bg-[var(--color-paper-dim)] hover:text-[var(--color-ink)]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 pb-8">
          <p className="pb-5 font-body text-base font-medium leading-7 text-[var(--color-ink)]/80">{tool.headline}</p>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[var(--color-hairline)] py-5 font-body text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-[var(--color-ink)]/50">{k}</dt>
                <dd className="text-[var(--color-ink)]">{v}</dd>
              </div>
            ))}
          </dl>

          <Section title="Pain points it addresses">
            <div className="flex flex-wrap gap-2">
              {tool.painPoints.map((p) => <Chip key={p}>{p}</Chip>)}
            </div>
          </Section>

          <Section title={`Where it's used (${useCases.length})`}>
            <ol className="flex flex-col gap-3">
              {useCases.map((u) => (
                <li key={u.id} className="rounded-2xl border border-[var(--color-hairline)] p-4">
                  <p className="font-body text-sm font-semibold text-[var(--color-ink)]">{u.scenario}</p>
                  <p className="mt-0.5 font-body text-xs text-[var(--color-ink)]/50">
                    {u.task}
                    {u.phaseId && ` in ${phaseLabel[u.phaseId]}`}
                  </p>
                  <p className="mt-3 font-body text-sm leading-6 text-[var(--color-ink)]/75">{u.description}</p>
                  <p className="mt-3 font-body text-sm leading-6 text-[var(--color-ink)]">
                    <span className="font-semibold text-[var(--color-brand)]">AI does: </span>
                    {u.aiValue}
                  </p>
                  <p className="mt-2 font-body text-xs text-[var(--color-ink)]/50">
                    For {u.stakeholders.map((s) => stakeholderLabel[s]).join(", ")}
                  </p>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="AI techniques">
            <div className="flex flex-wrap gap-2">
              {tool.aiTechniques.map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
          </Section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-[var(--color-hairline)] px-7 py-5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("raeco:open-chat"))}
            className="flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_10px_24px_rgba(25,52,160,0.28)] transition hover:-translate-y-0.5"
          >
            <MessageSquare size={16} /> Ask AAL whether {tool.name} fits your project
          </button>
          {tool.website && (
            <a
              href={tool.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-body text-sm font-semibold text-[var(--color-ink)]/70 hover:text-[var(--color-brand)]"
            >
              Visit website <ExternalLink size={14} />
            </a>
          )}
        </footer>
      </motion.aside>
    </motion.div>
  );
}
