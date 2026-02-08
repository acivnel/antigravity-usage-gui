import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            login: () => Promise<{ success: boolean; email?: string; error?: string }>
            checkAuth: () => Promise<boolean>
            getQuota: () => Promise<any[]>
            logout: () => Promise<boolean>
        }
    }
}
