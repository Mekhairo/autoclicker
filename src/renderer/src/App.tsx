import { useState, useEffect, useCallback } from 'react'
import { Profile, ClickerSettings } from '../../shared/types'
import TitleBar from './components/TitleBar'
import ProfileManager from './components/ProfileManager'
import CpsDisplay from './components/CpsDisplay'
import CpsSlider from './components/CpsSlider'
import ClickTypeSelector from './components/ClickTypeSelector'
import IncrementalToggle from './components/IncrementalToggle'
import HotkeyPicker from './components/HotkeyPicker'
import StartButton from './components/StartButton'
import './App.css'

declare global {
  interface Window {
    api: {
      startClicking: (s: ClickerSettings) => Promise<void>
      stopClicking: () => Promise<void>
      toggleClicking: (s: ClickerSettings) => Promise<void>
      isRunning: () => Promise<boolean>
      loadProfiles: () => Promise<Profile[]>
      saveProfiles: (profiles: Profile[]) => Promise<boolean>
      registerHotkey: (hotkey: string, settings: ClickerSettings) => Promise<void>
      onStatusChange: (cb: (running: boolean) => void) => () => void
      onCpsUpdate: (cb: (cps: number) => void) => () => void
      minimizeWindow: () => void
      closeWindow: () => void
    }
  }
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string>('default')
  const [isRunning, setIsRunning] = useState(false)
  const [displayCps, setDisplayCps] = useState(0)

  // Derived active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? profiles[0]

  // Load profiles on mount
  useEffect(() => {
    window.api.loadProfiles().then(loaded => {
      setProfiles(loaded)
      setActiveProfileId(loaded[0]?.id ?? 'default')
      setDisplayCps(loaded[0]?.cps ?? 0)
    })

    const unsub1 = window.api.onStatusChange(running => setIsRunning(running))
    const unsub2 = window.api.onCpsUpdate(cps => setDisplayCps(cps))

    return () => { unsub1(); unsub2() }
  }, [])

  // Sync displayCps when profile changes (and not running)
  useEffect(() => {
    if (!isRunning && activeProfile) setDisplayCps(activeProfile.cps)
  }, [activeProfile, isRunning])

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '')
  }, [theme])

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === activeProfileId ? { ...p, ...updates } : p)
      window.api.saveProfiles(next)
      return next
    })
  }, [activeProfileId])

  const addProfile = useCallback(() => {
    const id = `profile-${Date.now()}`
    const newProfile: Profile = {
      id,
      name: `Profile ${profiles.length + 1}`,
      cps: 10,
      clickType: 'left',
      incremental: false,
      incrementDuration: 3,
      hotkey: ''
    }
    const next = [...profiles, newProfile]
    setProfiles(next)
    setActiveProfileId(id)
    window.api.saveProfiles(next)
  }, [profiles])

  const deleteProfile = useCallback((id: string) => {
    if (profiles.length <= 1) return
    const next = profiles.filter(p => p.id !== id)
    setProfiles(next)
    setActiveProfileId(next[0].id)
    window.api.saveProfiles(next)
  }, [profiles])

  const handleToggle = useCallback(() => {
    if (!activeProfile) return
    const settings: ClickerSettings = {
      cps: activeProfile.cps,
      clickType: activeProfile.clickType,
      incremental: activeProfile.incremental,
      incrementDuration: activeProfile.incrementDuration,
      hotkey: activeProfile.hotkey
    }
    window.api.toggleClicking(settings)
  }, [activeProfile])

  if (!activeProfile) return null

  return (
    <div className={`app ${isRunning ? 'app--running' : ''}`}>
      <TitleBar
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <div className="app__body">
        <ProfileManager
          profiles={profiles}
          activeProfileId={activeProfileId}
          isRunning={isRunning}
          onSelect={setActiveProfileId}
          onAdd={addProfile}
          onDelete={deleteProfile}
          onRename={name => updateProfile({ name })}
        />

        <CpsDisplay cps={displayCps} isRunning={isRunning} targetCps={activeProfile.cps} />

        <CpsSlider
          value={activeProfile.cps}
          disabled={isRunning}
          onChange={cps => updateProfile({ cps })}
        />

        <div className="app__row">
          <ClickTypeSelector
            value={activeProfile.clickType}
            disabled={isRunning}
            onChange={clickType => updateProfile({ clickType })}
          />
        </div>

        <div className="app__row">
          <IncrementalToggle
            enabled={activeProfile.incremental}
            duration={activeProfile.incrementDuration}
            disabled={isRunning}
            onToggle={incremental => updateProfile({ incremental })}
            onDurationChange={incrementDuration => updateProfile({ incrementDuration })}
          />
        </div>

        <div className="app__row">
          <HotkeyPicker
            value={activeProfile.hotkey ?? ''}
            disabled={isRunning}
            onChange={hotkey => updateProfile({ hotkey })}
          />
        </div>

        <StartButton isRunning={isRunning} cps={activeProfile.cps} onClick={handleToggle} />
      </div>
    </div>
  )
}
