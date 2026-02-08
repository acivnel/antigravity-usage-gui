import { loadStorage, saveStorage } from './storage'
import { refreshAccessToken } from './oauth'
import { debug } from '../core/logger'
import { NotLoggedInError, TokenRefreshError } from '../core/errors'
import type { StoredTokens, StorageSchema, AccountInfo } from '../quota/types'

const EXPIRY_BUFFER_MS = 5 * 60 * 1000

export class TokenManager {
    private storage: StorageSchema

    constructor() {
        this.storage = loadStorage()
    }

    isLoggedIn(): boolean {
        return !!this.storage.currentEmail && !!this.storage.accounts[this.storage.currentEmail]
    }

    getEmail(): string | undefined {
        return this.storage.currentEmail || undefined
    }

    getAccounts(): AccountInfo[] {
        return Object.values(this.storage.accounts).map(token => ({
            email: token.email || 'unknown',
            isActive: token.email === this.storage.currentEmail,
            projectId: token.projectId
        }))
    }

    async switchAccount(email: string): Promise<boolean> {
        if (this.storage.accounts[email]) {
            this.storage.currentEmail = email
            saveStorage(this.storage)
            debug('token-manager', `Switched to account ${email}`)
            return true
        }
        return false
    }

    async removeAccount(email: string): Promise<void> {
        if (this.storage.accounts[email]) {
            delete this.storage.accounts[email]
            if (this.storage.currentEmail === email) {
                const remaining = Object.keys(this.storage.accounts)
                this.storage.currentEmail = remaining.length > 0 ? remaining[0] : null
            }
            saveStorage(this.storage)
            debug('token-manager', `Removed account ${email}`)
        }
    }

    getTokens(): StoredTokens | null {
        if (!this.storage.currentEmail) return null
        return this.storage.accounts[this.storage.currentEmail] || null
    }

    // Called after successful login
    setTokens(tokens: StoredTokens): void {
        if (!tokens.email) {
            debug('token-manager', 'Cannot save tokens without email')
            return
        }
        this.storage.accounts[tokens.email] = tokens
        this.storage.currentEmail = tokens.email
        saveStorage(this.storage)
    }

    getProjectId(): string | undefined {
        return this.getTokens()?.projectId
    }

    setProjectId(projectId: string): void {
        const tokens = this.getTokens()
        if (!tokens) return

        tokens.projectId = projectId
        this.storage.accounts[tokens.email!] = tokens // Update in storage
        saveStorage(this.storage)
        debug('token-manager', `Project ID saved: ${projectId}`)
    }

    private isTokenExpired(tokens: StoredTokens): boolean {
        return Date.now() >= tokens.expiresAt - EXPIRY_BUFFER_MS
    }

    async getValidAccessToken(): Promise<string> {
        const tokens = this.getTokens()
        if (!tokens) {
            throw new NotLoggedInError()
        }

        if (this.isTokenExpired(tokens)) {
            debug('token-manager', 'Token expired or expiring soon, refreshing...')
            await this.refreshToken()
            return this.getTokens()!.accessToken
        }

        return tokens.accessToken
    }

    async refreshToken(): Promise<void> {
        const tokens = this.getTokens()
        if (!tokens || !tokens.refreshToken) {
            throw new NotLoggedInError('No refresh token available')
        }

        try {
            const response = await refreshAccessToken(tokens.refreshToken)

            const newTokens: StoredTokens = {
                accessToken: response.access_token,
                refreshToken: response.refresh_token || tokens.refreshToken,
                expiresAt: Date.now() + response.expires_in * 1000,
                email: tokens.email,
                projectId: tokens.projectId
            }

            this.setTokens(newTokens)
            debug('token-manager', 'Token refreshed successfully')
        } catch (err) {
            debug('token-manager', 'Token refresh failed', err)
            throw new TokenRefreshError('Failed to refresh token', { cause: err as Error })
        }
    }

    reload(): void {
        this.storage = loadStorage()
    }
}

// Singleton instance
let instance: TokenManager | null = null

export function getTokenManager(): TokenManager {
    if (!instance) {
        instance = new TokenManager()
    }
    return instance
}
