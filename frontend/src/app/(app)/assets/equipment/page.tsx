"use client";

import { useState } from "react";
import { useEquipment, useCreateEquipment, useLogMaintenance } from '@/hooks/domains/useProcurementQueries';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Coffee } from "lucide-react";
import { toast } from "sonner";
import { HubPageHeader } from "@/components/shared/hub-card";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge, equipmentStatusTone } from "@/components/shared/status-badge";
import { Equipment, Branch } from "@/types/api";
import { formatDate } from "@/lib/intl-date";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hubCtaClassName, text } from "@/lib/theme";
import { cn } from "@/lib/utils";

const EQUIPMENT_TYPES = [
  { value: "ESPRESSO_MACHINE", label: "Espresso Machine" },
  { value: "GRINDER", label: "Grinder" },
  { value: "BLENDER", label: "Blender" },
  { value: "POS_SYSTEM", label: "POS System" },
  { value: "REFRIGERATOR", label: "Refrigerator" },
  { value: "OTHER", label: "Other" },
] as const;

export default function EquipmentPage() {
  const { activeBranchId } = useAuth();
  const { data: equipmentData, isLoading: loading } = useEquipment(activeBranchId ?? undefined);
  const equipmentList = equipmentData || [];

  const createMutation = useCreateEquipment();
  const maintMutation = useLogMaintenance();

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("ESPRESSO_MACHINE");
  const [serial, setSerial] = useState("");
  
  const [maintDesc, setMaintDesc] = useState("");
  const [maintCost, setMaintCost] = useState("");
  const [maintNextDate, setMaintNextDate] = useState("");
  const [selectedEqId, setSelectedEqId] = useState<number | null>(null);

  // Removed manual loadEquipment

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranchId) return toast.error("Please select a branch first");
    try {
      await createMutation.mutateAsync({
        branchId: activeBranchId,
        name,
        type,
        status: "OPERATIONAL"
      });
      toast.success("Equipment registered successfully!");
      setName(""); setSerial("");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) return;
    try {
      await maintMutation.mutateAsync({
        id: selectedEqId,
        data: {
          description: maintDesc,
          cost: Number(maintCost),
          performedBy: "Admin",
          date: new Date().toISOString()
        }
      });
      toast.success("Maintenance logged successfully!");
      setMaintDesc(""); setMaintCost(""); setMaintNextDate("");
      setSelectedEqId(null);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };



  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to manage equipment." />
    );
  }

  return (
    <div className="space-y-6">
      <HubPageHeader
        title="Equipment Maintenance"
        icon={Coffee}
        description="Track machines, appliances, and schedule preventative maintenance."
        actions={
          <Dialog>
          <DialogTrigger render={<Button className={hubCtaClassName("assets")}>
            <Plus className="w-4 h-4 mr-2" />
            Register Equipment
          </Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Equipment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="equipment-name">Equipment Name</Label>
                <Input id="equipment-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. La Marzocco Linea PB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-type">Type</Label>
                <Select value={type} onValueChange={(v) => v && setType(v)}>
                  <SelectTrigger id="equipment-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment-serial">Serial Number</Label>
                <Input id="equipment-serial" value={serial} onChange={e => setSerial(e.target.value)} placeholder="e.g. SN-12345" />
              </div>
              <Button type="submit" className={cn("w-full", hubCtaClassName("assets"))}>Register</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
      />

      <DataTable 
        loading={loading}
        columns={[
          { title: "Name", dataIndex: "name", key: "name", render: (name: string) => <span className={cn("font-medium", text.primary)}>{name}</span> },
          { title: "Type", dataIndex: "type", key: "type", render: (type: string) => type.replace('_', ' ') },
          { title: "Branch", dataIndex: "branch", key: "branch", render: (branch: Branch) => branch?.name },
          { 
            title: "Status", 
            dataIndex: "status", 
            key: "status",
            render: (status: string) => (
              <StatusBadge tone={equipmentStatusTone(status)}>
                {status.replace('_', ' ')}
              </StatusBadge>
            )
          },
          { 
            title: "Next Maintenance", 
            dataIndex: "nextMaintenanceDate", 
            key: "nextMaintenanceDate",
            render: (date: string) => date ? formatDate(date) : "-"
          },
          { 
            title: "Action", 
            key: "action",
            render: (_: unknown, record: Equipment) => (
              <Dialog>
                <DialogTrigger render={<Button variant="outline" size="sm" onClick={() => setSelectedEqId(record.id)}>
                  <Wrench className="w-4 h-4 mr-2" /> Log Maintenance
                </Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Maintenance for {record.name}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLogMaintenance} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-description">Description</Label>
                      <Input id="maintenance-description" value={maintDesc} onChange={e => setMaintDesc(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-cost">Cost (THB)</Label>
                      <Input id="maintenance-cost" type="number" value={maintCost} onChange={e => setMaintCost(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Maintenance Date</Label>
                      <Input type="date" value={maintNextDate} onChange={e => setMaintNextDate(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Save Record</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )
          }
        ]}
        dataSource={equipmentList}
        rowKey="id"
      />
    </div>
  );
}
