import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Clock, CheckCircle, XCircle, DollarSign, ShoppingBag, Package, ChevronRight, Check, X } from 'lucide-react';
import api from '../api';

const STATUS_BADGE = {
  approved: <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>,
  rejected: <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wide border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>,
  sold:     <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-white text-xs font-bold uppercase tracking-wide"><DollarSign className="w-3.5 h-3.5" /> Sold</span>,
  reserved: <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-200"><Clock className="w-3.5 h-3.5" /> Reserved</span>,
  pending:  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>,
};

const ORDER_STATUS_BADGE = {
  requested:  <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide border border-amber-200">Awaiting Seller</span>,
  completed:  <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide border border-emerald-200">Deal Done ✓</span>,
  cancelled:  <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wide border border-rose-200">Cancelled</span>,
};

const TABS = [
  { key: 'garage', label: 'My Garage', icon: <Package className="w-4 h-4" /> },
  { key: 'purchases', label: 'My Purchases', icon: <ShoppingBag className="w-4 h-4" /> },
  { key: 'incoming', label: 'Incoming Requests', icon: <ChevronRight className="w-4 h-4" /> },
];

// ---- Sell Form ----
const SellForm = ({ onSubmitted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('car');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('type', type);
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post('/vehicles/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSubmitted();
    } catch (error) {
      alert('Failed to submit vehicle request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl mb-12 max-w-3xl mx-auto border-t-4 border-t-orange-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">New Sale Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title <span className="text-slate-400 font-normal">(e.g., 2018 Honda City)</span></label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border-slate-300 bg-slate-50/50 rounded-xl shadow-inner focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-3 border transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label>
            <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full border-slate-300 bg-slate-50/50 rounded-xl shadow-inner focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-3 border transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border-slate-300 bg-slate-50/50 rounded-xl shadow-inner focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-3 border transition-colors">
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full border-slate-300 bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 rounded-xl p-2 border transition-colors cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
          <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full border-slate-300 bg-slate-50/50 rounded-xl shadow-inner focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-3 border transition-colors"></textarea>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

// ---- My Garage Tab ----
const GarageTab = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchMyVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles/my-requests');
      setVehicles(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyVehicles(); }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;

  return (
    <>
      <div className="flex justify-end mb-8">
        <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'}`}>
          {showForm ? 'Cancel' : <><PlusCircle className="w-5 h-5" /> Sell Vehicle</>}
        </button>
      </div>
      {showForm && <SellForm onSubmitted={() => { setShowForm(false); fetchMyVehicles(); }} />}
      {vehicles.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl"><p className="text-slate-500 text-xl font-medium">You haven't listed any vehicles yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle._id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 flex-shrink-0 relative">
                {vehicle.image ? <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full text-slate-400 font-medium">No Image Uploaded</div>}
                <div className="absolute top-4 right-4">{STATUS_BADGE[vehicle.status] || STATUS_BADGE.pending}</div>
              </div>
              <div className="p-6 flex flex-col flex-grow bg-white/40">
                <h3 className="text-xl font-bold text-slate-900 font-outfit leading-tight mb-2">{vehicle.title}</h3>
                <p className="text-orange-600 font-extrabold text-xl mb-4">₹{vehicle.price.toLocaleString('en-IN')}</p>
                <div className="bg-white/60 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed flex-grow">{vehicle.description}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-4 pt-4 border-t border-slate-200/50">Type: {vehicle.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ---- My Purchases Tab ----
const PurchasesTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-purchases').then(({ data }) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (orders.length === 0) return <div className="text-center py-20 glass-card rounded-3xl"><p className="text-slate-500 text-xl font-medium">You haven't purchased anything yet.</p></div>;

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order._id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 h-36 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
            {order.vehicle?.image ? <img src={`http://localhost:5000${order.vehicle.image}`} alt={order.vehicle.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400 font-medium">No Image</div>}
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-outfit">{order.vehicle?.title}</h3>
                <p className="text-orange-600 font-extrabold text-xl">₹{order.agreedPrice.toLocaleString('en-IN')}</p>
              </div>
              {ORDER_STATUS_BADGE[order.status]}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-medium mb-1">Seller</p>
                <p className="font-bold text-slate-800">{order.seller?.name}</p>
                <p className="text-slate-500">{order.seller?.email}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-medium mb-1">Your Contact Info Submitted</p>
                <p className="font-bold text-slate-800">{order.buyerName}</p>
                <p className="text-slate-500">{order.buyerPhone}</p>
                <p className="text-slate-400 text-xs mt-1">{order.buyerAddress}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Requested on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Incoming Requests Tab (Seller view) ----
const IncomingTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get('/orders/incoming').then(({ data }) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleAction = async (orderId, action) => {
    try {
      await api.patch(`/orders/${action}/${orderId}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (orders.length === 0) return <div className="text-center py-20 glass-card rounded-3xl"><p className="text-slate-500 text-xl font-medium">No purchase requests for your vehicles yet.</p></div>;

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order._id} className="glass-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
              {order.vehicle?.image ? <img src={`http://localhost:5000${order.vehicle.image}`} alt={order.vehicle.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No Image</div>}
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit">{order.vehicle?.title}</h3>
                  <p className="text-orange-600 font-extrabold text-xl">₹{order.agreedPrice.toLocaleString('en-IN')}</p>
                </div>
                {ORDER_STATUS_BADGE[order.status]}
              </div>

              {/* Buyer details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm mb-4">
                <p className="font-bold text-slate-700 mb-2">Buyer's Details:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div><span className="text-slate-500">Name: </span><span className="font-semibold text-slate-800">{order.buyerName}</span></div>
                  <div><span className="text-slate-500">Email: </span><span className="font-semibold text-slate-800">{order.buyer?.email}</span></div>
                  <div><span className="text-slate-500">Phone: </span><span className="font-semibold text-slate-800">{order.buyerPhone}</span></div>
                </div>
                <div className="mt-2"><span className="text-slate-500">Address: </span><span className="font-semibold text-slate-800">{order.buyerAddress}</span></div>
              </div>

              <p className="text-xs text-slate-400 mb-4">Requested on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>

              {order.status === 'requested' && (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleAction(order._id, 'cancel')} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold text-sm transition-all">
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button onClick={() => handleAction(order._id, 'confirm')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    <Check className="w-4 h-4" /> Confirm Deal Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Main Dashboard ----
const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('garage');

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 font-outfit">My Account</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Welcome back, <span className="text-slate-700 font-bold">{user?.name}</span></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200/70 pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-all border-b-2 ${activeTab === tab.key ? 'border-orange-500 text-orange-600 bg-white/60' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/30'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'garage'    && <GarageTab />}
      {activeTab === 'purchases' && <PurchasesTab />}
      {activeTab === 'incoming'  && <IncomingTab />}
    </div>
  );
};

export default UserDashboard;
