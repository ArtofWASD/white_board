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
import { Plus, Trash2, Edit2, Check } from "lucide-react"
import { Exercise } from "@/types"
import { cn } from "@/lib/utils"
import { eventsApi } from "@/lib/api/events"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { useAuthStore } from "@/lib/store/useAuthStore"

interface EditWorkoutModalProps {
  workout: Workout
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditWorkoutModal({
  workout,
  isOpen,
  onClose,
  onSuccess,
}: EditWorkoutModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("09:00")
  const [scheme, setScheme] = useState("FOR_TIME")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [timeCap, setTimeCap] = useState("")
  const [rounds, setRounds] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Exercise Input State
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
    rxTime: "0",
    scTime: "0",
    rxDistance: "0",
    scDistance: "0",
    rxDistanceWeight: "0",
    scDistanceWeight: "0",
  })

  useEffect(() => {
    if (isOpen && workout) {
      setTitle(workout.title || "")
      setScheme(workout.type || "FOR_TIME")
      setDescription(workout.description || "")
      setTimeCap(workout.timeCap || "")
      setRounds(workout.rounds || "")
      setScheduledTime(workout.scheduledTime || "09:00")

      // Initialize date if available in workout object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawDate = (workout as any).eventDate || workout.date
      if (rawDate) {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          setDate(`${year}-${month}-${day}`)
        } else {
          setDate(rawDate)
        }
      }

      // Check if workout has exercises (e.g. from WorkoutCard or WorkoutDetail)
      // Some properties might be undefined if `Workout` type does not include them, so fallback gracefully
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((workout as any).exercises) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExercises((workout as any).exercises)
      }

      // We still fetch the full event to ensure we have the most accurate data,
      // specifically the original date/exercises structure.
      fetchFullEvent()
    }
  }, [isOpen, workout])

  const fetchFullEvent = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fullEvent: any = await eventsApi.getEvent(workout.id)
      if (fullEvent) {
        setTitle(fullEvent.title || workout.title || "")

        // Grab the date
        const rawDate = fullEvent.eventDate || fullEvent.date
        const d = new Date(rawDate)

        // fallback parsing
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          setDate(`${year}-${month}-${day}`)

          const hours = String(d.getHours()).padStart(2, "0")
          const minutes = String(d.getMinutes()).padStart(2, "0")
          setScheduledTime(`${hours}:${minutes}`)
        } else if (rawDate) {
          // fallback if it's just a YYYY-MM-DD string
          setDate(rawDate)
        }

        setScheme(
          fullEvent.scheme || fullEvent.exerciseType || workout.type || "FOR_TIME",
        )
        setDescription(fullEvent.description || workout.description || "")
        setTimeCap(fullEvent.timeCap || workout.timeCap || "")
        setRounds(fullEvent.rounds || workout.rounds || "")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExercises(fullEvent.exercises || (workout as any).exercises || [])
      }
    } catch (error) {
      console.error("Failed to fetch full event details for editing:", error)
      // Fallbacks if fetch fails
      setTitle(workout.title || "")
      setScheme(workout.type || "FOR_TIME")
      setDescription(workout.description || "")
      setTimeCap(workout.timeCap || "")
      setRounds(workout.rounds || "")
    }
  }

  const resetExerciseInput = () => {
    setExName("")
    setExMeasurement("weight")
    setExInputs({
      rxWeight: "0",
      rxReps: "0",
      scWeight: "0",
      scReps: "0",
      rxCalories: "0",
      scCalories: "0",
      rxTime: "0",
      scTime: "0",
      rxDistance: "0",
      scDistance: "0",
      rxDistanceWeight: "0",
      scDistanceWeight: "0",
    })
    setEditingId(null)
  }

  const handleExInputChange = (field: string, value: string) => {
    setExInputs((prev) => ({ ...prev, [field]: value }))
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
    if (!exName.trim()) return

    const newExercise: Exercise = {
      id: editingId || Date.now().toString(),
      name: exName.trim(),
      measurement: exMeasurement,
      weight: exMeasurement === "weight" ? exInputs.rxWeight : "",
      repetitions: exMeasurement === "weight" ? exInputs.rxReps : "",
      scWeight: exMeasurement === "weight" ? exInputs.scWeight || "0" : undefined,
      scReps: exMeasurement === "weight" ? exInputs.scReps || "0" : undefined,
      rxCalories: exMeasurement === "calories" ? exInputs.rxCalories : undefined,
      scCalories: exMeasurement === "calories" ? exInputs.scCalories || "0" : undefined,
      rxTime: exMeasurement === "time" ? exInputs.rxTime : undefined,
      scTime: exMeasurement === "time" ? exInputs.scTime || "0" : undefined,
      rxDistance: exMeasurement === "distance" ? exInputs.rxDistance : undefined,
      scDistance: exMeasurement === "distance" ? exInputs.scDistance || "0" : undefined,
      rxDistanceWeight:
        exMeasurement === "distance" ? exInputs.rxDistanceWeight : undefined,
      scDistanceWeight:
        exMeasurement === "distance" ? exInputs.scDistanceWeight || "0" : undefined,
    }

    if (editingId) {
      setExercises(exercises.map((e) => (e.id === editingId ? newExercise : e)))
      setEditingId(null)
    } else {
      setExercises([...exercises, newExercise])
    }

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
    setExInputs({
      rxWeight: exerciseToEdit.weight || "0",
      rxReps: exerciseToEdit.repetitions || "0",
      scWeight: exerciseToEdit.scWeight || "0",
      scReps: exerciseToEdit.scReps || "0",
      rxCalories: exerciseToEdit.rxCalories || "0",
      scCalories: exerciseToEdit.scCalories || "0",
      rxTime: exerciseToEdit.rxTime || "0",
      scTime: exerciseToEdit.scTime || "0",
      rxDistance: exerciseToEdit.rxDistance || "0",
      scDistance: exerciseToEdit.scDistance || "0",
      rxDistanceWeight: exerciseToEdit.rxDistanceWeight || "0",
      scDistanceWeight: exerciseToEdit.scDistanceWeight || "0",
    })

    setEditingId(id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (!title.trim()) {
      alert("Пожалуйста, введите название")
      return
    }
    if (!date) {
      alert("Пожалуйста, выберите дату")
      return
    }

    setIsSubmitting(true)

    try {
      const dateTime = new Date(`${date}T${scheduledTime}:00`).toISOString()

      const payload = {
        userId: workout.userId || user?.id || "",
        title,
        eventDate: dateTime,
        exerciseType: scheme,
        exercises,
        timeCap,
        rounds,
        description,
        scheme,
      }

      await eventsApi.updateEvent(workout.id, payload)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to update event:", error)
      alert("Ошибка при сохранении изменений")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto gap-0 p-0 flex flex-col max-sm:bottom-auto max-sm:top-[40%] max-sm:translate-y-[-50%]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Редактировать тренировку</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Murph"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Дата и Время *</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={date || ""}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  type="time"
                  value={scheduledTime || ""}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-24"
                  required
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
                <SelectContent>
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
                <Label htmlFor="timeCap">Количество времени</Label>
                <Input
                  id="timeCap"
                  value={timeCap || ""}
                  onChange={(e) => setTimeCap(e.target.value)}
                  placeholder="Например, 20:00 или 15 мин"
                />
              </div>
            )}
            {scheme === "EMOM" && (
              <div className="space-y-2">
                <Label htmlFor="rounds">Раунды</Label>
                <Input
                  id="rounds"
                  value={rounds || ""}
                  onChange={(e) => setRounds(e.target.value)}
                  placeholder="Например, 10"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Input
              id="description"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительные заметки..."
            />
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Упражнения</h4>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    value={exName || ""}
                    onChange={(e) => setExName(e.target.value)}
                    placeholder="Название упражнения"
                    className="bg-background"
                  />
                </div>
                <div className="w-full sm:w-[180px]">
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
                        rxTime: "0",
                        scTime: "0",
                        rxDistance: "0",
                        scDistance: "0",
                        rxDistanceWeight: "0",
                        scDistanceWeight: "0",
                      })
                    }}>
                    <SelectTrigger className="w-full text-base sm:text-sm font-medium bg-background">
                      <SelectValue placeholder="Тип упражнения" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Вес/Повторы</SelectItem>
                      <SelectItem value="calories">Калории</SelectItem>
                      <SelectItem value="time">Время</SelectItem>
                      <SelectItem value="distance">Дистанция</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кг
                          </span>
                        </div>
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
                            className="pr-12 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            повт
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : exMeasurement === "calories" ? (
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
                        className="pr-10 bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        кал
                      </span>
                    </div>
                  ) : exMeasurement === "time" ? (
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exInputs.rxTime}
                        onChange={(e) => handleExInputChange("rxTime", e.target.value)}
                        onFocus={() => handleExInputFocus("rxTime", "0")}
                        onBlur={() => handleExInputBlur("rxTime", "0")}
                        className="pr-10 bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        мин
                      </span>
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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            м
                          </span>
                        </div>
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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кг
                          </span>
                        </div>
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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кг
                          </span>
                        </div>
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
                            className="pr-12 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            повт
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : exMeasurement === "calories" ? (
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
                        className="pr-10 bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        кал
                      </span>
                    </div>
                  ) : exMeasurement === "time" ? (
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exInputs.scTime}
                        onChange={(e) => handleExInputChange("scTime", e.target.value)}
                        onFocus={() => handleExInputFocus("scTime", "0")}
                        onBlur={() => handleExInputBlur("scTime", "0")}
                        className="pr-10 bg-background"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        мин
                      </span>
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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            м
                          </span>
                        </div>
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
                            className="pr-8 bg-background"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            кг
                          </span>
                        </div>
                      </div>
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
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" /> Обновить упражнение
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Добавить
                    </>
                  )}
                </span>
              </Button>
            </div>

            {exercises && exercises.length > 0 && (
              <div className="space-y-2 mt-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between bg-background p-2 rounded border text-sm">
                    <div>
                      <span className="font-medium">{ex.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {ex.measurement === "weight"
                          ? `Rx: ${ex.weight || "-"}кг/${ex.repetitions || "-"} • Sc: ${ex.scWeight || "-"}кг/${ex.scReps || "-"}`
                          : ex.measurement === "calories"
                            ? `Rx: ${ex.rxCalories || "-"}кал • Sc: ${ex.scCalories || "-"}кал`
                            : `Rx: ${ex.rxTime || "-"}мин • Sc: ${ex.scTime || "-"}мин`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors !flex-row"
                        onClick={() => handleEditExercise(ex.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors !flex-row"
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
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            type="button"
            variant="outline"
            className="border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 bg-transparent transition-colors"
            disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
