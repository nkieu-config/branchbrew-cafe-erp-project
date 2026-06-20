export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  costPerUnit: number;
  globalMinStock: number;
}

export interface BranchInventory {
  id: number;
  branchId: number;
  ingredientId: number;
  ingredient: Ingredient;
  stock: number;
  minStock: number;
  updatedAt: string;
}

export interface WasteLog {
  id: number;
  branchId: number;
  ingredientId: number;
  ingredient: Ingredient;
  quantity: number;
  reason: string;
  recordedById: number;
  recordedBy: {
    name: string;
  };
  createdAt: string;
}

export interface Settlement {
  id: number;
  branchId: number;
  branch?: {
    name: string;
  };
  date: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedById: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  branchId: number;
  amount: number;
  category: string;
  description?: string;
  recordedById: number;
  recordedBy?: {
    name: string;
  };
  createdAt: string;
}

export interface SettlementExpected {
  expectedCash: number;
  expectedCreditCard: number;
  expectedQR: number;
  sales: number;
  expenses: number;
}
