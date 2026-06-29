"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Receipt, User as UserIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HubPageHeader } from "@/components/shared/hub-card";
import { HubListPage } from "@/components/shared/hub-list-page";
import { ListFilterSelect } from "@/components/shared/list-filters";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PayrollRunsTable } from "@/components/hr/PayrollRunsTable";
import {
  useApprovePayrollRun,
  useGeneratePayrollRun,
  useHrUsers,
  usePayrollRuns,
} from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { buildHrEmployeesUrl, buildHrPayrollUrl, parseHrPayrollSearchParams } from "@/lib/hr-hub-url";
import { formatBaht } from "@/lib/money";
import { formatHubListCountWithFetching } from "@/lib/format-hub-list-count";
import { getErrorMessage } from "@/lib/errors";
import {
  type PayrollRunWithPayslips,
  type PayrollStatusFilter,
  filterPayrollRuns,
  formatPayrollPeriod,
  hasPayrollRunForMonth,
  payrollRunPayslipCount,
  payrollRunTotalNet,
  summarizePayrollRuns,
} from "@/lib/payroll-filters";
import { infoBannerClassName, infoBannerIconClassName, infoBannerTextClassName, infoBannerTitleClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { hrSectionPanelClassName } from "@/lib/theme/hub-hr";
import { cn } from "@/lib/utils";
import type { Branch, User } from "@/types/api";

export default function PayrollPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBranchId } = useAuth();
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;

  const employeeId = useMemo(
    () => parseHrPayrollSearchParams(searchParams).employeeId,
    [searchParams],
  );

  const { data: branches = [] } = useBranches();
  const branchName = (branches as Branch[]).find((b) => b.id === branchIdNum)?.name;
  const { data: hrUsers = [] } = useHrUsers(branchIdNum);

  const {
    data: payrollRuns = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePayrollRuns(branchIdNum);

  const generatePayrollMutation = useGeneratePayrollRun();
  const approvePayrollMutation = useApprovePayrollRun();

  const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>("ALL");
  const [approveTarget, setApproveTarget] = useState<PayrollRunWithPayslips | null>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentPeriodLabel = formatPayrollPeriod(currentMonth, currentYear);

  const filteredEmployee = employeeId != null
    ? (hrUsers as User[]).find((employee) => employee.id === employeeId)
    : undefined;

  const summary = useMemo(
    () => summarizePayrollRuns(payrollRuns as PayrollRunWithPayslips[]),
    [payrollRuns],
  );

  const filteredPayrollRuns = useMemo(
    () =>
      filterPayrollRuns(payrollRuns as PayrollRunWithPayslips[], {
        statusFilter,
        employeeId,
      }),
    [payrollRuns, statusFilter, employeeId],
  );

  const defaultExpandedRowKeys = useMemo(() => {
    if (employeeId == null) return undefined;
    return filteredPayrollRuns.map((run) => run.id);
  }, [employeeId, filteredPayrollRuns]);

  const hasCurrentMonthRun = hasPayrollRunForMonth(
    payrollRuns as PayrollRunWithPayslips[],
    currentMonth,
    currentYear,
  );

  const hasActiveFilters = statusFilter !== "ALL" || employeeId != null;

  const clearEmployeeFilter = () => {
    router.replace(buildHrPayrollUrl(), { scroll: false });
  };

  const handleGenerate = async () => {
    if (!branchIdNum) return;
    try {
      await generatePayrollMutation.mutateAsync({
        branchId: branchIdNum,
        month: currentMonth,
        year: currentYear,
      });
      toast.success(`Payroll generated for ${currentPeriodLabel}`);
      setShowGenerateConfirm(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to generate payroll"));
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approvePayrollMutation.mutateAsync(id);
      toast.success("Payroll run approved");
      setApproveTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to approve payroll"));
    }
  };

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to generate and manage payroll." />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <HubPageHeader
          hideTitle
          icon={Receipt}
          accentHub="hr"
          branchScope={{ branchName }}
          actions={
            <Button
              className={hubCtaClassName("hr")}
              disabled={hasCurrentMonthRun || generatePayrollMutation.isPending}
              onClick={() => setShowGenerateConfirm(true)}
            >
              {generatePayrollMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                  Generating…
                </>
              ) : (
                <>Generate {currentPeriodLabel}</>
              )}
            </Button>
          }
        />

        <HubListPage className={hrSectionPanelClassName()}>
          {employeeId != null && (
            <HubListPage.Banner>
              <div className={infoBannerClassName()}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <UserIcon className={infoBannerIconClassName()} aria-hidden />
                    <div className="min-w-0">
                      <p className={infoBannerTitleClassName()}>
                        Payroll for {filteredEmployee?.name ?? `employee #${employeeId}`}
                      </p>
                      <p className={infoBannerTextClassName()}>
                        Showing runs that include this employee. Expand a row to view their payslip
                        lines only.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      href={buildHrEmployeesUrl({ employee: employeeId })}
                      className={cn("text-sm font-medium", inlineLinkClassName())}
                    >
                      Employee profile
                    </Link>
                    <button
                      type="button"
                      className={cn("text-sm font-medium", inlineLinkClassName())}
                      onClick={clearEmployeeFilter}
                    >
                      Clear filter
                    </button>
                  </div>
                </div>
              </div>
            </HubListPage.Banner>
          )}

          {summary.draft > 0 && (
            <HubListPage.Banner>
              <div className={infoBannerClassName()}>
                <div className="flex items-start gap-3">
                  <Receipt className={infoBannerIconClassName()} aria-hidden />
                  <div>
                    <p className={infoBannerTitleClassName()}>Draft payroll awaiting approval</p>
                    <p className={infoBannerTextClassName()}>
                      {summary.draft} run{summary.draft === 1 ? "" : "s"} still in draft — review
                      payslips and approve before disbursement.
                    </p>
                  </div>
                </div>
              </div>
            </HubListPage.Banner>
          )}

          <HubListPage.Error
            message={isError ? getErrorMessage(error, "Failed to load payroll runs") : undefined}
            onRetry={() => void refetch()}
            loading={isFetching}
          />

          <HubListPage.Toolbar
            showReset={hasActiveFilters}
            onReset={() => {
              setStatusFilter("ALL");
              clearEmployeeFilter();
            }}
            filters={
              <ListFilterSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as PayrollStatusFilter)}
                ariaLabel="Filter payroll runs by status"
                widthClassName="w-full sm:w-[180px]"
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "PAID", label: "Paid" },
                ]}
              />
            }
          />

          <HubListPage.Count
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            actions={
              <Link
                href="/hr/employees"
                className={cn("inline-flex items-center gap-1 text-sm font-medium", inlineLinkClassName())}
              >
                <Users className="w-3.5 h-3.5" aria-hidden />
                Employee directory
              </Link>
            }
          >
            {formatHubListCountWithFetching(
              (() => {
                const base = hasActiveFilters
                  ? `${filteredPayrollRuns.length} of ${payrollRuns.length} runs`
                  : summary.total > 0
                    ? `${summary.total} run${summary.total === 1 ? "" : "s"} · ${summary.totalPayslips} payslip${summary.totalPayslips === 1 ? "" : "s"}`
                    : "No payroll runs yet";
                return summary.totalNet > 0 && !hasActiveFilters
                  ? `${base} · ${formatBaht(summary.totalNet)} total net`
                  : base;
              })(),
              isFetching,
              isLoading,
            )}
          </HubListPage.Count>

          <PayrollRunsTable
            payrollRuns={filteredPayrollRuns}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            hasCurrentMonthRun={hasCurrentMonthRun}
            currentPeriodLabel={currentPeriodLabel}
            employeeId={employeeId}
            employeeName={filteredEmployee?.name}
            defaultExpandedRowKeys={defaultExpandedRowKeys}
            onApprove={setApproveTarget}
          />
        </HubListPage>
      </div>

      <ConfirmDialog
        open={showGenerateConfirm}
        onOpenChange={setShowGenerateConfirm}
        title={`Generate payroll for ${currentPeriodLabel}?`}
        description="This creates a draft run from clocked attendance hours at this branch. You can review payslips before approving."
        confirmLabel="Generate"
        loading={generatePayrollMutation.isPending}
        onConfirm={handleGenerate}
      />

      <ConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve this payroll run?"
        description={
          approveTarget
            ? `${formatPayrollPeriod(approveTarget.month, approveTarget.year)} · ${formatBaht(payrollRunTotalNet(approveTarget))} net · ${payrollRunPayslipCount(approveTarget)} payslip${payrollRunPayslipCount(approveTarget) === 1 ? "" : "s"}`
            : undefined
        }
        confirmLabel="Approve"
        loading={approvePayrollMutation.isPending}
        onConfirm={async () => {
          if (approveTarget) await handleApprove(approveTarget.id);
        }}
      />
    </>
  );
}
