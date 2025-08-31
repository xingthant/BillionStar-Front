import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const CartIcon = () => {
  try {
    const { getCartItemsCount, toggleCart } = useCart();
    const itemCount = getCartItemsCount();

    return (
      <div className="cart-icon" onClick={toggleCart}>
        <span>🛒</span>
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </div>
    );
  } catch (error) {
    // Fallback UI if CartContext is not available
    return (
      <div className="cart-icon">
        <span>🛒</span>
      </div>
    );
  }
};

export default CartIcon;