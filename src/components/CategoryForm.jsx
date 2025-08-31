import { useState } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (category) {
        // Update existing category
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/categories/${category._id}`,
          { name: name.trim() },
          { withCredentials: true }
        );
      } else {
        // Create new category
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/categories`,
          { name: name.trim() },
          { withCredentials: true }
        );
      }

      onSave(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h3>{category ? 'Edit Category' : 'Add New Category'}</h3>
      
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
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Enter category name"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
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

export default CategoryForm;
