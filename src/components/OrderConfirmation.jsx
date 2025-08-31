import { useLocation, Link } from 'react-router-dom';
import '../styles/Checkout.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">❌</div>
        <h2 className="empty-cart-title">Order Not Found</h2>
        <p className="empty-cart-message">Unable to find order details.</p>
        <Link to="/products" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Order Confirmed!</h1>
        <p>Thank you for your order, {order.shippingAddress?.contactPhoneNumber}!</p>
      </div>

      <div className="shipping-form">
        <h2 className="shipping-title">Order Details</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Order Information</h3>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style={{ 
            color: order.status === 'ordered' ? '#2563eb' : '#059669',
            fontWeight: '600'
          }}>{order.status}</span></p>
          <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Shipping Address</h3>
          <p>{order.shippingAddress?.building}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}</p>
          <p>Phone: {order.shippingAddress?.contactPhoneNumber}</p>
        </div>

        <div className="summary-items">
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Items Ordered</h3>
          {order.items?.map(item => (
            <div key={item.productId} className="summary-item">
              <img
                src={item.image}
                alt={item.name}
                className="summary-item-image"
              />
              <div className="summary-item-details">
                <h4 className="summary-item-name">{item.name}</h4>
                <div className="summary-item-price">${item.price}</div>
                <div className="summary-item-quantity">Qty: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <Link 
            to="/orders" 
            style={{ 
              display: 'block', 
              marginTop: '1rem', 
              color: '#2563eb', 
              textDecoration: 'none' 
            }}
          >
            View Your Orders →
          </Link>
        </div>
      </div>
    </div>
  );
};

<div style={{ textAlign: 'center', marginTop: '2rem' }}>
  <Link to="/products" className="continue-shopping-btn">
    Continue Shopping
  </Link>
  <Link 
    to="/orders" 
    style={{ 
      display: 'block', 
      marginTop: '1rem', 
      color: '#2563eb', 
      textDecoration: 'none',
      fontWeight: '500'
    }}
  >
    View All Orders →
  </Link>
</div>

export default OrderConfirmation;