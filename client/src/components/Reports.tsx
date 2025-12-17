import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Package, AlertTriangle, Calendar } from 'lucide-react';
import { storage } from '../storage';
import { Medicine, Sale, Purchase } from '../types';

export default function Reports() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'sales' | 'expiry' | 'purchases'>('stock');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMedicines(storage.getMedicines());
    setSales(storage.getSales());
    setPurchases(storage.getPurchases());
  };

  const getLowStockMedicines = () => {
    return medicines.filter((m) => m.stockQuantity <= m.reorderLevel);
  };

  const getExpiringMedicines = () => {
    const today = new Date();
    return medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const expiry = new Date(m.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });
  };

  const getExpiredMedicines = () => {
    return medicines.filter((m) => m.expiryDate && new Date(m.expiryDate) < new Date());
  };

  const getTotalSalesValue = () => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getTotalPurchasesValue = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  };

  const getTopSellingMedicines = () => {
    const medicinesSold: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!medicinesSold[item.medicineId]) {
          medicinesSold[item.medicineId] = {
            name: item.medicineName,
            quantity: 0,
            revenue: 0,
          };
        }
        medicinesSold[item.medicineId].quantity += item.quantity;
        medicinesSold[item.medicineId].revenue += item.subtotal;
      });
    });

    return Object.values(medicinesSold)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const getSalesLast30Days = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return sales.filter((sale) => new Date(sale.saleDate) >= thirtyDaysAgo);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <div className="text-3xl font-bold">{medicines.length}</div>
          <div className="text-sm opacity-80">Medicines</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <div className="text-3xl font-bold">₹{getTotalSalesValue().toFixed(0)}</div>
          <div className="text-sm opacity-80">Sales Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Alert</span>
          </div>
          <div className="text-3xl font-bold">{getLowStockMedicines().length}</div>
          <div className="text-sm opacity-80">Low Stock Items</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Warning</span>
          </div>
          <div className="text-3xl font-bold">
            {getExpiringMedicines().length + getExpiredMedicines().length}
          </div>
          <div className="text-sm opacity-80">Expiring/Expired</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'stock'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stock Status
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'sales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'expiry'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expiry Alert
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Purchases
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'stock' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Low Stock Alert</h3>
              {getLowStockMedicines().length === 0 ? (
                <p className="text-gray-500">All medicines are adequately stocked.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medicine</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Current Stock</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Reorder Level</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getLowStockMedicines().map((medicine) => (
                        <tr key={medicine.id}>
                          <td className="px-4 py-3">{medicine.name}</td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">
                            {medicine.stockQuantity}
                          </td>
                          <td className="px-4 py-3 text-right">{medicine.reorderLevel}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                              Reorder Required
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Top Selling Medicines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Sales (All Time)</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{getTotalSalesValue().toFixed(2)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Last 30 Days</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹
                    {getSalesLast30Days()
                      .reduce((sum, sale) => sum + sale.totalAmount, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>

              {getTopSellingMedicines().length === 0 ? (
                <p className="text-gray-500">No sales data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medicine</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Units Sold</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getTopSellingMedicines().map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-medium">#{index + 1}</td>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">
                            ₹{item.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'expiry' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Expired Medicines</h3>
              {getExpiredMedicines().length === 0 ? (
                <p className="text-gray-500 mb-6">No expired medicines.</p>
              ) : (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medicine</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Batch</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getExpiredMedicines().map((medicine) => (
                        <tr key={medicine.id} className="bg-red-50">
                          <td className="px-4 py-3 font-medium">{medicine.name}</td>
                          <td className="px-4 py-3">{medicine.batchNumber}</td>
                          <td className="px-4 py-3 text-red-600 font-medium">{medicine.expiryDate}</td>
                          <td className="px-4 py-3 text-right">{medicine.stockQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="text-xl font-bold mb-4 text-orange-600">Expiring Soon (Within 30 Days)</h3>
              {getExpiringMedicines().length === 0 ? (
                <p className="text-gray-500">No medicines expiring soon.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Medicine</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Batch</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Stock</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Days Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getExpiringMedicines().map((medicine) => {
                        const daysLeft = Math.ceil(
                          (new Date(medicine.expiryDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <tr key={medicine.id} className="bg-orange-50">
                            <td className="px-4 py-3 font-medium">{medicine.name}</td>
                            <td className="px-4 py-3">{medicine.batchNumber}</td>
                            <td className="px-4 py-3 text-orange-600 font-medium">{medicine.expiryDate}</td>
                            <td className="px-4 py-3 text-right">{medicine.stockQuantity}</td>
                            <td className="px-4 py-3 text-right font-medium">{daysLeft}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchases' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Purchase Summary</h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Total Purchases (All Time)</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{getTotalPurchasesValue().toFixed(2)}
                </div>
              </div>

              {purchases.length === 0 ? (
                <p className="text-gray-500">No purchase data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Supplier</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Items</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchases
                        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                        .slice(0, 20)
                        .map((purchase) => (
                          <tr key={purchase.id}>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">{purchase.supplierName}</td>
                            <td className="px-4 py-3 text-gray-600">{purchase.invoiceNumber || 'N/A'}</td>
                            <td className="px-4 py-3 text-right">{purchase.items.length}</td>
                            <td className="px-4 py-3 text-right font-medium text-blue-600">
                              ₹{purchase.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
