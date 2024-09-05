import axios from 'axios';

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => localStorage.getItem('token');

// Fungsi untuk membuat permintaan yang memerlukan autentikasi
const authenticatedRequest = async (url, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }
  
    try {
      const response = await axios.get(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error) {
      // Cek jika kesalahan karena token kedaluwarsa
      if (error.response?.status === 401) {
        // Redirect ke halaman login atau refresh token
        window.location.href = '/login'; // Atau logika lain untuk refresh token
      }
      console.error('Request error:', error.response?.data?.msg || 'An error occurred');
      throw error;
    }
  };
  

export default authenticatedRequest;
