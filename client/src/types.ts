export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  expiryDate: string;
  batchNumber: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
  prescriptionNumber: string;
  items: SaleItem[];
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplierName: string;
  purchaseDate: string;
  totalAmount: number;
  invoiceNumber: string;
  items: PurchaseItem[];
}
