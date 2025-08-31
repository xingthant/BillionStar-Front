import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';
import '../styles/Header.css';
import { useState } from 'react';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-icon">
              <span className="text-white">B</span>
            </div>
            <span className="logo-text">Billionaire</span>
          </div>
          <div className="loading">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img src="/logo.jpg" alt="" className='b-logo'/>
          </div>
          <span className="logo-text">Billionaire OS</span>
        </Link>

        {/* Navigation Toggle Button for Mobile */}
        <button className="nav-toggle" onClick={toggleNav} aria-label="Toggle navigation">
          <span className="hamburger"></span>
        </button>

        <nav className={`nav ${isNavOpen ? 'nav--open' : ''}`}>
          <Link to="/products" className="nav-link" onClick={toggleNav}>Products</Link>
          <Link to="/contact" className="nav-link" onClick={toggleNav}>Contact</Link>
          <Link to="/orders" className="nav-link" onClick={toggleNav}>My Orders</Link>
        </nav>

        <div className="user-actions">
          {/* Cart Icon */}
          <CartIcon />
          
          {user ? (
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="user-greeting">Hi, {user.username}</span>
              </div>
              {user.isAdmin && (
                <Link to="/admin" className="admin-badge">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
