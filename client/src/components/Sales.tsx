import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Sale, SaleItem, Medicine, Customer } from '../types';
import {
  fetchMedicines,
  fetchCustomers,
  fetchSales,
  createSale,
  deleteSale,
  updateSale,
} from '../api';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [prescriptionNumber, setPrescriptionNumber] = useState<string>('');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const loadData = async () => {
    const [meds, custs, salesFromDb] = await Promise.all([
      fetchMedicines(),
      fetchCustomers(),
      fetchSales(),
    ]);
    console.log('salesFromDb', salesFromDb);
    setMedicines(meds);
    setCustomers(custs);
    setSales(salesFromDb);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = () => {
    if (!selectedMedicine) return;

    const medicine = medicines.find((m) => m.id === selectedMedicine);
    if (!medicine) return;

    if (quantity > medicine.stockQuantity) {
      alert('Insufficient stock!');
      return;
    }

    const existingItem = cartItems.find((item) => item.medicineId === selectedMedicine);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.medicineId === selectedMedicine
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      const newItem: SaleItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        unitPrice: medicine.unitPrice,
        subtotal: quantity * medicine.unitPrice,
      };
      setCartItems([...cartItems, newItem]);
    }

    setSelectedMedicine('');
    setQuantity(1);
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems(cartItems.filter((item) => item.medicineId !== medicineId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For new sale, require items. For edit, allow header-only edit.
    if (!editingSale && cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      if (editingSale) {
        const res = await updateSale(editingSale.id, {
          customerId: selectedCustomer || null,
          prescriptionNumber: prescriptionNumber || null,
          paymentMethod,
        });
        console.log('updateSale response', res);
      } else {
        const res = await createSale({
          customerId: selectedCustomer || null,
          prescriptionNumber: prescriptionNumber || null,
          paymentMethod,
          items: cartItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
        console.log('createSale response', res);
      }
    } catch (err) {
      console.error('Error saving sale', err);
      alert('Failed to save sale');
      return;
    }

    resetForm();
    await loadData();
  };

  const resetForm = () => {
    setCartItems([]);
    setSelectedCustomer('');
    setPaymentMethod('Cash');
    setPrescriptionNumber('');
    setEditingSale(null);
    setShowForm(false);
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Delete this sale?')) return;

    try {
      await deleteSale(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete sale', err);
      alert('Failed to delete sale');
    }
  };

  const startEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
    setSelectedCustomer(sale.customerId ? String(sale.customerId) : '');
    setPaymentMethod(sale.paymentMethod);
    setPrescriptionNumber(sale.prescriptionNumber ?? '');
    setCartItems(sale.items); // will be [] unless your backend returns items
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Sales</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Sale
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingSale ? 'Edit Sale' : 'New Sale'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer (Optional)
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Walk-in Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Number (Optional)
                </label>
                <input
                  type="text"
                  value={prescriptionNumber}
                  onChange={(e) => setPrescriptionNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Add Items</h4>
                <div className="flex gap-3 mb-4">
                  <select
                    value={selectedMedicine}
                    onChange={(e) => setSelectedMedicine(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Medicine</option>
                    {medicines
                      .filter((m) => m.stockQuantity > 0)
                      .map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} - ₹{medicine.unitPrice} (Stock:{' '}
                          {medicine.stockQuantity})
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addToCart}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {cartItems.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-600">
                          <th className="pb-2">Medicine</th>
                          <th className="pb-2 text-right">Price</th>
                          <th className="pb-2 text-right">Qty</th>
                          <th className="pb-2 text-right">Subtotal</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr
                            key={item.medicineId}
                            className="border-t border-gray-200"
                          >
                            <td className="py-2">{item.medicineName}</td>
                            <td className="py-2 text-right">
                              ₹{item.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-2 text-right">{item.quantity}</td>
                            <td className="py-2 text-right font-medium">
                              ₹{item.subtotal.toFixed(2)}
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.medicineId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 font-bold">
                          <td colSpan={3} className="py-2 text-right">
                            Total:
                          </td>
                          <td className="py-2 text-right text-lg text-blue-600">
                            ₹{calculateTotal().toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingSale ? 'Save Changes' : 'Complete Sale'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Prescription</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No sales recorded yet. Create your first sale to get
                    started.
                  </td>
                </tr>
              ) : (
                sales
                  .sort(
                    (a, b) =>
                      new Date(b.saleDate).getTime() -
                      new Date(a.saleDate).getTime()
                  )
                  .map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(sale.saleDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {sale.items.length} items
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {sale.prescriptionNumber || 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            onClick={() => startEditSale(sale)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
