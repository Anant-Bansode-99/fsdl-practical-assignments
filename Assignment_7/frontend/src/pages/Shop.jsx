import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category && (p.category._id === selectedCategory || p.category.name.toLowerCase() === selectedCategory.toLowerCase()))
    : products;

  if (loading) return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Loading Catalog...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 40px' }}>
      
      {/* Breadcrumbs */}
      <div style={{ fontSize: '14px', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: '600' }}>
        Home / Shop {selectedCategory && `/ ${selectedCategory}`}
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: '2rem' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '16px' }}>FILTERS</h3>
            
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text-main)' }}>CATEGORIES</h4>
              <ul className="flex-col gap-2 flex" style={{ fontSize: '14px' }}>
                <li>
                  <Link to="/shop" style={{ color: !selectedCategory ? 'var(--primary)' : 'var(--text-muted)', fontWeight: !selectedCategory ? '700' : '400' }}>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" checked={!selectedCategory} readOnly style={{ accentColor: 'var(--primary)' }} /> All Products
                    </div>
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat._id}>
                    <Link to={`/shop?category=${cat._id}`} style={{ color: selectedCategory === cat._id ? 'var(--primary)' : 'var(--text-muted)', fontWeight: selectedCategory === cat._id ? '700' : '400' }}>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" checked={selectedCategory === cat._id} readOnly style={{ accentColor: 'var(--primary)' }} /> {cat.name}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '1rem', color: 'var(--text-main)' }}>PRICE</h4>
              <ul className="flex-col gap-2 flex" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                <li><input type="checkbox" /> Under Rs. 499</li>
                <li><input type="checkbox" /> Rs. 500 - Rs. 999</li>
                <li><input type="checkbox" /> Rs. 1000 - Rs. 1999</li>
                <li><input type="checkbox" /> Rs. 2000 & Above</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>
              {selectedCategory && categories.find(c => c._id === selectedCategory) 
                ? categories.find(c => c._id === selectedCategory).name 
                : (selectedCategory || 'All Products')} 
              <span style={{ color: 'var(--text-light)', fontWeight: '400', fontSize: '16px', marginLeft: '10px' }}>- {filteredProducts.length} items</span>
            </h2>
            <select className="input" style={{ width: '250px', padding: '0.5rem', fontSize: '14px' }}>
              <option>Sort by: Recommended</option>
              <option>Price: High to Low</option>
              <option>Price: Low to High</option>
              <option>Customer Rating</option>
            </select>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
               <h3 style={{ color: 'var(--text-muted)' }}>We couldn't find any matches!</h3>
               <p>Please check the spelling or try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {filteredProducts.map(product => (
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
                      Rs. {Math.round(product.price * 80)} <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '12px', fontWeight: '400', marginLeft: '5px' }}>Rs. {Math.round(product.price * 80 * 1.5)}</span> <span style={{ color: 'var(--warning)', fontSize: '12px', marginLeft: '5px' }}>(33% OFF)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
