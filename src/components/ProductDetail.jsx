import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError('Product not found');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.image,
        quantity: quantity,
        inStock: product.inStock
      });
      
      // Optional: Show a success message or notification
      console.log(`Added ${quantity} ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could show an error message to the user here
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading product...</p>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <div className="error-icon">❌</div>
      <p>{error}</p>
      <Link to="/products" className="breadcrumb-link">Back to Products</Link>
    </div>
  );

  if (!product) return (
    <div className="error-state">
      <div className="error-icon">🔍</div>
      <p>Product not found</p>
      <Link to="/products" className="breadcrumb-link">Back to Products</Link>
    </div>
  );

  const discountedPrice = product.price - (product.price * (product.discount / 100));
  const isInStock = product.inStock && product.quantity > 0;

  return (
    <div className="product-detail-container">
      <nav className="breadcrumb">
        <Link to="/products" className="breadcrumb-link">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        {/* Product Image */}
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-main-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>

          <div className="product-pricing">
            <span className="product-current-price">${discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="product-original-price">${product.price.toFixed(2)}</span>
                <span className="product-discount-badge">Save {product.discount}%</span>
              </>
            )}
          </div>

          <div className="product-meta">
            <span className={`product-stock-badge ${isInStock ? 'stock-available' : 'stock-unavailable'}`}>
              {isInStock ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
            </span>
            <span className="product-category">Category: {product.category?.name || 'Uncategorized'}</span>
          </div>

          {/* Add to Cart Section */}
          {isInStock && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <label className="quantity-label">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="quantity-select"
                  disabled={addingToCart}
                >
                  {[...Array(Math.min(product.quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                className="add-to-cart-button"
                disabled={addingToCart || !isInStock}
              >
                {addingToCart ? (
                  <>Adding to Cart...</>
                ) : (
                  <>Add to Cart - ${(discountedPrice * quantity).toFixed(2)}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;