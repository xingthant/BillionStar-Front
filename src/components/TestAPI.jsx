import { useState } from 'react';
import axios from 'axios';

const TestAPI = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
        withCredentials: true
      });
      setMessage(`API Success: ${response.data.length} products found`);
    } catch (error) {
      setMessage(`API Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <button 
        onClick={testBackend} 
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
};

export default TestAPI;
