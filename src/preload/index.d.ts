import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            login: () => Promise<{ success: boolean; email?: string; error?: string }>
            checkAuth: () => Promise<boolean>
            getQuota: () => Promise<any[] & { source?: string }>
            getAccounts: () => Promise<Array<{ email: string; isActive: boolean; projectId?: string }>>
            switchAccount: (email: string) => Promise<boolean>
            removeAccount: (email: string) => Promise<void>
            addAccount: () => Promise<{ success: boolean; email?: string; error?: string }>
            logout: () => Promise<boolean>
            checkForUpdates: () => Promise<void>
            quitAndInstall: () => Promise<void>
            onUpdateStatus: (callback: (data: any) => void) => () => void
            getVersion: () => Promise<string>
            windowMinimize: () => Promise<void>
            windowMaximize: () => Promise<void>
            windowClose: () => Promise<void>
        }
    }
}
