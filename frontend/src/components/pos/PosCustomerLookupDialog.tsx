"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OnScreenNumpad } from "@/components/pos/OnScreenNumpad";
import { posDialogContentClassName } from "@/lib/theme/immersive";

export function PosCustomerLookupDialog({
  open,
  onOpenChange,
  phone,
  onPhoneChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={posDialogContentClassName(
          "sm:max-w-[360px] bg-transparent border-none shadow-none p-0",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Find member by phone number</DialogTitle>
        <OnScreenNumpad
          value={phone}
          onChange={onPhoneChange}
          onClose={() => onOpenChange(false)}
          onSubmit={() => {
            onOpenChange(false);
            onSubmit();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
