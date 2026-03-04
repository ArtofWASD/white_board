import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Check, AlertCircle } from "lucide-react"
import { Exercise, Team, TeamMember } from "@/types"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { teamsApi } from "@/lib/api/teams"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { z } from "zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// ── Validation Schema ────────────────────────────────────────────────
const measurementEnum = z.enum(["weight", "calories", "time", "distance"])

const exerciseSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  measurement: measurementEnum,
  weight: z.string().optional(),
  repetitions: z.string().optional(),
  scWeight: z.string().optional(),
  scReps: z.string().optional(),
  rxCalories: z.string().optional(),
  scCalories: z.string().optional(),
  rxTime: z.string().optional(),
  scTime: z.string().optional(),
  rxDistance: z.string().optional(),
  scDistance: z.string().optional(),
  rxDistanceWeight: z.string().optional(),
  scDistanceWeight: z.string().optional(),
})

const exerciseInputSchema = z
  .object({
    exName: z
      .string()
      .min(2, "Минимум 2 символа")
      .max(100, "Не более 100 символов")
      .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?/]+$/, "Недопустимые символы"),
    exMeasurement: measurementEnum,
    rxWeight: z.string().optional(),
    rxReps: z.string().optional(),
    scWeight: z.string().optional(),
    scReps: z.string().optional(),
    rxCalories: z.string().optional(),
    scCalories: z.string().optional(),
    rxTime: z.string().optional(),
    scTime: z.string().optional(),
    rxDistance: z.string().optional(),
    scDistance: z.string().optional(),
    rxDistanceWeight: z.string().optional(),
    scDistanceWeight: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Only Rx fields are required; Sc fields are optional
    const isPosNum = (v: string | undefined) =>
      v === undefined || v === "" || (!isNaN(Number(v)) && Number(v) >= 0)
    const isPosInt = (v: string | undefined) =>
      v === undefined || v === "" || (/^\d+$/.test(v) && Number(v) >= 1)

    if (data.exMeasurement === "weight") {
      if (!isPosNum(data.rxWeight))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxWeight"],
        })
      if (!isPosInt(data.rxReps))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число ≥ 1",
          path: ["rxReps"],
        })
    }
    if (data.exMeasurement === "calories") {
      if (!isPosInt(data.rxCalories))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число ≥ 1",
          path: ["rxCalories"],
        })
    }
    if (data.exMeasurement === "time") {
      if (!isPosNum(data.rxTime))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxTime"],
        })
    }
    if (data.exMeasurement === "distance") {
      if (!isPosNum(data.rxDistance))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxDistance"],
        })
      if (!isPosNum(data.rxDistanceWeight))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxDistanceWeight"],
        })
    }
  })

const workoutFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(150, "Не более 150 символов")
      .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?/]+$/, "Недопустимые символы"),
    date: z.string().refine(
      (val) => {
        if (!val) return false
        const [year, month, day] = val.split("-").map(Number)
        const selectedDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: "Дата не может быть в прошлом" },
    ),
    scheduledTime: z.string(),
    scheme: z.string(),
    timeCap: z.string().optional(),
    rounds: z.string().optional(),
    description: z.string().max(500, "Не более 500 символов").optional(),
    selectedTeamId: z.string().optional(),
    assignmentType: z.enum(["all", "specific"]).optional(),
    selectedAthletes: z.array(z.string()).optional(),
    exercises: z
      .array(exerciseSchemaBase)
      .min(1, "Необходимо добавить хотя бы 1 упражнение"),
  })
  .superRefine((data, ctx) => {
    if (["FOR_TIME", "AMRAP", "CARDIO"].includes(data.scheme)) {
      if (data.timeCap && !/^\d+$/.test(data.timeCap)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число минут ≥ 1",
          path: ["timeCap"],
        })
      } else if (data.timeCap && Number(data.timeCap) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число минут ≥ 1",
          path: ["timeCap"],
        })
      }
    }
    if (data.scheme === "EMOM") {
      if (data.rounds && !/^\d+$/.test(data.rounds)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число раундов ≥ 1",
          path: ["rounds"],
        })
      } else if (data.rounds && Number(data.rounds) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число раундов ≥ 1",
          path: ["rounds"],
        })
      }
    }
  })

