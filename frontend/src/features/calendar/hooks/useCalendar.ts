import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ru } from "date-fns/locale"
import { useState } from "react"

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

interface UseCalendarReturn {
  currentDate: Date
  setDate: (date: Date) => void
  calendarDays: CalendarDay[]
  nextMonth: () => void
  prevMonth: () => void
  goToToday: () => void
  formatMonthYear: (date: Date) => string
  formatDayName: (date: Date) => string
  formatDayNumber: (date: Date) => string
  isSameDate: (date1: Date, date2: Date) => boolean
}

export function useCalendar(): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getCalendarDays = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { locale: ru })
    const endDate = endOfWeek(monthEnd, { locale: ru })

    const days = eachDayOfInterval({
      start: startDate,
      end: endDate,
    })

    return days.map((day) => ({
      date: day,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, new Date()),
    }))
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const formatMonthYear = (date: Date) => format(date, "LLLL yyyy", { locale: ru })

  const formatDayName = (date: Date) => format(date, "EEE", { locale: ru })

  const formatDayNumber = (date: Date) => format(date, "d", { locale: ru })

  const isSameDate = (date1: Date, date2: Date) => isSameDay(date1, date2)

  return {
    currentDate,
    calendarDays: getCalendarDays(),
    setDate: setCurrentDate,
    nextMonth,
    prevMonth,
    goToToday,
    formatMonthYear,
    formatDayName,
    formatDayNumber,
    isSameDate,
  }
}
