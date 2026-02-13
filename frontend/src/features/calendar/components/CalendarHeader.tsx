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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2 py-4">
      {/* Line 1: Month Title + Navigation */}
      <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start gap-4">
        <h2
          className={cn(
            "text-2xl font-bold capitalize text-foreground min-w-[200px]",
            view === "gantt" && "sm:w-[260px] sm:min-w-[260px] shrink-0", // Match sidebar width
          )}>
          {formatMonthYear(currentDate)}
        </h2>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" isIcon onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday}>
            Сегодня
          </Button>
          <Button variant="outline" size="sm" isIcon onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line 2: View Selector + Team Selector */}
      <div className="flex flex-row items-center justify-between w-full lg:w-auto lg:justify-end gap-4">
        <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
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
