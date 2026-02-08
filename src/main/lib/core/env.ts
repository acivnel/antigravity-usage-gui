import { app } from 'electron'
import { join } from 'path'

export function getConfigDir(): string {
    return app.getPath('userData')
}

export function getTokensPath(): string {
    return join(getConfigDir(), 'tokens.json')
}

export function getAccountDir(email: string): string {
    return join(getConfigDir(), 'accounts', Buffer.from(email).toString('base64').replace(/=/g, ''))
}
