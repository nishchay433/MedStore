import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, AlertCircle, Search } from 'lucide-react';
import { Medicine } from '../types';
import { fetchMedicines, createMedicine, updateMedicine, deleteMedicine } from '../api';

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Medicine, 'id'>>({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    unitPrice: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    expiryDate: '',
    batchNumber: '',
    description: '',
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  // const loadMedicines = () => {
  //   const data = storage.getMedicines();
  //   setMedicines(data);
  // };

  const loadMedicines = async () => {
  const data = await fetchMedicines();
  setMedicines(data);
};


  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const allMedicines = storage.getMedicines();

  //   if (editingId) {
  //     const updated = allMedicines.map((m) =>
  //       m.id === editingId ? { ...formData, id: editingId } : m
  //     );
  //     storage.saveMedicines(updated);
  //   } else {
  //     const newMedicine: Medicine = {
  //       ...formData,
  //       id: Date.now().toString(),
  //     };
  //     storage.saveMedicines([...allMedicines, newMedicine]);
  //   }

  //   resetForm();
  //   loadMedicines();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (editingId) {
    await updateMedicine(editingId, formData);
  } else {
    await createMedicine(formData);
  }

  resetForm();
  await loadMedicines();
};


  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      unitPrice: medicine.unitPrice,
      stockQuantity: medicine.stockQuantity,
      reorderLevel: medicine.reorderLevel,
      expiryDate: medicine.expiryDate,
      batchNumber: medicine.batchNumber,
      description: medicine.description,
    });
    setEditingId(medicine.id);
    setShowForm(true);
  };

  // const handleDelete = (id: string) => {
  //   if (confirm('Are you sure you want to delete this medicine?')) {
  //     const allMedicines = storage.getMedicines();
  //     const filtered = allMedicines.filter((m) => m.id !== id);
  //     storage.saveMedicines(filtered);
  //     loadMedicines();
  //   }
  // };

  const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this medicine?')) {
    await deleteMedicine(id);
    await loadMedicines();
  }
};


  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      unitPrice: 0,
      stockQuantity: 0,
      reorderLevel: 10,
      expiryDate: '',
      batchNumber: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Medicine Inventory</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price*
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity*
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Add'} Medicine
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Generic</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">Batch</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No medicines found. Add your first medicine to get started.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{medicine.name}</td>
                    <td className="px-4 py-3 text-gray-600">{medicine.genericName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{medicine.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          medicine.stockQuantity <= medicine.reorderLevel
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {medicine.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {medicine.expiryDate && (isExpired(medicine.expiryDate) || isExpiringSoon(medicine.expiryDate)) && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={
                          medicine.expiryDate && isExpired(medicine.expiryDate)
                            ? 'text-red-600 font-medium'
                            : medicine.expiryDate && isExpiringSoon(medicine.expiryDate)
                            ? 'text-orange-600 font-medium'
                            : 'text-gray-600'
                        }>
                          {medicine.expiryDate || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{medicine.batchNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
