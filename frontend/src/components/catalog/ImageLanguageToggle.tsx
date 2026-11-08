type Props = {
  showPt: boolean
  onChange: (showPt: boolean) => void
}

const OPTIONS = [
  { pt: false, label: 'Inglês' },
  { pt: true, label: 'Português' },
]

/** Alterna a imagem da carta entre a impressão em inglês e a em português. */
export function ImageLanguageToggle({ showPt, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Idioma da imagem"
      className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 text-sm font-semibold"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={showPt === option.pt}
          onClick={() => onChange(option.pt)}
          className={`rounded-md px-2 py-1.5 ${
            showPt === option.pt
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
