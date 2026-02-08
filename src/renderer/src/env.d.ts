/// <reference types="vite/client" />

interface Window {
    electron: {
        ipcRenderer: {
            send(channel: string, ...args: any[]): void
            on(channel: string, listener: (event: any, ...args: any[]) => void): void
            once(channel: string, listener: (event: any, ...args: any[]) => void): void
            invoke(channel: string, ...args: any[]): Promise<any>
        }
    }
    api: {
        login: () => Promise<{ success: boolean; error?: string }>
        checkAuth: () => Promise<boolean>
        getQuota: () => Promise<any[] & { source?: string }>
        getAccounts: () => Promise<Array<{ email: string; isActive: boolean; projectId?: string }>>
        switchAccount: (email: string) => Promise<boolean>
        removeAccount: (email: string) => Promise<void>
        addAccount: () => Promise<{ success: boolean; error?: string }>
        logout: () => Promise<boolean>
        checkForUpdates: () => Promise<void>
        quitAndInstall: () => Promise<void>
    }
}
