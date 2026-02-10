import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdSystemUpdateAlt, MdClose, MdCheckCircle, MdError, MdDownload } from 'react-icons/md'
import { Button } from './ui'

export function UpdateNotification(): JSX.Element | null {
    const [status, setStatus] = useState<string>('')
    const [progress, setProgress] = useState<number>(0)
    const [version, setVersion] = useState<string>('')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Listen for update status
        const removeListener = window.api.onUpdateStatus((data: any) => {
            console.log('Update status:', data)

            if (data.status === 'checking') {
                // Optional: show checking status, mostly silent
            }
            else if (data.status === 'available') {
                setStatus('available')
                setVersion(data.version)
                setIsVisible(true)
            }
            else if (data.status === 'downloading') {
                setStatus('downloading')
                setProgress(Math.round(data.progress))
                setIsVisible(true)
            }
            else if (data.status === 'downloaded') {
                setStatus('downloaded')
                setVersion(data.version)
                setIsVisible(true)
            }
            else if (data.status === 'error') {
                setStatus('error')
                setIsVisible(true)
                // Auto hide error after 5s
                setTimeout(() => setIsVisible(false), 5000)
            }
            else if (data.status === 'not-available') {
                // Hide if explicitly valid "no update"
                setIsVisible(false)
            }
        })

        // Initial check
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
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl p-4 z-50"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0">
                            {status === 'downloading' ? <MdDownload className="animate-bounce" /> :
                                status === 'downloaded' ? <MdCheckCircle className="text-green-500" /> :
                                    status === 'error' ? <MdError className="text-red-500" /> :
                                        <MdSystemUpdateAlt />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-neutral-900 dark:text-white">
                                {status === 'available' && `Update Available: ${version}`}
                                {status === 'downloading' && `Downloading Update... ${progress}%`}
                                {status === 'downloaded' && `Ready to Install: ${version}`}
                                {status === 'error' && `Update Failed`}
                            </h3>

                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {status === 'available' && "A new version is being downloaded in the background."}
                                {status === 'downloading' && (
                                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                                {status === 'downloaded' && "Restart the app to apply the update."}
                                {status === 'error' && "Something went wrong. Please try again later."}
                            </p>

                            {status === 'downloaded' && (
                                <div className="mt-3 flex gap-2">
                                    <Button onClick={() => window.api.quitAndInstall()} className="text-xs py-1 px-3">
                                        Restart & Install
                                    </Button>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 px-2"
                                    >
                                        Later
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                            <MdClose />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
