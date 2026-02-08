import { request as httpsRequest } from 'https'
import { request as httpRequest } from 'http'
import { URL } from 'url'
import { debug } from '../core/logger'

export interface ConnectUserStatus {
    isAuthenticated?: boolean
    email?: string
    quota?: {
        promptCredits?: {
            used?: number
            limit?: number
            remaining?: number
        }
        models?: Array<any>
    }
}

export class ConnectClient {
    private isHttps: boolean

    constructor(private baseUrl: string) {
        this.isHttps = baseUrl.startsWith('https://')
    }

    async getUserStatus(): Promise<ConnectUserStatus> {
        const endpoint = '/exa.language_server_pb.LanguageServerService/GetUserStatus'

        try {
            const response = await this.request('POST', endpoint, {
                metadata: {
                    ideName: 'antigravity',
                    extensionName: 'antigravity',
                    locale: 'en'
                }
            })

            return this.parseUserStatus(response)
        } catch (err) {
            debug('connect-client', `Connect RPC call failed: ${err}`)
            throw err
        }
    }

    private request(method: string, path: string, body?: unknown): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl)

            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Connect-Protocol-Version': '1'
                },
                timeout: 5000,
                rejectUnauthorized: false
            }

            const protocol = this.isHttps ? httpsRequest : httpRequest

            const req = protocol(options, (res) => {
                let data = ''

                res.on('data', chunk => data += chunk)

                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data))
                        } catch {
                            resolve(data)
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`))
                    }
                })
            })

            req.on('error', reject)
            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request timed out'))
            })

            if (body) {
                req.write(JSON.stringify(body))
            }

            req.end()
        })
    }

    private parseUserStatus(response: any): ConnectUserStatus {
        const status: ConnectUserStatus = {}
        const data = response.userStatus || response

        if (data.email) status.email = data.email
        if (data.isAuthenticated) status.isAuthenticated = data.isAuthenticated

        // Quick quota extraction
        status.quota = {}

        if (data.planStatus?.planInfo?.monthlyPromptCredits) {
            status.quota.promptCredits = {
                limit: data.planStatus.planInfo.monthlyPromptCredits,
                remaining: data.planStatus.availablePromptCredits,
                used: data.planStatus.planInfo.monthlyPromptCredits - data.planStatus.availablePromptCredits
            }
        }

        if (data.cascadeModelConfigData?.clientModelConfigs) {
            status.quota.models = data.cascadeModelConfigData.clientModelConfigs
        }

        return status
    }
}
