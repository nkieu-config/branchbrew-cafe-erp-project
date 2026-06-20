"use client"

import { useEffect, useState } from "react"
import { getProductionBOMs, getIngredients, createProductionBOM } from "@/lib/api"
import { Table, Button, Modal, Form, Select, InputNumber, Space, Progress, Tag } from "antd"
import { ListTree, Plus, MinusCircle, Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { AnimatedPage } from "@/components/animated-page"

export default function BOMPage() {
  const [bomsGrouped, setBomsGrouped] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bomsData, ingredientsData] = await Promise.all([
        getProductionBOMs(),
        getIngredients()
      ])
      
      setIngredients(ingredientsData)

      // Group BOMs by targetIngredientId
      const grouped = (bomsData || []).reduce((acc: any, bom: any) => {
        const targetId = bom.targetIngredientId;
        if (!acc[targetId]) {
          acc[targetId] = {
            id: `TARGET_${targetId}`,
            targetName: bom.targetIngredient.name,
            targetUnit: bom.targetIngredient.unit,
            isGroup: true,
            children: []
          };
        }
        acc[targetId].children.push({
          id: bom.id,
          rawIngredientId: bom.rawIngredientId,
          rawName: bom.rawIngredient.name,
          rawUnit: bom.rawIngredient.unit,
          quantityNeeded: bom.quantityNeeded,
          costPerUnit: bom.rawIngredient.costPerUnit,
          totalCost: bom.quantityNeeded * bom.rawIngredient.costPerUnit
        });
        return acc;
      }, {});

      setBomsGrouped(Object.values(grouped))
    } catch (error) {
      console.error(error)
      toast.error("Failed to load BOMs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (values: any) => {
    try {
      const promises = values.rawIngredients.map((item: any) => 
        createProductionBOM({
          targetIngredientId: values.targetIngredientId,
          rawIngredientId: item.rawIngredientId,
          quantityNeeded: item.quantityNeeded
        })
      );
      await Promise.all(promises);
      toast.success("BOM updated successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create BOM");
    }
  }

  const columns = [
    {
      title: 'Target / Raw Ingredient',
      dataIndex: 'targetName',
      key: 'name',
      render: (_: any, record: any) => {
        if (record.isGroup) {
          return <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{record.targetName}</span>
        }
        return <span className="text-slate-600 dark:text-slate-400 pl-4">{record.rawName}</span>
      }
    },
    {
      title: 'Quantity Needed',
      key: 'quantity',
      render: (_: any, record: any) => {
        if (record.isGroup) return <span className="text-slate-400 text-xs uppercase tracking-wider">Per 1 {record.targetUnit}</span>;
        return <span className="font-mono font-medium">{record.quantityNeeded} {record.rawUnit}</span>
      }
    },
    {
      title: 'Est. Cost',
      key: 'cost',
      render: (_: any, record: any) => {
        if (record.isGroup) {
          const total = record.children.reduce((sum: number, c: any) => sum + c.totalCost, 0);
          return <span className="font-black text-rose-600 dark:text-rose-400">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        }
        return <span className="text-slate-500 font-mono">฿{record.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      }
    },
    {
      title: 'Food Cost % (Target < 30%)',
      key: 'foodcost',
      render: (_: any, record: any) => {
        if (record.isGroup) {
          const totalRawCost = record.children.reduce((sum: number, c: any) => sum + c.totalCost, 0);
          // Mock an estimated sale price for demonstration purposes (e.g. 150 THB, or 80 THB)
          const mockSalePrice = totalRawCost > 30 ? 120 : 60; 
          const foodCostPercent = (totalRawCost / mockSalePrice) * 100;
          const isWarning = foodCostPercent > 30;

          return (
            <div className="flex items-center gap-4">
              <div className="w-24">
                <Progress 
                  percent={parseFloat(foodCostPercent.toFixed(1))} 
                  size="small"
                  strokeColor={isWarning ? '#ef4444' : '#10b981'} // Red if > 30%, Green otherwise
                  format={(percent) => (
                    <span className={`font-black text-xs ${isWarning ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {percent}%
                    </span>
                  )}
                />
              </div>
              {isWarning && (
                <Tag color="error" className="flex items-center gap-1 font-bold rounded-lg border-rose-200">
                  <AlertTriangle className="w-3 h-3" /> High Cost
                </Tag>
              )}
            </div>
          )
        }
        return null;
      }
    }
  ]

  return (
    <AnimatedPage className="space-y-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ListTree className="w-6 h-6 text-orange-500" />
            Bill of Materials (Recipes)
          </h1>
          <p className="text-slate-500 font-medium">Manage recipes and monitor food cost efficiency.</p>
        </div>
        <div className="ml-auto">
          <Button 
            type="primary" 
            className="bg-orange-500 hover:bg-orange-600 h-10 px-4 rounded-xl shadow-sm font-bold flex items-center gap-2"
            onClick={() => setIsModalVisible(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create / Update BOM
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1">
        <Table 
          columns={columns} 
          dataSource={bomsGrouped} 
          rowKey="id"
          loading={loading}
          pagination={false}
          defaultExpandAllRows={true}
          className="w-full overflow-x-auto [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:dark:bg-slate-800"
        />
      </div>

      <Modal
        title={<div className="font-black text-lg">Create / Update BOM</div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item
            name="targetIngredientId"
            label={<span className="font-bold">Target Product (What are we making?)</span>}
            rules={[{ required: true, message: 'Please select target product' }]}
          >
            <Select
              showSearch
              placeholder="Select Target Product"
              optionFilterProp="children"
              className="h-11"
              options={ingredients.map(i => ({ label: i.name, value: i.id }))}
            />
          </Form.Item>

          <div className="mb-3 font-black text-slate-700 dark:text-slate-300">Raw Ingredients (Recipe)</div>
          
          <Form.List name="rawIngredients" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline" className="w-full">
                    <Form.Item
                      {...restField}
                      name={[name, 'rawIngredientId']}
                      rules={[{ required: true, message: 'Missing ingredient' }]}
                      className="mb-0 w-[300px]"
                    >
                      <Select
                        showSearch
                        placeholder="Select Raw Ingredient"
                        optionFilterProp="children"
                        className="h-11"
                        options={ingredients.map(i => ({ label: `${i.name} (${i.unit})`, value: i.id }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantityNeeded']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                      className="mb-0 w-[150px]"
                    >
                      <InputNumber placeholder="Quantity" min={0.01} step={0.01} className="w-full h-11 flex items-center" />
                    </Form.Item>
                    <MinusCircle onClick={() => remove(name)} className="text-rose-500 hover:text-rose-700 cursor-pointer w-5 h-5 ml-2 mt-2" />
                  </Space>
                ))}
                <Form.Item className="mt-4">
                  <Button type="dashed" onClick={() => add()} block icon={<Plus className="w-4 h-4" />} className="h-11 font-bold rounded-xl border-slate-300">
                    Add Raw Ingredient
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)} className="h-11 font-bold rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-orange-500 hover:bg-orange-600 border-none h-11 font-bold rounded-xl px-6" icon={<Save className="w-4 h-4" />}>
              Save Recipe
            </Button>
          </div>
        </Form>
      </Modal>
    </AnimatedPage>
  )
}
