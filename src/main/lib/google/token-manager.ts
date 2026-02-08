import { loadTokens, saveTokens } from './storage'
import { refreshAccessToken } from './oauth'
import { debug } from '../core/logger'
import { NotLoggedInError, TokenRefreshError } from '../core/errors'
import type { StoredTokens } from '../quota/types'

const EXPIRY_BUFFER_MS = 5 * 60 * 1000

export class TokenManager {
    private tokens: StoredTokens | null = null

    constructor() {
        this.tokens = loadTokens()
    }

    isLoggedIn(): boolean {
        return this.tokens !== null
    }

    getEmail(): string | undefined {
        return this.tokens?.email
    }

    getTokens(): StoredTokens | null {
        return this.tokens
    }

    getProjectId(): string | undefined {
        return this.tokens?.projectId
    }

    setProjectId(projectId: string): void {
        if (!this.tokens) return
        this.tokens.projectId = projectId
        saveTokens(this.tokens)
        debug('token-manager', `Project ID saved: ${projectId}`)
    }

    private isTokenExpired(): boolean {
        if (!this.tokens) return true
        return Date.now() >= this.tokens.expiresAt - EXPIRY_BUFFER_MS
    }

    async getValidAccessToken(): Promise<string> {
        if (!this.tokens) {
            throw new NotLoggedInError()
        }

        if (this.isTokenExpired()) {
            debug('token-manager', 'Token expired or expiring soon, refreshing...')
            await this.refreshToken()
        }

        return this.tokens.accessToken
    }

    async refreshToken(): Promise<void> {
        if (!this.tokens?.refreshToken) {
            throw new NotLoggedInError('No refresh token available')
        }

        try {
            const response = await refreshAccessToken(this.tokens.refreshToken)

            this.tokens = {
                accessToken: response.access_token,
                refreshToken: response.refresh_token || this.tokens.refreshToken,
                expiresAt: Date.now() + response.expires_in * 1000,
                email: this.tokens.email,
                projectId: this.tokens.projectId
            }

            saveTokens(this.tokens)
            debug('token-manager', 'Token refreshed successfully')
        } catch (err) {
            debug('token-manager', 'Token refresh failed', err)
            throw new TokenRefreshError('Failed to refresh token', { cause: err as Error })
        }
    }

    reload(): void {
        this.tokens = loadTokens()
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
