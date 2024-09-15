import BackendApi from '../apis/BackendApi';

export const fetchTaskSummary = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.get('/api/tasks/summary', {
    headers: { 'x-auth-token': token },
  });    
  return response.data;
};

export const fetchTasks = async (queryParams) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.get(`/api/tasks?${queryParams}`, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const createTask = async (task) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.post('/api/tasks', task, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const updateTask = async (taskId, updates) => {
  const token = localStorage.getItem('accessToken');
  const response = await BackendApi.put(`/api/tasks/${taskId}`, updates, {
    headers: { 'x-auth-token': token },
  });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const token = localStorage.getItem('accessToken');
  await BackendApi.delete(`/api/tasks/${taskId}`, {
    headers: { 'x-auth-token': token },
  });
};