export type Role = 'GM' | 'Manager' | 'Sales';

export type ProductCategory = 
  | 'Mobil Short Term' 
  | 'Bis Short Term' 
  | 'E-Voucher' 
  | 'Mobil Long Term' 
  | 'Bis Long Term' 
  | 'Supir';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Mobil Short Term',
  'Bis Short Term',
  'E-Voucher',
  'Mobil Long Term',
  'Bis Long Term',
  'Supir'
];

export type DealStage = 'Call/Meeting' | 'Prospecting' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export const DEAL_STAGES: DealStage[] = [
  'Call/Meeting',
  'Prospecting',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

export interface User {
  id: string;
  name: string;
  role: Role;
  managerId?: string; // Reference to another user if this is a Sales rep
}

export interface PIC {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  pics: PIC[];
}

export interface Target {
  id: string;
  userId: string;
  month: string; // YYYY-MM format
  productTargets: Record<ProductCategory, number>;
}

export interface DealHistoryEntry {
  id: string;
  stage: DealStage;
  subType?: 'Call' | 'Offline Meeting';
  timestamp: string;
  note?: string;
  products?: DealProduct[];
  estimatedValue?: number;
}

export interface DealProduct {
  id: string;
  category: ProductCategory;
  quantity: number;
  estimatedValue: number;
  details?: string;
}

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  picId?: string;
  salesId: string;
  products: DealProduct[];
  stage: DealStage;
  estimatedValue: number;
  actualValue?: number; // 100% of estimated when Won
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  history?: DealHistoryEntry[];
}
