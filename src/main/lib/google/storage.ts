import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { dirname } from 'path'
import { getTokensPath } from '../core/env'
import { debug } from '../core/logger'
import type { StoredTokens } from '../quota/types'

// Simple storage implementation for now - single account support first
// We can expand to multi-account later if needed

export function saveTokens(tokens: StoredTokens): void {
    const path = getTokensPath()
    const dir = dirname(path)

    debug('storage', `Saving tokens to ${path}`)

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }

    writeFileSync(path, JSON.stringify(tokens, null, 2), { mode: 0o600 })
}

export function loadTokens(): StoredTokens | null {
    const path = getTokensPath()

    debug('storage', `Loading tokens from ${path}`)

    if (!existsSync(path)) {
        debug('storage', 'No tokens file found')
        return null
    }

    try {
        const content = readFileSync(path, 'utf-8')
        return JSON.parse(content) as StoredTokens
    } catch (err) {
        debug('storage', 'Failed to parse tokens file', err)
        return null
    }
}

export function deleteTokens(): boolean {
    const path = getTokensPath()

    debug('storage', `Deleting tokens at ${path}`)

    if (!existsSync(path)) {
        return false
    }

    try {
        unlinkSync(path)
        return true
    } catch (err) {
        debug('storage', 'Failed to delete tokens', err)
        return false
    }
}

export function hasTokens(): boolean {
    return existsSync(getTokensPath())
}
