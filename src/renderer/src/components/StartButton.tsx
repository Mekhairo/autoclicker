import './StartButton.css'

interface Props {
  isRunning: boolean
  cps: number
  onClick: () => void
}

export default function StartButton({ isRunning, cps, onClick }: Props) {
  return (
    <div className="start-wrap">
      <button
        className={`start-btn ${isRunning ? 'start-btn--running' : ''} ${cps === 0 ? 'start-btn--zero' : ''}`}
        onClick={onClick}
      >
        <span className="start-btn__label">{isRunning ? 'STOP' : 'START'}</span>
        {isRunning && <span className="start-btn__pulse" />}
      </button>
      {cps === 0 && !isRunning && (
        <p className="start-hint">Set CPS above 0 to start</p>
      )}
    </div>
  )
}
