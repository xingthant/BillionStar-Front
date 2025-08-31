import { useState } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const UserForm = ({ user: userData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    email: userData?.email || '',
    phoneNumber: userData?.phoneNumber || '',
    isAdmin: userData?.isAdmin || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try different endpoints - your backend might use a different route
      let endpoint = `${import.meta.env.VITE_API_URL}/api/auth/users/${userData._id}`;
      
      const response = await axios.put(
        endpoint,
        formData,
        { withCredentials: true }
      );

      onSave(response.data);
    } catch (error) {
      console.error('User update error:', error);
      
      // Try alternative endpoints if the first one fails
      if (error.response?.status === 404) {
        try {
          // Try a different endpoint pattern
          const alternativeEndpoint = `${import.meta.env.VITE_API_URL}/api/users/${userData._id}`;
          const response = await axios.put(
            alternativeEndpoint,
            formData,
            { withCredentials: true }
          );
          onSave(response.data);
          return;
        } catch (secondError) {
          setError('User endpoint not found. Please check your backend routes.');
        }
      } else {
        setError(error.response?.data?.message || 'Error updating user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h3>Edit User: {userData.username}</h3>
      
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Check if your backend has the correct user update endpoint.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Role</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleInputChange}
                style={{ width: 'auto' }}
              />
              <span>Is Administrator</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update User'}
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

export default UserForm;
