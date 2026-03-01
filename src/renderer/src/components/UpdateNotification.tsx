import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MdSystemUpdateAlt, MdClose, MdCheckCircle, MdError, MdDownload } from 'react-icons/md'
import { Button } from './ui'

export function UpdateNotification(): JSX.Element | null {
    const { t } = useTranslation()
    const [status, setStatus] = useState<string>('')
    const [progress, setProgress] = useState<number>(0)
    const [version, setVersion] = useState<string>('')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const removeListener = window.api.onUpdateStatus((data: any) => {
            if (data.status === 'available') {
                setStatus('available')
                setVersion(data.version)
                setIsVisible(true)
            } else if (data.status === 'downloading') {
                setStatus('downloading')
                setProgress(Math.round(data.progress))
                setIsVisible(true)
            } else if (data.status === 'downloaded') {
                setStatus('downloaded')
                setVersion(data.version)
                setIsVisible(true)
            } else if (data.status === 'error') {
                setStatus('error')
                setIsVisible(true)
                setTimeout(() => setIsVisible(false), 5000)
            } else if (data.status === 'not-available') {
                setIsVisible(false)
            }
        })

        window.api.checkForUpdates()

        return () => {
            removeListener()
        }
    }, [])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    className="fixed bottom-3 right-3 left-3 md:left-auto md:w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl p-3 z-50"
                >
                    <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0">
                            {status === 'downloading' ? <MdDownload className="text-base animate-bounce" /> :
                                status === 'downloaded' ? <MdCheckCircle className="text-base text-green-500" /> :
                                    status === 'error' ? <MdError className="text-base text-red-500" /> :
                                        <MdSystemUpdateAlt className="text-base" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-xs text-neutral-900 dark:text-white">
                                {status === 'available' && t('update.available', { version })}
                                {status === 'downloading' && t('update.downloading', { progress })}
                                {status === 'downloaded' && t('update.downloaded', { version })}
                                {status === 'error' && t('update.failed')}
                            </h3>

                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {status === 'available' && t('update.downloadingHint')}
                                {status === 'downloading' && (
                                    <span className="block w-full bg-neutral-100 dark:bg-neutral-800 h-1 rounded-full mt-1.5 overflow-hidden">
                                        <span
                                            className="block bg-indigo-500 h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </span>
                                )}
                                {status === 'downloaded' && t('update.downloadedHint')}
                            </p>

                            {status === 'downloaded' && (
                                <div className="mt-2 flex gap-2">
                                    <Button onClick={() => window.api.quitAndInstall()} className="text-[11px] py-1 px-2.5">
                                        {t('update.restart')}
                                    </Button>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 px-1.5"
                                    >
                                        {t('update.later')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            <MdClose className="text-sm" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
