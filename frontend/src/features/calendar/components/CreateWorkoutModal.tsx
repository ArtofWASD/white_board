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
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Exercise, Team, TeamMember } from "@/types"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { teamsApi } from "@/lib/api/teams"
import { Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// ── Validation helpers ────────────────────────────────────────────────
const isPositiveNumber = (v: string) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0)

const isPositiveInteger = (v: string) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1)

const isValidName = (v: string) => /^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?/]+$/.test(v.trim())

// ── Types ─────────────────────────────────────────────────────────────
interface FieldErrors {
  title?: string
  rounds?: string
  timeCap?: string
  // Exercise inputs
  exName?: string
  rxWeight?: string
  rxReps?: string
  rxCalories?: string
  rxTime?: string
  rxDistance?: string
  scWeight?: string
  scReps?: string
  scCalories?: string
  scTime?: string
  scDistance?: string
}

interface CreateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
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
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("09:00")
  const [scheme, setScheme] = useState("FOR_TIME")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [timeCap, setTimeCap] = useState("")
  const [rounds, setRounds] = useState("")
  const [description, setDescription] = useState("")

  const { user } = useAuthStore()
  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [assignmentType, setAssignmentType] = useState<"all" | "specific">("all")
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])

  // Exercise Input State
  const [exName, setExName] = useState("")
  const [exMeasurement, setExMeasurement] = useState<
    "weight" | "calories" | "time" | "distance"
  >("weight")
  const [rxWeight, setRxWeight] = useState("")
  const [rxReps, setRxReps] = useState("")
  const [scWeight, setScWeight] = useState("")
  const [scReps, setScReps] = useState("")
  const [rxCalories, setRxCalories] = useState("")
  const [scCalories, setScCalories] = useState("")
  const [rxTime, setRxTime] = useState("")
  const [scTime, setScTime] = useState("")
  const [rxDistance, setRxDistance] = useState("")
  const [scDistance, setScDistance] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (isOpen) {
      if (defaultDate) {
        const year = defaultDate.getFullYear()
        const month = String(defaultDate.getMonth() + 1).padStart(2, "0")
        const day = String(defaultDate.getDate()).padStart(2, "0")
        setDate(`${year}-${month}-${day}`)
      } else {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, "0")
        const day = String(now.getDate()).padStart(2, "0")
        setDate(`${year}-${month}-${day}`)
      }
      setScheduledTime("09:00")
      setTitle("")
      setScheme("FOR_TIME")
      setExercises([])
      setTimeCap("")
      setRounds("")
      setDescription("")
      setErrors({})

      setSelectedTeamId(defaultTeamId || "")
      setAssignmentType("all")
      setSelectedAthletes([])

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
  }, [isOpen, defaultDate, defaultTeamId, user])

  const fetchUserTeams = async () => {
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
    if (selectedTeamId && selectedTeamId !== "none") {
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

  const resetExerciseInput = () => {
    setExName("")
    setExMeasurement("weight")
    setRxWeight("")
    setRxReps("")
    setScWeight("")
    setScReps("")
    setRxCalories("")
    setScCalories("")
    setRxTime("")
    setScTime("")
    setRxDistance("")
    setScDistance("")
    setErrors((prev) => {
      const next = { ...prev }
      delete next.exName
      delete next.rxWeight
      delete next.rxReps
      delete next.rxCalories
      delete next.rxTime
      delete next.rxDistance
      delete next.scWeight
      delete next.scReps
      delete next.scCalories
      delete next.scTime
      delete next.scDistance
      return next
    })
  }

  // ── Validate exercise inputs ────────────────────────────────────────
  const validateExerciseInputs = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!exName.trim()) {
      newErrors.exName = "Введите название упражнения"
    } else if (exName.trim().length < 2) {
      newErrors.exName = "Минимум 2 символа"
    } else if (exName.trim().length > 100) {
      newErrors.exName = "Не более 100 символов"
    } else if (!isValidName(exName)) {
      newErrors.exName = "Недопустимые символы"
    }

    if (exMeasurement === "weight") {
      if (rxWeight && !isPositiveNumber(rxWeight))
        newErrors.rxWeight = "Введите число ≥ 0"
      if (rxReps && !isPositiveInteger(rxReps))
        newErrors.rxReps = "Введите целое число ≥ 1"
      if (scWeight && !isPositiveNumber(scWeight))
        newErrors.scWeight = "Введите число ≥ 0"
      if (scReps && !isPositiveInteger(scReps))
        newErrors.scReps = "Введите целое число ≥ 1"
    }

    if (exMeasurement === "calories") {
      if (rxCalories && !isPositiveInteger(rxCalories))
        newErrors.rxCalories = "Введите целое число ≥ 1"
      if (scCalories && !isPositiveInteger(scCalories))
        newErrors.scCalories = "Введите целое число ≥ 1"
    }

    if (exMeasurement === "time") {
      if (rxTime && !isPositiveNumber(rxTime)) newErrors.rxTime = "Введите число ≥ 0"
      if (scTime && !isPositiveNumber(scTime)) newErrors.scTime = "Введите число ≥ 0"
    }

    if (exMeasurement === "distance") {
      if (rxDistance && !isPositiveNumber(rxDistance))
        newErrors.rxDistance = "Введите число ≥ 0"
      if (scDistance && !isPositiveNumber(scDistance))
        newErrors.scDistance = "Введите число ≥ 0"
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleAddExercise = () => {
    if (!validateExerciseInputs()) return

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exName.trim(),
      measurement: exMeasurement,
      weight: rxWeight,
      repetitions: rxReps,
      scWeight,
      scReps,
      rxCalories: exMeasurement === "calories" ? rxCalories : undefined,
      scCalories: exMeasurement === "calories" ? scCalories : undefined,
      rxTime: exMeasurement === "time" ? rxTime : undefined,
      scTime: exMeasurement === "time" ? scTime : undefined,
      rxDistance: exMeasurement === "distance" ? rxDistance : undefined,
      scDistance: exMeasurement === "distance" ? scDistance : undefined,
    }

    setExercises([...exercises, newExercise])
    resetExerciseInput()
  }

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id))
  }

  const handleEditExercise = (id: string) => {
    const exerciseToEdit = exercises.find((e) => e.id === id)
    if (!exerciseToEdit) return

    setExName(exerciseToEdit.name)
    setExMeasurement(exerciseToEdit.measurement || "weight")
    setRxWeight(exerciseToEdit.weight || "")
    setRxReps(exerciseToEdit.repetitions || "")
    setScWeight(exerciseToEdit.scWeight || "")
    setScReps(exerciseToEdit.scReps || "")
    setRxCalories(exerciseToEdit.rxCalories || "")
    setScCalories(exerciseToEdit.scCalories || "")
    setRxTime(exerciseToEdit.rxTime || "")
    setScTime(exerciseToEdit.scTime || "")
    setRxDistance(exerciseToEdit.rxDistance || "")
    setScDistance(exerciseToEdit.scDistance || "")

    handleRemoveExercise(id)
  }

  // ── Validate main form ──────────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!title.trim()) {
      newErrors.title = "Введите название тренировки"
    } else if (title.trim().length < 3) {
      newErrors.title = "Минимум 3 символа"
    } else if (title.trim().length > 150) {
      newErrors.title = "Не более 150 символов"
    } else if (!isValidName(title)) {
      newErrors.title = "Недопустимые символы"
    }

    if (rounds && !isPositiveInteger(rounds)) {
      newErrors.rounds = "Введите целое число раундов ≥ 1"
    }

    if (timeCap && !isPositiveInteger(timeCap)) {
      newErrors.timeCap = "Введите целое число минут ≥ 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dateTime = new Date(`${date}T${scheduledTime}:00`).toISOString()

    const payload = {
      title: title.trim(),
      eventDate: dateTime,
      exerciseType: scheme,
      exercises,
      timeCap,
      rounds,
      description,
      teamId: selectedTeamId || undefined,
      scheme,
      assignees:
        assignmentType === "specific" && selectedAthletes.length > 0
          ? selectedAthletes
          : undefined,
    }

    onSave(payload)
    onClose()
  }

  // ── Input style helpers ─────────────────────────────────────────────
  const errCls = (hasErr: boolean) =>
    cn("bg-background", hasErr && "border-red-500 focus-visible:ring-red-500")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto gap-0 p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Создать тренировку</DialogTitle>
          <div className="sr-only">Заполните форму для создания новой тренировки</div>
        </DialogHeader>

        <div className="p-6 pt-2 flex-1 overflow-y-auto space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((p) => ({ ...p, title: undefined }))
                }}
                placeholder="например, Murph"
                maxLength={150}
                className={errCls(!!errors.title)}
              />
              <FieldError msg={errors.title} />
            </div>
            <div className="space-y-2">
              <Label>Дата и Время</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheme">Тип</Label>
              <Select value={scheme} onValueChange={setScheme}>
                <SelectTrigger id="scheme">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900">
                  <SelectItem value="FOR_TIME">На время (For Time)</SelectItem>
                  <SelectItem value="AMRAP">AMRAP</SelectItem>
                  <SelectItem value="EMOM">EMOM</SelectItem>
                  <SelectItem value="WEIGHTLIFTING">Тяжелая атлетика</SelectItem>
                  <SelectItem value="CARDIO">Кардио</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(scheme === "FOR_TIME" || scheme === "AMRAP" || scheme === "CARDIO") && (
              <div className="space-y-2">
                <Label htmlFor="timeCap">Кол-во минут (тайм-кап)</Label>
                <Input
                  id="timeCap"
                  type="number"
                  min="1"
                  step="1"
                  value={timeCap}
                  onChange={(e) => {
                    setTimeCap(e.target.value)
                    if (errors.timeCap) setErrors((p) => ({ ...p, timeCap: undefined }))
                  }}
                  placeholder="например, 20"
                  className={errCls(!!errors.timeCap)}
                />
                <FieldError msg={errors.timeCap} />
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
                  value={rounds}
                  onChange={(e) => {
                    setRounds(e.target.value)
                    if (errors.rounds) setErrors((p) => ({ ...p, rounds: undefined }))
                  }}
                  placeholder="например, 10"
                  className={errCls(!!errors.rounds)}
                />
                <FieldError msg={errors.rounds} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительные заметки..."
              maxLength={500}
            />
          </div>

          {/* Team & Athlete Selection */}
          {(user?.role === "TRAINER" ||
            user?.role === "ORGANIZATION_ADMIN" ||
            user?.role === "SUPER_ADMIN") && (
            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-select">Команда</Label>
                <Select
                  value={selectedTeamId}
                  onValueChange={(val) => setSelectedTeamId(val)}>
                  <SelectTrigger id="team-select" className="bg-background">
                    <SelectValue placeholder="Выберите команду..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="none">Личная тренировка</SelectItem>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeamId && selectedTeamId !== "none" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Назначить:</Label>
                    <RadioGroup
                      value={assignmentType}
                      onValueChange={(val: "all" | "specific") => setAssignmentType(val)}
                      className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="r-all" />
                        <Label htmlFor="r-all" className="font-normal cursor-pointer">
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
                                    setSelectedAthletes(
                                      selectedAthletes.filter(
                                        (id) => id !== member.user.id,
                                      ),
                                    )
                                  } else {
                                    setSelectedAthletes([
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
                                    ({member.role === "OWNER" ? "Владелец" : "Участник"})
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
          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Упражнения</h4>
              <div className="flex gap-1 bg-muted rounded-md p-1">
                {(["weight", "calories", "time", "distance"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setExMeasurement(m)
                      // Clear only the numeric fields, keep exercise name and new measurement
                      setRxWeight("")
                      setRxReps("")
                      setScWeight("")
                      setScReps("")
                      setRxCalories("")
                      setScCalories("")
                      setRxTime("")
                      setScTime("")
                      setRxDistance("")
                      setScDistance("")
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.rxWeight
                        delete next.rxReps
                        delete next.scWeight
                        delete next.scReps
                        delete next.rxCalories
                        delete next.scCalories
                        delete next.rxTime
                        delete next.scTime
                        delete next.rxDistance
                        delete next.scDistance
                        return next
                      })
                    }}
                    className={cn(
                      "px-2 py-1 text-xs rounded-sm transition-all",
                      exMeasurement === m
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}>
                    {m === "weight"
                      ? "Вес/Повторы"
                      : m === "calories"
                        ? "Калории"
                        : m === "time"
                          ? "Время"
                          : "Дистанция"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {/* Exercise name */}
              <div>
                <Input
                  value={exName}
                  onChange={(e) => {
                    setExName(e.target.value)
                    if (errors.exName) setErrors((p) => ({ ...p, exName: undefined }))
                  }}
                  placeholder="Название упражнения"
                  maxLength={100}
                  className={errCls(!!errors.exName)}
                />
                <FieldError msg={errors.exName} />
              </div>

              {/* Numeric inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* RX */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary">RX</span>
                  {exMeasurement === "weight" ? (
                    <div className="flex gap-2 flex-col">
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={rxWeight}
                          onChange={(e) => {
                            setRxWeight(e.target.value)
                            if (errors.rxWeight)
                              setErrors((p) => ({ ...p, rxWeight: undefined }))
                          }}
                          placeholder="Кг"
                          className={errCls(!!errors.rxWeight)}
                        />
                        <FieldError msg={errors.rxWeight} />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={rxReps}
                          onChange={(e) => {
                            setRxReps(e.target.value)
                            if (errors.rxReps)
                              setErrors((p) => ({ ...p, rxReps: undefined }))
                          }}
                          placeholder="Повт"
                          className={errCls(!!errors.rxReps)}
                        />
                        <FieldError msg={errors.rxReps} />
                      </div>
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <div>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={rxCalories}
                        onChange={(e) => {
                          setRxCalories(e.target.value)
                          if (errors.rxCalories)
                            setErrors((p) => ({ ...p, rxCalories: undefined }))
                        }}
                        placeholder="Кал"
                        className={errCls(!!errors.rxCalories)}
                      />
                      <FieldError msg={errors.rxCalories} />
                    </div>
                  ) : exMeasurement === "time" ? (
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={rxTime}
                        onChange={(e) => {
                          setRxTime(e.target.value)
                          if (errors.rxTime)
                            setErrors((p) => ({ ...p, rxTime: undefined }))
                        }}
                        placeholder="Мин"
                        className={errCls(!!errors.rxTime)}
                      />
                      <FieldError msg={errors.rxTime} />
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={rxDistance}
                        onChange={(e) => {
                          setRxDistance(e.target.value)
                          if (errors.rxDistance)
                            setErrors((p) => ({ ...p, rxDistance: undefined }))
                        }}
                        placeholder="Метры (м)"
                        className={errCls(!!errors.rxDistance)}
                      />
                      <FieldError msg={errors.rxDistance} />
                    </div>
                  )}
                </div>

                {/* Scaled */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground">Scaled</span>
                  {exMeasurement === "weight" ? (
                    <div className="flex gap-2 flex-col">
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={scWeight}
                          onChange={(e) => {
                            setScWeight(e.target.value)
                            if (errors.scWeight)
                              setErrors((p) => ({ ...p, scWeight: undefined }))
                          }}
                          placeholder="Кг"
                          className={errCls(!!errors.scWeight)}
                        />
                        <FieldError msg={errors.scWeight} />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={scReps}
                          onChange={(e) => {
                            setScReps(e.target.value)
                            if (errors.scReps)
                              setErrors((p) => ({ ...p, scReps: undefined }))
                          }}
                          placeholder="Повт"
                          className={errCls(!!errors.scReps)}
                        />
                        <FieldError msg={errors.scReps} />
                      </div>
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <div>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={scCalories}
                        onChange={(e) => {
                          setScCalories(e.target.value)
                          if (errors.scCalories)
                            setErrors((p) => ({ ...p, scCalories: undefined }))
                        }}
                        placeholder="Кал"
                        className={errCls(!!errors.scCalories)}
                      />
                      <FieldError msg={errors.scCalories} />
                    </div>
                  ) : exMeasurement === "time" ? (
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={scTime}
                        onChange={(e) => {
                          setScTime(e.target.value)
                          if (errors.scTime)
                            setErrors((p) => ({ ...p, scTime: undefined }))
                        }}
                        placeholder="Мин"
                        className={errCls(!!errors.scTime)}
                      />
                      <FieldError msg={errors.scTime} />
                    </div>
                  ) : (
                    <div>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={scDistance}
                        onChange={(e) => {
                          setScDistance(e.target.value)
                          if (errors.scDistance)
                            setErrors((p) => ({ ...p, scDistance: undefined }))
                        }}
                        placeholder="Метры (м)"
                        className={errCls(!!errors.scDistance)}
                      />
                      <FieldError msg={errors.scDistance} />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddExercise}
                variant="outline"
                className="w-full">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Добавить упражнение
                </span>
              </Button>
            </div>

            {/* Exercise List */}
            {exercises.length > 0 && (
              <div className="space-y-2 mt-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between bg-background p-2 rounded border text-sm">
                    <div>
                      <span className="font-medium">{ex.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {ex.measurement === "weight"
                          ? `Rx: ${ex.weight || "—"}кг/${ex.repetitions || "—"} • Sc: ${ex.scWeight || "—"}кг/${ex.scReps || "—"}`
                          : ex.measurement === "calories"
                            ? `Rx: ${ex.rxCalories || "—"}кал • Sc: ${ex.scCalories || "—"}кал`
                            : ex.measurement === "time"
                              ? `Rx: ${ex.rxTime || "—"}мин • Sc: ${ex.scTime || "—"}мин`
                              : `Rx: ${ex.rxDistance || "—"}м • Sc: ${ex.scDistance || "—"}м`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-white dark:hover:text-white dark:hover:bg-transparent !flex-row"
                        onClick={() => handleEditExercise(ex.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-white dark:hover:text-white dark:hover:bg-transparent !flex-row"
                        onClick={() => handleRemoveExercise(ex.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} type="button">
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            type="button"
            variant="outline"
            className="border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800 bg-transparent transition-colors">
            Создать тренировку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
