import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import { info, error } from './core/logger'

export function initUpdater(mainWindow: BrowserWindow): void {
    // autoUpdater.logger = console // Or custom logger

    // Disable auto downloading - wait for user confirmation if preferred, 
    // but for now let's auto download to make it seamless
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    info('Initializing auto-updater...')

    autoUpdater.on('checking-for-update', () => {
        info('Checking for update...')
        mainWindow.webContents.send('update-status', { status: 'checking' })
    })

    autoUpdater.on('update-available', (updateInfo) => {
        info(`Update available: ${updateInfo.version}`)
        mainWindow.webContents.send('update-status', { status: 'available', version: updateInfo.version })
    })

    autoUpdater.on('update-not-available', () => {
        info('Update not available')
        mainWindow.webContents.send('update-status', { status: 'not-available' })
    })

    autoUpdater.on('error', (err) => {
        error('Error in auto-updater', err)
        mainWindow.webContents.send('update-status', { status: 'error', error: err.message })
    })

    autoUpdater.on('download-progress', (progressObj) => {
        mainWindow.webContents.send('update-status', {
            status: 'downloading',
            progress: progressObj.percent
        })
    })

    autoUpdater.on('update-downloaded', (updateInfo) => {
        info(`Update downloaded: ${updateInfo.version}`)
        mainWindow.webContents.send('update-status', { status: 'downloaded', version: updateInfo.version })
    })

    // IPC handlers
    ipcMain.handle('check-for-updates', () => {
        if (is.dev) {
            info('Skipping update check in dev mode')
            mainWindow.webContents.send('update-status', { status: 'not-available' }) // Mock response
            return
        }
        autoUpdater.checkForUpdatesAndNotify()
    })

    ipcMain.handle('quit-and-install', () => {
        autoUpdater.quitAndInstall()
    })

    // Initial check if not dev
    if (!is.dev) {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify()
        }, 3000)
    }
}
