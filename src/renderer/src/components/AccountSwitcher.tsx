import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdLogout, MdCheck, MdPerson } from 'react-icons/md'


interface Account {
    email: string
    isActive: boolean
    projectId?: string
}

interface AccountSwitcherProps {
    accounts: Account[]
    onSwitch: (email: string) => Promise<void>
    onAdd: () => Promise<void>
    onRemove: (email: string) => Promise<void>
}

export function AccountSwitcher({ accounts, onSwitch, onAdd, onRemove }: AccountSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)

    const activeAccount = accounts.find(a => a.isActive)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all duration-200 ${isOpen
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-600'
                    }`}
            >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {activeAccount?.email?.[0]?.toUpperCase() || <MdPerson />}
                </div>
                <span className="text-xs font-medium truncate max-w-[120px] hidden sm:block">
                    {activeAccount?.email || 'Sign In'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 z-50 overflow-hidden ring-1 ring-black/5"
                        >
                            <div className="p-1.5 flex flex-col gap-1">
                                <div className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    Accounts
                                </div>

                                {accounts.map(account => (
                                    <div
                                        key={account.email}
                                        className={`group relative flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-200 ${account.isActive
                                            ? 'bg-indigo-50/80 dark:bg-indigo-500/10'
                                            : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80'
                                            }`}
                                    >
                                        <button
                                            className="flex-1 flex items-center gap-3 text-left min-w-0"
                                            onClick={() => {
                                                if (!account.isActive) {
                                                    onSwitch(account.email)
                                                    setIsOpen(false)
                                                }
                                            }}
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${account.isActive
                                                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                }`}>
                                                {account.email[0].toUpperCase()}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className={`text-sm font-medium truncate leading-tight ${account.isActive
                                                    ? 'text-indigo-900 dark:text-indigo-100'
                                                    : 'text-neutral-700 dark:text-neutral-300'
                                                    }`}>
                                                    {account.email}
                                                </div>
                                                {account.projectId && (
                                                    <div className="text-[10px] text-neutral-500 dark:text-neutral-500 truncate mt-0.5 font-mono opacity-80">
                                                        {account.projectId}
                                                    </div>
                                                )}
                                            </div>

                                            {account.isActive && (
                                                <div className="shrink-0 text-indigo-500 dark:text-indigo-400">
                                                    <MdCheck className="text-lg" />
                                                </div>
                                            )}
                                        </button>

                                        {!account.isActive && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onRemove(account.email)
                                                }}
                                                className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-400 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Sign out"
                                            >
                                                <MdLogout className="text-lg" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <div className="h-px bg-neutral-100 dark:bg-neutral-800/80 my-1 mx-2" />

                                <button
                                    onClick={() => {
                                        onAdd()
                                        setIsOpen(false)
                                    }}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors group text-sm font-medium"
                                >
                                    <div className="w-9 h-9 rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-400 group-hover:border-neutral-400 group-hover:text-neutral-500 dark:group-hover:border-neutral-500 dark:group-hover:text-neutral-300 transition-colors">
                                        <MdAdd className="text-lg" />
                                    </div>
                                    <span>Add another account</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
