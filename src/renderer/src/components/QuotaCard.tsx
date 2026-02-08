import { motion } from 'framer-motion' // Need to install framer-motion or remove animation
import { Card } from './ui'

export function QuotaCard({ model }: { model: any }) {
    const percent = Math.round(model.remaining)
    const isLow = percent < 20

    return (
        <Card className="relative overflow-hidden group hover:border-neutral-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{model.displayName}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {percent}% LEFT
                </div>
            </div>

            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-indigo-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>

            {model.resetTime && (
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4 flex items-center gap-2">
                    <span>Resets at:</span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                        {new Date(model.resetTime).toLocaleString([], {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </p>
            )}
        </Card>
    )
}
