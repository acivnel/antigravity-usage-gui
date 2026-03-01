import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MdRemove, MdCropSquare, MdClose } from 'react-icons/md'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

function WindowControls() {
    return (
        <div className="flex items-center gap-0 shrink-0">
            <button
                onClick={() => window.api.windowMinimize()}
                className="w-10 h-7 flex items-center justify-center text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-white transition-colors"
            >
                <MdRemove className="text-sm" />
            </button>
            <button
                onClick={() => window.api.windowMaximize()}
                className="w-10 h-7 flex items-center justify-center text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-white transition-colors"
            >
                <MdCropSquare className="text-xs" />
            </button>
            <button
                onClick={() => window.api.windowClose()}
                className="w-10 h-7 flex items-center justify-center text-neutral-400 hover:bg-red-500 hover:text-white transition-colors rounded-tr-none"
            >
                <MdClose className="text-sm" />
            </button>
        </div>
    )
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden transition-colors duration-300">
            <div className="drag-region w-full shrink-0 flex items-center justify-between select-none bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 border-b border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium tracking-wider uppercase pl-3">Antigravity Usage</span>
                <WindowControls />
            </div>
            <div className="flex-1 flex flex-col px-4 pb-4 max-w-2xl mx-auto w-full min-h-0">
                {children}
            </div>
        </div>
    )
}

export function Button({
    className,
    variant = 'primary',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
    const base = "px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30",
        secondary: "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
    }

    return (
        <button className={cn(base, variants[variant], className)} {...props} />
    )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/50 rounded-xl p-4 backdrop-blur-sm transition-colors duration-300",
                className
            )}
            {...props}
        />
    )
}
