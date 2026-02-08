import { CloudCodeClient } from '../google/cloudcode'
import { getTokenManager } from '../google/token-manager'
import { probeForConnectAPI } from '../local/port-prober'
import { ConnectClient } from '../local/connect-client'
import { debug } from '../core/logger'

export interface QuotaInfo {
    model: string
    displayName: string
    remaining: number
    resetTime: string
    isExhausted: boolean
    limit: number
}

// Common ports Antigravity might use
const COMMON_PORTS = [
    ...Array.from({ length: 10 }, (_, i) => 10000 + i), // 10000-10009
    ...Array.from({ length: 10 }, (_, i) => 20000 + i)  // 20000-20009
]

async function fetchLocalQuota(): Promise<QuotaInfo[] | null> {
    try {
        const probe = await probeForConnectAPI(COMMON_PORTS)
        if (!probe) return null

        const client = new ConnectClient(probe.baseUrl)
        const status = await client.getUserStatus()

        if (!status.quota?.models) return null

        return status.quota.models.map((m: any) => ({
            model: m.modelOrAlias?.model || m.modelId,
            displayName: m.label || m.displayName,
            remaining: (m.quotaInfo?.remainingFraction || 0) * 100,
            resetTime: m.quotaInfo?.resetTime,
            isExhausted: m.isExhausted || false,
            limit: 100
        }))
    } catch (err) {
        debug('quota', 'Failed to fetch local quota', err)
        return null
    }
}

export async function fetchQuota(): Promise<QuotaInfo[] & { source?: string }> {
    debug('quota', 'Fetching quota...')

    // Try local first
    const localQuota = await fetchLocalQuota()
    if (localQuota) {
        debug('quota', 'Using local quota from IDE')
        const result = localQuota as QuotaInfo[] & { source: string }
        result.source = 'local'
        return result
    }

    // Fallback to cloud
    debug('quota', 'Local quota unavailable, falling back to cloud API')

    const tokenManager = getTokenManager()

    if (!tokenManager.isLoggedIn()) {
        throw new Error('Not logged in')
    }

    const client = new CloudCodeClient(tokenManager)
    await client.resolveProjectId()

    const response = await client.fetchAvailableModels()
    const models = response.models || {}

    const quotas: QuotaInfo[] = []

    for (const [key, info] of Object.entries(models)) {
        const modelInfo = info as any
        const quota = modelInfo.quotaInfo

        if (quota) {
            quotas.push({
                model: modelInfo.model || key,
                displayName: modelInfo.displayName || key,
                remaining: (quota.remainingFraction || 0) * 100,
                resetTime: quota.resetTime,
                isExhausted: quota.isExhausted || false,
                limit: 100
            })
        }
    }

    const result = quotas as QuotaInfo[] & { source: string }
    result.source = 'cloud'
    return result
}
