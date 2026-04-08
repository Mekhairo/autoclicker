/**
 * Cross-platform mouse clicker
 *
 * Windows: uses koffi to call Win32 SendInput (no native compilation needed)
 * Linux:   uses robotjs (compiled against current Node/Electron)
 * macOS:   uses robotjs
 *
 * koffi ships pre-built binaries for all platforms so it works in packaged apps
 * without electron-rebuild.
 */

import { platform } from 'os'
import { ClickType } from '../shared/types'

type Clicker = (type: ClickType) => void

// ── Windows via koffi ─────────────────────────────────────────────────────────

function buildWindowsClicker(): Clicker | null {
  try {
    const koffi = require('koffi')

    const user32 = koffi.load('user32.dll')

    // INPUT structure for mouse
    const MOUSEINPUT = koffi.struct('MOUSEINPUT', {
      dx: 'int32',
      dy: 'int32',
      mouseData: 'uint32',
      dwFlags: 'uint32',
      time: 'uint32',
      dwExtraInfo: 'uintptr'
    })

    const INPUT = koffi.struct('INPUT', {
      type: 'uint32',
      mi: MOUSEINPUT
    })

    const SendInput = user32.func('uint32 SendInput(uint32 nInputs, _In_ INPUT *pInputs, int cbSize)')

    const INPUT_MOUSE = 0
    const MOUSEEVENTF_LEFTDOWN = 0x0002
    const MOUSEEVENTF_LEFTUP = 0x0004
    const MOUSEEVENTF_RIGHTDOWN = 0x0008
    const MOUSEEVENTF_RIGHTUP = 0x0010
    const MOUSEEVENTF_MIDDLEDOWN = 0x0020
    const MOUSEEVENTF_MIDDLEUP = 0x0040

    const inputSize = koffi.sizeof(INPUT)

    function sendMouseEvent(flags: number): void {
      const input = [{ type: INPUT_MOUSE, mi: { dx: 0, dy: 0, mouseData: 0, dwFlags: flags, time: 0, dwExtraInfo: 0 } }]
      SendInput(1, input, inputSize)
    }

    return (type: ClickType) => {
      if (type === 'left') {
        sendMouseEvent(MOUSEEVENTF_LEFTDOWN)
        sendMouseEvent(MOUSEEVENTF_LEFTUP)
      } else if (type === 'right') {
        sendMouseEvent(MOUSEEVENTF_RIGHTDOWN)
        sendMouseEvent(MOUSEEVENTF_RIGHTUP)
      } else {
        sendMouseEvent(MOUSEEVENTF_MIDDLEDOWN)
        sendMouseEvent(MOUSEEVENTF_MIDDLEUP)
      }
    }
  } catch (e) {
    console.warn('[clicker] Windows koffi init failed:', e)
    return null
  }
}

// ── robotjs fallback (Linux / macOS) ─────────────────────────────────────────

function buildRobotClicker(): Clicker | null {
  try {
    const robot = require('robotjs')
    robot.setMouseDelay(0)
    return (type: ClickType) => robot.mouseClick(type)
  } catch (e) {
    console.warn('[clicker] robotjs not available:', e)
    return null
  }
}

// ── Export ────────────────────────────────────────────────────────────────────

let _clicker: Clicker | null = null

export function getClicker(): Clicker | null {
  if (_clicker) return _clicker
  _clicker = platform() === 'win32' ? buildWindowsClicker() : buildRobotClicker()
  return _clicker
}
