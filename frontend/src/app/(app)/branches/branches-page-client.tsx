"use client";

import { useMemo, useState } from "react";
import { Building2, Loader2, MapPin, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranches, useCreateBranch, useUpdateBranch } from "@/hooks/domains/useGeneralQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AnimatedPage } from "@/components/animated-page";
import { HubPageHeader } from "@/components/shared/hub-card";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { QueryErrorBanner } from "@/components/shared/query-error-banner";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { OrganizationHubLinks } from "@/components/organization/OrganizationHubLinks";
import { BranchFormModal } from "@/components/organization/BranchFormModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type BranchTypeFilter,
  branchTypeLabel,
  filterBranches,
  summarizeBranches,
} from "@/lib/branch-filters";
import { getErrorMessage } from "@/lib/errors";
import type { Branch } from "@/types/api";
import {
  branchCardAccentClassName,
  branchCardClassName,
  branchCardMetaClassName,
  branchLegendSwatchClassName,
  emptyStatePanelClassName,
  formSelectContentClassName,
  hubCtaClassName,
  hubLoadingSpinnerClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inventorySummaryStripClassName,
  listToolbarFieldClassName,
  metricValueClassName,
  organizationSectionPanelClassName,
  organizationSummaryChipClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function BranchesPageClient({ embedded = false }: { embedded?: boolean }) {
  const {
    data: branches,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);
  const [typeFilter, setTypeFilter] = useState<BranchTypeFilter>("ALL");

  const branchList = (branches as Branch[] | undefined) ?? [];
  const summary = useMemo(() => summarizeBranches(branchList), [branchList]);

  const filteredBranches = useMemo(
    () =>
      filterBranches(branchList, {
        typeFilter,
        search: debouncedSearch,
      }),
    [branchList, typeFilter, debouncedSearch],
  );

  const hasActiveFilters = search.trim().length > 0 || typeFilter !== "ALL";

  const toggleTypeFilter = (next: BranchTypeFilter) => {
    setTypeFilter((current) => (current === next ? "ALL" : next));
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: {
    name: string;
    location?: string;
    isCentralKitchen?: boolean;
  }) => {
    try {
      if (editingBranch) {
        await updateMutation.mutateAsync({ id: editingBranch.id, ...payload });
        toast.success("Branch updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Branch created");
      }
      setIsModalOpen(false);
      setEditingBranch(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save branch"));
      throw err;
    }
  };

  const content = (
    <div className={cn("space-y-6 w-full", embedded ? "max-w-5xl" : "max-w-5xl mx-auto")}>
      <HubPageHeader
        hideTitle
        accentHub="organization"
        description="Manage franchise locations and central kitchens across the organization."
        actions={
          <OrganizationHubLinks current="branches">
            <Button
              className={hubCtaClassName("organization", "font-bold min-h-[44px]")}
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Add branch
            </Button>
          </OrganizationHubLinks>
        }
      />

      <div className={organizationSectionPanelClassName()}>
        {!isLoading && !isError && summary.total === 0 && (
          <div className={infoBannerClassName()}>
            <div className="flex items-start gap-3">
              <Building2 className={infoBannerIconClassName()} aria-hidden />
              <div>
                <p className={infoBannerTitleClassName()}>No branches yet</p>
                <p className={infoBannerTextClassName()}>
                  Create your first branch or central kitchen, then assign users in{" "}
                  <span className="font-medium">Users &amp; Roles</span> and stock in Inventory.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isError && summary.total > 0 && (
          <div
            className={inventorySummaryStripClassName()}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={cn("font-semibold tabular-nums", text.primary)}>
              {summary.total} branch{summary.total === 1 ? "" : "es"}
            </span>
            {summary.centralKitchen > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  typeFilter === "central",
                  metricValueClassName("amber"),
                )}
                onClick={() => toggleTypeFilter("central")}
              >
                {summary.centralKitchen} central kitchen
                {summary.centralKitchen === 1 ? "" : "s"}
              </button>
            )}
            {summary.franchise > 0 && (
              <button
                type="button"
                className={organizationSummaryChipClassName(
                  typeFilter === "franchise",
                  text.muted,
                )}
                onClick={() => toggleTypeFilter("franchise")}
              >
                {summary.franchise} franchise
                {summary.franchise === 1 ? "" : "s"}
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && summary.total > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-subtle)]">
            <span className="font-medium uppercase tracking-wide">Legend</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={branchLegendSwatchClassName("central")} aria-hidden />
              Central kitchen (HQ)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={branchLegendSwatchClassName("franchise")} aria-hidden />
              Franchise location
            </span>
          </div>
        )}

        {isError && (
          <QueryErrorBanner
            message={getErrorMessage(error, "Failed to load branches.")}
            onRetry={() => void refetch()}
            loading={isFetching}
          />
        )}

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, location, ID…"
          showReset={hasActiveFilters}
          onReset={resetFilters}
          filters={
            <Select
              value={typeFilter}
              onValueChange={(value) => value && setTypeFilter(value as BranchTypeFilter)}
            >
              <SelectTrigger
                className={listToolbarFieldClassName("w-full sm:w-[180px]")}
                aria-label="Filter by branch type"
              >
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="central">Central kitchen</SelectItem>
                <SelectItem value="franchise">Franchise</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className={cn("w-8 h-8", hubLoadingSpinnerClassName())} aria-hidden />
            <span className="sr-only">Loading branches</span>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className={emptyStatePanelClassName()}>
            <Building2
              className={cn("w-12 h-12 mx-auto mb-4", metricValueClassName("slate"))}
              aria-hidden
            />
            <p className={cn("font-semibold", text.primary)}>
              {hasActiveFilters ? "No branches match your filters" : "No branches yet"}
            </p>
            <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>
              {hasActiveFilters
                ? "Try clearing search or type filters."
                : "Create your first branch or central kitchen to start assigning staff and inventory."}
            </p>
            {!hasActiveFilters && (
              <Button
                className={hubCtaClassName("organization", "mt-6 min-h-[44px] font-bold")}
                onClick={handleAddNew}
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden />
                Add first branch
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBranches.map((branch) => (
              <article
                key={branch.id}
                className={branchCardClassName(
                  "organization",
                  branchCardAccentClassName(branch.isCentralKitchen),
                )}
              >
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className={cn("font-bold text-lg truncate", text.primary)}>
                      {branch.name}
                    </h3>
                    <p className={cn("text-sm flex items-center gap-1 mt-1", text.muted)}>
                      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        {branch.location?.trim() || "No location specified"}
                      </span>
                    </p>
                  </div>
                  <StatusBadge tone={branch.isCentralKitchen ? "warning" : "neutral"}>
                    {branchTypeLabel(branch.isCentralKitchen)}
                  </StatusBadge>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--table-row-border)] flex justify-between items-center gap-2">
                  <span className={branchCardMetaClassName()}>ID #{branch.id}</span>
                  <TableActionButton
                    label="Edit"
                    icon={Pencil}
                    tone="blue"
                    onClick={() => handleEdit(branch)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <BranchFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        branch={editingBranch}
        onSubmit={handleSave}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );

  if (embedded) return content;

  return <AnimatedPage className="space-y-6 max-w-5xl mx-auto w-full">{content}</AnimatedPage>;
}
