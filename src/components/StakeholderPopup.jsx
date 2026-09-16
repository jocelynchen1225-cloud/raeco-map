import { motion } from "framer-motion";
import { Ruler, HardHat, Pencil, User, Settings, Package, Calculator } from "lucide-react";
import stakeholders from "../data/stakeholders.json";

const ICONS = {
  ruler: Ruler,
  hardhat: HardHat,
  pencil: Pencil,
  user: User,
  gear: Settings,
  package: Package,
  calculator: Calculator,
};

// Matches the Figma reference exactly: fixed 26px corner radius (not a %,
// which stretches unevenly on a wide short card), same icon/name/dot set.
export default function StakeholderPopup({ onSelectStakeholder, onBack }) {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col items-center justify-center gap-8 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-4"
      >
        {stakeholders.map((s) => {
          const Icon = ICONS[s.icon] ?? User;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStakeholder?.(s.id)}
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "26px",
              }}
              className="flex flex-col items-start gap-2 border border-white/60 px-6 py-7 text-left shadow-[0_8px_30px_rgba(25,52,160,0.12)] transition-transform hover:scale-[1.03] hover:shadow-[0_12px_36px_rgba(25,52,160,0.2)]"
            >
              <Icon size={26} strokeWidth={1.75} className="text-[var(--color-ink)]/70" />
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
          View All
        </button>
      </div>
    </div>
  );
}
