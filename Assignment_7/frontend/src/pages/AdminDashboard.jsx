import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Category Form
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  
  // Product Form
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImages, setProdImages] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [user, navigate, activeTab]);



  const fetchAdminData = async () => {
    try {
      if (activeTab === 'categories' || activeTab === 'products') {
        const catRes = await axios.get('http://localhost:5000/api/categories');
        setCategories(catRes.data);
      }
      if (activeTab === 'orders') {
        setLoadingOrders(true);
        const authConfig = { headers: { Authorization: `Bearer ${user?.token}` } };
        const ordRes = await axios.get('http://localhost:5000/api/orders/all', authConfig);
        setOrders(ordRes.data);
        setLoadingOrders(false);
      }
    } catch (err) {
      console.error(err);
      setLoadingOrders(false);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      const authConfig = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}/confirm`, {}, authConfig);
      setSuccessMsg('Order confirmed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming order');
    }
  };

  const markDelivered = async (orderId) => {
    try {
      const authConfig = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}/deliver`, {}, authConfig);
      setSuccessMsg('Order marked as delivered!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order');
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      const authConfig = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('http://localhost:5000/api/categories', { name: catName, image: catImage }, authConfig);
      setSuccessMsg('Category added!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setCatName(''); setCatImage('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding category');
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      const formConfig = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      const formData = new FormData();
      formData.append('name', prodName);
      formData.append('description', prodDesc);
      formData.append('price', prodPrice);
      formData.append('category', prodCategory);
      formData.append('stock', prodStock);
      if (prodImages) {
        for (let i = 0; i < prodImages.length; i++) formData.append('images', prodImages[i]);
      }
      await axios.post('http://localhost:5000/api/products', formData, formConfig);
      setSuccessMsg('Product added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setProdName(''); setProdDesc(''); setProdPrice(''); setProdCategory(''); setProdStock(''); setProdImages(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product');
    }
  };

  const getStatusChip = (order) => {
    if (order.isDelivered) return { label: 'Delivered', color: '#03A685', bg: '#e6f7f3' };
    if (order.isConfirmed)  return { label: 'Confirmed – Shipping Soon', color: '#1D6EBC', bg: '#e8f1fb' };
    return { label: 'Pending Confirmation', color: '#D26000', bg: '#fff4e6' };
  };

  const tabs = [
    { id: 'orders', label: '🛒 Orders' },
    { id: 'categories', label: '📁 Categories' },
    { id: 'products', label: '📦 Products' },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 40px' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your store orders, categories, and products.</p>

      {successMsg && (
        <div style={{ padding: '0.75rem 1.5rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontWeight: '600' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2" style={{ marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              marginBottom: '-2px',
              letterSpacing: '0.5px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================ ORDERS TAB ============================ */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>
            All Customer Orders
            <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '8px' }}>
              {orders.filter(o => !o.isConfirmed).length} pending
            </span>
          </h3>

          {loadingOrders ? <p>Loading orders…</p> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No orders placed yet.</p>
            </div>
          ) : (
            <div className="flex-col flex gap-4">
              {orders.map(order => {
                const { label, color, bg } = getStatusChip(order);
                return (
                  <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    {/* Order Header */}
                    <div style={{ background: bg, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Order ID</p>
                        <strong style={{ fontSize: '13px' }}>{order._id}</strong>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Customer</p>
                        <strong>{order.user?.name} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({order.user?.email})</span></strong>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Date</p>
                        <strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Total</p>
                        <strong style={{ color: 'var(--primary)' }}>₹{order.totalPrice.toLocaleString('en-IN')}</strong>
                      </div>
                      <span style={{ background: color, color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {label}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div style={{ padding: '1rem 1.5rem' }}>
                      <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '6px 0', fontWeight: '700' }}>Product</th>
                            <th style={{ padding: '6px 0', fontWeight: '700' }}>Qty</th>
                            <th style={{ padding: '6px 0', fontWeight: '700' }}>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '8px 0' }}>{item.name}</td>
                              <td style={{ padding: '8px 0' }}>{item.qty}</td>
                              <td style={{ padding: '8px 0' }}>₹{(item.qty * item.price).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div style={{ marginTop: '0.75rem', fontSize: '13px', color: 'var(--text-muted)' }}>
                        📍 {order.shippingAddress?.address}, {order.shippingAddress?.city} – {order.shippingAddress?.postalCode}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3" style={{ marginTop: '1rem' }}>
                        {!order.isConfirmed && (
                          <button
                            onClick={() => confirmOrder(order._id)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '13px' }}
                          >
                            ✓ Confirm Order
                          </button>
                        )}
                        {order.isConfirmed && !order.isDelivered && (
                          <button
                            onClick={() => markDelivered(order._id)}
                            className="btn"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '13px', background: '#1D6EBC', color: 'white' }}
                          >
                            🚚 Mark as Delivered
                          </button>
                        )}
                        {order.isDelivered && (
                          <span style={{ color: '#03A685', fontWeight: '700', padding: '0.5rem 0' }}>✓ Order Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================ CATEGORIES TAB ============================ */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Category</h3>
            <form onSubmit={submitCategory} className="flex-col gap-4 flex">
              <div>
                <label className="label">Category Name</label>
                <input type="text" className="input" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Emoji Icon</label>
                <input type="text" className="input" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="e.g. 👕" required />
              </div>
              <button type="submit" className="btn btn-primary">Add Category</button>
            </form>
          </div>
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Existing Categories</h3>
            <ul className="flex-col gap-2 flex">
              {categories.map(cat => (
                <li key={cat._id} className="flex gap-4 items-center" style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.image}</span>
                  <strong>{cat.name}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ============================ PRODUCTS TAB ============================ */}
      {activeTab === 'products' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New Product</h3>
          <form onSubmit={submitProduct} className="flex-col gap-4 flex" style={{ maxWidth: '600px' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Product Name</label>
                <input type="text" className="input" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows="4" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₹ in INR)</label>
                <input type="number" step="1" className="input" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required placeholder="e.g. 1499" />
              </div>
              <div>
                <label className="label">Stock Quantity</label>
                <input type="number" className="input" value={prodStock} onChange={(e) => setProdStock(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Product Images</label>
              <input type="file" className="input" multiple accept="image/*" onChange={(e) => setProdImages(e.target.files)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Upload Product</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
