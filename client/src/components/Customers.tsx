import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Customer } from '../types';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

import { storage } from '../storage';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  // const loadCustomers = () => {
  //   const data = storage.getCustomers();
  //   setCustomers(data);
  // };

  const loadCustomers = async () => {
  try {
    const data = await fetchCustomers();
    setCustomers(data);
  } catch (err) {
    console.error('Error loading customers', err);
  }
};


  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const allCustomers = storage.getCustomers();

  //   if (editingId) {
  //     const updated = allCustomers.map((c) =>
  //       c.id === editingId ? { ...formData, id: editingId } : c
  //     );
  //     storage.saveCustomers(updated);
  //   } else {
  //     const newCustomer: Customer = {
  //       ...formData,
  //       id: Date.now().toString(),
  //     };
  //     storage.saveCustomers([...allCustomers, newCustomer]);
  //   }

  //   resetForm();
  //   loadCustomers();
  // };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   try {
//     if (editingId) {
//       // temporary: still local updating; we’ll wire PUT later
//       const allCustomers = [...customers];
//       const updated = allCustomers.map((c) =>
//         c.id === editingId ? { ...c, ...formData } : c
//       );
//       setCustomers(updated);
//     } else {
//       // create in DB
//       const created = await createCustomer({
//         name: formData.name,
//         phone: formData.phone,
//         email: formData.email,
//         address: formData.address,
//       });
//       setCustomers((prev) => [...prev, created]);
//     }

//     resetForm();
//   } catch (err) {
//     console.error('Error saving customer', err);
//     alert('Failed to save customer');
//   }
// };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (editingId) {
      const updated = await updateCustomer(editingId, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      });

      setCustomers((prev) =>
        prev.map((c) => (c.id === editingId ? updated : c))
      );
    } else {
      const created = await createCustomer({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      });

      setCustomers((prev) => [...prev, created]);
    }

    resetForm();
  } catch (err) {
    console.error('Error saving customer', err);
    alert('Failed to save customer');
  }
};



  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  // const handleDelete = (id: string) => {
  //   if (confirm('Are you sure you want to delete this customer?')) {
  //     const allCustomers = storage.getCustomers();
  //     const filtered = allCustomers.filter((c) => c.id !== id);
  //     storage.saveCustomers(filtered);
  //     loadCustomers();
  //   }
  // };

  const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  } catch (err) {
    console.error('Error deleting customer', err);
    alert('Failed to delete customer');
  }
};


  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
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
                  Phone Number*
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Add'} Customer
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            No customers found. Add your first customer to get started.
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
