import { ArrowLeft } from "lucide-react";

export default function BackButton({ onClick, label = "Back", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-3 rounded-full border border-white/85 bg-white/78 px-5 py-3 font-body text-sm font-extrabold text-slate-950 shadow-[0_18px_50px_rgba(48,58,86,.13)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:text-[var(--color-brand)] ${className}`}
    >
      <ArrowLeft size={18} strokeWidth={2.4} />
      {label}
    </button>
  );
}
