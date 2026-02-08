import { motion } from 'framer-motion' // Need to install framer-motion or remove animation
import { Card } from './ui'

export function QuotaCard({ model }: { model: any }) {
    const percent = Math.round(model.remaining)
    const isLow = percent < 20

    return (
        <Card className="relative overflow-hidden group hover:border-neutral-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{model.displayName}</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-1">{model.model}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {percent}% LEFT
                </div>
            </div>

            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isLow ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {model.resetTime && (
                <p className="text-xs text-neutral-500 mt-4 flex items-center gap-2">
                    <span>Resets at:</span>
                    <span className="text-neutral-300">
                        {new Date(model.resetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </p>
            )}
        </Card>
    )
}
