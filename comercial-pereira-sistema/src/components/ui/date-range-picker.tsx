// components/ui/date-range-picker.tsx
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange, DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DatePickerWithRangeProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = "Selecionar período",
  className
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selectedRange: DateRange | undefined) => {
    onDateChange?.(selectedRange)
    // Auto-close when both dates are selected
    if (selectedRange?.from && selectedRange?.to) {
      setIsOpen(false)
    }
  }

  const formatDateRange = (dateRange?: DateRange) => {
    if (!dateRange?.from) {
      return placeholder
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
    }

    return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date?.from && "text-gray-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(date)}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Selecionar período</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <DayPicker
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="border-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0 font-normal aria-selected:opacity-100"
              ),
              day_range_start: "day-range-start",
              day_range_end: "day-range-end",
              day_selected:
                "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              day_today: "bg-accent text-accent-foreground",
              day_outside:
                "day-outside text-gray-500 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500 aria-selected:opacity-30",
              day_disabled: "text-gray-500 opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => {
                onDateChange?.(undefined)
                setIsOpen(false)
              }}
            >
              Limpar
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              disabled={!date?.from}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}