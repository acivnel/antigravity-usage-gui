import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { fetchQuota } from './quota/service'
import { error } from './core/logger'

let tray: Tray | null = null

export function initTray(mainWindow: BrowserWindow): void {
    const iconPath = process.platform === 'win32'
        ? join(__dirname, '../../resources/icon.ico')
        // Fallback to a default icon or just use the same one, assuming build resources exist
        : join(__dirname, '../../resources/icon.png')

    // In development, handle missing icon gracefully
    let icon
    try {
        icon = nativeImage.createFromPath(iconPath)
    } catch (e) {
        console.error('Failed to load tray icon', e)
        return
    }

    try {
        tray = new Tray(icon)
    } catch (e) {
        // If resource is missing in dev, just skip tray for now or use empty image 
        // (though empty active image might be invisible)
        console.warn('Could not create tray icon (likely missing resource in dev)', e)
        return
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show()
                mainWindow.focus()
            }
        },
        { type: 'separator' },
        {
            label: 'Check Quota Now',
            click: async () => {
                try {
                    const quotas = await fetchQuota()
                    const lowQuota = quotas.find(q => q.remaining < 20)

                    if (lowQuota) {
                        tray?.displayBalloon({
                            title: 'Low Quota Warning',
                            content: `${lowQuota.displayName} is at ${Math.round(lowQuota.remaining)}%`
                        })
                    } else {
                        // Optional: notify success
                    }
                } catch (err) {
                    error('Failed to check quota from tray', err as Error)
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit()
            }
        }
    ])

    tray.setToolTip('Antigravity Usage')
    tray.setContextMenu(contextMenu)

    tray.on('double-click', () => {
        mainWindow.show()
        mainWindow.focus()
    })
}

export function destroyTray(): void {
    if (tray) {
        tray.destroy()
        tray = null
    }
}
