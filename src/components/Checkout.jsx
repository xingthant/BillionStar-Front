import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    city: '',
    street: '',
    building: '',
    contactPhoneNumber: ''
  });

  const total = getCartTotal();

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: item.price - (item.price * (item.discount / 100)),
          quantity: item.quantity
        })),
        totalAmount: total,
        shippingAddress
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        orderData,
        { withCredentials: true }
      );

      // Clear cart on successful order
      clearCart();
      
      // Redirect to order confirmation
      navigate('/order-confirmation', { 
        state: { order: response.data } 
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2 className="empty-cart-title">Your cart is empty</h2>
        <p className="empty-cart-message">Add some items to your cart before checking out.</p>
        <a href="/products" className="continue-shopping-btn">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-steps">
          <div className="checkout-step active">
            <span className="checkout-step-number">1</span>
            <span>Shipping</span>
          </div>
          <div className="checkout-step">
            <span className="checkout-step-number">2</span>
            <span>Payment</span>
          </div>
          <div className="checkout-step">
            <span className="checkout-step-number">3</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="checkout-grid">
        {/* Shipping Form */}
        <div className="shipping-form">
          <h2 className="shipping-title">Shipping Information</h2>
          
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="city" className="form-label">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="form-input"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="street" className="form-label">Street</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  className="form-input"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="Enter street name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="building" className="form-label">Building & Apt</label>
                <input
                  type="text"
                  id="building"
                  name="building"
                  required
                  className="form-input"
                  value={shippingAddress.building}
                  onChange={handleInputChange}
                  placeholder="Building number, apt/suite"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhoneNumber" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="contactPhoneNumber"
                  name="contactPhoneNumber"
                  required
                  className="form-input"
                  value={shippingAddress.contactPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your contact number"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="place-order-btn"
            >
              {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-items">
            {cartItems.map(item => {
              const discountedPrice = item.price - (item.price * (item.discount / 100));
              
              return (
                <div key={item._id} className="summary-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="summary-item-image"
                  />
                  <div className="summary-item-details">
                    <h4 className="summary-item-name">{item.name}</h4>
                    <div className="summary-item-price">${discountedPrice.toFixed(2)}</div>
                    <div className="summary-item-quantity">Qty: {item.quantity}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
