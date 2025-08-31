import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Orders.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        { withCredentials: true }
      );
      setOrder(response.data);
    } catch (error) {
      setError('Failed to fetch order details');
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ordered': return 'status-ordered';
      case 'cancelled': return 'status-cancelled';
      case 'delivered': return 'status-delivered';
      case 'finished': return 'status-finished';
      default: return 'status-ordered';
    }
  };

  if (loading) return <div className="loading-state">Loading order details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!order) return <div className="error-state">Order not found</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Order Details</h1>
        <Link to="/orders" className="continue-shopping-btn">
          ← Back to Orders
        </Link>
      </div>

      <div className="order-card">
        <div className="order-header">
          <div className="order-info">
            <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
            <div className="order-date">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className={`order-status ${getStatusBadge(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        // In your OrderDetailsModal component, add this to the modal header:
      <div className="modal-header">
        <h2>Order Details</h2>
        <div className="modal-actions">
          <button 
            className="modal-delete-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this order?')) {
                onStatusUpdate(order._id, 'delete');
                onClose();
              }
            }}
            title="Delete Order"
          >
            🗑️ Delete
          </button>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
      </div>

        <div className="order-details">
          <div className="order-items">
            <h3>Items Ordered</h3>
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
              <span>Subtotal</span>
              <span>${order.totalAmount}</span>
            </div>
            <div className="order-total-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="order-total-row">
              <span>Tax (10%)</span>
              <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
            </div>
            <div className="order-total-row order-grand-total">
              <span>Total</span>
              <span>${(order.totalAmount * 1.1).toFixed(2)}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="order-shipping">
              <h3>Shipping Address</h3>
              <div className="shipping-address">
                <p><strong>Building:</strong> {order.shippingAddress.building}</p>
                <p><strong>Street:</strong> {order.shippingAddress.street}</p>
                <p><strong>City:</strong> {order.shippingAddress.city}</p>
                <p><strong>Phone:</strong> {order.shippingAddress.contactPhoneNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
