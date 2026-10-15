import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prodRes = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(prodRes.data);
        const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(reviewRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, Number(qty));
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    
    if (!user) {
      setReviewError('Please login to submit a review');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/reviews/${id}`, { rating, comment }, config);
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      
      // Refresh reviews
      const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(reviewRes.data);
    } catch (error) {
      setReviewError(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 20px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>&larr; Go Back</button>
      
      <div className="grid grid-cols-2 gap-8">
        <div style={{ backgroundColor: '#f1f5f9', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '2rem' }}>
          {product.images?.[0] ? (
            <img src={`http://localhost:5000${product.images[0]}`} alt={product.name} style={{ width: '100%', borderRadius: 'inherit' }} />
          ) : (
            <span style={{ fontSize: '5rem', color: '#cbd5e1' }}>📸</span>
          )}
        </div>
        
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.name}</h1>
          
          <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
            <span className="badge" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>★ {product.averageRating?.toFixed(1) || '0.0'} ({product.numReviews} Reviews)</span>
            {product.category && <span style={{ color: 'var(--text-muted)' }}>MFA: {product.category.name}</span>}
          </div>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.7' }}>
            {product.description}
          </p>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span>Price:</span>
              <div>
                <span style={{ fontWeight: '700', fontSize: '1.5rem', color: 'var(--primary)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '14px', marginLeft: '8px' }}>₹{Math.round(product.price * 1.5).toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <span>Status:</span>
              <span style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <select value={qty} onChange={(e) => setQty(e.target.value)} className="input" style={{ width: '80px' }}>
                  {[...Array(Math.min(product.stock, 10)).keys()].map(x => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
                <button onClick={handleAddToCart} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Customer Reviews</h3>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            {reviews.length === 0 ? <p>No reviews yet.</p> : (
              <ul className="flex-col flex gap-4">
                {reviews.map(review => (
                  <li key={review._id} className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <strong>{review.name}</strong>
                      <span className="badge">★ {review.rating}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{review.comment}</p>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4>Write a Review</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You must purchase and receive this product to write a review.</p>
              
              {reviewError && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{reviewError}</div>}
              {reviewSuccess && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem' }}>{reviewSuccess}</div>}

              {user ? (
                <form onSubmit={submitReview} className="flex-col flex gap-4 mt-4">
                  <div>
                    <label className="label">Rating</label>
                    <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Comment</label>
                    <textarea 
                      className="input" 
                      rows="3" 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      required
                      placeholder="Share your feedback..."
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
              ) : (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  Please <Link to={`/login?redirect=/product/${id}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>sign in</Link> to write a review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
