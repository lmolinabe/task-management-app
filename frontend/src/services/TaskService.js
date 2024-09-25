import BackendApi from '../apis/BackendApi';

export const fetchTaskSummary = async (csrfToken) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.get('/api/tasks/summary', {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
  },);    
  return response.data;
};

export const fetchTasks = async (queryParams, csrfToken) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.get(`/api/tasks?${queryParams}`, {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
  });
  return response.data;
};

export const createTask = async (task, csrfToken) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.post('/api/tasks', task, {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
  });
  return response.data;
};

export const updateTask = async (taskId, updates, csrfToken) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.put(`/api/tasks/${taskId}`, updates, {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
  });
  return response.data;
};

export const deleteTask = async (taskId, csrfToken) => {
  const token = localStorage.getItem('accessToken');
  await BackendApi.delete(`/api/tasks/${taskId}`, {
    headers: { 'x-auth-token': token, 'x-csrf-token': csrfToken },
  });
};