import { motion } from "framer-motion";
import StatsGrid from "./StatsGrid";

export default function HeroState({ onSelectRoleAndTask }) {
  return (
    <section className="relative min-h-[calc(100vh-100px)] px-8 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-10 pt-12 text-center md:pt-16"
      >
        <h1 className="font-body text-[44px] font-extrabold leading-[1.15] text-[var(--color-brand)] md:text-[56px]">
          Find the right AI workflow
          <br />
          for your AEC task
        </h1>

        <p className="max-w-2xl font-body text-lg leading-relaxed text-[var(--color-ink)]">
          A scenario-based map of AI tools for architecture, engineering, construction, and
          real estate. Start with your role and the task you need to complete, then explore
          relevant workflows, compare tools, and see where each tool fits across the project
          lifecycle.
        </p>

        <StatsGrid />

        <button
          type="button"
          onClick={onSelectRoleAndTask}
          className="w-full rounded-lg border border-[var(--color-ink)] py-5 font-body text-xl text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)] hover:text-white"
        >
          EXPLORE BY YOUR ROLE
        </button>
      </motion.div>
    </section>
  );
}
