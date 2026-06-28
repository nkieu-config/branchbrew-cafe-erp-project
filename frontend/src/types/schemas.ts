import { z } from 'zod';

// Shared Schemas for API Payloads

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
});

export const CreatePromotionSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive(),
  minPurchase: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateShiftSchema = z.object({
  employeeId: z.number(),
  branchId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  role: z.string(),
});

export const CreateTransferSchema = z.object({
  fromBranchId: z.number(),
  toBranchId: z.number(),
  ingredientId: z.number(),
  quantity: z.number().positive(),
  reason: z.string().optional(),
});

export const EquipmentSchema = z.object({
  name: z.string(),
  type: z.string(),
  branchId: z.number(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED']),
  serialNumber: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
});

export const LogMaintenanceSchema = z.object({
  description: z.string(),
  cost: z.number().min(0),
  performedBy: z.string().optional(),
  date: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  newStatus: z.enum(['ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED']).optional(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type CreatePromotionDTO = z.infer<typeof CreatePromotionSchema>;
export type CreateShiftDTO = z.infer<typeof CreateShiftSchema>;
export type CreateTransferDTO = z.infer<typeof CreateTransferSchema>;
export type EquipmentDTO = z.infer<typeof EquipmentSchema>;
export type LogMaintenanceDTO = z.infer<typeof LogMaintenanceSchema>;
