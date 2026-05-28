export default function SectionNumber({ num }) {
  return (
    <span
      aria-hidden="true"
      className="absolute font-display font-bold select-none pointer-events-none"
      style={{
        top: '-0.2em',
        left: '-0.05em',
        fontSize: 'clamp(6rem, 15vw, 12rem)',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(245,158,11,0.07)',
        letterSpacing: '-0.05em',
        lineHeight: 1,
        zIndex: 0,
        userSelect: 'none',
      }}
    >
      {num}
    </span>
  )
}
