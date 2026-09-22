import { motion } from "framer-motion";
import StatsGrid from "./StatsGrid";
import LandingIndustryStrip from "./LandingIndustryStrip";
import LandingExtras from "./LandingExtras";

export default function HeroState({ onSelectRoleAndTask }) {
  return (
    <section className="relative px-8 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-4 text-center md:pt-6"
      >
        <LandingIndustryStrip />

        <h1 className="font-body text-[34px] font-extrabold leading-[1.15] text-[var(--color-brand)] md:text-[44px]">
          A takeaway AI adoption plan for your role and task
        </h1>

        <p className="max-w-2xl font-body text-base leading-relaxed text-[var(--color-ink)] md:text-lg">
          Pick your REACO role and task. Download a feasible AI adoption plan, with tools mapped
          to the job you need to finish and the stage of the project lifecycle.
        </p>

        <StatsGrid />

        <button
          type="button"
          onClick={onSelectRoleAndTask}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full border-2 border-[var(--color-brand)] font-body text-sm font-bold uppercase tracking-wide text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)] hover:text-white md:h-36 md:w-36 md:text-base"
        >
          Start to
          <br />
          Explore
        </button>
      </motion.div>

      <LandingExtras />
    </section>
  );
}
