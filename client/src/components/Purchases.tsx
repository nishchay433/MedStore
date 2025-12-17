import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Purchase, PurchaseItem, Medicine } from '../types';
import { storage } from '../storage';

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [supplierName, setSupplierName] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPurchases(storage.getPurchases());
    setMedicines(storage.getMedicines());
  };

  const addToCart = () => {
    if (!selectedMedicine || quantity <= 0 || unitPrice <= 0) {
      alert('Please fill all fields correctly!');
      return;
    }

    const medicine = medicines.find((m) => m.id === selectedMedicine);
    if (!medicine) return;

    const existingItem = cartItems.find((item) => item.medicineId === selectedMedicine);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.medicineId === selectedMedicine
            ? {
                ...item,
                quantity: item.quantity + quantity,
                unitPrice,
                subtotal: (item.quantity + quantity) * unitPrice,
              }
            : item
        )
      );
    } else {
      const newItem: PurchaseItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
      };
      setCartItems([...cartItems, newItem]);
    }

    setSelectedMedicine('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems(cartItems.filter((item) => item.medicineId !== medicineId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierName || cartItems.length === 0) {
      alert('Please fill supplier name and add items!');
      return;
    }

    const allMedicines = storage.getMedicines();
    const updatedMedicines = allMedicines.map((medicine) => {
      const purchaseItem = cartItems.find((item) => item.medicineId === medicine.id);
      if (purchaseItem) {
        return {
          ...medicine,
          stockQuantity: medicine.stockQuantity + purchaseItem.quantity,
          unitPrice: purchaseItem.unitPrice,
        };
      }
      return medicine;
    });
    storage.saveMedicines(updatedMedicines);

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      supplierName,
      purchaseDate: new Date().toISOString(),
      totalAmount: calculateTotal(),
      invoiceNumber,
      items: cartItems,
    };

    const allPurchases = storage.getPurchases();
    storage.savePurchases([...allPurchases, newPurchase]);

    resetForm();
    loadData();
  };

  const resetForm = () => {
    setCartItems([]);
    setSupplierName('');
    setInvoiceNumber('');
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Purchases</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">New Purchase Order</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Add Items</h4>
                <div className="flex gap-3 mb-4">
                  <select
                    value={selectedMedicine}
                    onChange={(e) => {
                      setSelectedMedicine(e.target.value);
                      const med = medicines.find((m) => m.id === e.target.value);
                      if (med) setUnitPrice(med.unitPrice);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <tr key={item.medicineId} className="border-t border-gray-200">
                            <td className="py-2">{item.medicineName}</td>
                            <td className="py-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="py-2 text-right">{item.quantity}</td>
                            <td className="py-2 text-right font-medium">₹{item.subtotal.toFixed(2)}</td>
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
                  Complete Purchase
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
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No purchases recorded yet. Create your first purchase order to get started.
                  </td>
                </tr>
              ) : (
                purchases
                  .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                  .map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(purchase.purchaseDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{purchase.supplierName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {purchase.invoiceNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{purchase.items.length} items</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        ₹{purchase.totalAmount.toFixed(2)}
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
