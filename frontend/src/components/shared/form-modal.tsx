"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formDialogContentClassName, typeHeadingClassName } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface FormModalProps {
  title: string;
  icon?: LucideIcon;
  /** Optional icon color class (defaults to indigo metric). */
  iconClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number | string;
  /** @deprecated No-op — Dialog unmounts content when closed. */
  destroyOnHidden?: boolean;
  /** @deprecated No-op — kept for API compatibility. */
  forceRender?: boolean;
}

export function FormModal({
  title,
  icon: Icon,
  iconClassName = "text-[var(--metric-indigo)]",
  isOpen,
  onClose,
  children,
  width = 800,
}: FormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={formDialogContentClassName(width)} showCloseButton>
        <DialogHeader>
          <DialogTitle className={cn(typeHeadingClassName(), "flex items-center gap-2 text-lg")}>
            {Icon && <Icon className={cn("w-5 h-5 shrink-0", iconClassName)} aria-hidden />}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

type FormModalFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Standard modal footer — primary/cancel actions aligned right. */
export function FormModalFooter({ children, className }: FormModalFooterProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
