import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, Button, Card } from './components/ui'
import { QuotaCard } from './components/QuotaCard'
import { LanguageSelector } from './components/LanguageSelector'

// Models to prioritize/show as requested
const KNOWN_MODELS = [
    'gemini-3-pro-high',
    'gemini-3-pro-low',
    'gemini-3-flash',
    'claude-3-5-sonnet',
    'claude-3-5-sonnet-thinking',
    'claude-3-opus-thinking',
    'gpt-4o',
    'gpt-oss-120b-medium'
]

// Helper to normalize model names for comparison
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function App(): JSX.Element {
    const { t } = useTranslation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [quotas, setQuotas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        checkStatus()
    }, [])

    async function checkStatus() {
        try {
            setLoading(true)
            const loggedIn = await window.api.checkAuth()
            setIsLoggedIn(loggedIn)

            const data = await window.api.getQuota()
            if (data && data.length > 0) {
                // Filter quotas to only show known models or prioritize them
                // User requested "output ONLY these models".
                const filtered = data.filter(model => {
                    const id = normalize(model.model)
                    const name = normalize(model.displayName || '')
                    return KNOWN_MODELS.some(k => id.includes(normalize(k)) || name.includes(normalize(k)))
                })

                // If filter removes everything (e.g. models have different internal names), fall back to all
                // But better to just show filtered if not empty, otherwise show all sorted
                const finalData = filtered.length > 0 ? filtered : data

                const sorted = finalData.sort((a, b) => {
                    // Sort by remaining percentage ascending
                    return a.remaining - b.remaining
                })

                setQuotas(sorted)
            } else if (loggedIn) {
                setError(t('app.error') || 'Failed to fetch quota data')
            }
        } catch (err) {
            console.error(err)
            setError(t('app.error'))
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin() {
        setLoading(true)
        setError('')
        try {
            const res = await window.api.login()
            if (res.success) {
                // Token is saved by main process, just check status
                await checkStatus()
            } else {
                setError(res.error || t('app.error'))
            }
        } catch (err) {
            setError(t('app.error'))
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        await window.api.logout()
        setQuotas([])
        setIsLoggedIn(false)
    }

    if (loading && !quotas.length) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                    <p className="text-neutral-500 text-sm">{t('app.loading')}</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <header className="flex justify-between items-center mb-6 shrink-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        {t('app.title')}
                    </h1>
                    <p className="text-neutral-400 text-xs mt-1">{t('app.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSelector />
                    {isLoggedIn || quotas.length > 0 ? (
                        <Button variant="secondary" onClick={handleLogout} className="text-xs px-3 py-1.5">{t('app.logout')}</Button>
                    ) : (
                        <Button onClick={handleLogin} className="text-xs px-3 py-1.5">{t('app.login')}</Button>
                    )}
                </div>
            </header>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 shrink-0"
                >
                    {error}
                </motion.div>
            )}

            {!isLoggedIn && quotas.length === 0 && !loading && (
                <Card className="text-center py-12 shrink-0">
                    <h2 className="text-xl font-semibold mb-2">{t('app.welcome.title')}</h2>
                    <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                        {t('app.welcome.subtitle')}
                    </p>
                    <Button onClick={handleLogin}>{t('app.welcome.connect')}</Button>
                </Card>
            )}

            {/* Scrollable Container with Padding for Scrollbar */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2 custom-scrollbar">
                <div className="grid gap-4 md:grid-cols-2 pb-6">
                    <AnimatePresence>
                        {quotas.map((model, index) => (
                            <motion.div
                                key={model.model}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <QuotaCard model={model} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {quotas.length > 0 && (
                <div className="mt-2 flex justify-center shrink-0 pt-3 border-t border-neutral-800">
                    <Button variant="secondary" onClick={checkStatus} className="text-xs">
                        {t('app.refresh')}
                    </Button>
                </div>
            )}
        </Layout>
    )
}

export default App
