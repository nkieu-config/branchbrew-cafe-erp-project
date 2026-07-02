"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCreateCustomer } from "@/hooks/domains/useCrmQueries";
import { getErrorMessage } from "@/lib/errors";
import {
  normalizePhoneInput,
  validateCustomerFields,
  type CustomerFieldErrors,
} from "@/lib/crm/register-customer-validation";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { crmDialogContentClassName } from "@/lib/theme/hub-crm";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { formFieldInvalidClassName } from "@/lib/theme/color-helpers";

export function RegisterCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({});
  const createMutation = useCreateCustomer();

  const clearFieldError = (field: keyof CustomerFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setFieldErrors({});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateCustomerFields({ name, phone });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const trimmedName = name.trim();
    const normalizedPhone = normalizePhoneInput(phone);

    try {
      await createMutation.mutateAsync({ name: trimmedName, phone: normalizedPhone });
      toast.success("Customer created!");
      resetForm();
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create customer"));
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className={hubCtaClassName("crm", "font-medium")}>
            <UserPlus className="w-4 h-4 mr-2" aria-hidden />
            Add member
          </Button>
        }
      />
      <DialogContent className={crmDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-lg")}>Add member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="flex flex-col gap-stack pt-2" noValidate>
          <FormField id="customer-name" error={fieldErrors.name}>
            <FormFieldLabel className={text.secondary}>Name</FormFieldLabel>
            <FormFieldControl>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                }}
                placeholder="e.g. John Doe"
                className={formFieldInsetClassName(formFieldInvalidClassName(!!fieldErrors.name))}
              />
            </FormFieldControl>
            <FormFieldError />
          </FormField>

          <FormField id="customer-phone" error={fieldErrors.phone}>
            <FormFieldLabel className={text.secondary}>Phone</FormFieldLabel>
            <FormFieldControl>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError("phone");
                }}
                placeholder="e.g. 0812345678"
                inputMode="tel"
                autoComplete="tel"
                className={formFieldInsetClassName(formFieldInvalidClassName(!!fieldErrors.phone))}
              />
            </FormFieldControl>
            <FormFieldError />
          </FormField>

          <Button
            type="submit"
            className={hubCtaClassName("crm", "w-full text-md")}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding…" : "Add member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
