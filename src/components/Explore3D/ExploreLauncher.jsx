/**
 * The entry point into Drive Mode. A fixed pill in the bottom-right, stacked
 * above the theme toggle (GameHUD owns the bottom-left). Keyboard-driven, so
 * it's desktop-only.
 */
import { CONTENT } from '@/utils/constants'

const DRIVE = CONTENT.driveMode

export default function ExploreLauncher({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group fixed bottom-20 right-5 z-[9000] hidden items-center gap-2.5 rounded-full border border-border bg-surface/90 py-2 pl-3 pr-4 font-mono text-xs text-text-secondary backdrop-blur transition-colors duration-200 hover:border-amber/60 hover:text-text-primary md:flex"
      aria-label={DRIVE.launcherAria}
    >
      <span className="text-base leading-none">🚗</span>
      <span className="tracking-wide">{DRIVE.launcher}</span>
      <span className="text-[10px] text-text-muted transition-colors group-hover:text-amber">
        {DRIVE.launcherBadge}
      </span>
    </button>
  )
}
