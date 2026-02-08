export class APIError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message)
        this.name = 'APIError'
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AuthenticationError'
    }
}

export class NetworkError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'NetworkError'
    }
}

export class RateLimitError extends Error {
    constructor(message: string, public retryAfterMs?: number) {
        super(message)
        this.name = 'RateLimitError'
    }
}

export class NotLoggedInError extends Error {
    constructor(message: string = 'Not logged in') {
        super(message)
        this.name = 'NotLoggedInError'
    }
}

export class TokenRefreshError extends Error {
    constructor(message: string, public options?: { cause?: Error; isRetryable?: boolean }) {
        super(message)
        this.name = 'TokenRefreshError'
        this.cause = options?.cause
    }
}
