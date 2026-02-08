import { createServer } from 'http'
import { shell } from 'electron'
import { URL, URLSearchParams } from 'url'
import { debug } from '../core/logger'
import { saveTokens } from './storage'
import type { OAuthTokenResponse, StoredTokens } from '../quota/types'

const OAUTH_CONFIG = {
    clientId: process.env.ANTIGRAVITY_OAUTH_CLIENT_ID || '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com',
    clientSecret: process.env.ANTIGRAVITY_OAUTH_CLIENT_SECRET || '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',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}

async function getAvailablePort(): Promise<number> {
    return new Promise((resolve) => {
        const server = createServer()
        server.listen(0, '127.0.0.1', () => {
            const port = (server.address() as any).port
            server.close(() => resolve(port))
        })
    })
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
        code,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    })

    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })

    if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
    }

    return response.json() as Promise<OAuthTokenResponse>
}

async function getUserEmail(accessToken: string): Promise<string | undefined> {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (response.ok) {
            const data = await response.json() as { email?: string }
            return data.email
        }
    } catch (err) {
        debug('oauth', 'Failed to get user info', err)
    }
    return undefined
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        grant_type: 'refresh_token'
    })

    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })

    if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
    }

    return response.json() as Promise<OAuthTokenResponse>
}

export interface OAuthResult {
    success: boolean
    email?: string
    error?: string
}

export async function startOAuthFlow(): Promise<OAuthResult> {
    const port = await getAvailablePort()
    const redirectUri = `http://127.0.0.1:${port}/callback`
    const state = Math.random().toString(36).substring(7)

    debug('oauth', `Starting OAuth flow on port ${port}`)

    const authParams = new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state
    })

    const authUrl = `${OAUTH_CONFIG.authUrl}?${authParams.toString()}`

    return new Promise((resolve) => {
        let resolved = false

        const server = createServer(async (req, res) => {
            if (resolved) return

            const url = new URL(req.url || '/', `http://127.0.0.1:${port}`)

            if (url.pathname === '/callback') {
                const code = url.searchParams.get('code')
                const returnedState = url.searchParams.get('state')

                if (!code || returnedState !== state) {
                    res.writeHead(400)
                    res.end('Invalid request')
                    resolved = true
                    server.close()
                    resolve({ success: false, error: 'Invalid callback' })
                    return
                }

                try {
                    const tokens = await exchangeCodeForTokens(code, redirectUri)
                    const email = await getUserEmail(tokens.access_token)

                    const storedTokens: StoredTokens = {
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token || '',
                        expiresAt: Date.now() + tokens.expires_in * 1000,
                        email
                    }

                    saveTokens(storedTokens)

                    res.writeHead(200, { 'Content-Type': 'text/html' })
                    res.end('<h1>Login Successful!</h1><p>You can close this window.</p>')

                    resolved = true
                    server.close()
                    resolve({ success: true, email })

                } catch (err) {
                    res.writeHead(500)
                    res.end('Login failed')
                    resolved = true
                    server.close()
                    resolve({ success: false, error: err instanceof Error ? err.message : 'Unknown error' })
                }
            }
        })

        server.listen(port, '127.0.0.1', () => {
            shell.openExternal(authUrl)
        })
    })
}
