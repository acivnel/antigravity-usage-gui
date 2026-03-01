import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, Button, Card } from './components/ui'
import { QuotaCard } from './components/QuotaCard'
import { AccountSwitcher } from './components/AccountSwitcher'
import { SettingsModal } from './components/SettingsModal'
import { UpdateNotification } from './components/UpdateNotification'
import { MdSettings, MdCloudQueue, MdLaptop } from 'react-icons/md'

// Models matching the user's actual usage
const KNOWN_MODELS = [
    'Gemini 3.1 Pro (High)',
    'Gemini 3.1 Pro (Low)',
    'Gemini 3 Flash',
    'Claude Sonnet 4.6 (Thinking)',
    'Claude Opus 4.6 (Thinking)',
    'GPT-OSS 120B (Medium)',
]

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

interface Account {
    email: string
    isActive: boolean
    projectId?: string
}

function App(): JSX.Element {
    const { t } = useTranslation()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [quotas, setQuotas] = useState<any[]>([])
    const [quotaSource, setQuotaSource] = useState<'cloud' | 'local' | null>(null)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        checkStatus()
    }, [])

    async function checkStatus() {
        try {
            setLoading(true)
            const loggedIn = await window.api.checkAuth()
            setIsLoggedIn(loggedIn)

            if (loggedIn) {
                const accs = await window.api.getAccounts()
                setAccounts(accs)
            } else {
                setAccounts([])
            }

            const data = await window.api.getQuota()
            if (data && data.length > 0) {
                setQuotaSource(data.source as any || 'cloud')

                const filtered = data.filter(model => {
                    const id = normalize(model.model)
                    const name = normalize(model.displayName || '')
                    return KNOWN_MODELS.some(k => {
                        const normalizedK = normalize(k)
                        return id.includes(normalizedK) || name.includes(normalizedK) || normalizedK.includes(id) || normalizedK.includes(name)
                    })
                })

                const finalData = filtered.length > 0 ? filtered : data
                const sorted = finalData.sort((a, b) => a.remaining - b.remaining)
                setQuotas(sorted)
            } else {
                setQuotas([])
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

    async function handleAddAccount() {
        setLoading(true)
        try {
            const res = await window.api.addAccount()
            if (res.success) {
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

    async function handleSwitchAccount(email: string) {
        setLoading(true)
        try {
            await window.api.switchAccount(email)
            await checkStatus()
        } catch (err) {
            setError(t('app.error'))
            setLoading(false)
        }
    }

    async function handleRemoveAccount(email: string) {
        setLoading(true)
        try {
            await window.api.removeAccount(email)
            await checkStatus()
        } catch (err) {
            setError(t('app.error'))
            setLoading(false)
        }
    }

    return (
        <Layout>
            <header className="flex justify-between items-center mb-4 pt-2 shrink-0 z-10">
                <div>
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        {t('app.title')}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">{t('app.subtitle')}</p>
                        {quotaSource && (
                            <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border ${quotaSource === 'local'
                                ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                }`}>
                                {quotaSource === 'local' ? <MdLaptop className="text-[10px]" /> : <MdCloudQueue className="text-[10px]" />}
                                <span>{t(`app.source.${quotaSource}`)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isLoggedIn && accounts.length > 0 && (
                        <AccountSwitcher
                            accounts={accounts}
                            onSwitch={handleSwitchAccount}
                            onAdd={handleAddAccount}
                            onRemove={handleRemoveAccount}
                        />
                    )}

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400"
                    >
                        <MdSettings className="text-lg" />
                    </button>
                    {!isLoggedIn && (
                        <Button onClick={handleLogin} className="text-[11px] px-2.5 py-1">{t('app.login')}</Button>
                    )}
                </div>
            </header>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-lg mb-4 text-xs shrink-0"
                >
                    {error}
                </motion.div>
            )}

            {!isLoggedIn && quotas.length === 0 && !loading && (
                <Card className="text-center py-8 shrink-0">
                    <h2 className="text-lg font-semibold mb-1.5 dark:text-white">{t('app.welcome.title')}</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto text-xs">
                        {t('app.welcome.subtitle')}
                    </p>
                    <Button onClick={handleLogin}>{t('app.welcome.connect')}</Button>
                </Card>
            )}

            {loading && !quotas.length ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                    <p className="text-neutral-500 text-xs">{t('app.loading')}</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1 custom-scrollbar">
                    <div className="flex flex-col gap-1.5 pb-4">
                        <AnimatePresence>
                            {quotas.map((model, index) => (
                                <motion.div
                                    key={model.model}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.04 }}
                                >
                                    <QuotaCard model={model} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {quotas.length > 0 && (
                <div className="mt-1 flex justify-center shrink-0 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <Button variant="secondary" onClick={checkStatus} className="text-[11px]">
                        {t('app.refresh')}
                    </Button>
                </div>
            )}

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <UpdateNotification />
        </Layout>
    )
}

export default App
