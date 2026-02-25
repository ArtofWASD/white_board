"use client"

import React, { useState } from "react"
import Header from "../layout/Header"
import Footer from "../layout/Footer"
import LeftMenu from "../layout/LeftMenu"
import { NavItem } from "../../types"

export const TimerLayout: React.FC<{
  children: React.ReactNode
  navItems?: NavItem[]
}> = ({ children, navItems }) => {
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header
        onRightMenuClick={() => {}}
        onLeftMenuClick={() => setIsLeftMenuOpen(true)}
        navItems={navItems}
      />
      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        showAuth={false}
        toggleAuth={() => {}}
        events={[]}
        onShowEventDetails={() => {}}
        navItems={navItems}
      />
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
