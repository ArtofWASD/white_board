import React from "react"
import { ExerciseTracker } from "./ExerciseTracker"
import { RecentActivities } from "./RecentActivities"
import { WeightTracker } from "./WeightTracker"
import { UniversalCalculator } from "./UniversalCalculator"

export interface WidgetProps {
  id: string
  isExpanded: boolean
  onToggle: () => void
  user?: any
  exercises?: any[]
  events?: any[]
  isLoading?: boolean
  hasMoreExercises?: boolean
  hasMoreEvents?: boolean
  onLoadMoreExercises?: () => void
  onLoadMoreEvents?: () => void
  onCreateExercise?: (name: string, initialWeight?: number) => Promise<void>
  onAddRecord?: (exerciseId: string, weight: number) => Promise<void>
  onUpdateExercise?: (id: string, name: string) => Promise<void>
}

export interface WidgetDefinition {
  id: string
  component: React.FC<WidgetProps>
}

export const widgetRegistry: Record<string, WidgetDefinition> = {
  "exercise-tracker": {
    id: "exercise-tracker",
    component: (props: WidgetProps) => (
      <ExerciseTracker
        exercises={props.exercises || []}
        isLoading={props.isLoading || false}
        onCreateExercise={props.onCreateExercise!}
        onAddRecord={props.onAddRecord!}
        onUpdateExercise={props.onUpdateExercise!}
        hasMore={props.hasMoreExercises || false}
        onLoadMore={props.onLoadMoreExercises!}
        isExpanded={props.isExpanded}
        onToggle={props.onToggle}
      />
    ),
  },
  "weight-tracker": {
    id: "weight-tracker",
    component: (props: WidgetProps) => {
      if (!props.user) return null
      return (
        <WeightTracker
          user={props.user}
          isExpanded={props.isExpanded}
          onToggle={props.onToggle}
        />
      )
    },
  },
  "recent-activities": {
    id: "recent-activities",
    component: (props: WidgetProps) => (
      <RecentActivities
        exercises={props.exercises || []}
        events={props.events || []}
        hasMoreEvents={props.hasMoreEvents || false}
        onLoadMoreEvents={props.onLoadMoreEvents!}
        isExpanded={props.isExpanded}
        onToggle={props.onToggle}
      />
    ),
  },
  "universal-calculator": {
    id: "universal-calculator",
    component: (props: WidgetProps) => (
      <UniversalCalculator
        exercises={props.exercises || []}
        isExpanded={props.isExpanded}
        onToggle={props.onToggle}
      />
    ),
  },
}
