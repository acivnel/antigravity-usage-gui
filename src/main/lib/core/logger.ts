import { app } from 'electron'
import { join } from 'path'
import { appendFileSync, existsSync, mkdirSync } from 'fs'

const LOG_DIR = app.getPath('logs')
const LOG_FILE = join(LOG_DIR, 'antigravity-usage.log')

if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true })
}

export function debug(category: string, message: string, ...args: any[]): void {
    log('DEBUG', category, message, ...args)
}

export function info(message: string, ...args: any[]): void {
    log('INFO', 'system', message, ...args)
}

export function error(message: string | Error, ...args: any[]): void {
    const msg = message instanceof Error ? message.message : message
    log('ERROR', 'system', msg, ...args)
    if (message instanceof Error && message.stack) {
        log('ERROR', 'system', message.stack)
    }
}

function log(level: string, category: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString()
    const formattedArgs = args.length ? ` ${JSON.stringify(args)}` : ''
    const logMessage = `[${timestamp}] [${level}] [${category}] ${message}${formattedArgs}\n`

    // Console output
    console.log(logMessage.trim())

    // File output
    try {
        appendFileSync(LOG_FILE, logMessage)
    } catch (err) {
        console.error('Failed to write to log file:', err)
    }
}
