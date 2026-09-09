import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logo from "@/assets/aal-logo.png";

const NAV = [
  { label: "Research", href: "#research" },
  { label: "Stakeholders", href: "#stakeholders" },
  { label: "AI Tools", href: "#tools" },
  { label: "Advisory", href: "#advisory" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-hairline bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5 md:px-12">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="AAL Innovation"
            width={512}
            height={512}
            className="h-11 w-11 shrink-0 rounded-lg object-cover md:h-14 md:w-14"
          />
          <span className="truncate text-[15px] tracking-wide text-foreground md:text-[17px]">
            AAL INNOVATION
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[17px] text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="justify-self-end rounded-md border border-hairline p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-hairline px-6 pb-5 md:hidden">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-hairline py-4 text-base text-foreground last:border-b-0"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
