"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, User, Activity, FileText } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(100, 0);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (action.includes("APPROVE")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    if (action.includes("REJECT") || action.includes("DELETE")) return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
    if (action.includes("UPDATE") || action.includes("RECEIVE")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading audit trail...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-xl">System Audit Trail</CardTitle>
              <CardDescription>Comprehensive log of critical system actions and data modifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Module</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{log.user?.name || log.user?.email}</span>
                          <span className="text-xs text-slate-400">({log.user?.role})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <span>{log.targetType}</span>
                          {log.targetId && <span className="text-slate-400">#{log.targetId}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md truncate">
                          <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{log.details || "-"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
