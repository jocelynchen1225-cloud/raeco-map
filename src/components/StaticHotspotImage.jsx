export default function StaticHotspotImage({ config, onHotspotClick, blurred = false }) {
  return (
    <div className={blurred ? "pointer-events-none absolute inset-0" : "relative w-full"}>
      <div className={blurred ? "h-full w-full overflow-hidden opacity-30 blur-[3px]" : "relative w-full"}>
        <img
          src={config.image}
          alt=""
          className={blurred ? "block h-full w-full select-none object-cover" : "block w-full select-none"}
          draggable={false}
        />
        {!blurred &&
          config.hotspots.map((h) => {
            const style =
              h.shape === "circle"
                ? {
                    left: `${h.xPct}%`,
                    top: `${h.yPct}%`,
                    width: `${h.rPct * 2}%`,
                    height: `${h.rPct * 2}%`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                  }
                : {
                    left: `${h.xPct}%`,
                    top: `${h.yPct}%`,
                    width: `${h.wPct}%`,
                    height: `${h.hPct}%`,
                    borderRadius: "16px",
                  };
            return (
              <button
                key={h.id}
                type="button"
                aria-label={h.id}
                onClick={() => onHotspotClick?.(h)}
                style={{ ...style, WebkitTapHighlightColor: "transparent" }}
                className="absolute cursor-pointer appearance-none border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40"
              />
            );
          })}
      </div>
    </div>
  );
}
