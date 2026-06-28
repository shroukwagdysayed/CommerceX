import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import type { AdminUser } from '../../services/adminService';
import type { Product } from '../../types/product';
import type { Order } from '../../types/order';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<(Order & { user?: { name: string; email: string } })[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Product Form State (Create / Edit)
  const [showProductForm, setShowProductForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, ordRes, userRes] = await Promise.all([
        adminService.getProducts(),
        adminService.getOrders(),
        adminService.getUsers(),
      ]);

      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data);
      if (userRes.success && userRes.data) setUsers(userRes.data);

      if (!prodRes.success || !ordRes.success || !userRes.success) {
        setError('Some data modules failed to load. Check server connection.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Display message timer
  const triggerNotification = (success: string = '', err: string = '') => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    if (err) {
      setError(err);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Product Actions
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setSelectedProductId(null);
    setTitle('');
    setDescription('');
    setPrice(0);
    setCategory('');
    setBrand('');
    setStock(0);
    setImageUrl('');
    setShowProductForm(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setFormMode('edit');
    setSelectedProductId(prod._id);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategory(prod.category);
    setBrand(prod.brand);
    setStock(prod.stock);
    setImageUrl(prod.images && prod.images.length > 0 ? prod.images[0] : '');
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      title,
      description,
      price,
      category,
      brand,
      stock,
      images: imageUrl ? [imageUrl] : [],
    };

    setLoading(true);
    try {
      let res;
      if (formMode === 'create') {
        res = await adminService.createProduct(payload);
      } else {
        res = await adminService.updateProduct(selectedProductId!, payload);
      }

      if (res.success) {
        triggerNotification(
          formMode === 'create' ? 'Product created successfully' : 'Product updated successfully'
        );
        setShowProductForm(false);
        await loadDashboardData();
      } else {
        triggerNotification('', res.message || 'Operation failed');
      }
    } catch (err) {
      triggerNotification('', 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const res = await adminService.deleteProduct(productId);
      if (res.success) {
        triggerNotification('Product deleted successfully');
        await loadDashboardData();
      } else {
        triggerNotification('', res.message || 'Delete failed');
      }
    } catch (err) {
      triggerNotification('', 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  // Order Actions
  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setLoading(true);
    try {
      const res = await adminService.updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        triggerNotification('Order status updated');
        await loadDashboardData();
      } else {
        triggerNotification('', res.message || 'Failed to update order status');
      }
    } catch (err) {
      triggerNotification('', 'Error updating order status');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleRoleToggle = async (user: AdminUser) => {
    if (user._id === currentUser?._id) {
      triggerNotification('', 'Self-demotion is restricted to prevent lockout');
      return;
    }

    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const message = `Are you sure you want to change ${user.name}'s role to ${nextRole}?`;
    if (!window.confirm(message)) return;

    setLoading(true);
    try {
      const res = await adminService.updateUserRole(user._id, nextRole);
      if (res.success) {
        triggerNotification(`User role changed to ${nextRole}`);
        await loadDashboardData();
      } else {
        triggerNotification('', res.message || 'Failed to change role');
      }
    } catch (err) {
      triggerNotification('', 'Error toggling user role');
    } finally {
      setLoading(false);
    }
  };

  // Pricing calculations for stats
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalPrice, 0);

  return (
    <div className="admin-dashboard-container">
      {/* Page Header */}
      <div className="mb-10 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-slate-400">Oversee store performance, products, orders, and user privileges.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="btn-secondary px-5 py-2.5 text-sm cursor-pointer"
          >
            Refresh Data
          </button>
          {activeTab === 'products' && (
            <button
              onClick={handleOpenCreateForm}
              className="btn-primary px-5 py-2.5 text-sm cursor-pointer"
            >
              + Create Product
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black gradient-text">${totalRevenue.toFixed(2)}</h3>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-100">{orders.length}</h3>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Products Catalog</p>
          <h3 className="text-3xl font-black text-slate-100">{products.length}</h3>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Users</p>
          <h3 className="text-3xl font-black text-slate-100">{users.length}</h3>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-white/8 mb-8 gap-4 overflow-x-auto">
        {(['overview', 'products', 'orders', 'users'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 border-b-2 text-sm font-semibold transition-all duration-200 capitalize cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading Block overlay */}
      {loading && (
        <div className="text-center py-20">
          <div className="gradient-text text-xl font-bold animate-pulse">Syncing dashboard information...</div>
        </div>
      )}

      {/* Tab Panels */}
      {!loading && (
        <div className="tab-panels-content">
          
          {/* OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders Overview */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-slate-200">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-slate-400 text-sm">No orders yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord._id} className="flex justify-between items-center text-sm border-b border-white/4 pb-3">
                        <div>
                          <p className="font-semibold text-slate-200 truncate max-w-[150px]">{ord.user?.name || 'Guest User'}</p>
                          <p className="text-xs text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-200">${ord.totalPrice.toFixed(2)}</p>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-400">{ord.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Alerts Overview */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-slate-200">Inventory Status</h3>
                {products.filter(p => p.stock <= 3).length === 0 ? (
                  <p className="text-slate-400 text-sm">✓ All product inventory quantities are healthy.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {products.filter(p => p.stock <= 3).slice(0, 5).map((p) => (
                      <div key={p._id} className="flex justify-between items-center text-sm border-b border-white/4 pb-3">
                        <span className="font-semibold text-slate-200 truncate max-w-[200px]">{p.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          p.stock === 0 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} remaining`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB PANEL */}
          {activeTab === 'products' && (
            <div>
              {/* CRUD overlay modal-style panel */}
              {showProductForm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                  <div className="glass-card w-full max-w-[600px] p-8 rounded-3xl relative overflow-y-auto max-h-[90vh]">
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                    <h3 className="text-xl font-bold mb-6 text-slate-100">
                      {formMode === 'create' ? 'Create New Product' : 'Modify Product Details'}
                    </h3>

                    <form onSubmit={handleSaveProduct} className="flex flex-col gap-4 text-left">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="form-control text-sm"
                          placeholder="e.g. AeroSound Headphones"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <textarea
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="form-control text-sm min-h-[80px]"
                          placeholder="Product specifications and sales copy..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ($)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="form-control text-sm"
                            placeholder="Price greater than 0"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Qty</label>
                          <input
                            type="number"
                            required
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                            className="form-control text-sm"
                            placeholder="0 or positive"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                          <input
                            type="text"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-control text-sm"
                            placeholder="Audio, Accessories, etc."
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand</label>
                          <input
                            type="text"
                            required
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="form-control text-sm"
                            placeholder="Brand Name"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Image URL</label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="form-control text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>

                      <div className="flex gap-4 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowProductForm(false)}
                          className="btn-secondary py-2.5 text-sm flex-grow cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary py-2.5 text-sm flex-grow cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-6">Image</th>
                        <th className="py-4 px-6">Product Title</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4 text-sm text-slate-300">
                      {products.map((prod) => {
                        const img = prod.images && prod.images.length > 0
                          ? prod.images[0]
                          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

                        return (
                          <tr key={prod._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-6">
                              <img
                                src={img}
                                alt={prod.title}
                                className="w-10 h-10 object-cover rounded-lg bg-black/10"
                              />
                            </td>
                            <td className="py-3 px-6 font-bold text-slate-200 max-w-[200px] truncate">
                              {prod.title}
                            </td>
                            <td className="py-3 px-6 text-slate-400 capitalize">{prod.category}</td>
                            <td className="py-3 px-6 font-extrabold text-slate-200">${prod.price.toFixed(2)}</td>
                            <td className="py-3 px-6">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                prod.stock === 0 ? 'text-red-400 bg-red-500/10' : 'text-slate-300 bg-white/5'
                              }`}>
                                {prod.stock} items
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditForm(prod)}
                                className="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="text-red-400 hover:text-red-300 px-3 py-1.5 text-xs font-semibold cursor-pointer border border-red-500/10 hover:border-red-500/30 rounded-lg bg-red-500/5 transition-all"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB PANEL */}
          {activeTab === 'orders' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Total Price</th>
                      <th className="py-4 px-6">Date Placed</th>
                      <th className="py-4 px-6">Status Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4 text-sm text-slate-300">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-slate-400">{ord._id}</td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-200">{ord.user?.name || 'Guest User'}</p>
                          <p className="text-xs text-slate-400">{ord.user?.email || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-slate-200">${ord.totalPrice.toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            ord.status === 'Delivered'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : ord.status === 'Shipped'
                              ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                              : ord.status === 'Processing'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                              : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            className="bg-brand-secondary border border-white/8 text-slate-300 text-xs rounded-lg p-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB PANEL */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Account User Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Role Rank</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4 text-sm text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-200">{u.name}</td>
                        <td className="py-4 px-6 text-slate-400">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            u.role === 'admin'
                              ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                              : 'text-slate-400 bg-white/5 border-white/10'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={u._id === currentUser?._id}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              u.role === 'admin'
                                ? 'text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 cursor-pointer disabled:opacity-30'
                                : 'btn-secondary cursor-pointer'
                            }`}
                          >
                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
