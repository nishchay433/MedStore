import { Medicine, Customer, Sale, Purchase } from './types';

const STORAGE_KEYS = {
  MEDICINES: 'medical_store_medicines',
  CUSTOMERS: 'medical_store_customers',
  SALES: 'medical_store_sales',
  PURCHASES: 'medical_store_purchases',
};

export const storage = {
  getMedicines: (): Medicine[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    return data ? JSON.parse(data) : [];
  },

  saveMedicines: (medicines: Medicine[]) => {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  },

  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },

  saveSales: (sales: Sale[]) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getPurchases: (): Purchase[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return data ? JSON.parse(data) : [];
  },

  savePurchases: (purchases: Purchase[]) => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },
};
