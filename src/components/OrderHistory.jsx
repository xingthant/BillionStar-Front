import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Orders.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/my-orders');
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        if (retryCount < 1) {
          // Try to refresh auth status first
          await checkAuthStatus();
          return fetchOrders(retryCount + 1);
        }
        setError('Your session has expired. Please login again.');
        logout();
      } else if (error.response?.status === 404) {
        setError('Orders endpoint not found. Please contact support.');
      } else {
        setError('Failed to fetch orders. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <div className="empty-orders-icon">📦</div>
        <h2 className="empty-orders-title">No orders yet</h2>
        <p className="empty-orders-message">Your order history will appear here once you start shopping.</p>
        <Link to="/products" className="continue-shopping-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Your Orders</h1>
        <p className="orders-subtitle">
          Hello {user?.username}, here's your order history
        </p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                <div className="order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="order-status">
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="order-details">
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-image"
                    />
                    <div className="order-item-info">
                      <h4 className="order-item-name">{item.name}</h4>
                      <div className="order-item-price">${item.price}</div>
                      <div className="order-item-quantity">Quantity: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Total Amount:</span>
                  <span>${order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
