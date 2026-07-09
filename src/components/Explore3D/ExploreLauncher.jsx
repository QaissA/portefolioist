/**
 * The entry point into Drive Mode. A fixed pill in the bottom-right (GameHUD
 * owns the bottom-left). Keyboard-driven, so it's desktop-only.
 */
export default function ExploreLauncher({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group fixed bottom-5 right-5 z-[9000] hidden items-center gap-2.5 rounded-full border border-border bg-surface/90 py-2 pl-3 pr-4 font-mono text-xs text-text-secondary backdrop-blur transition-colors duration-200 hover:border-amber/60 hover:text-text-primary md:flex"
      aria-label="Explore the portfolio in a drivable 3D scene"
    >
      <span className="text-base leading-none">🚗</span>
      <span className="tracking-wide">DRIVE MODE</span>
      <span className="text-[10px] text-text-muted transition-colors group-hover:text-amber">
        3D
      </span>
    </button>
  )
}
