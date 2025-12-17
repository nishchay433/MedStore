import { Medicine, Customer , Sale } from './types';

const API_URL = 'http://localhost:4000/api';

// ---------- Sales types ----------
export type SaleItemInput = {
  medicineId: string;   // or number, but keep consistent
  quantity: number;
  unitPrice: number;
};

export type CreateSaleInput = {
  customerId: string | null;
  prescriptionNumber: string | null;
  paymentMethod: string;
  items: SaleItemInput[];
};

// ---------- Sales API ----------
export async function createSale(
  data: CreateSaleInput
): Promise<{ saleId: number; totalAmount: number }> {
  const res = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      items: data.items.map((it) => ({
        ...it,
        medicineId: Number(it.medicineId),
      })),
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to create sale');
  }

  return res.json();
}

export type UpdateSaleInput = {
  customerId: string | null;
  prescriptionNumber: string | null;
  paymentMethod: string;
};

export async function updateSale(
  id: string,
  data: UpdateSaleInput
): Promise<Sale> {
  const res = await fetch(`${API_URL}/sales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update sale');
  }

  return res.json();
}



export async function fetchSales(): Promise<Sale[]> {
  const res = await fetch(`${API_URL}/sales`);
  if (!res.ok) {
    throw new Error('Failed to fetch sales');
  }
  return res.json(); // backend already maps to exact Sale shape
}



export async function deleteSale(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/sales/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete sale');
}




// ---------- Medicines API ----------
export async function fetchMedicines(): Promise<Medicine[]> {
  const res = await fetch(`${API_URL}/medicines`);
  const data = await res.json();
  return data.map((row: any) => ({
    id: row.medicine_id.toString(),
    name: row.name,
    genericName: row.generic_name,
    category: row.category,
    manufacturer: row.manufacturer,
    unitPrice: Number(row.unit_price),
    stockQuantity: Number(row.stock_qty),
    reorderLevel: Number(row.reorder_level),
    expiryDate: row.expiry_date || '',
    batchNumber: row.batch_number,
    description: row.description,
  }));
}

export async function createMedicine(
  data: Omit<Medicine, 'id'>
): Promise<Medicine> {
  const res = await fetch(`${API_URL}/medicines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await res.json();
  return {
    id: row.medicine_id.toString(),
    name: row.name,
    genericName: row.generic_name,
    category: row.category,
    manufacturer: row.manufacturer,
    unitPrice: row.unit_price,
    stockQuantity: row.stock_qty,
    reorderLevel: row.reorder_level,
    expiryDate: row.expiry_date || '',
    batchNumber: row.batch_number,
    description: row.description,
  };
}

export async function updateMedicine(
  id: string,
  data: Omit<Medicine, 'id'>
): Promise<Medicine> {
  const res = await fetch(`${API_URL}/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await res.json();
  return {
    id: row.medicine_id.toString(),
    name: row.name,
    genericName: row.generic_name,
    category: row.category,
    manufacturer: row.manufacturer,
    unitPrice: Number(row.unit_price),
    stockQuantity: Number(row.stock_qty),
    reorderLevel: Number(row.reorder_level),
    expiryDate: row.expiry_date || '',
    batchNumber: row.batch_number,
    description: row.description,
  };
}

export async function deleteMedicine(id: string): Promise<void> {
  await fetch(`${API_URL}/medicines/${id}`, { method: 'DELETE' });
}

// ---------- Customers API ----------
export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/customers`);
  const data = await res.json();

  return data.map((row: any) => ({
    id: row.customer_id.toString(),
    name: row.name,
    phone: row.phone,
    email: row.email ?? '',
    address: row.address ?? '',
  }));
}

export async function createCustomer(
  data: Omit<Customer, 'id'>
): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create customer');
  }

  const row = await res.json();

  return {
    id: row.customer_id.toString(),
    name: row.name,
    phone: row.phone,
    email: row.email ?? '',
    address: row.address ?? '',
  };
}

export async function updateCustomer(
  id: string,
  data: Omit<Customer, 'id'>
): Promise<Customer> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update customer');
  }

  const row = await res.json();

  return {
    id: row.customer_id.toString(),
    name: row.name,
    phone: row.phone,
    email: row.email ?? '',
    address: row.address ?? '',
  };
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete customer');
  }
}
