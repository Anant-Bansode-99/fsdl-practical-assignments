import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review State
  const [reviewingItem, setReviewingItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMessage('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/reviews/${reviewingItem}`, { rating, comment }, config);
      setReviewMessage('Review submitted successfully!');
      setTimeout(() => {
        setReviewingItem(null);
        setReviewMessage('');
        setComment('');
      }, 2000);
    } catch (error) {
      setReviewMessage(error.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 20px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>My Account</h2>
        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline">Logout</button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3>{user?.name}</h3>
            <p className="text-muted">{user?.email}</p>
            <span className="badge" style={{ marginTop: '0.5rem' }}>{user?.role.toUpperCase()}</span>
          </div>
        </div>

        {/* Orders Section */}
        <div style={{ gridColumn: 'span 2' }}>
          <h3>Order History</h3>
          {orders.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
              <p>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</Link>
            </div>
          ) : (
            <div className="flex-col gap-4 flex" style={{ marginTop: '1rem' }}>
              {orders.map(order => (
                <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div className="flex justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>ORDER ID</p>
                        <strong style={{ fontSize: '12px' }}>{order._id}</strong>
                      </div>
                      <div>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>DATE</p>
                        <strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong>
                      </div>
                      <div>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>TOTAL</p>
                        <strong className="text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>STATUS</p>
                        {order.isDelivered ? (
                          <strong style={{ color: 'var(--success)' }}>✓ Delivered</strong>
                        ) : order.isConfirmed ? (
                          <strong style={{ color: '#1D6EBC' }}>✓ Confirmed – Shipping Soon</strong>
                        ) : (
                          <strong style={{ color: '#D26000' }}>⏳ Awaiting Admin Confirmation</strong>
                        )}
                      </div>
                    </div>
                  </div>

                  <ul className="flex-col gap-3 flex">
                    {order.orderItems.map(item => (
                      <li key={item.product} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <img src={`http://localhost:5000${item.images?.[0] || item.image || ''}`} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} onError={(e)=>{e.target.style.display='none'}} />
                          <Link to={`/product/${item.product}`} className="font-bold hover:text-primary">{item.name}</Link>
                          <span className="text-muted">x{item.qty}</span>
                        </div>
                        
                        {/* Review Button */}
                        <button 
                          onClick={() => setReviewingItem(item.product)} 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                          Write Review
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h3>Submit Review</h3>
              <button onClick={() => { setReviewingItem(null); setReviewMessage(''); }} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>
            
            {reviewMessage && (
              <div style={{ padding: '0.75rem', background: reviewMessage.includes('Error') || reviewMessage.includes('already') ? 'var(--danger)' : 'var(--success)', color: 'white', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                {reviewMessage}
              </div>
            )}

            <form onSubmit={submitReview} className="flex-col gap-4 flex">
              <div>
                <label className="label">Rating</label>
                <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 - Excellent (Highly Recommended)</option>
                  <option value="4">4 - Very Good (Minor Flaws)</option>
                  <option value="3">3 - Good (Average)</option>
                  <option value="2">2 - Fair (Below Expectations)</option>
                  <option value="1">1 - Poor (Do Not Recommend)</option>
                </select>
              </div>
              <div>
                <label className="label">Your Comment</label>
                <textarea 
                  className="input" 
                  rows="4" 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="What did you like or dislike about this product?"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
