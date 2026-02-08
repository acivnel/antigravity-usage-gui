import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdDarkMode, MdLightMode, MdUpdate, MdLanguage } from 'react-icons/md'
import { Button } from './ui'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'


export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [updateStatus, setUpdateStatus] = useState<string>('')

    const checkForUpdates = async () => {
        setUpdateStatus(t('app.loading'))
        try {
            await window.api.checkForUpdates()
            // Status will come via IPC update-status, handled in App.tsx typically
            // but we can set a temporary message
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
                    className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-900 dark:text-white"
                >
                    <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                        <h2 className="text-xl font-bold">Настройки / Settings</h2>
                        <button onClick={onClose} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <MdClose className="text-xl text-neutral-500 dark:text-neutral-400" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    {theme === 'dark' ? <MdDarkMode className="text-xl text-indigo-500 dark:text-indigo-400" /> : <MdLightMode className="text-xl text-indigo-500 dark:text-indigo-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{theme === 'dark' ? 'Темная тема' : 'Светлая тема'}</p>
                                    <p className="text-xs text-neutral-500">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-neutral-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <MdLanguage className="text-xl text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Язык приложения</p>
                                    <p className="text-xs text-neutral-500">Current: {i18n.language.toUpperCase()}</p>
                                </div>
                            </div>
                            <Button variant="secondary" onClick={toggleLanguage} className="text-xs">
                                {i18n.language.startsWith('ru') ? 'English' : 'Русский'}
                            </Button>
                        </div>

                        {/* Update Check */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <MdUpdate className="text-xl text-orange-500 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Обновления</p>
                                    <p className="text-xs text-neutral-500">GitHub Releases</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Button variant="secondary" onClick={checkForUpdates} className="text-xs flex items-center gap-2">
                                    <MdUpdate />
                                    Проверить
                                </Button>
                                {updateStatus && <p className="text-[10px] text-neutral-500 dark:text-neutral-400 animate-pulse">{updateStatus}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-neutral-100/50 dark:bg-neutral-800/30 text-center">
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-widest font-bold">
                            Antigravity Usage GUI v1.0.0
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
