import { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, ArrowLeftRight } from 'lucide-react';
import api from '../api';

const TABS = [
  { key: 'vehicles', label: 'Vehicle Requests' },
  { key: 'transactions', label: 'Transactions' },
];

const ORDER_STATUS = {
  requested: <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">In Progress</span>,
  completed: <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Completed</span>,
  cancelled: <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">Cancelled</span>,
};

// ---- Vehicle Requests Panel ----
const VehiclesPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/all-requests');
      setRequests(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/requests/${id}`, { status });
      fetchRequests();
    } catch (error) { alert('Failed to update request'); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading...</div>;

  if (requests.length === 0) return (
    <div className="text-center py-16 glass-card rounded-3xl">
      <p className="text-slate-500 text-xl font-bold font-outfit">No vehicle requests in the system.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      {requests.map(vehicle => (
        <div key={vehicle._id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all">
          <div className="w-full md:w-72 h-48 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner relative">
            {vehicle.image ? <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400 font-medium">No Image</div>}
            <div className="absolute top-3 left-3">
              {vehicle.status === 'approved' && <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">APPROVED</span>}
              {vehicle.status === 'rejected' && <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">REJECTED</span>}
              {vehicle.status === 'pending'  && <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">PENDING</span>}
              {vehicle.status === 'reserved' && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">RESERVED</span>}
              {vehicle.status === 'sold'     && <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">SOLD</span>}
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-widest mb-3">{vehicle.type}</span>
                  <h3 className="text-2xl font-bold text-slate-900 font-outfit leading-tight mb-2">{vehicle.title}</h3>
                </div>
                <div className="text-2xl font-extrabold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl">₹{vehicle.price.toLocaleString('en-IN')}</div>
              </div>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-2">{vehicle.description}</p>
              <div className="bg-slate-50/80 rounded-xl p-4 text-sm border border-slate-200 shadow-inner">
                <span className="text-slate-500 font-medium">Seller:</span>
                <div className="mt-1">
                  <span className="font-bold text-slate-800">{vehicle.seller?.name}</span>
                  <span className="text-slate-500 ml-2 bg-white px-2 py-1 rounded-md border border-slate-100">{vehicle.seller?.email}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-slate-200/50">
              {vehicle.status !== 'rejected' && (
                <button onClick={() => handleUpdateStatus(vehicle._id, 'rejected')} className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold transition-all flex items-center gap-2">
                  <X className="w-5 h-5" /> Reject
                </button>
              )}
              {vehicle.status !== 'approved' && vehicle.status !== 'sold' && vehicle.status !== 'reserved' && (
                <button onClick={() => handleUpdateStatus(vehicle._id, 'approved')} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <Check className="w-5 h-5" /> Approve
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Transactions Panel ----
const TransactionsPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/transactions').then(({ data }) => setOrders(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading...</div>;

  if (orders.length === 0) return (
    <div className="text-center py-16 glass-card rounded-3xl">
      <p className="text-slate-500 text-xl font-bold font-outfit">No transactions recorded yet.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {orders.map(order => (
        <div key={order._id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vehicle image */}
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
              {order.vehicle?.image ? <img src={`http://localhost:5000${order.vehicle.image}`} alt={order.vehicle?.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No Image</div>}
            </div>

            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit">{order.vehicle?.title}</h3>
                  <p className="text-orange-600 font-extrabold text-2xl mt-1">₹{order.agreedPrice.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400 mt-1">{order.vehicle?.type?.toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>
                {ORDER_STATUS[order.status]}
              </div>

              {/* Buyer <-> Seller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-blue-600 font-bold uppercase tracking-wide text-xs mb-2">Buyer</p>
                  <p className="font-bold text-slate-800">{order.buyerName || order.buyer?.name}</p>
                  <p className="text-slate-600">{order.buyer?.email}</p>
                  <p className="text-slate-500 text-xs mt-1">📞 {order.buyerPhone}</p>
                  <p className="text-slate-500 text-xs">📍 {order.buyerAddress}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-emerald-600 font-bold uppercase tracking-wide text-xs mb-2">Seller</p>
                  <p className="font-bold text-slate-800">{order.seller?.name}</p>
                  <p className="text-slate-600">{order.seller?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Main Admin Dashboard ----
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="py-6">
      <div className="mb-10 p-6 glass-card rounded-3xl border-l-4 border-l-slate-900 flex items-center gap-4">
        <ShieldAlert className="w-12 h-12 text-slate-800" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Admin Panel</h1>
          <p className="text-slate-500 mt-1 font-medium">Oversee vehicle requests and view all completed transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200/70">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-all border-b-2 ${activeTab === tab.key ? 'border-orange-500 text-orange-600 bg-white/60' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/30'}`}
          >
            {tab.key === 'transactions' && <ArrowLeftRight className="w-4 h-4" />} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'vehicles'     && <VehiclesPanel />}
      {activeTab === 'transactions' && <TransactionsPanel />}
    </div>
  );
};

export default AdminDashboard;
