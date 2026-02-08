import { debug } from '../core/logger'
import { APIError, AuthenticationError, RateLimitError } from '../core/errors'
import type { TokenManager } from './token-manager'

const BASE_URL = 'https://cloudcode-pa.googleapis.com'
const USER_AGENT = 'antigravity'

const METADATA = {
    ideType: 'ANTIGRAVITY',
    platform: 'PLATFORM_UNSPECIFIED',
    pluginType: 'GEMINI'
}

export interface LoadCodeAssistResponse {
    cloudaicompanionProject?: string | { id?: string }
    paidTier?: { id?: string }
    currentTier?: { id?: string }
    allowedTiers?: Array<{ id?: string; isDefault?: boolean }>
}

export class CloudCodeClient {
    private projectId?: string

    constructor(private tokenManager: TokenManager) {
        this.projectId = tokenManager.getProjectId()
    }

    private async request<T>(endpoint: string, body?: unknown): Promise<T> {
        const token = await this.tokenManager.getValidAccessToken()
        const url = `${BASE_URL}${endpoint}`

        debug('cloudcode', `Calling ${endpoint}`)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT
            },
            body: body ? JSON.stringify(body) : undefined
        })

        if (response.status === 401 || response.status === 403) {
            throw new AuthenticationError('Authentication failed')
        }

        if (response.status === 429) {
            throw new RateLimitError('Rate limited')
        }

        if (!response.ok) {
            throw new APIError(`API request failed: ${response.status}`, response.status)
        }

        return response.json() as Promise<T>
    }

    async loadCodeAssist(): Promise<LoadCodeAssistResponse> {
        const response = await this.request<LoadCodeAssistResponse>('/v1internal:loadCodeAssist', {
            metadata: METADATA
        })

        let projectId: string | undefined
        if (response.cloudaicompanionProject) {
            if (typeof response.cloudaicompanionProject === 'string') {
                projectId = response.cloudaicompanionProject
            } else if (response.cloudaicompanionProject.id) {
                projectId = response.cloudaicompanionProject.id
            }
        }

        if (projectId) {
            this.projectId = projectId
            this.tokenManager.setProjectId(projectId)
        }

        return response
    }

    async resolveProjectId(): Promise<string | undefined> {
        if (this.projectId) return this.projectId

        await this.loadCodeAssist()
        return this.projectId
    }

    async fetchAvailableModels(): Promise<any> {
        const body = this.projectId ? { project: this.projectId } : {}
        return this.request('/v1internal:fetchAvailableModels', body)
    }
}
