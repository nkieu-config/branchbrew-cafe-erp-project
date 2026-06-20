"use client"

import { useEffect, useState } from "react"
import { getProductionOrders, completeProductionOrder } from "@/lib/api"
import { Table, Tag, Button, Popconfirm } from "antd"
import { ChefHat, CheckCircle, PackageOpen } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CentralKitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getProductionOrders()
      setOrders(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load production orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleComplete = async (orderId: number) => {
    try {
      await completeProductionOrder(orderId)
      toast.success("Production order completed successfully")
      fetchOrders()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to complete order (check raw materials stock)")
    }
  }

  const columns = [
    {
      title: 'Order No.',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <span className="font-mono font-medium">{text}</span>,
    },
    {
      title: 'Target Product',
      key: 'targetIngredient',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {record.targetIngredient?.name}
          </span>
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantityToProduce',
      render: (_: any, record: any) => (
        <span>{record.quantityToProduce} {record.targetIngredient?.unit}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'PLANNED') color = 'blue';
        if (status === 'IN_PROGRESS') color = 'warning';
        if (status === 'COMPLETED') color = 'success';
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Planned Start',
      dataIndex: 'plannedStartDate',
      key: 'plannedStartDate',
      render: (date: string) => date ? format(new Date(date), 'dd MMM yyyy') : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          {record.status !== 'COMPLETED' && (
            <Popconfirm
              title="Complete Production"
              description="Are you sure you want to complete this order? This will deduct raw materials from inventory."
              onConfirm={() => handleComplete(record.id)}
              okText="Yes, Complete"
              cancelText="Cancel"
            >
              <Button type="primary" icon={<CheckCircle className="w-4 h-4" />} className="bg-emerald-500 hover:bg-emerald-600 border-none flex items-center gap-1">
                Complete
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="primary" className="bg-orange-500 hover:bg-orange-600 border-none shadow-sm">
          + New Production Order
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="w-full overflow-x-auto [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:dark:bg-slate-800"
        />
      </div>
    </div>
  )
}
