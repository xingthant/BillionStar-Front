import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    clearCart 
  } = useCart();

  const total = getCartTotal();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart} />
      
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Shopping Cart</h2>
          <button className="close-cart" onClick={closeCart}>×</button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty</p>
              <Link to="/products" className="continue-shopping" onClick={closeCart}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map(item => {
                const discountedPrice = item.price - (item.price * (item.discount / 100));
                
                return (
                  <div key={item._id} className="cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">${discountedPrice.toFixed(2)}</p>
                      
                      <div className="cart-item-quantity">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                          className="quantity-input"
                          min="1"
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total:</span>
              <span className="cart-total-amount">${total.toFixed(2)}</span>
            </div>
            
            <Link to="/checkout" className="checkout-btn" onClick={closeCart}>
              Proceed to Checkout
            </Link>
            
            <button 
              onClick={clearCart}
              style={{
                width: '100%',
                marginTop: '30px',
                padding: '0.5rem',
                background: 'none',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;