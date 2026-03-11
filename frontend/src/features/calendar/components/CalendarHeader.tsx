import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  currentDate: Date
  view: "month" | "agenda" | "gantt"
  onViewChange: (view: "month" | "agenda" | "gantt") => void
  onNextMonth: () => void
  onPrevMonth: () => void
  onToday: () => void
  formatMonthYear: (date: Date) => string
  rightActions?: React.ReactNode
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNextMonth,
  onPrevMonth,
  onToday,
  formatMonthYear,
  rightActions,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-center px-2 py-4">
      {/* Navigation Buttons - Left column */}
      <div className="flex items-center gap-1 order-2 lg:order-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={onToday}>
          Сегодня
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Title - Center column */}
      <div className="flex justify-center order-1 lg:order-2">
        <h2
          className={cn(
            "text-2xl font-bold capitalize text-foreground whitespace-nowrap",
            view === "gantt" && "sm:w-[260px] sm:min-w-[260px] shrink-0", // Match sidebar width
          )}>
          {formatMonthYear(currentDate)}
        </h2>
      </div>

      {/* View Selector + Team Selector - Right column */}
      <div className="flex flex-row items-center justify-between w-full lg:w-auto lg:justify-end gap-4 order-3">
        <div className="flex items-center bg-muted/50 dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700">
          <button
            onClick={() => onViewChange("month")}
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              view === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Месяц</span>
          </button>
          <button
            onClick={() => onViewChange("agenda")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              view === "agenda"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Список</span>
          </button>
          <button
            onClick={() => onViewChange("gantt")}
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              view === "gantt"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}>
            <CalendarIcon className="h-4 w-4 rotate-90" />
            <span className="hidden sm:inline">Гант</span>
          </button>
        </div>

        {rightActions && <div className="w-auto">{rightActions}</div>}
      </div>
    </div>
  )
}
