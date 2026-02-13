"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useTeamStore } from "../../lib/store/useTeamStore"
import Button from "../ui/Button"
import { getUnreadNotificationCount } from "../../lib/api/notifications"
import { waitForSocket } from "../../lib/socket"

interface HeaderProps {
  onRightMenuClick?: () => void
  onLeftMenuClick?: () => void
  navItems?: {
    label: string
    href: string
    icon?: React.ReactNode
    onClick?: () => void
    tooltip?: string
    variant?: "primary" | "outline" | "ghost" | "link" | "destructive"
  }[]
  rightContent?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({
  onRightMenuClick,
  onLeftMenuClick,
  navItems,
  rightContent,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const { teams, selectedTeam, selectTeam } = useTeamStore()

  const isDashboard = pathname?.startsWith("/dashboard") || pathname === "/calendar"

  const handleLoginClick = () => {
    router.push("/login")
  }

  const handleTitleClick = () => {
    router.push("/")
  }

  const handleUserIconClick = () => {
    router.push("/dashboard")
  }

  const handleNotificationsClick = () => {
    router.push("/notifications")
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectTeam(e.target.value)
  }

  const [unreadCount, setUnreadCount] = React.useState(0)

  // Интеграция с WebSocket
  React.useEffect(() => {
    let isMounted = true
    let socketInstance: any = null

    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !user) return
      try {
        const count = await getUnreadNotificationCount()
        if (isMounted) setUnreadCount(count)
      } catch (e) {
        console.error("Failed to fetch unread count", e)
      }
    }

    const handleNewNotification = (data: any) => {
      fetchUnreadCount()
    }

    const setupSocket = async () => {
      if (isAuthenticated && user) {
        // Первоначальная загрузка
        fetchUnreadCount()

        try {
          // Инициализируем сокет (увеличиваем счетчик ссылок)
          const { initializeSocket } = await import("../../lib/socket")
          const socket = initializeSocket(user.id)

          if (isMounted) {
            socketInstance = socket
            socket.on("newNotification", handleNewNotification)
          }
        } catch (e) {
          console.error("[Header] Socket init failed", e)
        }
      }
    }

    setupSocket()

    return () => {
      isMounted = false
      if (socketInstance) {
        socketInstance.off("newNotification", handleNewNotification)
        // Отключаемся (уменьшаем счетчик ссылок)
        import("../../lib/socket").then(({ disconnectSocket }) => {
          disconnectSocket()
        })
      }
    }
  }, [isAuthenticated, user])

  return (
    <header className="bg-gray-800 text-white py-2 px-2 sm:px-4 flex justify-between items-center relative gap-2 sm:gap-4 z-50">
      <div className="flex items-center">
        {isDashboard && (
          <button
            onClick={onLeftMenuClick}
            className="lg:hidden mr-2 p-1 text-gray-300 hover:text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        )}
        {/* Desktop/Tablet Logo (Left Aligned) */}
        <Link href="/" className="ml-2 hidden lg:flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={60}
            priority
            className="w-auto h-10 sm:h-14 object-contain"
          />
        </Link>

        {/* Mobile Centered Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={50}
              priority
              className="w-auto h-8 object-contain"
            />
          </Link>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full max-w-2xl pointer-events-none lg:pointer-events-auto">
        <div className="pointer-events-auto">
          {navItems ? (
            <>
              <nav className="hidden lg:flex space-x-4">
                {navItems.map((item) =>
                  item.icon ? (
                    <Button
                      key={item.label}
                      onClick={item.onClick}
                      href={item.href !== "#" ? item.href : undefined}
                      variant="ghost"
                      isIcon={true}
                      tooltip={item.tooltip}
                      className="text-white hover:text-blue-300">
                      {item.icon}
                    </Button>
                  ) : item.onClick ? (
                    <Button
                      key={item.label}
                      onClick={item.onClick}
                      variant={item.variant || "ghost"}
                      className="text-white hover:text-blue-300 font-medium transition-colors">
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      key={item.href}
                      href={item.href}
                      variant={item.variant || "ghost"}
                      className="text-white hover:text-blue-300 font-medium transition-colors">
                      {item.label}
                    </Button>
                  ),
                )}
              </nav>
              {isDashboard && (
                <div className="lg:hidden flex flex-col items-center">
                  {isAuthenticated && teams.length > 0 && selectedTeam && <div />}
                </div>
              )}
            </>
          ) : !isDashboard ? (
            <Link href="/" onClick={handleTitleClick} className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={180}
                height={60}
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </Link>
          ) : (
            // Логотип по центру на мобильных для панели управления
            <div className="flex flex-col items-center">
              <Link href="/" className="lg:hidden flex items-center hidden">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={180}
                  height={60}
                  priority
                  className="w-auto h-10 sm:h-14 object-contain"
                />
              </Link>
              {isAuthenticated && teams.length > 0 && selectedTeam ? (
                teams.length > 1 ? (
                  <div className="relative pointer-events-auto">
                    <select
                      value={selectedTeam.id}
                      onChange={handleTeamChange}
                      className="appearance-none bg-transparent text-white text-lg sm:text-xl font-bold py-1 px-4 pr-8 rounded cursor-pointer hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none text-center">
                      {teams.map((team) => (
                        <option
                          key={team.id}
                          value={team.id}
                          className="bg-gray-800 text-white">
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                ) : null
              ) : (
                <h1
                  className="text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={handleTitleClick}>
                  The Slate
                </h1>
              )}
            </div>
          )}
        </div>
      </div>

      {rightContent ? (
        <div className="flex items-center space-x-4 cursor-pointer ml-auto pointer-events-auto z-50">
          {rightContent}
        </div>
      ) : isAuthenticated && user ? (
        <div className="flex items-center space-x-1 sm:space-x-4 cursor-pointer ml-auto">
          <div className="relative group">
            <button
              onClick={handleNotificationsClick}
              className="flex items-center justify-center h-10 w-10 text-gray-300 hover:text-white transition-colors focus:outline-none relative"
              aria-label="Notifications">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.454 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-gray-800">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Подсказка */}
            <div className="absolute top-full right-0 mt-2 w-max bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              {unreadCount > 0
                ? `${unreadCount} новых уведомлений`
                : "Нет новых уведомлений"}
              <div className="absolute  right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>

          <div
            onClick={handleUserIconClick}
            className="flex items-center space-x-1 sm:space-x-2">
            <span className="hidden lg:inline text-sm sm:text-base">
              Привет, {user.name}
              {user.lastName ? ` ${user.lastName}` : ""}!
            </span>
            <div className="w-[27px] h-[27px] sm:w-[35px] sm:h-[35px] rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-bold text-sm sm:text-base">
                {user.name.charAt(0)}
                {user.lastName ? user.lastName.charAt(0) : ""}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleLoginClick}
          className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer ml-auto">
          <Image
            src="/login.png"
            alt="Login"
            width={27}
            height={27}
            className="sm:w-[35px] sm:h-[35px]"
          />
        </button>
      )}
    </header>
  )
}

export default Header
