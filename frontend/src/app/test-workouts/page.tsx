"use client"

import { WorkoutCard, Workout } from "@/features/workouts/components/WorkoutCard"
import { WorkoutDetail } from "@/features/workouts/components/WorkoutDetail"
import { useState } from "react"

const mockWorkouts: Workout[] = [
  {
    id: "1",
    title: "Fran",
    type: "FOR_TIME",
    description: "21-15-9 Reps For Time:\nThrusters (95/65 lb)\nPull-Ups",
    movements: ["Thrusters", "Pull-Ups"],
    result: "3:45",
  },
  {
    id: "2",
    title: "Murph",
    type: "FOR_TIME",
    description:
      "1 Mile Run\n100 Pull-Ups\n200 Push-Ups\n300 Air Squats\n1 Mile Run\n\n*Partition the pull-ups, push-ups, and squats as needed. Start and finish with a mile run. If you've got a twenty pound vest or body armor, wear it.",
    movements: ["Run", "Pull-Ups", "Push-Ups", "Air Squats", "Run"],
    timeCap: "60 mins",
  },
  {
    id: "3",
    title: "Cindy",
    type: "AMRAP",
    description: "20 Minute AMRAP:\n5 Pull-Ups\n10 Push-Ups\n15 Air Squats",
    movements: ["Pull-Ups", "Push-Ups", "Air Squats"],
    rounds: "18+5",
    result: "18 rounds",
  },
  {
    id: "4",
    title: "EMOM 10",
    type: "EMOM",
    description:
      "Every Minute on the Minute for 10 Minutes:\nOdd: 15 Wall Balls (20/14 lb)\nEven: 12 Burpees",
    movements: ["Wall Balls", "Burpees"],
  },
]

export default function TestPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleOpenDetail = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsDetailOpen(true)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Workout Component System Test</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onOpenDetail={() => handleOpenDetail(workout)}
          />
        ))}
      </div>

      <WorkoutDetail
        workout={selectedWorkout}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}
