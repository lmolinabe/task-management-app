import axios from 'axios';

const BackendApi = axios.create({
    baseURL: process.env.APP_BACKEND_URL || 'http://localhost:5000'
});

export default BackendApi;