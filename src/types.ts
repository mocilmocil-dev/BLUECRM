export type Role = 'GM' | 'Manager' | 'Sales' | 'Pool';

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

export type UnitStatus = 'Available' | 'Maintenance' | 'Rent Out' | 'Booked' | 'Hold';
export type MaintenanceStatus = 'Being Serviced' | 'In Queue';

export interface Unit {
  id: string;
  plateNumber: string;
  model: string;
  location: 'Jakarta' | 'Surabaya' | string;
  status: UnitStatus;
  maintenanceStatus?: MaintenanceStatus;
  category: 'Mobil Long Term';
  assignedDealId?: string | null; // linked to a won/active deal
  lastServiceDate?: string;
  notes?: string;
  manufactureYear?: string;
  color?: string;
  transmission?: string;
  fuelLevel?: number;
  taxExpiryDate?: string;
  stnkExpiryDate?: string;
  lastOdometer?: number;
  updatedAt: string;
}

export type DriverStatus = 'Available' | 'Reserved' | 'Assigned' | 'Leave';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  location: 'Jakarta' | 'Surabaya' | string;
  status: DriverStatus;
  category: 'Supir';
  assignedDealId?: string | null;
  licenseNumber?: string;
  updatedAt: string;
}
