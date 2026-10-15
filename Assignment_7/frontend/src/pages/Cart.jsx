import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = Math.round(cart.reduce((acc, item) => acc + item.qty * item.price, 0));

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 20px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Shopping Cart</h2>

      {cart.length === 0 ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h4>Your cart is empty</h4>
          <Link to="/shop" className="btn btn-outline" style={{ marginTop: '1rem' }}>Go Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          <div style={{ gridColumn: 'span 2' }}>
            <ul className="flex-col flex gap-4">
              {cart.map(item => (
                <li key={item.product} className="card flex items-center justify-between" style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex items-center gap-4">
                    <img src={`http://localhost:5000${item.image}`} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                    <Link to={`/product/${item.product}`} className="font-bold hover:text-primary">{item.name}</Link>
                  </div>
                  <div className="flex items-center gap-6">
                    <span style={{ fontWeight: '700', minWidth: '80px' }}>₹{item.price.toLocaleString('en-IN')}</span>
                    <select 
                      value={item.qty} 
                      onChange={(e) => addToCart({ _id: item.product, name: item.name, price: item.price, images: [item.image] }, Number(e.target.value) - item.qty)} 
                      className="input" 
                      style={{ width: '70px', padding: '0.25rem' }}
                    >
                      {[...Array(10).keys()].map(x => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                    <button onClick={() => removeFromCart(item.product)} className="text-danger" style={{ fontSize: '1.5rem', marginLeft: '1rem' }}>&times;</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>Order Summary</h3>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={checkoutHandler} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
