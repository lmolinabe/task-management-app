import AppBackendApi from '../apis/BackendApi';

export const fetchUser = async (csrfToken) => {
    const token = localStorage.getItem('accessToken');
    const response = await AppBackendApi.get('/api/users/profile', {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
    });
    return response.data;
}

export const updateUser = async (updatedData, csrfToken) => {
    const token = localStorage.getItem('accessToken');    
    const response = await AppBackendApi.put('/api/users/settings', updatedData, {
        headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
        });
    return response.data;
}