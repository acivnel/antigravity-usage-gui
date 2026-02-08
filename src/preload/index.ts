import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    login: () => ipcRenderer.invoke('login'),
    checkAuth: () => ipcRenderer.invoke('check-auth'),
    getQuota: () => ipcRenderer.invoke('get-quota'),
    logout: () => ipcRenderer.invoke('logout')
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
