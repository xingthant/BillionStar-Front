import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    quantity: '',
    inStock: true,
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discount: product.discount || '',
        quantity: product.quantity || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
        category: product.category?._id || ''
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = product?.image;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          }
        );
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        quantity: parseInt(formData.quantity),
        image: imageUrl,
        category: formData.category
      };

      let response;
      if (product) {
        // Update existing product
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${product._id}`,
          productData,
          { withCredentials: true }
        );
      } else {
        // Create new product
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products`,
          productData,
          { withCredentials: true }
        );
      }

      onSave(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form-input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="form-input"
              step="1"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity in Stock</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
                disabled={categories.length === 0}
                >
                <option value="">Select a category</option>
                {categories.length === 0 ? (
                    <option value="" disabled>Loading categories...</option>
                ) : (
                    categories.map(category => (
                    <option key={category._id} value={category._id}>
                        {category.name}
                    </option>
                    ))
                )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Stock Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <span>In Stock</span>
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {product?.image && !imageFile && (
              <div style={{ marginTop: '0.5rem' }}>
                <img 
                  src={product.image} 
                  alt="Current" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="4"
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #e5e7eb',
              background: 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
