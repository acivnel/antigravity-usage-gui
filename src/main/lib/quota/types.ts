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
