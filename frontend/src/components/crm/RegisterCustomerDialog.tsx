"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCreateCustomer } from "@/hooks/domains/useCrmQueries";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function RegisterCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const createMutation = useCreateCustomer();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await createMutation.mutateAsync({ name, phone });
      toast.success("Customer created!");
      setName("");
      setPhone("");
      setOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create customer"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="customer-name" className={text.secondary}>
              Name
            </Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. John Doe"
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone" className={text.secondary}>
              Phone
            </Label>
            <Input
              id="customer-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="e.g. 0812345678"
              className={formFieldInsetClassName()}
            />
          </div>
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
