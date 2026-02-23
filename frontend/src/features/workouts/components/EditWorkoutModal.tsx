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
  const { user } = useAuthStore()

  // Exercise Input State
  const [exName, setExName] = useState("")
  const [exMeasurement, setExMeasurement] = useState<"weight" | "calories" | "time">("weight")
  const [rxWeight, setRxWeight] = useState("")
  const [rxReps, setRxReps] = useState("")
  const [scWeight, setScWeight] = useState("")
  const [scReps, setScReps] = useState("")
  const [rxCalories, setRxCalories] = useState("")
  const [scCalories, setScCalories] = useState("")
  const [rxTime, setRxTime] = useState("")
  const [scTime, setScTime] = useState("")

  useEffect(() => {
    if (isOpen && workout) {
      setTitle(workout.title || "")
      setScheme(workout.type || "FOR_TIME")
      setDescription(workout.description || "")
      setTimeCap(workout.timeCap || "")
      setRounds(workout.rounds || "")
      setScheduledTime(workout.scheduledTime || "09:00")
      // Check if workout has exercises (e.g. from WorkoutCard or WorkoutDetail)
      // Some properties might be undefined if `Workout` type does not include them, so fallback gracefully
      if ((workout as any).exercises) {
          setExercises((workout as any).exercises)
      }

      // We still fetch the full event to ensure we have the most accurate data,
      // specifically the original date/exercises structure.
      fetchFullEvent()
    }
  }, [isOpen, workout])

  const fetchFullEvent = async () => {
    try {
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

        setScheme(fullEvent.scheme || fullEvent.exerciseType || workout.type || "FOR_TIME")
        setDescription(fullEvent.description || workout.description || "")
        setTimeCap(fullEvent.timeCap || workout.timeCap || "")
        setRounds(fullEvent.rounds || workout.rounds || "")
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
    setRxWeight("")
    setRxReps("")
    setScWeight("")
    setScReps("")
    setRxCalories("")
    setScCalories("")
    setRxTime("")
    setScTime("")
  }

  const handleAddExercise = () => {
    if (!exName.trim()) return

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

    // Populate inputs
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

    // Remove from list so it can be re-added
    handleRemoveExercise(id)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto gap-0 p-0 flex flex-col">
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

          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Упражнения</h4>
              <div className="flex gap-1 bg-muted rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setExMeasurement("weight")}
                  className={cn(
                    "px-2 py-1 text-xs rounded-sm transition-all",
                    exMeasurement === "weight"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
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
                  <Plus className="h-4 w-4" /> Добавить
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
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-black dark:hover:bg-gray-800 transition-colors !flex-row"
                        onClick={() => handleEditExercise(ex.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300 dark:bg-black dark:hover:bg-gray-800 transition-colors !flex-row"
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
            className="dark:bg-black dark:text-white dark:hover:bg-gray-800 transition-colors"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            type="button" 
            variant="outline"
            className="border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800 bg-transparent transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
