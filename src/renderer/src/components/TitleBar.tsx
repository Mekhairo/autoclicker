import './TitleBar.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

export default function TitleBar({ theme, onThemeToggle }: Props) {
  return (
    <div className="titlebar">
      <div className="titlebar__drag">
        <span className="titlebar__icon">◎</span>
        <span className="titlebar__title">AutoClicker</span>
      </div>
      <div className="titlebar__controls">
        <button className="titlebar__btn titlebar__btn--theme" onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? '○' : '●'}
        </button>
        <button className="titlebar__btn" onClick={() => window.api.minimizeWindow()} title="Minimize">
          —
        </button>
        <button className="titlebar__btn titlebar__btn--close" onClick={() => window.api.closeWindow()} title="Close">
          ✕
        </button>
      </div>
    </div>
  )
}
