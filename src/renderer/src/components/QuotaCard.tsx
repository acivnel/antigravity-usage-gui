import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const NEW_MODELS = ['Gemini 3.1 Pro (High)', 'Gemini 3.1 Pro (Low)']

function getStatusColor(percent: number) {
    if (percent < 20) return { bar: 'bg-red-500', badge: 'bg-red-500/10 text-red-400', dot: 'bg-red-400' }
    if (percent < 50) return { bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' }
    return { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' }
}

export function QuotaCard({ model }: { model: any }) {
    const { t } = useTranslation()
    const percent = Math.round(model.remaining)
    const colors = getStatusColor(percent)
    const isNew = NEW_MODELS.some(n => model.displayName?.includes(n))

    return (
        <div className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/30 hover:border-neutral-300 dark:hover:border-neutral-600/50 transition-all duration-200">
            {/* Status dot */}
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />

            {/* Model name */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {model.displayName}
                    </span>
                    {isNew && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                            {t('app.quota.new')}
                        </span>
                    )}
                </div>
                {model.resetTime && (
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {t('app.quota.reset')} {new Date(model.resetTime).toLocaleString([], {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>

            {/* Progress bar */}
            <div className="w-20 shrink-0">
                <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700/60 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${colors.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Percentage */}
            <div className={`text-xs font-bold tabular-nums shrink-0 w-10 text-right ${percent < 20 ? 'text-red-400' : percent < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {percent}%
            </div>
        </div>
    )
}
