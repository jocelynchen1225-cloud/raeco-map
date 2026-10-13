import { useState } from "react";

function initials(name = "AI") {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AI";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

// Tools without a logo file (or whose file fails to load) get an initials tile
// in the brand tint, so the grid never shows a broken image.
export default function ToolLogo({ tool, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.24);
  if (!tool) return null;

  if (!tool.logo || failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center bg-[var(--color-brand)]/10 font-body font-bold text-[var(--color-brand)]"
        style={{ width: size, height: size, borderRadius: radius, fontSize: Math.max(10, size * 0.32) }}
        aria-hidden="true"
      >
        {initials(tool.name)}
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden border border-[var(--color-hairline)] bg-white"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <img
        src={tool.logo}
        alt=""
        className="h-full w-full object-contain p-[12%]"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </span>
  );
}
