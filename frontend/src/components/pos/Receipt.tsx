import React, { forwardRef } from "react";
import { Coffee } from "lucide-react";
import type { ReceiptOrder } from "@/types/api";
import { formatDateTime } from "@/lib/intl-date";
import { formatMoney } from "@/lib/money";
import { formatQueueNumber } from "@/lib/queue";
import { inclusiveTaxAmount } from "@/lib/vat";
import {
  receiptBarcodeBoxClassName,
  receiptFooterClassName,
  receiptHeaderClassName,
  receiptBranchClassName,
  receiptDocTypeClassName,
  receiptEmphasisClassName,
  receiptIconClassName,
  receiptItemNameClassName,
  receiptItemNoteClassName,
  receiptMutedClassName,
  receiptPaymentSectionClassName,
  receiptQueueBoxClassName,
  receiptRootClassName,
  receiptRowClassName,
  receiptSectionDividerClassName,
  receiptSubtleClassName,
  receiptTableClassName,
  receiptTableHeadRowClassName,
  receiptTitleClassName,
  receiptTotalRowClassName,
  receiptTotalsClassName,
  receiptVatRowClassName,
} from "@/lib/theme";

export interface ReceiptSettings {
  companyName?: string;
  taxId?: string;
  vatRate?: number;
  receiptFooter?: string;
}

export const Receipt = forwardRef<
  HTMLDivElement,
  { order: ReceiptOrder; branchName?: string; settings?: ReceiptSettings }
>(({ order, branchName, settings }, ref) => {
  if (!order) return null;

  const vatRate = settings?.vatRate ?? 7;
  const vatAmount = inclusiveTaxAmount(order.netTotal ?? 0, vatRate);
  const companyName = settings?.companyName || "QAFA CAFE";
  const taxId = settings?.taxId || "010556XXXXXX0";
  const footer = settings?.receiptFooter || "Thank You For Visiting!";
  const date = formatDateTime(new Date());

  return (
    <div ref={ref} className={receiptRootClassName("print:shadow-none shadow-lg")}>
      <div className={receiptHeaderClassName()}>
        <div className="flex justify-center mb-0.5">
          <Coffee size={24} className={receiptIconClassName()} aria-hidden />
        </div>
        <h2 className={receiptTitleClassName()}>{companyName.toUpperCase()}</h2>
        <p className={receiptBranchClassName()}>{branchName || "Headquarters"}</p>
        <p className={receiptSubtleClassName()}>TAX ID: {taxId}</p>
        <p className={receiptDocTypeClassName()}>TAX INVOICE / RECEIPT</p>
      </div>

      <div className={receiptSectionDividerClassName()}>
        {order.queueNumber != null && order.queueNumber > 0 && (
          <div className={receiptQueueBoxClassName()}>
            QUEUE #{formatQueueNumber(order.queueNumber)}
          </div>
        )}
        <div className={receiptRowClassName()}>
          <span>Date: {date}</span>
          <span>Ref: #{order.id || "N/A"}</span>
        </div>
        <div className={receiptRowClassName()}>
          <span>
            Cashier:{" "}
            {typeof order.cashier === "string" ? order.cashier : order.cashier?.name || "System"}
          </span>
          <span>POS: 01</span>
        </div>
        {order.customerName && (
          <div className="mt-0.5">
            <span>Member: {order.customerName}</span>
          </div>
        )}
      </div>

      <table className={receiptTableClassName()}>
        <thead>
          <tr className={receiptTableHeadRowClassName()}>
            <th className="w-[60%] text-left">Item</th>
            <th className="w-[15%] text-center">Qty</th>
            <th className="w-[25%] text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-0.5 align-top break-words pr-1">
                <div className={receiptItemNameClassName()}>{item.product.name}</div>
                {item.notes && (
                  <div className={receiptItemNoteClassName()}>- {item.notes}</div>
                )}
              </td>
              <td className="text-center align-top py-0.5">{item.quantity}</td>
              <td className="text-right align-top py-0.5">
                {(item.product.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={receiptTotalsClassName()}>
        <div className={receiptRowClassName()}>
          <span>Subtotal</span>
          <span>{order.subtotal?.toFixed(2)}</span>
        </div>
        {order.discount != null && order.discount > 0 && (
          <div className={receiptRowClassName()}>
            <span>Discount</span>
            <span>-฿{(order.discount || 0).toFixed(2)}</span>
          </div>
        )}
        <div className={receiptVatRowClassName()}>
          <span>VAT ({vatRate}% Included)</span>
          <span>{formatMoney(vatAmount)}</span>
        </div>
        <div className={receiptTotalRowClassName()}>
          <span>NET TOTAL</span>
          <span>{order.netTotal?.toFixed(2)} THB</span>
        </div>
      </div>

      <div className={receiptPaymentSectionClassName()}>
        <div className={receiptRowClassName()}>
          <span>Payment Method</span>
          <span>QR / Cash</span>
        </div>
      </div>

      <div className={receiptFooterClassName()}>
        <div className={receiptBarcodeBoxClassName()}>
          ||| | || |||| | ||| ||
          <br />
          {String(order.id).padStart(10, "0")}
        </div>
        <p className={receiptEmphasisClassName("m-0")}>{footer}</p>
        <p className={receiptMutedClassName("mt-0.5 mb-0")}>Powered by QafaCafe ERP</p>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";
