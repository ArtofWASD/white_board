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
import { Plus, X, Trash2 } from "lucide-react"
import { Exercise, Team, TeamMember } from "@/types" // Ensure this type exists or definition matches
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { teamsApi } from "@/lib/api/teams"
import { Check, ChevronsUpDown } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

interface CreateWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  defaultDate?: Date
  defaultTeamId?: string
}

export function CreateWorkoutModal({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  defaultTeamId,
}: CreateWorkoutModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("09:00") // Default time
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

      // Reset Team/Athlete state
      setSelectedTeamId(defaultTeamId || "")
      setAssignmentType("all")
      setSelectedAthletes([])

      resetExerciseInput()

      // Fetch teams if user is trainer/org/admin
      if (
        user &&
        (user.role === "TRAINER" ||
          user.role === "ORGANIZATION_ADMIN" ||
          user.role === "SUPER_ADMIN")
      ) {
        fetchuserTeams()
      }
    }
  }, [isOpen, defaultDate, defaultTeamId, user])

  const fetchuserTeams = async () => {
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

  // Fetch members when team selected
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    // Construct payload matching eventsApi expectations
    // Note: eventsApi.createEvent expects { title, eventDate, exerciseType (scheme), exercises, timeCap, rounds ... }
    // We are adding 'scheduledTime' to the description or handling it separately?
    // The requirement was to show scheduledTime. The backend might not have a specific column for it yet based on EventModal analysis.
    // However, existing events often have time in 'date' if it's ISO?
    // Or we can append it to description for now or just merge into eventDate if the backend supports datetime.
    // Let's assume eventDate is ISO string including time.

    // Combine date and time
    const dateTime = new Date(`${date}T${scheduledTime}:00`).toISOString()

    const payload = {
      title,
      eventDate: dateTime, // Sending full ISO with time
      exerciseType: scheme, // Mapping scheme to exerciseType as per EventModal logic
      exercises,
      timeCap,
      rounds,
      description,
      teamId: selectedTeamId || undefined,
      assignees:
        assignmentType === "specific" && selectedAthletes.length > 0
          ? selectedAthletes
          : undefined,
    }

    onSave(payload)
    onClose()
  }

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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="например, Murph"
                required
              />
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
                <Label htmlFor="timeCap">
                  Количество времени
                </Label>
                <Input
                  id="timeCap"
                  value={timeCap}
                  onChange={(e) => setTimeCap(e.target.value)}
                  placeholder="например, 20:00 или 15 мин"
                />
              </div>
            )}
            {scheme === "EMOM" && (
              <div className="space-y-2">
                <Label htmlFor="rounds">Раунды</Label>
                <Input
                  id="rounds"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  placeholder="например, 10"
                />
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
                  <SelectContent className="bg-white">
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
                value={exName}
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
                        value={rxWeight}
                        onChange={(e) => setRxWeight(e.target.value)}
                        placeholder="Кг"
                        className="bg-background"
                      />
                      <Input
                        value={rxReps}
                        onChange={(e) => setRxReps(e.target.value)}
                        placeholder="Повт"
                        className="bg-background"
                      />
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <Input
                      value={rxCalories}
                      onChange={(e) => setRxCalories(e.target.value)}
                      placeholder="Кал"
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      value={rxTime}
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
                        value={scWeight}
                        onChange={(e) => setScWeight(e.target.value)}
                        placeholder="Кг"
                        className="bg-background"
                      />
                      <Input
                        value={scReps}
                        onChange={(e) => setScReps(e.target.value)}
                        placeholder="Повт"
                        className="bg-background"
                      />
                    </div>
                  ) : exMeasurement === "calories" ? (
                    <Input
                      value={scCalories}
                      onChange={(e) => setScCalories(e.target.value)}
                      placeholder="Кал"
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      value={scTime}
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
                          ? `Rx: ${ex.weight || "-"}кг/${ex.repetitions || "-"} • Sc: ${ex.scWeight || "-"}кг/${ex.scReps || "-"}`
                          : ex.measurement === "calories" 
                          ? `Rx: ${ex.rxCalories || "-"}кал • Sc: ${ex.scCalories || "-"}кал`
                          : `Rx: ${ex.rxTime || "-"}мин • Sc: ${ex.scTime || "-"}мин`}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 !flex-row"
                      onClick={() => handleRemoveExercise(ex.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
          <Button onClick={handleSubmit} type="button">
            Создать тренировку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
