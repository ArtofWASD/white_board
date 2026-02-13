"use client"

import { CalendarSystem } from "@/features/calendar/CalendarSystem"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { addDays, format, startOfMonth, subDays } from "date-fns"

// Helper to generate mock workouts relative to today
const generateMockWorkouts = (): Record<string, Workout[]> => {
  const today = new Date()
  const start = startOfMonth(today)

  const workouts: Record<string, Workout[]> = {}

  // Add some workouts
  const dates = [
    format(today, "yyyy-MM-dd"),
    format(addDays(today, 2), "yyyy-MM-dd"),
    format(subDays(today, 1), "yyyy-MM-dd"),
    format(addDays(today, 5), "yyyy-MM-dd"),
    format(addDays(today, 10), "yyyy-MM-dd"),
  ]

  workouts[dates[0]] = [
    {
      id: "1",
      title: "Fran",
      type: "FOR_TIME",
      result: "3:45",
      scheduledTime: "09:00",
      description: "21-15-9 Reps For Time",
      movements: ["Thrusters", "Pull-Ups"],
    },
    {
      id: "1-b",
      title: "Heavy Squats",
      type: "WEIGHTLIFTING",
      scheduledTime: "10:30",
      description: "5x5 Back Squat",
      movements: ["Back Squat"],
    },
  ]

  workouts[dates[1]] = [
    {
      id: "2",
      title: "Murph",
      type: "FOR_TIME",
      description: "1 Mile Run...",
      movements: ["Run", "Pull-Ups", "Push-Ups", "Squats", "Run"],
      timeCap: "60 mins",
    },
  ]

  workouts[dates[2]] = [
    {
      id: "3",
      title: "Cindy",
      type: "AMRAP",
      description: "20 min AMRAP",
      movements: ["Pull-Ups", "Push-Ups", "Squats"],
      rounds: "20",
    },
  ]

  workouts[dates[3]] = [
    {
      id: "4",
      title: "EMOM 10",
      type: "EMOM",
      description: "Odds: Wall Balls, Evens: Burpees",
      movements: ["Wall Balls", "Burpees"],
    },
  ]

  return workouts
}

const mockWorkouts = generateMockWorkouts()

export default function TestCalendarPage() {
  return (
    <div className="w-full px-[20px] py-4 h-screen flex flex-col">
      <div className="flex-1 min-h-0">
        <CalendarSystem workouts={mockWorkouts} />
      </div>
    </div>
  )
}
