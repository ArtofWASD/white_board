"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface AnimatedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const AnimatedLink: React.FC<AnimatedLinkProps> = ({
  href,
  children,
  className,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("relative inline-flex flex-col items-center text-white font-medium", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.span
        className="absolute -bottom-1 left-1/2 h-0.5 bg-current -translate-x-1/2"
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </Link>
  )
}

export default AnimatedLink
