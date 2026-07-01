import { AUTH_ENDPOINTS } from './auth';
import { CORE_ENDPOINTS } from './core';
import { ORDER_ENDPOINTS } from './orders';
import { INGREDIENT_ENDPOINTS, MODIFIER_ENDPOINTS, PRODUCT_ENDPOINTS } from './products';
import { CUSTOMER_ENDPOINTS, PROMOTION_ENDPOINTS } from './crm';
import { ACCOUNTING_ENDPOINTS, AUDIT_ENDPOINTS } from './accounting';
import { BRANCH_ENDPOINTS } from './branches';
import { FINANCE_ENDPOINTS } from './finance';
import { INVENTORY_ENDPOINTS } from './inventory';
import { HR_ENDPOINTS } from './hr';
import { PROCUREMENT_ENDPOINTS } from './procurement';
import { PRODUCTION_ENDPOINTS } from './production';
import { EQUIPMENT_ENDPOINTS } from './equipment';
import { REPORT_ENDPOINTS } from './reports';
import { SETTINGS_ENDPOINTS } from './settings';

/** @deprecated Prefer domain-specific `*_ENDPOINTS` imports for tree-shaking. */
export const API_ENDPOINTS = {
  health: CORE_ENDPOINTS.health,
  auth: AUTH_ENDPOINTS,
  orders: ORDER_ENDPOINTS,
  products: PRODUCT_ENDPOINTS,
  modifiers: MODIFIER_ENDPOINTS,
  ingredients: INGREDIENT_ENDPOINTS,
  customers: CUSTOMER_ENDPOINTS,
  promotions: PROMOTION_ENDPOINTS,
  accounting: ACCOUNTING_ENDPOINTS,
  audit: AUDIT_ENDPOINTS,
  branches: BRANCH_ENDPOINTS,
  finance: FINANCE_ENDPOINTS,
  inventory: INVENTORY_ENDPOINTS,
  hr: HR_ENDPOINTS,
  procurement: PROCUREMENT_ENDPOINTS,
  production: PRODUCTION_ENDPOINTS,
  equipment: EQUIPMENT_ENDPOINTS,
  reports: REPORT_ENDPOINTS,
  settings: SETTINGS_ENDPOINTS,
  navCounts: CORE_ENDPOINTS.navCounts,
} as const;

export { AUTH_ENDPOINTS } from './auth';
export { CORE_ENDPOINTS } from './core';
export { ORDER_ENDPOINTS } from './orders';
export { INGREDIENT_ENDPOINTS, MODIFIER_ENDPOINTS, PRODUCT_ENDPOINTS } from './products';
export { CUSTOMER_ENDPOINTS, PROMOTION_ENDPOINTS } from './crm';
export { ACCOUNTING_ENDPOINTS, AUDIT_ENDPOINTS } from './accounting';
export { BRANCH_ENDPOINTS } from './branches';
export { FINANCE_ENDPOINTS } from './finance';
export { INVENTORY_ENDPOINTS } from './inventory';
export { HR_ENDPOINTS } from './hr';
export { PROCUREMENT_ENDPOINTS } from './procurement';
export { PRODUCTION_ENDPOINTS } from './production';
export { EQUIPMENT_ENDPOINTS } from './equipment';
export { REPORT_ENDPOINTS } from './reports';
export { SETTINGS_ENDPOINTS } from './settings';
