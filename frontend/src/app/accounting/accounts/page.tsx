"use client"

import { useEffect, useState } from "react"
import { getAccounts } from "@/lib/api"
import { Table, Tag, Typography } from "antd"
import { Landmark } from "lucide-react"
import { toast } from "sonner"

const { Text } = Typography;

export default function ChartOfAccountsPage() {
  const [accountsTree, setAccountsTree] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccounts()
      
      // Group by type to create Tree structure
      const grouped = data.reduce((acc: any, account: any) => {
        const type = account.type;
        if (!acc[type]) {
          acc[type] = {
            id: `GROUP_${type}`,
            code: '',
            name: type.charAt(0) + type.slice(1).toLowerCase() + 's', // "Assets"
            type: type,
            isGroup: true,
            children: []
          };
        }
        acc[type].children.push(account);
        return acc;
      }, {});

      // Convert object to array and sort children by code
      const treeData = Object.values(grouped).map((group: any) => {
        group.children.sort((a: any, b: any) => a.code.localeCompare(b.code));
        return group;
      });

      setAccountsTree(treeData)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string, record: any) => 
        record.isGroup ? <span className="font-semibold text-slate-800 dark:text-slate-200">{record.type}</span> : <span className="font-mono font-medium">{code}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => 
        record.isGroup ? <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{name}</span> : <span>{name}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string, record: any) => {
        if (record.isGroup) return null; // Hide badge on group row to keep it clean
        let color = 'default';
        if (type === 'ASSET') color = 'blue';
        else if (type === 'LIABILITY') color = 'volcano';
        else if (type === 'EQUITY') color = 'purple';
        else if (type === 'REVENUE') color = 'success';
        else if (type === 'EXPENSE') color = 'warning';
        
        return <Tag color={color}>{type}</Tag>
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: any) => {
        if (record.isGroup) return null;
        return <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Landmark className="w-5 h-5 text-emerald-500" />
          Chart of Accounts
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
        <Table 
          columns={columns} 
          dataSource={accountsTree} 
          rowKey="id"
          loading={loading}
          pagination={false}
          defaultExpandAllRows={true}
          className="w-full overflow-x-auto [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:dark:bg-slate-800"
        />
      </div>
    </div>
  )
}
