import * as React from "react"
import { CalendarIcon, ClockIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  id?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", id }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize selected Date object from value
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const handleSelectDate = (newDate: Date | undefined) => {
    if (!newDate) return
    const current = dateValue ? new Date(dateValue) : new Date()
    current.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    onChange?.(current.toISOString())
  }

  const handleTimeChange = (type: "hour" | "minute", val: string) => {
    const current = dateValue ? new Date(dateValue) : new Date()
    const numVal = parseInt(val, 10)
    if (type === "hour") {
      current.setHours(numVal)
    } else {
      current.setMinutes(numVal)
    }
    onChange?.(current.toISOString())
  }

  const hourValue = dateValue ? dateValue.getHours() : 12
  const minuteValue = dateValue ? dateValue.getMinutes() : 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={
        <Button
          type="button"
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2 border border-input rounded-md bg-background text-sm cursor-pointer",
            !dateValue && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
          {dateValue ? format(dateValue, "PPP p") : <span>{placeholder}</span>}
        </Button>
      } />
      <PopoverContent className="w-auto p-3 flex flex-col gap-3" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelectDate}
        />
        <div className="flex items-center gap-2 border-t pt-3 justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            <span>Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Hour select */}
            <select
              value={hourValue}
              onChange={(e) => handleTimeChange("hour", e.target.value)}
              className="h-8 w-14 rounded-md border border-input bg-background text-xs px-1 text-center font-medium focus:ring-1 focus:ring-primary outline-hidden"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-xs font-semibold">:</span>
            {/* Minute select */}
            <select
              value={minuteValue}
              onChange={(e) => handleTimeChange("minute", e.target.value)}
              className="h-8 w-14 rounded-md border border-input bg-background text-xs px-1 text-center font-medium focus:ring-1 focus:ring-primary outline-hidden"
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
