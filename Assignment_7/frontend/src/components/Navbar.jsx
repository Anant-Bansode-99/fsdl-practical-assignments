import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { User, ShoppingBag, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center" style={{ width: '100%' }}>
        
        <div className="flex items-center gap-8">
          <Link to="/" className="logo">Luxe<span>.</span></Link>
          <div className="nav-links">
            <Link to="/shop?category=men" className="nav-link">Men</Link>
            <Link to="/shop?category=women" className="nav-link">Women</Link>
            <Link to="/shop?category=kids" className="nav-link">Kids</Link>
            <Link to="/shop?category=beauty" className="nav-link">Beauty</Link>
            <Link to="/shop" className="nav-link text-primary font-bold">SALE</Link>
          </div>
        </div>

        <div className="nav-actions">
          {user && user.role === 'admin' && (
            <Link to="/admin" className="action-item">
              <LayoutDashboard size={20} />
              <span>Admin</span>
            </Link>
          )}

          <Link to={user ? "/profile" : "/login"} className="action-item">
            <User size={20} />
            <span>Profile</span>
          </Link>

          <Link to="/cart" className="action-item relative" style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            <span>Bag</span>
            {cartItemCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: '-8px', right: '0px', background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', border: 'none' }}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
