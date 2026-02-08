export interface StoredTokens {
    accessToken: string
    refreshToken: string
    expiresAt: number
    email?: string
    projectId?: string
}

export interface OAuthTokenResponse {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope: string
    token_type: string
}

export type QuotaSource = 'cloud' | 'local'

export interface AccountInfo {
    email: string
    isActive: boolean
    projectId?: string
}

export interface StorageSchema {
    currentEmail: string | null
    accounts: Record<string, StoredTokens>
}
