import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ClickerSettings, Profile } from '../shared/types'

const api = {
  // Clicker controls
  startClicking: (settings: ClickerSettings) =>
    ipcRenderer.invoke('clicker:start', settings),
  stopClicking: () =>
    ipcRenderer.invoke('clicker:stop'),
  toggleClicking: (settings: ClickerSettings) =>
    ipcRenderer.invoke('clicker:toggle', settings),
  isRunning: () =>
    ipcRenderer.invoke('clicker:is-running'),

  // Profile management
  loadProfiles: (): Promise<Profile[]> =>
    ipcRenderer.invoke('profiles:load'),
  saveProfiles: (profiles: Profile[]) =>
    ipcRenderer.invoke('profiles:save', profiles),

  // Hotkey
  registerHotkey: (hotkey: string, settings: ClickerSettings) =>
    ipcRenderer.invoke('hotkey:register', hotkey, settings),

  // Events from main → renderer
  onStatusChange: (cb: (running: boolean) => void) => {
    ipcRenderer.on('clicker:status', (_, running) => cb(running))
    return () => ipcRenderer.removeAllListeners('clicker:status')
  },
  onCpsUpdate: (cb: (cps: number) => void) => {
    ipcRenderer.on('clicker:cps-update', (_, cps) => cb(cps))
    return () => ipcRenderer.removeAllListeners('clicker:cps-update')
  },

  // Window controls (frameless)
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (e) {
    console.error(e)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
