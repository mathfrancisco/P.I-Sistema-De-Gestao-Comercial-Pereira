// components/ui/badge.tsx
import * as React from "react"
import { cn } from "@/lib/utils/utils"

// Define variant styles manually since you don't have class-variance-authority
const badgeVariants = {
  default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
  destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline: "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50",
  success: "border-transparent bg-green-600 text-white hover:bg-green-700",
  warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
  info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }