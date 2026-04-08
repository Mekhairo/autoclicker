import './CpsDisplay.css'

interface Props {
  cps: number
  isRunning: boolean
  targetCps: number
}

export default function CpsDisplay({ cps, isRunning, targetCps }: Props) {
  const displayValue = isRunning ? cps : targetCps
  const isRamping = isRunning && cps < targetCps

  return (
    <div className={`cps-display ${isRunning ? 'cps-display--running' : ''}`}>
      <span className="cps-display__value">{displayValue}</span>
      <span className="cps-display__unit">CPS</span>
      {isRamping && (
        <span className="cps-display__ramp">↗ {targetCps}</span>
      )}
    </div>
  )
}
