import React, { forwardRef } from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm outline-none transition-all
              ${
                error
                  ? "border-destructive focus:ring-2 focus:ring-destructive"
                  : "border-input focus:ring-2 focus:ring-ring focus:border-primary hover:border-muted-foreground"
              }
              ${disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-background text-foreground"}
              ${className}
            `}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p
            className={`text-xs mt-1 ${error ? "text-destructive" : "text-muted-foreground"}`}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = "Textarea"
