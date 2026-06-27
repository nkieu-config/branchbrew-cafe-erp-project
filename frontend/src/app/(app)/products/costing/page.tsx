"use client"

import { useOrders } from '@/hooks/domains/useReportsQueries';
import { TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react"
import { StatCard } from "@/components/shared/stat-card"
import { DataTable } from "@/components/shared/data-table"
import { HubCard } from "@/components/shared/hub-card"
import { toNumber, formatBaht } from "@/lib/money"
import { formatDateTime } from "@/lib/intl-date"
import { ledgerCreditClassName, metricValueClassName, text } from "@/lib/theme"
import { Order } from "@/types/api"

export default function CostingReportPage() {
  const { data: ordersData = [], isLoading } = useOrders()
  const orders = ordersData;

  const totalRevenue = orders.reduce((sum: number, o: Order) => sum + toNumber(o.netAmount), 0)
  const totalCogs = orders.reduce((sum: number, o: Order) => sum + toNumber(o.totalCogs), 0)
  const grossProfit = totalRevenue - totalCogs
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      <HubCard
        title="Costing & Profitability"
        icon={BarChart3}
        description="Track revenue, COGS, and gross profit margins from completed orders."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Revenue"
            value={`฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard 
            title="Total COGS (Cost of Goods)"
            value={`฿${totalCogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Activity}
            color="red"
          />
          <StatCard 
            title={`Gross Profit (Margin: ${margin.toFixed(1)}%)`}
            value={`฿${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            color="blue"
          />
        </div>
      </HubCard>

      <HubCard title="Transaction History" icon={TrendingUp}>
        <DataTable 
          columns={[
            { title: "Order ID", dataIndex: "id", key: "id", render: (id: number) => <span className={`font-medium ${text.primary}`}>#{id}</span> },
            { title: "Date", dataIndex: "createdAt", key: "date", render: (date: string) => <span className={text.subtle}>{formatDateTime(date)}</span> },
            { title: "Revenue", dataIndex: "netAmount", key: "rev", align: "right", render: (val: number | string) => <span className="tabular-nums">{formatBaht(val)}</span> },
            { title: "COGS", dataIndex: "totalCogs", key: "cogs", align: "right", render: (val: number | string) => <span className={`tabular-nums ${ledgerCreditClassName()}`}>{formatBaht(val)}</span> },
            { 
              title: "Profit", 
              key: "profit", 
              align: "right",
              render: (_, record: Order) => {
                const profit = toNumber(record.netAmount) - toNumber(record.totalCogs);
                return <span className={`font-medium tabular-nums ${metricValueClassName("blue")}`}>{formatBaht(profit)}</span>
              }
            },
          ]}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          hideBorders
          emptyDescription="No completed orders yet."
        />
      </HubCard>
    </div>
  )
}
