import React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 items-center">
          <a href="/about" className="text-gray-300 hover:text-white transition-colors">
            О нас
          </a>
          <a
            href="/docs/terms"
            className="text-gray-300 hover:text-white transition-colors">
            Условия использования
          </a>
          <a
            href="/docs/privacy"
            className="text-gray-300 hover:text-white transition-colors">
            Политика конфиденциальности
          </a>
          <a
            href="/docs/consent"
            className="text-gray-300 hover:text-white transition-colors">
            Согласие на обработку ПД
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} The Slate. Все права защищены.</p>
      </div>
    </footer>
  )
}

export default Footer
