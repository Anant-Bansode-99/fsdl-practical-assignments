import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [user, navigate, cart]);

  const itemsPrice = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const taxPrice = Math.round(0.18 * itemsPrice); // 18% GST
  const totalPrice = Math.round(itemsPrice + shippingPrice + taxPrice);

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    
    if (user && user.role === 'admin') {
      setError('Admins cannot purchase products. Please use a user account.');
      return;
    }

    setProcessing(true);
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const orderData = {
        orderItems: cart,
        shippingAddress: { address, city, postalCode },
        paymentMethod: 'Online Payment',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      await axios.post('http://localhost:5000/api/orders', orderData, config);
      clearCart();
      
      // Simulate Payment Processing
      setTimeout(() => {
        setProcessing(false);
        setSuccess('Payment is done! Order is successful and accepted.');
        setTimeout(() => navigate('/profile'), 3000);
      }, 2000);

    } catch (error) {
      setProcessing(false);
      setError(error.response?.data?.message || 'Error processing payment');
    }
  };

  if (success) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div style={{ padding: '3rem', textAlign: 'center', width: '100%', maxWidth: '500px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>✅</div>
          <h3>Payment Successful!</h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{success}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Redirecting you to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 20px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
      
      <div className="grid grid-cols-3 gap-8">
        <div style={{ gridColumn: 'span 2' }}>
          {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{error}</div>}
          
          <form onSubmit={placeOrderHandler} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Shipping Information</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Address</label>
                <input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input type="text" className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </div>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Payment Method</h4>
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#f8fafc' }}>
                  <strong>Online Payment</strong>
                </div>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem' }} disabled={processing}>
              {processing ? 'Processing Payment...' : 'Pay & Place Order'}
            </button>
          </form>
        </div>
        
        <div>
          <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>Order Summary</h3>
            <ul className="flex-col gap-2 flex" style={{ marginBottom: '1.5rem' }}>
              {cart.map(item => (
                <li key={item.product} className="flex justify-between items-center" style={{ fontSize: '14px' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{item.qty} × {item.name}</span>
                  <span>₹{(item.qty * item.price).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex-col gap-3 flex" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '14px' }}>
              <div className="flex justify-between items-center">
                <span>Items</span>
                <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping {itemsPrice > 999 ? <span style={{ color: 'var(--success)', fontSize: '12px' }}>(FREE)</span> : ''}</span>
                <span>₹{shippingPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>GST (18%)</span>
                <span>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: '700', fontSize: '16px' }}>
                <span>Total Payable</span>
                <span style={{ color: 'var(--primary)' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
