import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { storage } from '../storage';
import { Medicine, Sale, Purchase, Customer } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMedicines(storage.getMedicines());
    setSales(storage.getSales());
    setPurchases(storage.getPurchases());
    setCustomers(storage.getCustomers());
  };

  const getTotalSalesValue = () => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getTotalPurchasesValue = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  };

  const getLowStockCount = () => {
    return medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;
  };

  const getExpiringCount = () => {
    const today = new Date();
    return medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const expiry = new Date(m.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30;
    }).length;
  };

  const getRecentSales = () => {
    return sales
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);
  };

  const getSalesToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  };

  const getSalesThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return sales.filter((sale) => new Date(sale.saleDate) >= firstDayOfMonth);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome to MedStore Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => onNavigate('medicines')}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Total</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{medicines.length}</div>
          <div className="text-sm text-gray-600">Medicines in Stock</div>
        </div>

        <div
          onClick={() => onNavigate('customers')}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Total</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{customers.length}</div>
          <div className="text-sm text-gray-600">Registered Customers</div>
        </div>

        <div
          onClick={() => onNavigate('sales')}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-orange-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Today</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{getSalesToday().length}</div>
          <div className="text-sm text-gray-600">Sales Transactions</div>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-teal-600"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Month</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ₹{getSalesThisMonth().reduce((sum, s) => sum + s.totalAmount, 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Revenue This Month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Low Stock Alert</h3>
          </div>
          <div className="text-4xl font-bold mb-2">{getLowStockCount()}</div>
          <p className="opacity-90 mb-4">medicines need reordering</p>
          <button
            onClick={() => onNavigate('reports')}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            View Details
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6" />
            <h3 className="text-xl font-bold">Expiry Alert</h3>
          </div>
          <div className="text-4xl font-bold mb-2">{getExpiringCount()}</div>
          <p className="opacity-90 mb-4">medicines expiring within 30 days</p>
          <button
            onClick={() => onNavigate('reports')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h3>
          {getRecentSales().length === 0 ? (
            <p className="text-gray-500">No sales recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {getRecentSales().map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">{sale.customerName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(sale.saleDate).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">₹{sale.totalAmount.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">{sale.items.length} items</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                  <div className="font-bold text-gray-900">{sales.length} transactions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{getTotalSalesValue().toFixed(0)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Purchases</div>
                  <div className="font-bold text-gray-900">{purchases.length} orders</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ₹{getTotalPurchasesValue().toFixed(0)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Stock Value</div>
                  <div className="font-bold text-gray-900">
                    {medicines.reduce((sum, m) => sum + m.stockQuantity, 0)} units
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-600">
                  ₹{medicines.reduce((sum, m) => sum + m.stockQuantity * m.unitPrice, 0).toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
