import axios from 'axios';

const baseUrl = process.env.APP_BACKEND_URL || 'http://localhost:5000'; 

const BackendApi = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default BackendApi;