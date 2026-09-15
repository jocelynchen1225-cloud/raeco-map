const NAV_LINKS = ["Scenarios", "Stakeholders", "AI Tools", "Customise Solution"];

export default function NavBar() {
  return (
    <header className="relative z-20 flex items-center justify-between px-10 py-6 md:px-16">
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="AAL Innovation"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
        <span className="font-body text-[17px] font-normal tracking-wide text-[var(--color-ink)]">
          AAL INNOVATION
        </span>
      </div>

      <nav className="hidden items-center gap-10 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="font-body text-[17px] text-[var(--color-ink)] transition-colors hover:text-[var(--color-brand)]"
          >
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
