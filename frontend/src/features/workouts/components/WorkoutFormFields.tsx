import { UseFormReturn, Controller } from "react-hook-form"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { cn } from "@/lib/utils"
import { WorkoutFormValues } from "../schemas/workoutFormSchema"

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
}

export const errCls = (hasErr: boolean) =>
  cn("bg-background", hasErr && "border-red-500 focus-visible:ring-red-500")

interface WorkoutFormFieldsProps {
  form: UseFormReturn<WorkoutFormValues>
}

export function WorkoutFormFields({ form }: WorkoutFormFieldsProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form

  const scheme = watch("scheme")

  return (
    <>
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
        {(scheme === "EMOM" || scheme === "FOR_TIME") && (
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
    </>
  )
}
