import React, { useState } from 'react';
import { X, ShoppingBag, User, Phone, MapPin } from 'lucide-react';
import api from '../api';

const BuyModal = ({ vehicle, onClose, onSuccess }) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/orders/place/${vehicle._id}`, {
        buyerName,
        buyerPhone,
        buyerAddress,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card rounded-3xl shadow-2xl p-8 border-t-4 border-t-orange-500 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2.5 rounded-xl text-white shadow-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">Purchase Request</h2>
            <p className="text-slate-500 text-sm font-medium">Seller will review and confirm the deal</p>
          </div>
        </div>

        {/* Vehicle summary */}
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100 flex items-center gap-4">
          {vehicle.image && (
            <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
          )}
          <div>
            <p className="font-bold text-slate-900 text-lg font-outfit">{vehicle.title}</p>
            <p className="text-orange-600 font-extrabold text-xl">₹{vehicle.price.toLocaleString('en-IN')}</p>
            <p className="text-slate-500 text-xs capitalize">{vehicle.type}</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              required
              type="text"
              placeholder="Your Full Name"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              required
              type="tel"
              placeholder="Your Phone Number"
              value={buyerPhone}
              onChange={e => setBuyerPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <textarea
              required
              placeholder="Your Delivery / Contact Address"
              rows={3}
              value={buyerAddress}
              onChange={e => setBuyerAddress(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium resize-none"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">How it works:</strong> After submitting, the vehicle will be reserved for you. The seller will review your details and confirm the deal. You'll see the status in <strong className="text-slate-800">My Purchases</strong>.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Placing Request...' : `Confirm Purchase – ₹${vehicle.price.toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyModal;
