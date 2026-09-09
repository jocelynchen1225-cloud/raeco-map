import logo from "@/assets/aal-logo.png";

const COLUMNS = [
  {
    title: "Research",
    links: ["Adoption benchmark", "Scenario library", "Tool assessments", "Working papers"],
  },
  {
    title: "Advisory",
    links: ["Readiness diagnostic", "Pilot design", "Capability building", "Governance"],
  },
  {
    title: "Organisation",
    links: ["About AAL", "Method", "Partners", "Contact"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={logo}
                alt="AAL Innovation"
                width={512}
                height={512}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <span className="truncate text-[15px] tracking-wide text-foreground">
                AAL INNOVATION
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Independent research and advisory on artificial intelligence adoption across
              architecture, engineering, construction and real estate.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AAL Innovation. All rights reserved.</p>
          <p>Research outputs published under open licence.</p>
        </div>
      </div>
    </footer>
  );
}
