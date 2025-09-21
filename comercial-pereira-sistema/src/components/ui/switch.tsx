// components/ui/switch.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, size = 'md', label, ...props }, ref) => {
    const sizeClasses = {
      sm: {
        track: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
        label: 'text-sm'
      },
      md: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
        label: 'text-sm'
      },
      lg: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
        label: 'text-base'
      }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked)
    }

    const switchElement = (
      <label className={cn(
        "relative inline-flex items-center cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        
        {/* Track */}
        <div className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "peer-checked:bg-blue-600 peer-unchecked:bg-gray-200",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          sizeClasses[size].track
        )}>
          {/* Thumb */}
          <span className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            "peer-checked:translate-x-4 peer-unchecked:translate-x-0",
            size === 'sm' && "peer-checked:translate-x-3",
            size === 'lg' && "peer-checked:translate-x-5",
            sizeClasses[size].thumb.replace('data-[state=checked]:translate-x-3', '').replace('data-[state=checked]:translate-x-4', '').replace('data-[state=checked]:translate-x-5', '')
          )} />
        </div>
        
        {label && (
          <span className={cn(
            "ml-3 font-medium text-gray-900",
            disabled && "text-gray-400",
            sizeClasses[size].label
          )}>
            {label}
          </span>
        )}
      </label>
    )

    return switchElement
  }
)

Switch.displayName = "Switch"

export { Switch }