import { motion } from "framer-motion";
import { User } from "lucide-react";
import stakeholders from "../data/stakeholders.json";
import { STAKEHOLDER_ICONS, getIndustryColor, INDUSTRY_LABELS } from "../lib/taskVisuals";

// Matches the Figma reference: fixed 26px corner radius, same icon/name/dot
// set, tinted per RAECO industry with a flat fill (no gradient) to match the
// site's overall flat-color aesthetic.
export default function StakeholderPopup({ onSelectStakeholder, onBack }) {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-start gap-6 overflow-hidden px-6 pb-8 pt-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-4"
      >
        {stakeholders.map((s) => {
          const Icon = STAKEHOLDER_ICONS[s.icon] ?? User;
          const industryColor = getIndustryColor(s.industry);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStakeholder?.(s.id)}
              style={{
                background: `${industryColor}26`,
                borderRadius: "26px",
                borderColor: `${industryColor}55`,
              }}
              className="flex flex-col items-start gap-1.5 border px-5 py-5 text-left shadow-[0_8px_30px_rgba(25,52,160,0.12)] transition-transform hover:scale-[1.03] hover:shadow-[0_12px_36px_rgba(25,52,160,0.2)]"
            >
              <span
                className="mb-1 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${industryColor}55`, color: "var(--color-ink)" }}
              >
                {INDUSTRY_LABELS[s.industry]}
              </span>
              <Icon size={22} strokeWidth={1.75} className="text-[var(--color-ink)]/70" />
              <span className="font-body text-base font-semibold text-[var(--color-ink)]">
                {s.label}
              </span>
              <span className="flex items-center gap-3 font-body text-xs text-[var(--color-ink)]/70">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {s.tasks} Tasks
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {s.painPoints} PainPoints
                </span>
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onBack}
          className="font-body text-sm text-[var(--color-brand)] underline underline-offset-4"
        >
          ← back
        </button>

        <button
          type="button"
          onClick={() => onSelectStakeholder?.("all")}
          className="rounded-full border border-[var(--color-brand)] bg-white/80 px-6 py-2.5 font-body text-sm font-semibold text-[var(--color-brand)] shadow-[0_10px_28px_rgba(25,52,160,0.12)] backdrop-blur-md transition hover:bg-[var(--color-brand)] hover:text-white"
        >
          Skip and view all
        </button>

      </div>
    </div>
  );
}
