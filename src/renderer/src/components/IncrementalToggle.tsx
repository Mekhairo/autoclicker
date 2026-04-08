import './IncrementalToggle.css'

interface Props {
  enabled: boolean
  duration: number
  disabled: boolean
  onToggle: (enabled: boolean) => void
  onDurationChange: (duration: number) => void
}

export default function IncrementalToggle({ enabled, duration, disabled, onToggle, onDurationChange }: Props) {
  return (
    <div className="incremental">
      <div className="incremental__header">
        <div>
          <div className="label" style={{ margin: 0 }}>Incremental mode</div>
          <div className="incremental__desc">Ramp CPS from 0 to target</div>
        </div>
        <button
          className={`toggle ${enabled ? 'toggle--on' : ''}`}
          disabled={disabled}
          onClick={() => onToggle(!enabled)}
          aria-label="Toggle incremental mode"
        >
          <span className="toggle__thumb" />
        </button>
      </div>

      {enabled && (
        <div className="incremental__duration">
          <span className="incremental__duration-label">Ramp duration</span>
          <div className="incremental__duration-control">
            <button
              className="incremental__step"
              disabled={disabled || duration <= 1}
              onClick={() => onDurationChange(Math.max(1, duration - 1))}
            >
              −
            </button>
            <span className="incremental__duration-value">{duration}s</span>
            <button
              className="incremental__step"
              disabled={disabled || duration >= 30}
              onClick={() => onDurationChange(Math.min(30, duration + 1))}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
