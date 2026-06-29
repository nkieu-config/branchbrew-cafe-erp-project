"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { hubModalIconClassName } from "@/lib/theme/color-helpers";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { organizationDialogWideClassName } from "@/lib/theme/organization";
import { formFieldInsetClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type UserFormModalProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  branches: Branch[];
  onSubmit: (payload: {
    name: string;
    email: string;
    password?: string;
    role: Role;
    branchId: number | null;
    employmentType: EmploymentType;
    hourlyRate: number;
    baseSalary: number;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function UserFormModal({
  open,
  onClose,
  user,
  branches,
  onSubmit,
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
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRole((user?.role as Role) ?? "STAFF");
    setBranchId(user?.branchId ? String(user.branchId) : "0");
    setEmploymentType((user?.employmentType as EmploymentType) ?? "PART_TIME");
    setHourlyRate(
      user?.hourlyRate != null && user.hourlyRate > 0 ? String(user.hourlyRate) : "50",
    );
    setBaseSalary(
      user?.baseSalary != null && user.baseSalary > 0 ? String(user.baseSalary) : "0",
    );
  }, [open, user]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || (!user && !password.trim())) {
      toast.error("Name, email, and password are required for new users");
      return;
    }
    if (!user && password.trim().length < 6) {
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

    await onSubmit({
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={organizationDialogWideClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <ShieldCheck className={hubModalIconClassName("organization")} aria-hidden />
            {user ? "Edit user account" : "Create user account"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update access role, branch assignment, or reset the password. Leave password blank to keep the current one."
              : "Provision login credentials and assign a branch. Compensation defaults can be refined later in HR."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-full-name" className={text.secondary}>
                Full name
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
              {user && <span className={text.muted}>(leave blank to keep current)</span>}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete={user ? "new-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={user ? "••••••••" : "Minimum 6 characters"}
              className={formFieldInsetClassName()}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-role" className={text.secondary}>
                System role
              </Label>
              <Select value={role} onValueChange={(value) => value && setRole(value as Role)}>
                <SelectTrigger id="user-role" className={formFieldInsetClassName("w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="STAFF">Staff — POS &amp; basic apps</SelectItem>
                  <SelectItem value="MANAGER">Manager — approvals &amp; reports</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin — full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-branch" className={text.secondary}>
                Assigned branch
              </Label>
              <Select value={branchId} onValueChange={(value) => value != null && setBranchId(value)}>
                <SelectTrigger id="user-branch" className={formFieldInsetClassName("w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value="0">All branches (HQ / Admin)</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-employment-type" className={text.secondary}>
                Employment type
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
                  <SelectItem value="PART_TIME">Part-time (hourly)</SelectItem>
                  <SelectItem value="FULL_TIME">Full-time (salaried)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-compensation" className={text.secondary}>
                {employmentType === "PART_TIME" ? "Hourly rate (THB)" : "Monthly base salary (THB)"}
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className={cn("min-h-[44px]", hubCtaClassName("organization"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {user ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
