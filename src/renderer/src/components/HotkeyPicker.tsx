import { useState, useRef } from 'react'
import './HotkeyPicker.css'

interface Props {
  value: string
  disabled: boolean
  onChange: (hotkey: string) => void
}

function electronKey(e: KeyboardEvent): string {
  const mods: string[] = []
  if (e.ctrlKey) mods.push('Ctrl')
  if (e.altKey) mods.push('Alt')
  if (e.shiftKey) mods.push('Shift')

  const ignore = ['Control', 'Alt', 'Shift', 'Meta', 'CapsLock']
  if (ignore.includes(e.key)) return mods.join('+')

  const key = e.code.startsWith('Key') ? e.code.slice(3) :
              e.code.startsWith('Digit') ? e.code.slice(5) :
              e.key === ' ' ? 'Space' : e.key

  return [...mods, key].join('+')
}

export default function HotkeyPicker({ value, disabled, onChange }: Props) {
  const [recording, setRecording] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const startRecording = () => {
    if (disabled) return
    setRecording(true)

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === 'Escape') {
        setRecording(false)
        document.removeEventListener('keydown', onKey)
        return
      }
      const combo = electronKey(e)
      if (combo) {
        onChange(combo)
        setRecording(false)
        document.removeEventListener('keydown', onKey)
      }
    }

    document.addEventListener('keydown', onKey)
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className="hotkey">
      <div className="label">Hotkey</div>
      <div className="hotkey__row">
        <button
          ref={ref}
          className={`hotkey__btn ${recording ? 'hotkey__btn--recording' : ''}`}
          disabled={disabled}
          onClick={startRecording}
        >
          {recording ? (
            <span className="hotkey__hint">Press any key…</span>
          ) : value ? (
            <span className="hotkey__key">{value}</span>
          ) : (
            <span className="hotkey__placeholder">Click to set hotkey</span>
          )}
        </button>
        {value && !recording && (
          <button className="hotkey__clear" disabled={disabled} onClick={clear} title="Clear hotkey">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
