import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdDarkMode, MdLightMode, MdUpdate, MdLanguage, MdCheck } from 'react-icons/md'
import { Button } from './ui'
import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'


export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [updateStatus, setUpdateStatus] = useState<string>('')
    const [version, setVersion] = useState<string>('')
    const [latestVersion, setLatestVersion] = useState<string>('')

    useEffect(() => {
        window.api.getVersion().then(setVersion)
        fetch('https://api.github.com/repos/acivnel/antigravity-usage-gui/releases/latest')
            .then(res => res.json())
            .then(data => {
                if (data.tag_name) {
                    setLatestVersion(data.tag_name.replace(/^v/, ''))
                }
            })
            .catch(() => { })
    }, [])

    const checkForUpdates = async () => {
        setUpdateStatus(t('app.loading'))
        try {
            await window.api.checkForUpdates()
            setTimeout(() => setUpdateStatus(''), 3000)
        } catch (err) {
            setUpdateStatus(t('app.error'))
        }
    }

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('ru') ? 'en' : 'ru'
        i18n.changeLanguage(newLang)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-900 dark:text-white flex flex-col"
                >
                    <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                        <h2 className="text-lg font-bold">{t('settings.title')}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <MdClose className="text-lg text-neutral-500 dark:text-neutral-400" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4 flex-1">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                    {theme === 'dark' ? <MdDarkMode className="text-lg text-indigo-500 dark:text-indigo-400" /> : <MdLightMode className="text-lg text-indigo-500 dark:text-indigo-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('settings.theme')}</p>
                                    <p className="text-[11px] text-neutral-500">{theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-neutral-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                    <MdLanguage className="text-lg text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('settings.language')}</p>
                                    <p className="text-[11px] text-neutral-500">{i18n.language.toUpperCase()}</p>
                                </div>
                            </div>
                            <Button variant="secondary" onClick={toggleLanguage} className="text-xs px-2.5 py-1">
                                {i18n.language.startsWith('ru') ? 'English' : 'Русский'}
                            </Button>
                        </div>

                        {/* Update Check */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                    <MdUpdate className="text-lg text-orange-500 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t('settings.updates')}</p>
                                    <p className="text-[11px] text-neutral-500">GitHub Releases</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Button variant="secondary" onClick={checkForUpdates} className="text-xs px-2.5 py-1 flex items-center gap-1.5">
                                    <MdUpdate className="text-sm" />
                                    {t('settings.checkUpdate')}
                                </Button>
                                {updateStatus && <p className="text-[10px] text-neutral-500 dark:text-neutral-400 animate-pulse">{updateStatus}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3 bg-neutral-100/50 dark:bg-neutral-800/30 text-center flex flex-col items-center justify-center shrink-0">
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-widest font-bold flex items-center gap-1.5">
                            Antigravity Usage v{version}
                        </p>
                        {latestVersion && latestVersion !== version && (
                            <p className="text-[9px] text-orange-500 mt-1 flex items-center gap-1 font-medium bg-orange-500/10 px-1.5 py-0.5 rounded">
                                <MdUpdate /> Update v{latestVersion} available!
                            </p>
                        )}
                        {latestVersion && latestVersion === version && (
                            <p className="text-[9px] text-emerald-500 mt-1 flex items-center gap-1 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <MdCheck className="text-[10px]" /> You have the latest version
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
