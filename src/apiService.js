import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Adjust the base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});
