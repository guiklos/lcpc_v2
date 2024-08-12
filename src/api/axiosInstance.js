// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://localhost:5188', // Base URL da sua API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
