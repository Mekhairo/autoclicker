import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { ClickerSettings, Profile } from '../shared/types'
import { getClicker } from './clicker'

// ── Profiles persistence ──────────────────────────────────────────────────────

function getProfilesPath(): string {
  return join(app.getPath('userData'), 'profiles.json')
}

function loadProfiles(): Profile[] {
  const path = getProfilesPath()
  if (!existsSync(path)) return getDefaultProfiles()
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return getDefaultProfiles()
  }
}

function saveProfiles(profiles: Profile[]): void {
  writeFileSync(getProfilesPath(), JSON.stringify(profiles, null, 2))
}

function getDefaultProfiles(): Profile[] {
  return [
    {
      id: 'default',
      name: 'Default',
      cps: 10,
      clickType: 'left',
      incremental: false,
      incrementDuration: 3
    }
  ]
}

// ── Clicker engine ─────────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null
let clickTimeout: ReturnType<typeof setTimeout> | null = null
let incrementalInterval: ReturnType<typeof setInterval> | null = null
let isRunning = false
let currentCps = 0
let activeSettings: ClickerSettings | null = null
let registeredHotkey: string | null = null

function scheduleClick(interval: number): void {
  if (!isRunning) return
  clickTimeout = setTimeout(() => {
    if (!isRunning) return
    try {
      getClicker()?.(activeSettings?.clickType ?? 'left')
    } catch (e) {
      console.error('Click error:', e)
    }
    scheduleClick(interval)
  }, interval)
}

function startClicking(settings: ClickerSettings): void {
  stopClicking()
  isRunning = true
  activeSettings = settings

  if (settings.incremental) {
    currentCps = 0
    const targetCps = settings.cps
    const steps = 20
    const stepSize = targetCps / steps
    const stepInterval = (settings.incrementDuration * 1000) / steps

    mainWindow?.webContents.send('clicker:cps-update', 0)

    let step = 0
    incrementalInterval = setInterval(() => {
      step++
      currentCps = Math.min(stepSize * step, targetCps)
      mainWindow?.webContents.send('clicker:cps-update', Math.round(currentCps))

      // Reschedule clicks at new rate
      if (clickTimeout) clearTimeout(clickTimeout)
      if (currentCps > 0) scheduleClick(1000 / currentCps)

      if (step >= steps) clearInterval(incrementalInterval!)
    }, stepInterval)

    if (currentCps > 0) scheduleClick(1000 / Math.max(currentCps, 0.1))
  } else {
    currentCps = settings.cps
    mainWindow?.webContents.send('clicker:cps-update', currentCps)
    if (currentCps > 0) scheduleClick(1000 / currentCps)
  }

  mainWindow?.webContents.send('clicker:status', true)
}

function stopClicking(): void {
  isRunning = false
  if (clickTimeout) {
    clearTimeout(clickTimeout)
    clickTimeout = null
  }
  if (incrementalInterval) {
    clearInterval(incrementalInterval)
    incrementalInterval = null
  }
  mainWindow?.webContents.send('clicker:status', false)
  mainWindow?.webContents.send('clicker:cps-update', activeSettings?.cps ?? 0)
}

function toggleClicking(settings?: ClickerSettings): void {
  if (isRunning) {
    stopClicking()
  } else if (settings) {
    startClicking(settings)
  }
}

function registerHotkey(hotkey: string, settings: ClickerSettings): void {
  if (registeredHotkey) {
    globalShortcut.unregister(registeredHotkey)
    registeredHotkey = null
  }
  if (!hotkey) return
  try {
    const success = globalShortcut.register(hotkey, () => toggleClicking(settings))
    if (success) registeredHotkey = hotkey
  } catch (e) {
    console.warn('Failed to register hotkey:', hotkey, e)
  }
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

ipcMain.handle('clicker:start', (_, settings: ClickerSettings) => {
  startClicking(settings)
  if (settings.hotkey) registerHotkey(settings.hotkey, settings)
})

ipcMain.handle('clicker:stop', () => stopClicking())

ipcMain.handle('clicker:toggle', (_, settings: ClickerSettings) => {
  toggleClicking(settings)
  if (settings.hotkey) registerHotkey(settings.hotkey, settings)
})

ipcMain.handle('clicker:is-running', () => isRunning)

ipcMain.handle('profiles:load', () => loadProfiles())

ipcMain.handle('profiles:save', (_, profiles: Profile[]) => {
  saveProfiles(profiles)
  return true
})

ipcMain.handle('hotkey:register', (_, hotkey: string, settings: ClickerSettings) => {
  registerHotkey(hotkey, settings)
})

// ── Window setup ──────────────────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow!.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.autoclicker')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopClicking()
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') app.quit()
})

// Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:close', () => {
  stopClicking()
  mainWindow?.close()
})
