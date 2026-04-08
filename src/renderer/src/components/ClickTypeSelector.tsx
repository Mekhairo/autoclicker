import { ClickType } from '../../../shared/types'
import './ClickTypeSelector.css'

interface Props {
  value: ClickType
  disabled: boolean
  onChange: (type: ClickType) => void
}

const OPTIONS: { value: ClickType; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'middle', label: 'Middle' }
]

export default function ClickTypeSelector({ value, disabled, onChange }: Props) {
  return (
    <div className="click-type">
      <div className="label">Click button</div>
      <div className="click-type__options">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`click-type__btn ${value === opt.value ? 'click-type__btn--active' : ''}`}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
