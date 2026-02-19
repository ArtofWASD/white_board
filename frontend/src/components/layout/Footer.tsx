import React from "react"
import Link from "next/link"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-start gap-12 md:gap-24 mb-8">
          {/* Column 1: Company & Resources */}
          <div className="flex flex-col space-y-3 items-start text-left w-full md:w-auto">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Компания
            </h3>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              О нас
            </Link>
            <Link href="/knowledge" className="text-gray-300 hover:text-white transition-colors">
              База знаний
            </Link>
          </div>

          {/* Column 2: Legal & Documents */}
          <div className="flex flex-col space-y-3 items-start text-left w-full md:w-auto">
             <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Документы
            </h3>
            <Link
              href="/docs/terms"
              className="text-gray-300 hover:text-white transition-colors">
              Условия использования
            </Link>
            <Link
              href="/docs/privacy"
              className="text-gray-300 hover:text-white transition-colors">
              Политика конфиденциальности
            </Link>
            <Link
              href="/docs/consent"
              className="text-gray-300 hover:text-white transition-colors">
              Согласие на обработку ПД
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} The Slate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
