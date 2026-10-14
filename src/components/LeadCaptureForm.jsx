import { useState } from "react";

const emptyLead = { firstName: "", surname: "", email: "", company: "", position: "" };

function LeadField({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 font-body text-[13px] font-semibold text-slate-800 ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-slate-200 bg-white/85 px-3.5 font-body text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/10"
      />
    </label>
  );
}

export default function LeadCaptureForm({
  title = "Leave your details",
  submitLabel = "Submit",
  onSubmit,
}) {
  const [lead, setLead] = useState(emptyLead);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(lead);
      }}
    >
      {title && <p className="font-body text-lg font-extrabold text-slate-950">{title}</p>}
      <div className="grid grid-cols-2 gap-4">
        <LeadField
          label="First Name"
          value={lead.firstName}
          onChange={(value) => setLead((current) => ({ ...current, firstName: value }))}
        />
        <LeadField
          label="Surname"
          value={lead.surname}
          onChange={(value) => setLead((current) => ({ ...current, surname: value }))}
        />
        <LeadField
          label="Email"
          type="email"
          className="col-span-2"
          value={lead.email}
          onChange={(value) => setLead((current) => ({ ...current, email: value }))}
        />
        <LeadField
          label="Company"
          value={lead.company}
          onChange={(value) => setLead((current) => ({ ...current, company: value }))}
        />
        <LeadField
          label="Position"
          value={lead.position}
          onChange={(value) => setLead((current) => ({ ...current, position: value }))}
        />
      </div>
      <button
        type="submit"
        className="mt-1 self-center rounded-2xl bg-[var(--color-brand)] px-10 py-3 font-body text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(25,52,160,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-950"
      >
        {submitLabel}
      </button>
    </form>
  );
}
