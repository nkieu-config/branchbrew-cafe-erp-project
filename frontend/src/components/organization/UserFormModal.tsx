"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Branch, EmploymentType, Role, User } from "@/types/api";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { organizationDialogWideClassName } from "@/lib/theme/organization";
import { formFieldInsetClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

export type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  role: Role;
  branchId: number | null;
  employmentType: EmploymentType;
  hourlyRate: number;
  baseSalary: number;
};

type UserFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: User | null;
  branches: Branch[];
  onSave: (payload: UserFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function UserFormModal({
  open,
  onOpenChange,
  initialValues,
  branches,
  onSave,
  isSubmitting = false,
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [branchId, setBranchId] = useState("0");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("PART_TIME");
  const [hourlyRate, setHourlyRate] = useState("50");
  const [baseSalary, setBaseSalary] = useState("0");

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setEmail(initialValues?.email ?? "");
    setPassword("");
    setRole((initialValues?.role as Role) ?? "STAFF");
    setBranchId(initialValues?.branchId ? String(initialValues.branchId) : "0");
    setEmploymentType((initialValues?.employmentType as EmploymentType) ?? "PART_TIME");
    setHourlyRate(
      initialValues?.hourlyRate != null && initialValues.hourlyRate > 0 ? String(initialValues.hourlyRate) : "50",
    );
    setBaseSalary(
      initialValues?.baseSalary != null && initialValues.baseSalary > 0 ? String(initialValues.baseSalary) : "0",
    );
  }, [open, initialValues]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || (!initialValues && !password.trim())) {
      toast.error("Name, email, and password are required for new users");
      return;
    }
    if (!initialValues && password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const parsedHourlyRate = Number(hourlyRate);
    const parsedBaseSalary = Number(baseSalary);
    if (
      !Number.isFinite(parsedHourlyRate) ||
      parsedHourlyRate < 0 ||
      !Number.isFinite(parsedBaseSalary) ||
      parsedBaseSalary < 0
    ) {
      toast.error("Enter valid compensation amounts");
      return;
    }

    await onSave({
      name: trimmedName,
      email: trimmedEmail,
      password: password.trim() || undefined,
      role,
      branchId: branchId === "0" ? null : Number(branchId),
      employmentType,
      hourlyRate: parsedHourlyRate,
      baseSalary: parsedBaseSalary,
    });
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} className={organizationDialogWideClassName()}>
      <FormDialog.Title>{initialValues ? "Edit user" : "Add user"}</FormDialog.Title>
      <FormDialog.Body className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-full-name" className={text.secondary}>
                Name
              </Label>
              <Input
                id="user-full-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Somchai Jai-dee"
                className={formFieldInsetClassName()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email" className={text.secondary}>
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="somchai@branchbrew.dev"
                className={formFieldInsetClassName()}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password" className={text.secondary}>
              Password{" "}
              {initialValues && <span className={text.muted}>(leave blank to keep)</span>}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={initialValues ? "••••••••" : "Minimum 6 characters"}
              className={formFieldInsetClassName()}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--table-row-border)] pt-4">
            <div className="space-y-2">
              <Label htmlFor="user-role" className={text.secondary}>
                Role
              </Label>
              <Select value={role} onValueChange={(value) => value && setRole(value as Role)}>
                <SelectTrigger id="user-role" className={formFieldInsetClassName("w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-branch" className={text.secondary}>
                Branch
              </Label>
              <Select value={branchId} onValueChange={(value) => value != null && setBranchId(value)}>
                <SelectTrigger id="user-branch" className={formFieldInsetClassName("w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="0">All branches (HQ)</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--table-row-border)] pt-4">
            <div className="space-y-2">
              <Label htmlFor="user-employment-type" className={text.secondary}>
                Employment
              </Label>
              <Select
                value={employmentType}
                onValueChange={(value) => {
                  if (value === "PART_TIME" || value === "FULL_TIME") {
                    setEmploymentType(value);
                  }
                }}
              >
                <SelectTrigger
                  id="user-employment-type"
                  className={formFieldInsetClassName("w-full")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-compensation" className={text.secondary}>
                {employmentType === "PART_TIME" ? "Hourly rate" : "Monthly salary"}
              </Label>
              <Input
                id="user-compensation"
                type="number"
                min={0}
                step="0.01"
                value={employmentType === "PART_TIME" ? hourlyRate : baseSalary}
                onChange={(event) => {
                  if (employmentType === "PART_TIME") {
                    setHourlyRate(event.target.value);
                  } else {
                    setBaseSalary(event.target.value);
                  }
                }}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
      </FormDialog.Body>

      <FormDialog.Footer className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className={cn("min-h-[44px]", hubCtaClassName("organization"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {initialValues ? "Save" : "Create"}
          </Button>
      </FormDialog.Footer>
    </FormDialog>
  );
}