type WorkoutFormValues = z.infer<typeof workoutFormSchema>

// ── Types ─────────────────────────────────────────────────────────────
interface CreateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: unknown) => Promise<void>
  defaultDate?: Date
  defaultTeamId?: string
}

// ── Small inline error ────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
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
  const {
    fields: exercises,
    append: appendExercise,
    remove: removeExercise,
    update: updateExercise,
  } = useFieldArray({
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

  // Exercise Sub-form State
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [exName, setExName] = useState("")
  const [exMeasurement, setExMeasurement] = useState<
    "weight" | "calories" | "time" | "distance"
  >("weight")
  const [exInputs, setExInputs] = useState({
    rxWeight: "0",
    rxReps: "0",
    scWeight: "0",
    scReps: "0",
    rxCalories: "0",
    scCalories: "0",
    rxTime: "00:00",
    scTime: "00:00",
    rxDistance: "0",
    scDistance: "0",
    rxDistanceWeight: "0",
    scDistanceWeight: "0",
  })
  const [exErrors, setExErrors] = useState<Record<string, string>>({})

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
      resetExerciseInput()

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

  function resetExerciseInput() {
    setExName("")
    setExMeasurement("weight")
    setExInputs({
      rxWeight: "0",
      rxReps: "0",
      scWeight: "0",
      scReps: "0",
      rxCalories: "0",
      scCalories: "0",
      rxTime: "00:00",
      scTime: "00:00",
      rxDistance: "0",
      scDistance: "0",
      rxDistanceWeight: "0",
      scDistanceWeight: "0",
    })
    setExErrors({})
    setEditingIndex(null)
  }

  const handleExInputChange = (field: string, value: string) => {
    setExInputs((prev) => ({ ...prev, [field]: value }))
    if (exErrors[field])
      setExErrors((p) => ({ ...p, [field]: undefined }) as Record<string, string>)
  }

  const handleExInputFocus = (field: keyof typeof exInputs, defaultValue: string) => {
    if (exInputs[field] === defaultValue) {
      handleExInputChange(field, "")
    }
  }

  const handleExInputBlur = (field: keyof typeof exInputs, defaultValue: string) => {
    if (exInputs[field] === "") {
      handleExInputChange(field, defaultValue)
    }
  }

  const handleAddExercise = () => {
    const parseResult = exerciseInputSchema.safeParse({
      exName: exName.trim(),
      exMeasurement,
      ...exInputs,
    })

    if (!parseResult.success) {
      const newErrors: Record<string, string> = {}
      parseResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message
        }
      })
      setExErrors(newErrors)
      return
    }

    const data = parseResult.data
    const newEx = {
      id: editingIndex !== null ? exercises[editingIndex].id : Date.now().toString(),
      name: data.exName,
      measurement: data.exMeasurement,
      weight: data.exMeasurement === "weight" ? data.rxWeight : undefined,
      repetitions: data.exMeasurement === "weight" ? data.rxReps : undefined,
      scWeight: data.exMeasurement === "weight" ? data.scWeight || "0" : undefined,
      scReps: data.exMeasurement === "weight" ? data.scReps || "0" : undefined,
      rxCalories: data.exMeasurement === "calories" ? data.rxCalories : undefined,
      scCalories: data.exMeasurement === "calories" ? data.scCalories || "0" : undefined,
      rxTime: data.exMeasurement === "time" ? data.rxTime : undefined,
      scTime: data.exMeasurement === "time" ? data.scTime || "0" : undefined,
      rxDistance: data.exMeasurement === "distance" ? data.rxDistance : undefined,
      scDistance: data.exMeasurement === "distance" ? data.scDistance || "0" : undefined,
      rxDistanceWeight:
        data.exMeasurement === "distance" ? data.rxDistanceWeight : undefined,
      scDistanceWeight:
        data.exMeasurement === "distance" ? data.scDistanceWeight || "0" : undefined,
    }

    if (editingIndex !== null) {
      updateExercise(editingIndex, newEx)
      setEditingIndex(null)
    } else {
      appendExercise(newEx)
    }

    resetExerciseInput()
  }

  const handleEditExercise = (index: number) => {
    const exerciseToEdit = exercises[index]
    if (!exerciseToEdit) return

    setExName(exerciseToEdit.name)
    setExMeasurement(exerciseToEdit.measurement || "weight")
    setExInputs({
      rxWeight: exerciseToEdit.weight || "",
      rxReps: exerciseToEdit.repetitions || "",
      scWeight: exerciseToEdit.scWeight || "",
      scReps: exerciseToEdit.scReps || "",
      rxCalories: exerciseToEdit.rxCalories || "0",
      scCalories: exerciseToEdit.scCalories || "0",
      rxTime: exerciseToEdit.rxTime || "00:00",
      scTime: exerciseToEdit.scTime || "00:00",
      rxDistance: exerciseToEdit.rxDistance || "0",
      scDistance: exerciseToEdit.scDistance || "0",
      rxDistanceWeight: exerciseToEdit.rxDistanceWeight || "0",
      scDistanceWeight: exerciseToEdit.scDistanceWeight || "0",
    })

    setEditingIndex(index)
  }

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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="например, Murph"
                  maxLength={150}
                  className={errCls(!!errors.title)}
                />
                <FieldError msg={errors.title?.message} />
              </div>
              <div className="space-y-2">
                <Label>Дата и Время</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      {...register("date")}
                      className={cn("w-full", errCls(!!errors.date))}
                    />
                  </div>
                  <Input
                    type="time"
                    {...register("scheduledTime")}
                    className={cn("w-24", errCls(!!errors.scheduledTime))}
                  />
                </div>
                <FieldError msg={errors.date?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheme">Тип</Label>
                <Controller
                  control={control}
                  name="scheme"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="scheme">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOR_TIME">На время (For Time)</SelectItem>
                        <SelectItem value="AMRAP">AMRAP</SelectItem>
                        <SelectItem value="EMOM">EMOM</SelectItem>
                        <SelectItem value="WEIGHTLIFTING">Тяжелая атлетика</SelectItem>
                        <SelectItem value="CARDIO">Кардио</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {(scheme === "FOR_TIME" || scheme === "AMRAP" || scheme === "CARDIO") && (
                <div className="space-y-2">
                  <Label htmlFor="timeCap">Кол-во минут (тайм-кап)</Label>
                  <Input
                    id="timeCap"
                    type="number"
                    min="1"
                    step="1"
                    {...register("timeCap")}
                    placeholder="например, 20"
                    className={errCls(!!errors.timeCap)}
                  />
                  <FieldError msg={errors.timeCap?.message} />
                </div>
              )}
              {scheme === "EMOM" && (
                <div className="space-y-2">
                  <Label htmlFor="rounds">Раунды</Label>
                  <Input
                    id="rounds"
                    type="number"
                    min="1"
                    step="1"
                    {...register("rounds")}
                    placeholder="например, 10"
                    className={errCls(!!errors.rounds)}
                  />
                  <FieldError msg={errors.rounds?.message} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Дополнительные заметки..."
                maxLength={500}
              />
              <FieldError msg={errors.description?.message} />
            </div>

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

            {/* Exercises Section */}
            <div
              className={cn(
                "border rounded-lg p-4 bg-muted/20 space-y-4",
                errors.exercises && "border-red-500",
              )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">Упражнения</h4>
                  {errors.exercises && (
                    <span className="text-xs text-red-500 font-medium">
                      {errors.exercises.root?.message || errors.exercises.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 bg-[var(--card)] p-3 rounded-md border shadow-sm">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Добавить новое
                </div>
                {/* Exercise name and Selection layout change for mobile */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={exName}
                      onChange={(e) => {
                        setExName(e.target.value)
                        if (exErrors.exName)
                          setExErrors((p) => {
                            const { exName, ...rest } = p
                            return rest
                          })
                      }}
                      placeholder="Название упражнения"
                      maxLength={100}
                      className={errCls(!!exErrors.exName)}
                    />
                    <FieldError msg={exErrors.exName} />
                  </div>
                  <div className="w-full sm:w-[180px] space-y-2">
                    <Select
                      value={exMeasurement}
                      onValueChange={(val: any) => {
                        setExMeasurement(val)
                        setExInputs({
                          rxWeight: "0",
                          rxReps: "0",
                          scWeight: "0",
                          scReps: "0",
                          rxCalories: "0",
                          scCalories: "0",
                          rxTime: "00:00",
                          scTime: "00:00",
                          rxDistance: "0",
                          scDistance: "0",
                          rxDistanceWeight: "0",
                          scDistanceWeight: "0",
                        })
                        setExErrors({})
                      }}>
                      <SelectTrigger className="w-full text-base sm:text-sm font-medium bg-background">
                        <SelectValue placeholder="Тип упражнения" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight" className="text-base sm:text-sm auto">
                          Вес/Повторы
                        </SelectItem>
                        <SelectItem
                          value="calories"
                          className="text-base sm:text-sm auto">
                          Калории
                        </SelectItem>
                        <SelectItem value="time" className="text-base sm:text-sm auto">
                          Время
                        </SelectItem>
                        <SelectItem
                          value="distance"
                          className="text-base sm:text-sm auto">
                          Дистанция
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Numeric inputs */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {/* RX */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary">RX *</span>
                    {exMeasurement === "weight" ? (
                      <div className="flex gap-2 flex-col">
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exInputs.rxWeight}
                              onChange={(e) =>
                                handleExInputChange("rxWeight", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("rxWeight", "0")}
                              onBlur={() => handleExInputBlur("rxWeight", "0")}
                              className={cn("pr-8", errCls(!!exErrors.rxWeight))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              кг
                            </span>
                          </div>
                          <FieldError msg={exErrors.rxWeight} />
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              step="1"
                              value={exInputs.rxReps}
                              onChange={(e) =>
                                handleExInputChange("rxReps", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("rxReps", "0")}
                              onBlur={() => handleExInputBlur("rxReps", "0")}
                              className={cn("pr-10", errCls(!!exErrors.rxReps))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              повт
                            </span>
                          </div>
                          <FieldError msg={exErrors.rxReps} />
                        </div>
                      </div>
                    ) : exMeasurement === "calories" ? (
                      <div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={exInputs.rxCalories}
                            onChange={(e) =>
                              handleExInputChange("rxCalories", e.target.value)
                            }
                            onFocus={() => handleExInputFocus("rxCalories", "0")}
                            onBlur={() => handleExInputBlur("rxCalories", "0")}
                            className={cn("pr-10", errCls(!!exErrors.rxCalories))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кал
                          </span>
                        </div>
                        <FieldError msg={exErrors.rxCalories} />
                      </div>
                    ) : exMeasurement === "time" ? (
                      <div>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exInputs.rxTime}
                            onChange={(e) =>
                              handleExInputChange("rxTime", e.target.value)
                            }
                            onFocus={() => handleExInputFocus("rxTime", "00:00")}
                            onBlur={() => handleExInputBlur("rxTime", "00:00")}
                            className={cn("pr-10", errCls(!!exErrors.rxTime))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            мин
                          </span>
                        </div>
                        <FieldError msg={exErrors.rxTime} />
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-col">
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={exInputs.rxDistance}
                              onChange={(e) =>
                                handleExInputChange("rxDistance", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("rxDistance", "0")}
                              onBlur={() => handleExInputBlur("rxDistance", "0")}
                              className={cn("pr-8", errCls(!!exErrors.rxDistance))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              м
                            </span>
                          </div>
                          <FieldError msg={exErrors.rxDistance} />
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exInputs.rxDistanceWeight}
                              onChange={(e) =>
                                handleExInputChange("rxDistanceWeight", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("rxDistanceWeight", "0")}
                              onBlur={() => handleExInputBlur("rxDistanceWeight", "0")}
                              className={cn("pr-8", errCls(!!exErrors.rxDistanceWeight))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              кг
                            </span>
                          </div>
                          <FieldError msg={exErrors.rxDistanceWeight} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scaled */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Scaled (опц.)
                    </span>
                    {exMeasurement === "weight" ? (
                      <div className="flex gap-2 flex-col">
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exInputs.scWeight}
                              onChange={(e) =>
                                handleExInputChange("scWeight", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("scWeight", "0")}
                              onBlur={() => handleExInputBlur("scWeight", "0")}
                              className={cn("pr-8", errCls(!!exErrors.scWeight))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              кг
                            </span>
                          </div>
                          <FieldError msg={exErrors.scWeight} />
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              step="1"
                              value={exInputs.scReps}
                              onChange={(e) =>
                                handleExInputChange("scReps", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("scReps", "0")}
                              onBlur={() => handleExInputBlur("scReps", "0")}
                              className={cn("pr-10", errCls(!!exErrors.scReps))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              повт
                            </span>
                          </div>
                          <FieldError msg={exErrors.scReps} />
                        </div>
                      </div>
                    ) : exMeasurement === "calories" ? (
                      <div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="1"
                            value={exInputs.scCalories}
                            onChange={(e) =>
                              handleExInputChange("scCalories", e.target.value)
                            }
                            onFocus={() => handleExInputFocus("scCalories", "0")}
                            onBlur={() => handleExInputBlur("scCalories", "0")}
                            className={cn("pr-10", errCls(!!exErrors.scCalories))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кал
                          </span>
                        </div>
                        <FieldError msg={exErrors.scCalories} />
                      </div>
                    ) : exMeasurement === "time" ? (
                      <div>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exInputs.scTime}
                            onChange={(e) =>
                              handleExInputChange("scTime", e.target.value)
                            }
                            onFocus={() => handleExInputFocus("scTime", "00:00")}
                            onBlur={() => handleExInputBlur("scTime", "00:00")}
                            className={cn("pr-10", errCls(!!exErrors.scTime))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            мин
                          </span>
                        </div>
                        <FieldError msg={exErrors.scTime} />
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-col">
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={exInputs.scDistance}
                              onChange={(e) =>
                                handleExInputChange("scDistance", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("scDistance", "0")}
                              onBlur={() => handleExInputBlur("scDistance", "0")}
                              className={cn("pr-8", errCls(!!exErrors.scDistance))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              м
                            </span>
                          </div>
                          <FieldError msg={exErrors.scDistance} />
                        </div>
                        <div>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={exInputs.scDistanceWeight}
                              onChange={(e) =>
                                handleExInputChange("scDistanceWeight", e.target.value)
                              }
                              onFocus={() => handleExInputFocus("scDistanceWeight", "0")}
                              onBlur={() => handleExInputBlur("scDistanceWeight", "0")}
                              className={cn("pr-8", errCls(!!exErrors.scDistanceWeight))}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              кг
                            </span>
                          </div>
                          <FieldError msg={exErrors.scDistanceWeight} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddExercise}
                  variant="outline"
                  className="w-full mt-2">
                  <span className="flex items-center gap-2">
                    {editingIndex !== null ? (
                      <>
                        <Check className="h-4 w-4" /> Обновить упражнение
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Сохранить упражнение
                      </>
                    )}
                  </span>
                </Button>
              </div>

              {/* Exercise List */}
              {exercises.length > 0 && (
                <div className="space-y-2 mt-4">
                  {exercises.map((ex, index) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between bg-muted/40 dark:bg-gray-900/50 p-2 rounded border dark:border-gray-700 text-sm">
                      <div>
                        <span className="font-medium">{ex.name}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {ex.measurement === "weight"
                            ? `Rx: ${ex.weight || "—"}кг/${ex.repetitions || "—"} • Sc: ${ex.scWeight || "—"}кг/${ex.scReps || "—"}`
                            : ex.measurement === "calories"
                              ? `Rx: ${ex.rxCalories || "—"}кал • Sc: ${ex.scCalories || "—"}кал`
                              : ex.measurement === "time"
                                ? `Rx: ${ex.rxTime || "—"}мин • Sc: ${ex.scTime || "—"}мин`
                                : `Rx: ${ex.rxDistance || "—"}м ${ex.rxDistanceWeight && ex.rxDistanceWeight !== "0" ? `/ ${ex.rxDistanceWeight}кг` : ""} • Sc: ${ex.scDistance || "—"}м ${ex.scDistanceWeight && ex.scDistanceWeight !== "0" ? `/ ${ex.scDistanceWeight}кг` : ""}`}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30 !flex-row shrink-0"
                          onClick={() => handleEditExercise(index)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 !flex-row shrink-0"
                          onClick={() => removeExercise(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t dark:border-gray-700 bg-muted/20 dark:bg-gray-900/20">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 bg-transparent transition-colors">
              {isSubmitting ? "Создание..." : "Создать тренировку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
