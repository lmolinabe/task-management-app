import AppBackendApi from '../apis/BackendApi';

export const fetchTasks = async () => {
  const token = localStorage.getItem('token');
  const response = await AppBackendApi.get('/api/tasks', {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const createTask = async (task) => {
  const token = localStorage.getItem('token');
  const response = await AppBackendApi.post('/api/tasks', task, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const updateTask = async (taskId, updates) => {
  const token = localStorage.getItem('token');
  const response = await AppBackendApi.put(`/api/tasks/${taskId}`, updates, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const token = localStorage.getItem('token');
  await AppBackendApi.delete(`/api/tasks/${taskId}`, {
    headers: { 'x-auth-token': token },
  });
};