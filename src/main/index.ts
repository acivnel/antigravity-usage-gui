import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startOAuthFlow } from './lib/google/oauth'
import { getTokenManager } from './lib/google/token-manager'
import { fetchQuota } from './lib/quota/service'
import { deleteTokens } from './lib/google/storage'
import { initTray } from './lib/tray'
import { initUpdater } from './lib/updater'
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden', // Custom title bar for Windows feel
        titleBarOverlay: {
            color: '#171717',
            symbolColor: '#ffffff',
            height: 30
        },
        ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // Close to tray behavior
    mainWindow.on('close', (event) => {
        if (!(app as any).isQuitting) {
            event.preventDefault()
            mainWindow?.hide()
            return false
        }
        return true
    })

    // HMR for renderer base on electron-vite cli.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// Add isQuitting flag to app
Object.defineProperty(app, 'isQuitting', {
    value: false,
    writable: true
})

app.on('before-quit', () => {
    (app as any).isQuitting = true
})

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC Handlers
    ipcMain.handle('login', async () => {
        const result = await startOAuthFlow()
        if (result.success) {
            getTokenManager().reload()
        }
        return result
    })

    ipcMain.handle('check-auth', () => {
        return getTokenManager().isLoggedIn()
    })

    ipcMain.handle('get-quota', async () => {
        try {
            return await fetchQuota()
        } catch (err) {
            console.error('Failed to fetch quota:', err)
            return []
        }
    })

    ipcMain.handle('logout', () => {
        deleteTokens()
        getTokenManager().reload()
        return true
    })

    createWindow()

    if (mainWindow) {
        initTray(mainWindow)
        // Initialize updater after window is ready
        if (!is.dev) {
            initUpdater(mainWindow)
            // Check for updates shortly after launch
            setTimeout(() => {
                autoUpdater.checkForUpdatesAndNotify()
            }, 3000)
        }
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
