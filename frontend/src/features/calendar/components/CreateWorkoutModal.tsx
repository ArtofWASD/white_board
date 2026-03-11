import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Check, AlertCircle } from "lucide-react"
import { Exercise, Team, TeamMember } from "@/types"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { teamsApi } from "@/lib/api/teams"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { z } from "zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  WorkoutFormValues,
  workoutFormSchema,
} from "@/features/workouts/schemas/workoutFormSchema"
import { WorkoutFormFields } from "@/features/workouts/components/WorkoutFormFields"
import { ExerciseSubForm } from "@/features/workouts/components/ExerciseSubForm"

// ── Types ─────────────────────────────────────────────────────────────
interface CreateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: unknown) => Promise<void>
  defaultDate?: Date
  defaultTeamId?: string
}

// ── Component ─────────────────────────────────────────────────────────
export function CreateWorkoutModal({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  defaultTeamId,
}: CreateWorkoutModalProps) {
  const { user } = useAuthStore()

  const defaultTeam =
    defaultTeamId === "my" || defaultTeamId === "all" || defaultTeamId === "all_teams"
      ? "none"
      : defaultTeamId || "none"

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      title: "",
      date: "",
      scheduledTime: "09:00",
      scheme: "FOR_TIME",
      timeCap: "",
      rounds: "",
      description: "",
      selectedTeamId: defaultTeam,
      assignmentType: "all",
      selectedAthletes: [],
      exercises: [],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = form
  const exercisesFieldArray = useFieldArray({
    control,
    name: "exercises",
  })

  // Watchers for conditional rendering
  const scheme = watch("scheme")
  const selectedTeamId = watch("selectedTeamId")
  const assignmentType = watch("assignmentType")
  const selectedAthletes = watch("selectedAthletes") || []

  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      let initialDate = ""
      if (defaultDate) {
        const year = defaultDate.getFullYear()
        const month = String(defaultDate.getMonth() + 1).padStart(2, "0")
        const day = String(defaultDate.getDate()).padStart(2, "0")
        initialDate = `${year}-${month}-${day}`
      } else {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, "0")
        const day = String(now.getDate()).padStart(2, "0")
        initialDate = `${year}-${month}-${day}`
      }

      reset({
        title: "",
        date: initialDate,
        scheduledTime: "09:00",
        scheme: "FOR_TIME",
        timeCap: "",
        rounds: "",
        description: "",
        selectedTeamId: defaultTeam,
        assignmentType: "all",
        selectedAthletes: [],
        exercises: [],
      })

      if (
        user &&
        (user.role === "TRAINER" ||
          user.role === "ORGANIZATION_ADMIN" ||
          user.role === "SUPER_ADMIN")
      ) {
        fetchUserTeams()
      }
    }
  }, [isOpen, defaultDate, defaultTeamId, user, reset]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUserTeams() {
    if (!user) return
    try {
      const response = await teamsApi.getUserTeams(user.id)
      if (response && Array.isArray(response)) {
        setAvailableTeams(response)
      }
    } catch (error) {
      console.error("Failed to fetch teams", error)
    }
  }

  useEffect(() => {
    const isSpecialFilter = ["all", "my", "all_teams", "none"].includes(
      selectedTeamId || "",
    )
    if (selectedTeamId && !isSpecialFilter) {
      const fetchMembers = async () => {
        try {
          const response = await teamsApi.getMembers(selectedTeamId)
          if (response && Array.isArray(response)) {
            setTeamMembers(response)
          }
        } catch (error) {
          console.error("Failed to fetch team members", error)
        }
      }
      fetchMembers()
    } else {
      setTeamMembers([])
    }
  }, [selectedTeamId])

  const onSubmitForm = async (data: WorkoutFormValues) => {
    try {
      const dateTime = new Date(`${data.date}T${data.scheduledTime}:00`).toISOString()
      const payload = {
        title: data.title.trim(),
        eventDate: dateTime,
        exerciseType: data.scheme,
        exercises: data.exercises,
        timeCap: data.timeCap,
        rounds: data.rounds,
        description: data.description,
        teamId:
          data.selectedTeamId === "none" ? undefined : data.selectedTeamId || undefined,
        scheme: data.scheme,
        assignees:
          data.assignmentType === "specific" && (data.selectedAthletes || []).length > 0
            ? data.selectedAthletes
            : undefined,
      }
      await onSave(payload)
      onClose()
    } catch (error: Error | unknown) {
      console.error(error)
      const msg =
        error instanceof Error ? error.message : "Произошла ошибка при сохранении"
      form.setError("root", { message: msg })
    }
  }

  const errCls = (hasErr: boolean) =>
    cn("bg-background", hasErr && "border-red-500 focus-visible:ring-red-500")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto gap-0 p-0 flex flex-col bg-[var(--card)]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Создать тренировку</DialogTitle>
          <div className="sr-only">Заполните форму для создания новой тренировки</div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          className="flex flex-col flex-1 overflow-y-auto">
          {errors.root && (
            <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-md flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{errors.root.message}</p>
            </div>
          )}

          <div className="p-6 pt-4 flex-1 overflow-y-auto space-y-4">
            <WorkoutFormFields form={form} />

            {/* Team & Athlete Selection */}
            {(user?.role === "TRAINER" ||
              user?.role === "ORGANIZATION_ADMIN" ||
              user?.role === "SUPER_ADMIN") && (
              <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-select">Команда</Label>
                  <Controller
                    control={control}
                    name="selectedTeamId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val)
                          setValue("selectedAthletes", []) // reset athletes if team changes
                        }}>
                        <SelectTrigger id="team-select" className="bg-background">
                          <SelectValue placeholder="Выберите команду..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Личная тренировка</SelectItem>
                          {availableTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {selectedTeamId && selectedTeamId !== "none" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>Назначить:</Label>
                      <Controller
                        control={control}
                        name="assignmentType"
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="r-all" />
                              <Label
                                htmlFor="r-all"
                                className="font-normal cursor-pointer">
                                Всей команде
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="specific" id="r-specific" />
                              <Label
                                htmlFor="r-specific"
                                className="font-normal cursor-pointer">
                                Выбрать атлетов
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>

                    {assignmentType === "specific" && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Участники ({selectedAthletes.length} выбрано)
                        </Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md bg-background p-1 space-y-1">
                          {teamMembers.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              В команде нет участников
                            </div>
                          ) : (
                            teamMembers.map((member) => {
                              const isSelected = selectedAthletes.includes(member.user.id)
                              return (
                                <div
                                  key={member.id}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors text-sm",
                                    isSelected && "bg-primary/10",
                                  )}
                                  onClick={() => {
                                    if (isSelected) {
                                      setValue(
                                        "selectedAthletes",
                                        selectedAthletes.filter(
                                          (id) => id !== member.user.id,
                                        ),
                                      )
                                    } else {
                                      setValue("selectedAthletes", [
                                        ...selectedAthletes,
                                        member.user.id,
                                      ])
                                    }
                                  }}>
                                  <div
                                    className={cn(
                                      "h-4 w-4 border rounded flex items-center justify-center transition-colors",
                                      isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-input",
                                    )}>
                                    {isSelected && <Check className="h-3 w-3" />}
                                  </div>
                                  <span className={cn(isSelected && "font-medium")}>
                                    {member.user.name} {member.user.lastName || ""}
                                    <span className="text-xs text-muted-foreground ml-1 font-normal opacity-70">
                                      ({member.role === "OWNER" ? "Владелец" : "Участник"}
                                      )
                                    </span>
                                  </span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <ExerciseSubForm form={form} exercisesFieldArray={exercisesFieldArray} />
          </div>

          <DialogFooter className="p-4 border-t dark:border-gray-700 bg-muted/20 dark:bg-gray-900/20">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="min-h-[48px] h-12 text-base"
              disabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="min-h-[48px] h-12 text-base border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 bg-transparent transition-colors">
              {isSubmitting ? "Создание..." : "Создать тренировку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
