import { cn } from "@/lib/utils";

/** Root shell for 80mm thermal receipt preview + print. */
export function receiptRootClassName(className?: string) {
  return cn("receipt-root", className);
}

export function receiptHeaderClassName(className?: string) {
  return cn("receipt-header", className);
}

export function receiptDocTypeClassName(className?: string) {
  return cn("receipt-doc-type", className);
}

export function receiptEmphasisClassName(className?: string) {
  return cn("receipt-emphasis", className);
}

export function receiptBranchClassName(className?: string) {
  return cn("receipt-header-branch", className);
}

export function receiptTitleClassName(className?: string) {
  return cn("receipt-title", className);
}

export function receiptSubtleClassName(className?: string) {
  return cn("receipt-subtle", className);
}

export function receiptMutedClassName(className?: string) {
  return cn("receipt-muted", className);
}

export function receiptSectionDividerClassName(className?: string) {
  return cn("receipt-section-divider", className);
}

export function receiptQueueBoxClassName(className?: string) {
  return cn("receipt-queue-box", className);
}

export function receiptRowClassName(className?: string) {
  return cn("receipt-row", className);
}

export function receiptTableClassName(className?: string) {
  return cn("receipt-table", className);
}

export function receiptTableHeadRowClassName(className?: string) {
  return cn("receipt-table-head-row", className);
}

export function receiptItemNameClassName(className?: string) {
  return cn("receipt-item-name", className);
}

export function receiptItemNoteClassName(className?: string) {
  return cn("receipt-item-note", className);
}

export function receiptTotalsClassName(className?: string) {
  return cn("receipt-totals", className);
}

export function receiptVatRowClassName(className?: string) {
  return cn("receipt-vat-row", className);
}

export function receiptPaymentSectionClassName(className?: string) {
  return cn("receipt-payment-section", className);
}

export function receiptTotalRowClassName(className?: string) {
  return cn("receipt-total-row", className);
}

export function receiptFooterClassName(className?: string) {
  return cn("receipt-footer", className);
}

export function receiptBarcodeBoxClassName(className?: string) {
  return cn("receipt-barcode-box", className);
}

export function receiptIconClassName(className?: string) {
  return cn("receipt-icon", className);
}
