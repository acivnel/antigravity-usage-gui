import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    login: () => ipcRenderer.invoke('login'),
    checkAuth: () => ipcRenderer.invoke('check-auth'),
    getQuota: () => ipcRenderer.invoke('get-quota'),
    getAccounts: () => ipcRenderer.invoke('get-accounts'),
    switchAccount: (email: string) => ipcRenderer.invoke('switch-account', email),
    removeAccount: (email: string) => ipcRenderer.invoke('remove-account', email),
    addAccount: () => ipcRenderer.invoke('add-account'),
    logout: () => ipcRenderer.invoke('logout'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, value) => callback(value))
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
