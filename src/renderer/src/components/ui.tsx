import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-neutral-900 text-white font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden">
            <div className="drag-region h-8 w-full shrink-0 flex items-center justify-center select-none bg-neutral-900/50 backdrop-blur-sm z-50">
                <span className="text-xs text-neutral-600 font-medium tracking-wide">Antigravity Usage</span>
            </div>
            <div className="flex-1 flex flex-col px-6 pb-6 max-w-4xl mx-auto w-full min-h-0">
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
    const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
        secondary: "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
    }

    return (
        <button className={cn(base, variants[variant], className)} {...props} />
    )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    )
}
