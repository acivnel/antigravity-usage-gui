import { useTranslation } from 'react-i18next'
import { MdLanguage } from 'react-icons/md'

export function LanguageSelector() {
    const { i18n } = useTranslation()

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('ru') ? 'en' : 'ru'
        i18n.changeLanguage(newLang)
    }

    return (
        <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            title="Switch Language / Переключить язык"
        >
            <MdLanguage className="text-lg" />
            <span>{i18n.language.startsWith('ru') ? 'RU' : 'EN'}</span>
        </button>
    )
}
