import './CpsSlider.css'

interface Props {
  value: number
  disabled: boolean
  onChange: (cps: number) => void
}

const MIN = 0
const MAX = 60

export default function CpsSlider({ value, disabled, onChange }: Props) {
  const pct = (value / MAX) * 100

  return (
    <div className="slider-wrap">
      <div className="slider-header">
        <span className="label" style={{ margin: 0 }}>Clicks per second</span>
        <input
          type="number"
          className="slider-input"
          value={value}
          min={MIN}
          max={MAX}
          disabled={disabled}
          onChange={e => {
            const v = Math.min(MAX, Math.max(MIN, parseInt(e.target.value) || 0))
            onChange(v)
          }}
        />
      </div>
      <div className="slider-track-wrap">
        <div
          className="slider-track-fill"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          className="slider"
          min={MIN}
          max={MAX}
          value={value}
          disabled={disabled}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ '--pct': `${pct}%` } as React.CSSProperties}
        />
      </div>
      <div className="slider-ticks">
        <span>0</span>
        <span>15</span>
        <span>30</span>
        <span>45</span>
        <span>60</span>
      </div>
    </div>
  )
}
