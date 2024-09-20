import AppBackendApi from '../apis/BackendApi';

export const fetchUser = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await AppBackendApi.get('/api/users/profile', {
    headers: { 'x-auth-token': token },
    });
    return response.data;
}

export const updateUser = async (updatedData) => {
    const token = localStorage.getItem('accessToken');    
    const response = await AppBackendApi.put('/api/users/settings', updatedData, {
        headers: { 'x-auth-token': token },
        });
    return response.data;
}