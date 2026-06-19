"use client";

import { useEffect, useState } from "react";
import { getCustomers, createCustomer } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedPage } from "@/components/animated-page";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
      .catch((err) => toast.error("Failed to load customers: " + err.message))
      .finally(() => setLoading(false));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);
    try {
      await createCustomer({ name, phone });
      toast.success("Customer registered successfully!");
      setOpen(false);
      setName("");
      setPhone("");
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Customers...</div>;

  return (
    <AnimatedPage className="w-full max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Member Database</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage loyalty members, points, and tiers.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <UserPlus className="w-4 h-4 mr-2" /> Register Member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="0812345678" />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Points Balance</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.phone}</TableCell>
                <TableCell className="font-semibold">{c.name}</TableCell>
                <TableCell className="text-amber-600 dark:text-amber-500 font-bold">{c.points.toLocaleString()} pts</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase font-bold tracking-wider py-0.5 px-2",
                    c.tier === 'PLATINUM' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' :
                    c.tier === 'GOLD' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 border-yellow-300 dark:border-yellow-800' :
                    c.tier === 'SILVER' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700' : ''
                  )}>
                    {c.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500">No members found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AnimatedPage>
  );
}
