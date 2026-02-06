import React from "react"
import { User } from "../../types"

interface AdminHeaderProps {
  activeTab: "overview" | "users" | "organizations" | "content" | "settings"
  user: User | null
  setIsMobileMenuOpen: (isOpen: boolean) => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  user,
  setIsMobileMenuOpen,
}) => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b-2 border-gray-200">
      <div className="flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-gray-500 focus:outline-none focus:text-gray-600 mr-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          {activeTab === "overview" && "Обзор Системы"}
          {activeTab === "users" && "Управление Пользователями"}
          {activeTab === "organizations" && "Управление Организациями"}
          {activeTab === "content" && "Управление Контентом"}
          {activeTab === "settings" && "Настройки"}
        </h1>
      </div>

      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">
              {user?.name} {user?.lastName}
            </p>
            <p className="text-xs text-indigo-600 font-bold tracking-wide">
              {user?.role === "SUPER_ADMIN" ? "SUPER ADMIN" : user?.role}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
            {(user?.name || "?").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
