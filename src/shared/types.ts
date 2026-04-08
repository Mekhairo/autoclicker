export type ClickType = 'left' | 'right' | 'middle'

export interface Profile {
  id: string
  name: string
  cps: number
  clickType: ClickType
  incremental: boolean
  incrementDuration: number // seconds to ramp from 0 to target CPS
  hotkey?: string
}

export interface ClickerSettings {
  cps: number
  clickType: ClickType
  incremental: boolean
  incrementDuration: number
  hotkey?: string
}
