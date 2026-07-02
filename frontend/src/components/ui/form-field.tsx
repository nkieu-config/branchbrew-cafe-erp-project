"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { SelectTrigger } from "@/components/ui/select"
import { formFieldErrorMessageClassName, formFieldInvalidClassName } from "@/lib/theme/color-helpers"
import { cn } from "@/lib/utils"

type FormFieldContextValue = {
  id: string
  error?: string
  disabled?: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

function useFormField() {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error("FormField subcomponents must be used within <FormField>")
  }
  return context
}

type FormFieldProps = {
  id: string
  error?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function FormField({ id, error, disabled = false, className, children }: FormFieldProps) {
  return (
    <FormFieldContext.Provider value={{ id, error, disabled }}>
      <div
        data-slot="form-field"
        data-disabled={disabled ? "true" : undefined}
        className={cn("flex flex-col gap-field", className)}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

function FormFieldLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { id } = useFormField()
  return (
    <Label htmlFor={id} className={className} {...props}>
      {children}
    </Label>
  )
}

function FormFieldControl({ children }: { children: React.ReactElement<Record<string, unknown>> }) {
  const { id, error, disabled } = useFormField()
  const childProps = children.props as Record<string, unknown>

  return React.cloneElement(children, {
    id,
    disabled: disabled || Boolean(childProps.disabled),
    "aria-invalid": error ? true : childProps["aria-invalid"],
    "aria-describedby": error ? `${id}-error` : childProps["aria-describedby"],
  })
}

/**
 * SelectTrigger wired to FormField context — use inside <Select> instead of raw SelectTrigger
 * so aria-invalid, invalid border, and label association work with portaled menus.
 */
function FormFieldSelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  const { id, error, disabled } = useFormField()

  return (
    <SelectTrigger
      id={id}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(className, formFieldInvalidClassName(!!error))}
      {...props}
    >
      {children}
    </SelectTrigger>
  )
}

function FormFieldTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  const { id, error, disabled } = useFormField()

  return (
    <textarea
      id={id}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(formFieldInvalidClassName(!!error), className)}
      {...props}
    />
  )
}

function FormFieldError({ className }: { className?: string }) {
  const { id, error } = useFormField()
  if (!error) return null

  return (
    <p
      id={`${id}-error`}
      className={cn(formFieldErrorMessageClassName(), className)}
      role="alert"
    >
      {error}
    </p>
  )
}

export {
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldLabel,
  FormFieldSelectTrigger,
  FormFieldTextarea,
  useFormField,
}
