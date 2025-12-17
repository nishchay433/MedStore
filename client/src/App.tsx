import { useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Medicines from './components/Medicines';
import Customers from './components/Customers';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import Reports from './components/Reports';

type View = 'dashboard' | 'medicines' | 'customers' | 'sales' | 'purchases' | 'reports';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'medicines', label: 'Medicines', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'medicines':
        return <Medicines />;
      case 'customers':
        return <Customers />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedStore</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
