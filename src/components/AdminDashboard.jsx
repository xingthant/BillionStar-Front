import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import UserForm from './UserForm';
import '../styles/Admin.css';
import React from 'react';
import NewArrivalManager from './NewArrivalManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError('');
      console.log('Starting data fetch...');
      
      // Fetch data with error handling for each endpoint
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/products`).catch(error => {
          console.error('Products fetch error:', error);
          return { data: [] };
        }),
        // FIXED: Added withCredentials for orders request
        axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
          withCredentials: true
        }).catch(error => {
          console.error('Orders fetch error:', error);
          if (error.response?.status === 401) {
            console.error('Authentication failed for orders endpoint');
          }
          return { data: [] };
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/categories`).catch(error => {
          console.error('Categories fetch error:', error);
          return { data: [] };
        })
      ]);

      console.log('API Responses:', {
        products: productsRes.data,
        orders: ordersRes.data,
        categories: categoriesRes.data
      });

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setCategories(categoriesRes.data || []);

      try {
      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        withCredentials: true
      });
        setUsers(usersRes.data || []);
      } catch(error) {
        console.log('Users endpoint not available yet, using empty array');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setFetchError('Failed to load data. Please check your backend server.');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders`,
        { withCredentials: true }
      );
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed when refreshing orders');
      }
    }
  };

  const handleViewOrderDetails = (order) => {
  setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
  setSelectedOrder(null);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        { withCredentials: true }
      );
      setProducts(products.filter(p => p._id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      alert('Error deleting product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveProduct = (savedProduct) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p._id === savedProduct._id ? savedProduct : p
      ));
    } else {
      setProducts([...products, savedProduct]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleCancelProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleSaveCategory = (savedCategory) => {
    if (editingCategory) {
      setCategories(categories.map(c => 
        c._id === savedCategory._id ? savedCategory : c
      ));
    } else {
      setCategories([...categories, savedCategory]);
    }
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/categories/${categoryId}`,
        { withCredentials: true }
      );
      setCategories(categories.filter(c => c._id !== categoryId));
      alert('Category deleted successfully!');
    } catch (error) {
      alert('Error deleting category: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const getSalesAnalytics = () => {
    const totalRevenue = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'finished');
    const pendingOrders = orders.filter(order => order.status === 'ordered');
    
    return {
      totalRevenue,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  };

  const analytics = getSalesAnalytics();

  const handleSaveUser = (savedUser) => {
    setUsers(users.map(u => 
      u._id === savedUser._id ? savedUser : u
    ));
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleCancelUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user._id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        { withCredentials: true }
      );
      
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('User deletion error:', error);
      alert('Error deleting user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        { withCredentials: true }
      );
      
      // Remove the order from the list
      setOrders(orders.filter(order => order._id !== orderId));
      
      // Close details modal if it's the deleted order
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
      
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {

      if (newStatus === 'delete') {
      await handleDeleteOrder(orderId);
      return;
      }
      console.log('Updating order:', orderId, 'to status:', newStatus);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        { status: newStatus },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update successful:', response.data);
      
      // Update orders list
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
      
      // Update selected order if it's the one being edited
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data);
      }
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error response:', error.response?.data);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown error occurred';
      
      alert('Error updating order status: ' + errorMessage);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
    ordered: { color: '#3b82f6', bgColor: '#dbeafe', text: 'Ordered' },
    processing: { color: '#f59e0b', bgColor: '#fef3c7', text: 'Processing' },
    shipped: { color: '#8b5cf6', bgColor: '#ede9fe', text: 'Shipped' },
    delivered: { color: '#10b981', bgColor: '#dcfce7', text: 'Delivered' },
    cancelled: { color: '#ef4444', bgColor: '#fee2e2', text: 'Cancelled' },
    finished: { color: '#6b7280', bgColor: '#f3f4f6', text: 'Finished' }
   };

   const config = statusConfig[status] || { color: '#6b7280', bgColor: '#f3f4f6', text: status ||'Unknown' };
    return (
      <span
        className='status-badge'
        style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: `1px solid ${config.color}20`,
        display: 'inline-block',
        minWidth: '80px',
        textAlign: 'center'
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      ordered: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['finished'],
      cancelled: [],
      finished: []
    };

    return statusFlow[currentStatus] || [];
  };

  const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
    if (!order) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="order-details">
            <div className="order-info-grid">
              <div className="order-info-item">
                <strong>Order ID:</strong> #{order._id?.slice(-8)}
              </div>
              <div className="order-info-item">
                <strong>Customer ID:</strong> {order.clerkUserId ? `User ${order.clerkUserId.slice(-8)}` : 'Guest'}
              </div>
              <div className="order-info-item">
                <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="order-info-item">
                <strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}
              </div>
              <div className="order-info-item">
                <strong>Current Status:</strong> {getStatusBadge(order.status)}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="shipping-address">
                <h3>Shipping Address</h3>
                <p>
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                  {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}

            <div className="order-items">
              <h3>Order Items ({order.items?.length || 0})</h3>
              <div className="items-list">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price?.toFixed(2)} each</p>
                      <p>Total: ${(item.price * item.quantity)?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="status-update">
              <h3>Update Order Status</h3>
              <div className="status-buttons">
                {getStatusOptions(order.status).map(status => (
                  <button
                    key={status}
                    className={`status-btn status-${status}`}
                    onClick={() => onStatusUpdate(order._id, status)}
                  >
                    Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
                {getStatusOptions(order.status).length === 0 && (
                  <p>No further status updates available for this order.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-empty">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
            Checking backend connection...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="admin-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>{fetchError}</p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
            Make sure your backend server is running on port 5000
          </p>
          <button 
            onClick={fetchData}
            className="continue-shopping-btn"
            style={{ marginTop: '1rem' }}
          >
            Retry Connection
          </button>
          <button 
            onClick={() => window.open('http://localhost:5000/api/products', '_blank')}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Test Backend API
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = statusFilter === 'all' 
  ? orders 
  : orders.filter(order => order.status === statusFilter);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage your e-commerce store</p>
        <button 
          onClick={fetchData}
          style={{
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            border: '1px solid ',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button 
          className={`admin-nav-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-nav-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button 
          className={`admin-nav-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({filteredOrders.length})
        </button>
        <button 
          className={`admin-nav-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={`admin-nav-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({categories.length})
        </button>

        <button 
          className={`admin-nav-button ${activeTab === 'new-arrivals' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-arrivals')}
        >
          New Arrivals ({newArrivals.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">Store Overview</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1', margin: '0 0 0.5rem 0' }}>{products.length}</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Total Products</p>
              </div>
              <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d', margin: '0 0 0.5rem 0' }}>{orders.length}</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Total Orders</p>
              </div>
              <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b45309', margin: '0 0 0.5rem 0' }}>{users.length}</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Total Users</p>
              </div>
              <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b91c1c', margin: '0 0 0.5rem 0' }}>{categories.length}</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Categories</p>
              </div>
            </div>
            
            {/* Revenue Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fdf2f8', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#be185d', margin: '0 0 0.5rem 0' }}>
                  ${analytics.totalRevenue.toFixed(2)}
                </h3>
                <p style={{ color: '#64748b', margin: 0 }}>Total Revenue</p>
              </div>
              <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b45309', margin: '0 0 0.5rem 0' }}>
                  {analytics.completedOrders}
                </h3>
                <p style={{ color: '#64748b', margin: 0 }}>Completed Orders</p>
              </div>
              <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d', margin: '0 0 0.5rem 0' }}>
                  {analytics.pendingOrders}
                </h3>
                <p style={{ color: '#64748b', margin: 0 }}>Pending Orders</p>
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
            {orders.length > 0 ? (
              orders.slice(0, 5).map(order => (
                <div key={order._id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Order #{order._id?.slice(-8) || 'N/A'}</span>
                    <span>${order.totalAmount || '0'}</span>
                    {order.status ? getStatusBadge(order.status) : <span>No Status</span>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No orders found</p>
            )}
          </div>
        </div>
      )}

    {activeTab === 'new-arrivals' && (
      <div className="admin-section">
        <NewArrivalManager />
      </div>
    )}

      {/* Products Tab */}
      {activeTab === 'products' && !showProductForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">Product Management</h2>
            <button className="add-button" onClick={handleAddProduct}>
              Add Product
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {products.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem' }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                          }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>{product.quantity}</td>
                      <td>{product.category?.name || 'No category'}</td>
                      <td>
                        <span className={`status-badge ${product.inStock ? 'status-delivered' : 'status-cancelled'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p>No products found. Click "Add Product" to create your first product.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Form */}
      {activeTab === 'products' && showProductForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button className="add-button" onClick={handleCancelProductForm}>
              Back to List
            </button>
          </div>
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancelProductForm}
          />
        </div>
      )}


      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">Order Management</h2>
            <div className="section-actions">
            <button className="refresh-btn" onClick={refreshOrders}>
             ↻ Refresh Orders
            </button>
          <div className="status-filters">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="ordered">Ordered</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="finished">Finished</option>
            </select>
            </div>
          </div>
        </div>
          <div style={{ overflowX: 'auto' }}>
            {filteredOrders.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className={`order-row status-${order.status}`}>
                  <td>#{order._id?.slice(-8) || 'N/A'}</td>
                  <td>
                    {order.clerkUserId ? `User ${order.clerkUserId.slice(-8)}` : 'Guest'}
                    {order.shippingAddress && (
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {order.shippingAddress.city}
                      </div>
                    )}
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <select
                      value={order.status || 'ordered'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="ordered">Ordered</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="finished">Finished</option>
                    </select>
                  </td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-btn"
                        onClick={() => handleViewOrderDetails(order)}
                      >
                        View Details
                      </button>
                      {/* ✅ ADD DELETE BUTTON */}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete Order"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p>No orders found yet.</p>
                <button 
                  onClick={refreshOrders}
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
                >
                  Retry Loading Orders
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onStatusUpdate={updateOrderStatus}
        />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && !showUserForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">User Management</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {users.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(userItem => (
                    <tr key={userItem._id}>
                      <td>
                        <strong>{userItem.username}</strong>
                        {userItem._id === user._id && (
                          <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>(You)</div>
                        )}
                      </td>
                      <td>{userItem.email}</td>
                      <td>{userItem.phoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${userItem.isAdmin ? 'status-ordered' : 'status-finished'}`}>
                          {userItem.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>{userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditUser(userItem)}
                            disabled={userItem._id === user._id}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(userItem._id)}
                            disabled={userItem._id === user._id}
                          >
                            Delete
                          </button>
                        </div>
                        {userItem._id === user._id && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Cannot edit/delete yourself
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p>No users found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab - Form View */}
      {activeTab === 'users' && showUserForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">Edit User</h2>
            <button className="add-button" onClick={handleCancelUserForm}>
              Back to List
            </button>
          </div>
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={handleCancelUserForm}
          />
        </div>
      )}

      {/* Categories Tab - List View */}
      {activeTab === 'categories' && !showCategoryForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">Category Management</h2>
            <button className="add-button" onClick={handleAddCategory}>
              Add Category
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {categories.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category._id}>
                      <td>
                        <strong>{category.name}</strong>
                      </td>
                      <td>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {products.filter(p => p.category?._id === category._id).length} products
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditCategory(category)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={products.some(p => p.category?._id === category._id)}
                          >
                            Delete
                          </button>
                        </div>
                        {products.some(p => p.category?._id === category._id) && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Cannot delete - has products
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p>No categories found. Click "Add Category" to create your first category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab - Form View */}
      {activeTab === 'categories' && showCategoryForm && (
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button className="add-button" onClick={handleCancelCategoryForm}>
              Back to List
            </button>
          </div>
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={handleCancelCategoryForm}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;