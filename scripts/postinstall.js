/**
 * postinstall.js
 *
 * On Windows we use koffi (pre-built) to call Win32 SendInput — no native
 * compilation needed. Skip rebuilding robotjs entirely.
 *
 * On Linux/macOS we rebuild robotjs against the installed Electron ABI so
 * the native module loads correctly at runtime.
 */

const { execSync } = require('child_process')

if (process.platform === 'win32') {
  console.log('Windows detected — skipping robotjs rebuild (using koffi instead)')
  process.exit(0)
}

console.log(`${process.platform} detected — rebuilding robotjs for Electron...`)
try {
  execSync('npx electron-rebuild -f -w robotjs', { stdio: 'inherit' })
} catch (e) {
  console.warn(
    '\n[warn] robotjs rebuild failed. The app will still run but clicking may not work.\n' +
    'If you need clicking on Linux/macOS, ensure you have internet access so Electron\n' +
    'headers can be downloaded, then run: npm run rebuild\n'
  )
}
