"use client";

import { useState } from "react";
import Link from "next/link";
import { useHrUsers, useCreateUser, useUpdateUser } from "@/hooks/domains/useHrQueries";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { AnimatedPage } from "@/components/animated-page";
import { HubPageHeader } from "@/components/shared/hub-card";
import { AccessDeniedState } from "@/components/shared/access-denied-state";
import { ShieldCheck, Plus, User as UserIcon, Mail, Shield, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { TableActionButton } from "@/components/shared/table-action-button";
import { StatusBadge, roleTone } from "@/components/shared/status-badge";
import { RoleGuard } from "@/components/RoleGuard";
import type { User, Branch, CreateUserPayload, Role, EmploymentType } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import {
  avatarPlaceholderClassName,
  hubCtaClassName,
  inlineLinkClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function UsersPageClient({ embedded = false }: { embedded?: boolean }) {
  const { data: users, isLoading: usersLoading } = useHrUsers();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    branchId: 0,
    employmentType: "PART_TIME",
    hourlyRate: 0,
    baseSalary: 0
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Never populate password
      role: user.role || "STAFF",
      branchId: user.branchId || 0,
      employmentType: user.employmentType || "PART_TIME",
      hourlyRate: user.hourlyRate || 0,
      baseSalary: user.baseSalary || 0
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ 
      name: "", email: "", password: "", role: "STAFF", branchId: 0, employmentType: "PART_TIME", hourlyRate: 50, baseSalary: 0 
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload: CreateUserPayload = {
        ...formData,
        role: formData.role as Role,
        employmentType: formData.employmentType as EmploymentType,
        branchId: formData.branchId === 0 ? null : formData.branchId,
      };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, ...payload });
        toast.success("User updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save user"));
    }
  };


  const content = (
    <div className={`space-y-6 w-full ${embedded ? "max-w-6xl" : "max-w-6xl mx-auto"}`}>
      <HubPageHeader
        title="Users & Roles"
        icon={ShieldCheck}
        description="Manage system access, passwords, and branch assignments."
        actions={
          <Button 
            className={hubCtaClassName("organization", "flex items-center gap-2")}
            onClick={handleAddNew}
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
        }
      />

      <p className={cn("text-sm -mt-4", text.muted)}>
        To update hourly rates or browse staff by branch, use{" "}
        <Link href="/hr/employees" className={inlineLinkClassName()}>
          HR → Employee Directory
        </Link>
        .
      </p>

      <DataTable
        loading={usersLoading || branchesLoading}
          columns={[
            {
              title: "User",
              key: "user",
              render: (_, record: User) => (
                <div className="flex items-center gap-3">
                  <div className={avatarPlaceholderClassName()}>
                    <UserIcon className={cn("w-4 h-4", text.muted)} />
                  </div>
                  <div>
                    <div className={cn("font-medium", text.primary)}>{record.name || 'Unnamed User'}</div>
                    <div className={cn("text-xs flex items-center gap-1", text.muted)}>
                      <Mail className="w-3 h-3" /> {record.email}
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: "Role",
              dataIndex: "role",
              key: "role",
              render: (role) => (
                <StatusBadge tone={roleTone(role)}>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {role}
                  </span>
                </StatusBadge>
              )
            },
            {
              title: "Branch",
              key: "branch",
              render: (_, record: User) => {
                const branchName = (branches as Branch[] | undefined)?.find((b) => b.id === record.branchId)?.name || "All Branches (HQ)";
                return (
                  <div className={cn("flex items-center gap-1.5", text.secondary)}>
                    <Building className={cn("w-4 h-4", text.muted)} />
                    {branchName}
                  </div>
                );
              }
            },
            {
              title: "Employment",
              key: "employment",
              render: (_, record: User) => (
                <div className={text.secondary}>
                  {record.employmentType ? record.employmentType.replace('_', ' ') : 'N/A'}
                </div>
              )
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_, record: User) => (
                <TableActionButton label="Edit Profile" onClick={() => handleEdit(record)} />
              )
            }
          ]}
          dataSource={users || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          emptyDescription="No users found."
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User Account" : "Create New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-full-name">Full Name</Label>
                <Input id="user-full-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Somchai Jai-dee" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address</Label>
                <Input id="user-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="somchai@qafacafe.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password {editingUser && <span className={cn(text.muted, "font-normal")}>(Leave blank to keep current)</span>}
              </Label>
              <Input id="user-password" type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "••••••••" : "e.g. qafa1234"} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-role">System Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    if (value) setFormData({ ...formData, role: value as Role });
                  }}
                >
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff (POS & basic apps)</SelectItem>
                    <SelectItem value="MANAGER">Manager (Approvals & Reports)</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin (All Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-branch">Assigned Branch</Label>
                <Select
                  value={formData.branchId ? String(formData.branchId) : "0"}
                  onValueChange={(value) => {
                    if (value == null) return;
                    setFormData({ ...formData, branchId: Number(value) });
                  }}
                >
                  <SelectTrigger id="user-branch" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Branches (HQ / Admin)</SelectItem>
                    {(branches as Branch[] | undefined)?.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-employment-type">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => {
                    if (value === "PART_TIME" || value === "FULL_TIME") {
                      setFormData({ ...formData, employmentType: value as EmploymentType });
                    }
                  }}
                >
                  <SelectTrigger id="user-employment-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PART_TIME">Part-Time (Hourly)</SelectItem>
                    <SelectItem value="FULL_TIME">Full-Time (Salaried)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-compensation">{formData.employmentType === 'PART_TIME' ? 'Hourly Rate (฿)' : 'Monthly Base Salary (฿)'}</Label>
                <Input 
                  id="user-compensation"
                  type="number" 
                  value={formData.employmentType === 'PART_TIME' ? formData.hourlyRate : formData.baseSalary} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (formData.employmentType === 'PART_TIME') setFormData({...formData, hourlyRate: val});
                    else setFormData({...formData, baseSalary: val});
                  }} 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving…" : "Save User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) return content;

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]} fallback={<AccessDeniedState description="Super Admin access is required to manage users and roles." />}>
      <AnimatedPage className="space-y-6 max-w-6xl mx-auto w-full">{content}</AnimatedPage>
    </RoleGuard>
  );
}
