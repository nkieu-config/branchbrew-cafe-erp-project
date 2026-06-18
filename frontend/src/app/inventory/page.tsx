"use client";

import { useEffect, useState } from "react";
import { getBranch, getTransfers, acceptTransfer, createTransfer, getBranches } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InventoryPage() {
  const { activeBranchId } = useAuth();
  const [inventories, setInventories] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [transferTarget, setTransferTarget] = useState("");
  const [transferIngredient, setTransferIngredient] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (activeBranchId) {
      fetchInventory();
      getBranches().then(setBranches);
    } else {
      setInventories([]);
      setLoading(false);
    }
  }, [activeBranchId]);

  const fetchInventory = () => {
    setLoading(true);
    Promise.all([getBranch(activeBranchId!), getTransfers(activeBranchId!)])
      .then(([branch, transfersData]) => {
        setInventories(branch.inventories || []);
        setBatches(branch.inventoryBatches || []);
        setTransfers(transfersData);
      })
      .catch((err) => toast.error("Failed to load inventory: " + err.message))
      .finally(() => setLoading(false));
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget || !transferIngredient || !transferQty) return;
    setIsTransferring(true);
    try {
      await createTransfer({
        fromBranchId: activeBranchId,
        toBranchId: Number(transferTarget),
        ingredientId: Number(transferIngredient),
        quantity: Number(transferQty)
      });
      toast.success("Transfer requested successfully!");
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleAcceptTransfer = async (id: number) => {
    try {
      await acceptTransfer(id);
      toast.success("Transfer accepted and stock updated!");
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  if (!activeBranchId) {
    return (
      <div className="p-10 text-center text-slate-500">
        Please select a branch to view its inventory. (Feature coming soon for Super Admins)
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <PackageOpen className="text-amber-600" /> Inventory & Lots
          </h1>
          <p className="text-slate-500">Track raw materials and manage FIFO batches.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Stock Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTransfer} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Ingredient</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={transferIngredient} 
                  onChange={(e) => setTransferIngredient(e.target.value)}
                  required
                >
                  <option value="">Select Ingredient</option>
                  {inventories.filter(i => i.stock > 0).map(i => (
                    <option key={i.ingredient.id} value={i.ingredient.id}>{i.ingredient.name} (Max: {i.stock})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>To Branch</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={transferTarget} 
                  onChange={(e) => setTransferTarget(e.target.value)}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.filter(b => b.id !== activeBranchId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" step="0.1" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isTransferring}>
                {isTransferring ? "Processing..." : "Initiate Transfer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">Total Stock (Aggregated)</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventories.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-semibold">{inv.ingredient.name}</TableCell>
                  <TableCell>{inv.stock} {inv.ingredient.unit}</TableCell>
                  <TableCell>
                    {inv.stock <= inv.minStock ? (
                      <Badge variant="destructive">Low</Badge>
                    ) : <Badge className="bg-emerald-500">Good</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">Active Batches (FIFO)</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Qty Left</TableHead>
                <TableHead>Added At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.ingredient.name}</TableCell>
                  <TableCell>{b.quantity} {b.ingredient.unit}</TableCell>
                  <TableCell className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-4 text-slate-400">No active batches</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">Pending Transfers</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.fromBranch.name}</TableCell>
                <TableCell>{t.toBranch.name}</TableCell>
                <TableCell>{t.ingredient.name}</TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell>
                  <Badge variant={t.status === 'COMPLETED' ? 'default' : 'secondary'} className={t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.status === 'PENDING' && t.toBranchId === activeBranchId && (
                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleAcceptTransfer(t.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                    </Button>
                  )}
                  {t.status === 'PENDING' && t.fromBranchId === activeBranchId && (
                    <span className="text-xs text-slate-400">Waiting for {t.toBranch.name}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {transfers.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-400">No transfers history</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
