const NAV_LINKS = ["Scenarios", "Stakeholders", "AI Tools", "Customise Solution"];
// Only "AI Tools" is wired to a page so far; the other links are placeholders.
const LIVE_LINKS = new Set(["AI Tools"]);

export default function NavBar({ activeLink = null, onNavigate, onHome }) {
  return (
    <header className="relative z-20 flex items-center justify-between px-10 py-6 md:px-16">
      <button type="button" onClick={onHome} className="flex items-center gap-4 text-left">
        <img
          src="/logo.png"
          alt="AAL Innovation"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
        <span className="font-body text-[17px] font-normal tracking-wide text-[var(--color-ink)]">
          AAL INNOVATION
        </span>
      </button>

      <nav className="hidden items-center gap-10 md:flex">
        {NAV_LINKS.map((link) => {
          const active = link === activeLink;
          return (
            <a
              key={link}
              href="#"
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (LIVE_LINKS.has(link)) onNavigate?.(link);
              }}
              className={`font-body text-[17px] transition-colors hover:text-[var(--color-brand)] ${
                active ? "font-semibold text-[var(--color-brand)] underline decoration-2 underline-offset-8" : "text-[var(--color-ink)]"
              }`}
            >
              {link}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
