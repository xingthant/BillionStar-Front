import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/NewArrivalManager.css';

const NewArrivalManager = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArrival, setEditingArrival] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    subtitle: '',
    price: '',
    image: '',
    position: 0,
    featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      try {
        setLoading(true);
        const [arrivalsRes, productsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/new-arrivals/all`, {
            withCredentials: true
          }).catch(error => {
            console.error('New arrivals fetch error:', error);
            return { data: [] };
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/products`).catch(error => {
            console.error('Products fetch error:', error);
            return { data: [] };
          })
        ]);
        
        setNewArrivals(arrivalsRes.data || []);
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArrival) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/new-arrivals/${editingArrival._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/new-arrivals`,
          formData,
          { withCredentials: true }
        );
      }
      
      resetForm();
      fetchData();
      alert(editingArrival ? 'New arrival updated successfully!' : 'New arrival added successfully!');
    } catch (error) {
      console.error('Error saving new arrival:', error);
      alert('Error saving new arrival: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (arrival) => {
    setEditingArrival(arrival);
    setFormData({
      productId: arrival.product?._id || '',
      title: arrival.title,
      subtitle: arrival.subtitle || '',
      price: arrival.price,
      image: arrival.image,
      position: arrival.position || 0,
      featured: arrival.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this new arrival?')) return;
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/new-arrivals/${id}`,
        { withCredentials: true }
      );
      fetchData();
      alert('New arrival deleted successfully!');
    } catch (error) {
      console.error('Error deleting new arrival:', error);
      alert('Error deleting new arrival: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/new-arrivals/${id}/toggle`,
        {},
        { withCredentials: true }
      );
      fetchData();
      alert(`New arrival ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error toggling new arrival:', error);
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingArrival(null);
    setFormData({
      productId: '',
      title: '',
      subtitle: '',
      price: '',
      image: '',
      position: 0,
      featured: false
    });
  };

  const handleProductSelect = (productId) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productId,
        title: prev.title || selectedProduct.name,
        subtitle: prev.subtitle || selectedProduct.description?.substring(0, 50) + '...',
        price: prev.price || `From $${selectedProduct.price}`,
        image: prev.image || selectedProduct.image
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading new arrivals...</p>
      </div>
    );
  }

  return (
    <div className="new-arrival-manager">
      <div className="section-header">
        <h2 className="section-title">Manage New Arrivals</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-button"
        >
          + Add New Arrival
        </button>
      </div>

      {/* New Arrival Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingArrival ? 'Edit' : 'Add'} New Arrival</h3>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="new-arrival-form">
              <div className="form-group">
                <label>Select Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  required
                >
                  <option value="">Choose a product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter title"
                />
              </div>

              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Enter subtitle"
                />
              </div>

              <div className="form-group">
                <label>Price Text *</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  placeholder="e.g., From $49.99"
                />
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="image-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    Featured Item
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingArrival ? 'Update' : 'Create'} New Arrival
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Arrivals List */}
      <div className="new-arrivals-list">
        {newArrivals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🆕</div>
            <h3>No New Arrivals Yet</h3>
            <p>Click "Add New Arrival" to get started!</p>
          </div>
        ) : (
          <div className="arrivals-grid">
            {newArrivals.map(arrival => (
              <div key={arrival._id} className={`arrival-card ${!arrival.isActive ? 'inactive' : ''}`}>
                <div className="arrival-image-container">
                  <img 
                    src={arrival.image} 
                    alt={arrival.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1iZWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                  {arrival.featured && <span className="featured-badge">⭐ Featured</span>}
                </div>
                
                <div className="arrival-info">
                  <h4>{arrival.title}</h4>
                  {arrival.subtitle && <p className="subtitle">{arrival.subtitle}</p>}
                  <p className="price">{arrival.price}</p>
                  <div className="arrival-meta">
                    <span className={`status ${arrival.isActive ? 'active' : 'inactive'}`}>
                      {arrival.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="position">Position: {arrival.position}</span>
                  </div>
                  {arrival.product && (
                    <p className="product-link">Product: {arrival.product.name}</p>
                  )}
                </div>

                <div className="arrival-actions">
                  <button 
                    onClick={() => handleEdit(arrival)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => toggleActive(arrival._id, arrival.isActive)}
                    className={`btn btn-sm ${arrival.isActive ? 'btn-warning' : 'btn-success'}`}
                  >
                    {arrival.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDelete(arrival._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivalManager;
