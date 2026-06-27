"use client";

import { useState } from "react";
import { useBranches, useCreateBranch, useUpdateBranch } from "@/hooks/domains/useGeneralQueries";
import { AnimatedPage } from "@/components/animated-page";
import { HubPageHeader } from "@/components/shared/hub-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableActionButton } from "@/components/shared/table-action-button";
import { Building2, Plus, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Branch } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import {
  branchCardClassName,
  emptyStatePanelClassName,
  hubCardIconFor,
  hubCtaClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function BranchesPageClient({ embedded = false }: { embedded?: boolean }) {
  const { data: branches, isLoading } = useBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    isCentralKitchen: false
  });

  const branchList = (branches as Branch[] | undefined) || [];

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location || "",
      isCentralKitchen: branch.isCentralKitchen ?? false
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBranch(null);
    setFormData({ name: "", location: "", isCentralKitchen: false });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Branch name is required");
      return;
    }

    try {
      if (editingBranch) {
        await updateMutation.mutateAsync({ id: editingBranch.id, ...formData });
        toast.success("Branch updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Branch created successfully");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save branch"));
    }
  };

  const content = (
    <div className={`space-y-6 w-full ${embedded ? "max-w-5xl" : "max-w-5xl mx-auto"}`}>
      <HubPageHeader
        title="Branches"
        icon={Building2}
        description="Manage all franchise locations and central kitchens."
        actions={
          <Button
            className={hubCtaClassName("organization", "flex items-center gap-2")}
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className={cn("w-8 h-8 animate-spin motion-reduce:animate-none", hubCardIconFor("organization"))} />
        </div>
      ) : branchList.length === 0 ? (
        <div className={emptyStatePanelClassName()}>
          <Building2 className={hubCardIconFor("organization", "w-12 h-12 mx-auto mb-4")} />
          <p className={cn("font-semibold", text.primary)}>No branches yet</p>
          <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>
            Create your first branch or central kitchen to start assigning staff and inventory.
          </p>
          <Button className={hubCtaClassName("organization", "mt-6")} onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" /> Add first branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchList.map((branch) => (
            <div key={branch.id} className={branchCardClassName("organization")}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={cn("font-bold text-lg flex items-center gap-2", text.primary)}>
                    {branch.name}
                  </h3>
                  <p className={cn("text-sm flex items-center gap-1 mt-1", text.muted)}>
                    <MapPin className="w-3.5 h-3.5" /> {branch.location || "No location specified"}
                  </p>
                </div>
                {branch.isCentralKitchen ? (
                  <StatusBadge tone="warning">HQ / Kitchen</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Franchise</StatusBadge>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-[var(--table-row-border)] flex justify-between items-center">
                <div className={cn("text-sm", text.muted)}>
                  ID: #{branch.id}
                </div>
                <TableActionButton label="Edit Details" onClick={() => handleEdit(branch)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch Details" : "Create New Branch"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input 
                id="branch-name"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Qafa Siam Square"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-location">Location / Address</Label>
              <Input 
                id="branch-location"
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                placeholder="e.g. 1st Floor, Center Point"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isCentralKitchen" 
                checked={formData.isCentralKitchen}
                onCheckedChange={(checked) => setFormData({...formData, isCentralKitchen: !!checked})}
              />
              <Label htmlFor="isCentralKitchen" className="font-normal">
                This branch is a Central Kitchen (HQ)
              </Label>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving…" : "Save Branch"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) return content;

  return <AnimatedPage className="space-y-6 max-w-5xl mx-auto w-full">{content}</AnimatedPage>;
}
