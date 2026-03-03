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
  const [rxWeight, setRxWeight] = useState("0")
  const [rxReps, setRxReps] = useState("0")
  const [scWeight, setScWeight] = useState("0")
  const [scReps, setScReps] = useState("0")
  const [rxCalories, setRxCalories] = useState("0")
  const [scCalories, setScCalories] = useState("0")
  const [rxTime, setRxTime] = useState("00:00")
  const [scTime, setScTime] = useState("00:00")
  const [rxDistance, setRxDistance] = useState("0")
  const [scDistance, setScDistance] = useState("0")
  const [rxDistanceWeight, setRxDistanceWeight] = useState("0")
  const [scDistanceWeight, setScDistanceWeight] = useState("0")

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
      const rawDate = (workout as any).eventDate || (workout as any).date
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
    setRxWeight("0")
    setRxReps("0")
    setScWeight("0")
    setScReps("0")
    setRxCalories("0")
    setScCalories("0")
    setRxTime("00:00")
    setScTime("00:00")
    setRxDistance("0")
    setScDistance("0")
    setRxDistanceWeight("0")
    setScDistanceWeight("0")
    setEditingId(null)
  }

  const handleAddExercise = () => {
    if (!exName.trim()) return

    const newExercise: Exercise = {
      id: editingId || Date.now().toString(),
      name: exName.trim(),
      measurement: exMeasurement,
      weight: exMeasurement === "weight" ? rxWeight : undefined,
      repetitions: exMeasurement === "weight" ? rxReps : undefined,
      scWeight: exMeasurement === "weight" ? scWeight : undefined,
      scReps: exMeasurement === "weight" ? scReps : undefined,
      rxCalories: exMeasurement === "calories" ? rxCalories : undefined,
      scCalories: exMeasurement === "calories" ? scCalories : undefined,
      rxTime: exMeasurement === "time" ? rxTime : undefined,
      scTime: exMeasurement === "time" ? scTime : undefined,
      distance: exMeasurement === "distance" ? rxDistance : undefined,
      scDistance: exMeasurement === "distance" ? scDistance : undefined,
      rxDistanceWeight: exMeasurement === "distance" ? rxDistanceWeight : undefined,
      scDistanceWeight: exMeasurement === "distance" ? scDistanceWeight : undefined,
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

    // Populate inputs
    setExName(exerciseToEdit.name)
    setExMeasurement(exerciseToEdit.measurement || "weight")
    setRxWeight(exerciseToEdit.weight || "0")
    setRxReps(exerciseToEdit.repetitions || "0")
    setScWeight(exerciseToEdit.scWeight || "0")
    setScReps(exerciseToEdit.scReps || "0")
    setRxCalories(exerciseToEdit.rxCalories || "0")
    setScCalories(exerciseToEdit.scCalories || "0")
    setRxTime(exerciseToEdit.rxTime || "00:00")
    setScTime(exerciseToEdit.scTime || "00:00")
    setRxDistance(exerciseToEdit.rxDistance || "0")
    setScDistance(exerciseToEdit.scDistance || "0")
    setRxDistanceWeight(exerciseToEdit.rxDistanceWeight || "0")
    setScDistanceWeight(exerciseToEdit.scDistanceWeight || "0")

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
                <SelectContent className="bg-white">
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

          <div className="border rounded-lg p-4 bg-muted/20 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold dark:text-white">Упражнения</h4>
              <div className="flex gap-1 bg-muted dark:bg-gray-700 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setExMeasurement("weight")}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-all",
                    exMeasurement === "weight"
                      ? "bg-background dark:bg-gray-600 shadow-sm text-foreground dark:text-white"
                      : "text-muted-foreground hover:text-foreground dark:hover:text-white",
                  )}>
                  Вес/Повторы
                </button>
                <button
                  type="button"
                  onClick={() => setExMeasurement("calories")}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-all",
                    exMeasurement === "calories"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}>
                  Калории
                </button>
                <button
                  type="button"
                  onClick={() => setExMeasurement("time")}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-all",
                    exMeasurement === "time"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}>
                  Время
                </button>
                <button
                  type="button"
                  onClick={() => setExMeasurement("distance")}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-all",
                    exMeasurement === "distance"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}>
                  Дистанция
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                value={exName || ""}
                onChange={(e) => setExName(e.target.value)}
                placeholder="Название упражнения"
                className="bg-background"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary">RX</span>
                  {exMeasurement === "weight" ? (
                    <div className="flex gap-2">
                      <Input
                        value={rxWeight || ""}
                        onChange={(e) => setRxWeight(e.target.value)}
                        placeholder="Кг"
                        className="bg-background"
                      />
                      <Input
                        value={rxReps || ""}
                        onChange={(e) => setRxReps(e.target.value)}
                        placeholder="Повт"
                        className="bg-background"
                      />
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <Input
                      value={rxCalories || ""}
                      onChange={(e) => setRxCalories(e.target.value)}
                      placeholder="Кал"
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      value={rxTime || ""}
                      onChange={(e) => setRxTime(e.target.value)}
                      placeholder="Мин"
                      className="bg-background"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground">Scaled</span>
                  {exMeasurement === "weight" ? (
                    <div className="flex gap-2">
                      <Input
                        value={scWeight || ""}
                        onChange={(e) => setScWeight(e.target.value)}
                        placeholder="Кг"
                        className="bg-background"
                      />
                      <Input
                        value={scReps || ""}
                        onChange={(e) => setScReps(e.target.value)}
                        placeholder="Повт"
                        className="bg-background"
                      />
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <Input
                      value={scCalories || ""}
                      onChange={(e) => setScCalories(e.target.value)}
                      placeholder="Кал"
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      value={scTime || ""}
                      onChange={(e) => setScTime(e.target.value)}
                      placeholder="Мин"
                      className="bg-background"
                    />
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
