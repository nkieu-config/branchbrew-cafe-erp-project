"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Form, Select, InputNumber, Tag, Button as AntButton, Popconfirm } from "antd";
import { Plus, CheckCircle2, ArrowRightLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { useIngredients } from "@/hooks/domains/useProductionQueries";
import {
  useTransfers,
  useCreateTransfer,
  useAcceptTransfer,
} from "@/hooks/domains/useTransferQueries";
import { FormModal } from "@/components/shared/form-modal";
import { DataTable } from "@/components/shared/data-table";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { Button } from "@/components/ui/button";
import type { Branch, Ingredient, StockTransfer } from "@/types/api";

type SourceInventory = { ingredient: Ingredient; stock: number };

interface StockTransfersPanelProps {
  mode: "full" | "compact";
  /** When compact, limit ingredient picker to branch stock on hand. */
  sourceInventories?: SourceInventory[];
}

function transferStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
}

export function StockTransfersPanel({
  mode,
  sourceInventories,
}: StockTransfersPanelProps) {
  const { user, activeBranchId } = useAuth();
  const branchId = activeBranchId ?? undefined;

  const { data: transfersData, isLoading: loadingTransfers } =
    useTransfers(branchId);
  const { data: branchesData, isLoading: loadingBranches } = useBranches();
  const { data: ingredientsData, isLoading: loadingIng } = useIngredients();

  const transfers = (transfersData as StockTransfer[]) || [];
  const branches = branchesData || [];
  const allIngredients = ingredientsData || [];

  const createMutation = useCreateTransfer();
  const acceptMutation = useAcceptTransfer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loading = loadingTransfers || loadingBranches || loadingIng;

  const visibleTransfers = useMemo(() => {
    if (mode === "full") return transfers;
    if (!branchId) return transfers.filter((t) => t.status === "PENDING");
    return transfers.filter(
      (t) =>
        t.status === "PENDING" &&
        (t.toBranchId === branchId || t.fromBranchId === branchId),
    );
  }, [transfers, mode, branchId]);

  const canAccept = (transfer: StockTransfer) => {
    if (transfer.status !== "PENDING") return false;
    if (user?.role === "SUPER_ADMIN") return true;
    return !!branchId && transfer.toBranchId === branchId;
  };

  const ingredientOptions = useMemo(() => {
    if (sourceInventories?.length) {
      return sourceInventories
        .filter((i) => i.stock > 0)
        .map((i) => ({
          value: i.ingredient.id,
          label: `${i.ingredient.name} (max ${i.stock} ${i.ingredient.unit})`,
        }));
    }
    return allIngredients.map((i: Ingredient) => ({
      value: i.id,
      label: `${i.name} (${i.unit})`,
    }));
  }, [sourceInventories, allIngredients]);

  const handleCreateSubmit = async (values: {
    fromBranchId?: number;
    toBranchId: number;
    ingredientId: number;
    quantity: number;
  }) => {
    const fromBranchId = branchId ?? values.fromBranchId;
    if (!fromBranchId) {
      toast.error("Select a source branch");
      return;
    }
    if (fromBranchId === values.toBranchId) {
      toast.error("Source and destination must differ");
      return;
    }

    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        fromBranchId,
        toBranchId: values.toBranchId,
        ingredientId: values.ingredientId,
        quantity: values.quantity,
      });
      toast.success("Transfer requested");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (transferId: number) => {
    try {
      await acceptMutation.mutateAsync(transferId);
      toast.success("Transfer accepted — inventory updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept transfer");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        mode === "compact" ? (
          format(new Date(date), "dd MMM HH:mm")
        ) : (
          format(new Date(date), "dd MMM yyyy HH:mm")
        ),
    },
    {
      title: "From",
      dataIndex: ["fromBranch", "name"],
      key: "from",
      render: (text: string) => <Tag color="blue">{text || "HQ"}</Tag>,
    },
    {
      title: "To",
      dataIndex: ["toBranch", "name"],
      key: "to",
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "Ingredient",
      key: "ingredient",
      render: (_: unknown, record: StockTransfer) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {record.ingredient?.name}{" "}
          <span className="text-slate-400 font-normal">
            ({record.quantity} {record.ingredient?.unit})
          </span>
        </span>
      ),
    },
    ...(mode === "full"
      ? [
          {
            title: "Requested by",
            dataIndex: ["requestedBy", "name"],
            key: "requestedBy",
            render: (text: string) => (
              <span className="text-slate-500">{text}</span>
            ),
          },
        ]
      : []),
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={transferStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: StockTransfer) => {
        if (canAccept(record)) {
          return (
            <Popconfirm
              title="Confirm receiving this transfer?"
              onConfirm={() => void handleAccept(record.id)}
            >
              <AntButton
                type="primary"
                size="small"
                className="bg-emerald-500 hover:bg-emerald-600 border-none font-bold"
                icon={<CheckCircle2 className="w-3 h-3" />}
              >
                Accept
              </AntButton>
            </Popconfirm>
          );
        }
        if (
          record.status === "PENDING" &&
          branchId &&
          record.fromBranchId === branchId
        ) {
          return (
            <span className="text-xs text-slate-400">
              Awaiting {record.toBranch?.name}
            </span>
          );
        }
        return null;
      },
    },
  ];

  const openCreate = () => {
    form.resetFields();
    if (branchId) {
      form.setFieldsValue({ fromBranchId: branchId });
    }
    setIsModalOpen(true);
  };

  if (mode === "full" && !branchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to request and manage stock transfers." />
    );
  }

  return (
    <div className={mode === "full" ? "space-y-6" : "space-y-3"}>
      {mode === "compact" && (
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-500" /> Pending Transfers
          </h2>
          <div className="flex gap-2">
            {branchId && (
              <Button variant="outline" size="sm" onClick={openCreate}>
                New transfer
              </Button>
            )}
            <Link
              href="/procurement/transfers"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              All transfers <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {mode === "full" && (
        <div className="flex justify-end">
          <AntButton
            type="primary"
            className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4 rounded-lg shadow-sm font-bold"
            icon={<Plus className="w-4 h-4" />}
            onClick={openCreate}
          >
            Request Transfer
          </AntButton>
        </div>
      )}

      <div
        className={
          mode === "full"
            ? "bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
            : undefined
        }
      >
        <DataTable
          columns={columns}
          dataSource={visibleTransfers}
          rowKey="id"
          loading={loading}
          pagination={mode === "full" ? { pageSize: 15 } : { pageSize: 5 }}
        />
      </div>

      <FormModal
        title="Request Stock Transfer"
        icon={ArrowRightLeft}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          className="mt-6"
        >
          {!branchId && (
            <Form.Item
              label="From branch (source)"
              name="fromBranchId"
              rules={[{ required: true, message: "Source branch is required" }]}
            >
              <Select
                showSearch
                placeholder="Select source branch"
                options={branches.map((b: Branch) => ({
                  value: b.id,
                  label: b.name,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            label="To branch (destination)"
            name="toBranchId"
            rules={[{ required: true, message: "Destination branch is required" }]}
          >
            <Select
              showSearch
              placeholder="Select destination branch"
              options={branches
                .filter((b: Branch) => b.id !== branchId)
                .map((b: Branch) => ({ value: b.id, label: b.name }))}
            />
          </Form.Item>

          <Form.Item
            label="Ingredient"
            name="ingredientId"
            rules={[{ required: true, message: "Ingredient is required" }]}
          >
            <Select
              showSearch
              placeholder="Select ingredient"
              options={ingredientOptions}
            />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Quantity is required" }]}
          >
            <InputNumber min={0.1} step={0.1} className="w-full" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-8">
            <AntButton onClick={() => setIsModalOpen(false)}>Cancel</AntButton>
            <AntButton
              type="primary"
              htmlType="submit"
              className="bg-indigo-600"
              loading={submitting}
            >
              Request Transfer
            </AntButton>
          </div>
        </Form>
      </FormModal>
    </div>
  );
}
