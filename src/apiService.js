import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://ps-ims-backend.vercel.app/api', // Adjust the base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});
