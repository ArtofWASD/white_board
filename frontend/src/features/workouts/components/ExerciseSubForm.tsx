import { useState } from "react"
import { Plus, Trash2, Edit2, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { cn } from "@/lib/utils"
import { UseFieldArrayReturn, UseFormReturn } from "react-hook-form"
import { WorkoutFormValues, exerciseInputSchema } from "../schemas/workoutFormSchema"
import { FieldError, errCls } from "./WorkoutFormFields"

interface ExerciseSubFormProps {
  form: UseFormReturn<WorkoutFormValues>
  exercisesFieldArray: UseFieldArrayReturn<WorkoutFormValues, "exercises", "id">
}

export function ExerciseSubForm({ form, exercisesFieldArray }: ExerciseSubFormProps) {
  const {
    formState: { errors },
  } = form
  const {
    fields: exercises,
    append: appendExercise,
    remove: removeExercise,
    update: updateExercise,
  } = exercisesFieldArray

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

  return (
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
        <div className="text-xs uppercase text-muted-foreground mb-1">Добавить</div>
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
              }}>
              <SelectTrigger
                className={cn("w-full text-base sm:text-sm font-medium", errCls(false))}>
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
                      onChange={(e) => handleExInputChange("rxWeight", e.target.value)}
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
                      onChange={(e) => handleExInputChange("rxReps", e.target.value)}
                      onFocus={() => handleExInputFocus("rxReps", "0")}
                      onBlur={() => handleExInputBlur("rxReps", "0")}
                      className={cn("pr-12", errCls(!!exErrors.rxReps))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      повт
                    </span>
                  </div>
                  <FieldError msg={exErrors.rxReps} />
                </div>
              </div>
            ) : exMeasurement === "calories" ? (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    value={exInputs.rxCalories}
                    onChange={(e) => handleExInputChange("rxCalories", e.target.value)}
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
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={exInputs.rxTime}
                    onChange={(e) => handleExInputChange("rxTime", e.target.value)}
                    onFocus={() => handleExInputFocus("rxTime", "0")}
                    onBlur={() => handleExInputBlur("rxTime", "0")}
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
                      onChange={(e) => handleExInputChange("rxDistance", e.target.value)}
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
            <span className="text-xs font-bold text-muted-foreground">Scaled (опц.)</span>
            {exMeasurement === "weight" ? (
              <div className="flex gap-2 flex-col">
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exInputs.scWeight}
                      onChange={(e) => handleExInputChange("scWeight", e.target.value)}
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
                      onChange={(e) => handleExInputChange("scReps", e.target.value)}
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
                  onChange={(e) => handleExInputChange("scCalories", e.target.value)}
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
                      onChange={(e) => handleExInputChange("scDistance", e.target.value)}
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
            {editingIndex !== null ? (
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
          {exercises.map((ex, index) => (
            <div
              key={ex.id}
              className="flex items-center justify-between bg-[var(--card)] p-2 rounded border shadow-sm text-sm">
              <div>
                <span className="font-medium text-[var(--foreground)]">{ex.name}</span>
                <div className="text-xs text-muted-foreground">
                  {ex.measurement === "weight"
                    ? `Rx: ${ex.weight || "-"}кг/${ex.repetitions || "-"} • Sc: ${ex.scWeight || "-"}кг/${ex.scReps || "-"}`
                    : ex.measurement === "calories"
                      ? `Rx: ${ex.rxCalories || "-"}кал • Sc: ${ex.scCalories || "-"}кал`
                      : ex.measurement === "time"
                        ? `Rx: ${ex.rxTime || "-"}мин • Sc: ${ex.scTime || "-"}мин`
                        : `Rx: ${ex.rxDistance || "-"}м (${ex.rxDistanceWeight || "-"}кг) • Sc: ${ex.scDistance || "-"}м (${ex.scDistanceWeight || "-"}кг)`}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleEditExercise(index)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => removeExercise(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
