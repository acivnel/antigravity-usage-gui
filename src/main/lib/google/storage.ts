import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { dirname } from 'path'
import { getTokensPath } from '../core/env'
import { debug } from '../core/logger'
import type { StoredTokens, StorageSchema } from '../quota/types'

// Migration helper
function migrateTokens(data: any): StorageSchema {
    // If it's already the new schema
    if (data.accounts && typeof data.accounts === 'object') {
        return data as StorageSchema
    }

    // Migration from single account (old format)
    const oldTokens = data as StoredTokens
    // If it has accessToken, it's likely the old format
    if (oldTokens.accessToken) {
        const schema: StorageSchema = {
            currentEmail: oldTokens.email || null,
            accounts: {}
        }

        if (oldTokens.email) {
            schema.accounts[oldTokens.email] = oldTokens
        } else {
            // Fallback if no email in old token, use a placeholder or try to fetch it later
            // For now, we might skip it or use 'unknown'
            // But realistically, email should be there if login succeeded
        }
        return schema
    }

    return { currentEmail: null, accounts: {} }
}

export function saveStorage(storage: StorageSchema): void {
    const path = getTokensPath()
    const dir = dirname(path)

    debug('storage', `Saving storage to ${path}`)

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }

    writeFileSync(path, JSON.stringify(storage, null, 2), { mode: 0o600 })
}

export function loadStorage(): StorageSchema {
    const path = getTokensPath()

    debug('storage', `Loading tokens from ${path}`)

    if (!existsSync(path)) {
        debug('storage', 'No tokens file found')
        return { currentEmail: null, accounts: {} }
    }

    try {
        const content = readFileSync(path, 'utf-8')
        const data = JSON.parse(content)
        return migrateTokens(data)
    } catch (err) {
        debug('storage', 'Failed to parse tokens file', err)
        return { currentEmail: null, accounts: {} }
    }
}

// Deprecated: used for migration or direct single-token access compatibility if needed
// but we should move to using loadStorage everywhere
export function saveTokens(tokens: StoredTokens): void {
    const storage = loadStorage()
    if (tokens.email) {
        storage.accounts[tokens.email] = tokens
        storage.currentEmail = tokens.email
        saveStorage(storage)
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
