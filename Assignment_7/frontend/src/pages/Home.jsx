import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/products')
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data.slice(0, 10)); // Show top 10 products
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading Collection...</div>;

  return (
    <div className="animate-fade-in">
      <section className="hero">
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800' }}>Unleash Your Style</h1>
          <p style={{ fontWeight: '400', opacity: 1 }}>Explore the biggest brands and the freshest fits of the season.</p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Category Circles - Signature Look */}
      <section className="container" style={{ padding: '4rem 40px' }}>
        <h2 className="section-title">Shop by Category</h2>
        <div className="flex justify-center gap-8" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          {categories.map((cat) => (
            <Link to={`/shop?category=${cat._id}`} key={cat._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '100px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '2px solid var(--border)', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {cat.image || '🛒'}
              </div>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: '700' }}>{cat.name}</h3>
            </Link>
          ))}
          {categories.length === 0 && <p className="text-muted">No categories available.</p>}
        </div>
      </section>

      {/* Featured Brands / Deals Banner */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ background: 'var(--secondary)', color: 'white', padding: '3rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0 }}>End of Season Sale</h2>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '1.2rem' }}>50-80% OFF on Top Brands.</p>
          </div>
          <Link to="/shop?sale=true" className="btn" style={{ background: 'white', color: 'var(--secondary)' }}>Grab Deals</Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container" style={{ padding: '0 40px 5rem' }}>
        <h2 className="section-title">Trending Now</h2>
        <div className="grid grid-cols-5 gap-6">
          {products.map((product) => (
            <Link to={`/product/${product._id}`} key={product._id} className="product-card">
              <div className="img-wrapper">
                {product.images?.[0] ? (
                  <img src={`http://localhost:5000${product.images[0]}`} alt={product.name} />
                ) : (
                   <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📸</div>
                )}
                {product.averageRating > 0 && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {product.averageRating?.toFixed(1)} <span style={{ color: 'var(--success)' }}>★</span> | {product.numReviews}
                  </div>
                )}
              </div>
              <div className="details">
                <h3 className="brand">{product.category?.name || 'Luxe Brand'}</h3>
                <h4>{product.name}</h4>
                <div className="price">
                  Rs. {Math.round(product.price * 80)} <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '12px', fontWeight: '400', marginLeft: '5px' }}>Rs. {Math.round(product.price * 80 * 1.5)}</span> <span style={{ color: 'var(--danger)', fontSize: '12px', marginLeft: '5px' }}>(33% OFF)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
