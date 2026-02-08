import { request } from 'https'
import { request as httpRequest } from 'http'
import { debug } from '../core/logger'

export interface ProbeResult {
    baseUrl: string
    protocol: 'https' | 'http'
    port: number
}

async function probePort(port: number, timeout = 500): Promise<ProbeResult | null> {
    const httpsResult = await probeHttps(port, timeout)
    if (httpsResult) return httpsResult

    const httpResult = await probeHttp(port, timeout)
    if (httpResult) return httpResult

    return null
}

function probeHttps(port: number, timeout: number): Promise<ProbeResult | null> {
    return new Promise((resolve) => {
        const options = {
            hostname: '127.0.0.1',
            port,
            path: '/exa.language_server_pb.LanguageServerService/GetUnleashData',
            method: 'POST',
            timeout,
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Connect-Protocol-Version': '1'
            }
        }

        const req = request(options, (res) => {
            if (res.statusCode === 200) {
                resolve({
                    baseUrl: `https://127.0.0.1:${port}`,
                    protocol: 'https',
                    port
                })
            } else {
                resolve(null)
            }
            res.resume()
        })

        req.on('error', () => resolve(null))
        req.on('timeout', () => {
            req.destroy()
            resolve(null)
        })

        req.write(JSON.stringify({ wrapper_data: {} }))
        req.end()
    })
}

function probeHttp(port: number, timeout: number): Promise<ProbeResult | null> {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port,
            path: '/',
            method: 'GET',
            timeout
        }

        const req = httpRequest(options, (res) => {
            resolve({
                baseUrl: `http://localhost:${port}`,
                protocol: 'http',
                port
            })
            res.resume()
        })

        req.on('error', () => resolve(null))
        req.on('timeout', () => {
            req.destroy()
            resolve(null)
        })

        req.end()
    })
}

export async function probeForConnectAPI(ports: number[] = [3000, 8080, 443], timeout = 500): Promise<ProbeResult | null> {
    debug('port-prober', `Probing ${ports.length} ports`)

    // Common ports to check + range
    const targetPorts = [...ports]

    // Add common range if not enough ports
    if (targetPorts.length < 5) {
        for (let i = 10000; i < 10010; i++) targetPorts.push(i)
    }

    const results = await Promise.allSettled(targetPorts.map(p => probePort(p, timeout)))

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            debug('port-prober', `Found working endpoint: ${result.value.baseUrl}`)
            return result.value
        }
    }

    return null
}
