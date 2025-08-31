import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Products.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (categoryId = 'all') => {
    try {
      setLoading(true);
      setError('');
      
      // Use the same API base URL for consistency
      const url = `${import.meta.env.VITE_API_URL}/api/products`;
      const response = await axios.get(url);
      
      // Filter products on the frontend instead of backend query
      let filteredProducts = response.data;
      
      if (categoryId !== 'all') {
        filteredProducts = response.data.filter(product => 
          product.category?._id === categoryId || product.category === categoryId
        );
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts(categoryId);
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading products...</p>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <button 
        onClick={() => fetchProducts('all')}
        className="retry-button"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="products-container">
      <div className="products-header">
        <h1 className="products-title">Our Products</h1>
        <p className="products-subtitle">Discover our amazing collection</p>
      </div>
      
      {/* Category Filter */}
      <div className="filters-section">
        <h2 className="filters-title">Filter by Category</h2>
        <div className="filters-grid">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(category._id)}
              className={`filter-button ${selectedCategory === category._id ? 'active' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="products-grid">
        {products.map(product => {
          // Calculate discounted price safely
          const discount = product.discount || 0;
          const originalPrice = product.price || 0;
          const discountedPrice = originalPrice - (originalPrice * (discount / 100));
          const isInStock = product.inStock && (product.quantity > 0 || product.inStock === true);

          return (
            <Link key={product._id} to={`/products/${product._id}`} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-price-section">
                  <div className="price-container">
                    <span className="product-price">{discountedPrice.toFixed(2)}฿</span>
                    {discount > 0 && (
                      <>
                        <span className="product-original-price">{originalPrice.toFixed(2)}฿</span>
                        <span className="product-discount">-{discount}%</span>
                      </>
                    )}
                  </div>
                  
                  <span className={`product-stock ${isInStock ? 'stock-in' : 'stock-out'}`}>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Category badge */}
                {product.category && (
                  <div className="product-category">
                    {product.category.name || product.category}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-subtitle">
            {selectedCategory !== 'all' 
              ? `No products in this category.` 
              : 'Check back later for new arrivals!'
            }
          </p>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => handleCategoryChange('all')}
              className="view-all-button"
            >
              View All Products
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
