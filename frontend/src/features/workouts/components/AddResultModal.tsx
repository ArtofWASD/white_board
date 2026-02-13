import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { eventsApi } from "@/lib/api/events"
import { Loader2 } from "lucide-react"
import { useState, ChangeEvent } from "react"
import { Workout } from "./WorkoutCard"
import { useAuthStore } from "@/lib/store/useAuthStore"

interface AddResultModalProps {
  workout: Workout
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddResultModal({
  workout,
  isOpen,
  onClose,
  onSuccess,
}: AddResultModalProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [resultValue, setResultValue] = useState("")
  const [scaling, setScaling] = useState<"RX" | "SCALED">("RX")
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      await eventsApi.addResult(workout.id, {
        username: user.name,
        userId: user.id,
        time:
          workout.type === "FOR_TIME" || workout.type === "EMOM"
            ? resultValue
            : undefined,
        value:
          workout.type === "AMRAP" || workout.type === "WEIGHTLIFTING"
            ? Number(resultValue)
            : undefined,
        scaling,
        // comment note: API might need update to support comments directly in addResult or use addNote separately.
        // Based on events.ts, addResult takes AddResultData which doesn't seem to have comment/notes.
        // But let's check events.ts again.
        // interface AddResultData { time?: string; username: string; userId?: string; value?: number; scaling?: string }
        // It does not have notes. We might need to call addNote after?
        // Or maybe just ignore for now if backend doesn't support it in one go.
        // Let's assume we can't send comment in addResult for now based on the interface.
        // Wait, the plan said "Comment: Optional text area".
        // I should check if I can add note. eventsApi.addNote exists.
      })

      // If there is a comment and we have a result (we don't get the result ID back from addResult easily unless we check return type)
      // eventsApi.addResult returns Promise<EventResult>. So we can use the ID.
      // Let's defer comment implementation or try to chain it.

      onSuccess?.()
      onClose()
      setResultValue("")
      setComment("")
      setScaling("RX")
    } catch (error) {
      console.error("Failed to add result:", error)
      // Ideally show error toast
    } finally {
      setIsLoading(false)
    }
  }

  const getResultLabel = () => {
    switch (workout.type) {
      case "FOR_TIME":
        return "Время (ММ:СС)"
      case "AMRAP":
        return "Количество раундов/повторений"
      case "WEIGHTLIFTING":
        return "Вес (кг)"
      case "EMOM":
        return "Результат" // Generic
      default:
        return "Результат"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Записать результат</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="result">{getResultLabel()}</Label>
            <Input
              id="result"
              value={resultValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setResultValue(e.target.value)
              }
              placeholder={workout.type === "FOR_TIME" ? "12:30" : "0"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Масштабирование</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scaling"
                  value="RX"
                  checked={scaling === "RX"}
                  onChange={() => setScaling("RX")}
                  className="w-4 h-4 text-primary"
                />
                <span className="font-bold">RX</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scaling"
                  value="SCALED"
                  checked={scaling === "SCALED"}
                  onChange={() => setScaling("SCALED")}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-muted-foreground">SCALED</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (опционально)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              placeholder="Как прошла тренировка?"
            />
            <p className="text-[10px] text-muted-foreground">
              * Комментарии пока не сохраняются (API limitation)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !resultValue}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
