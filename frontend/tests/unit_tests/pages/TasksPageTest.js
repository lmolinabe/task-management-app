import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TasksPage from '../../../src/pages/TasksPage';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../../src/services/TaskService';
import AppBackendApi from '../../../src/apis/BackendApi';

// Mock the TaskService functions
jest.mock('../../../src/services/TaskService');
// Mock the Backend API
jest.mock('../../../src/apis/BackendApi');

describe('TasksPage', () => {
  const mockTasks = [
    { _id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2024-01-01T12:00:00.000Z', status: 'pending' },
    { _id: '2', title: 'Task 2', description: 'Description 2', dueDate: '2024-01-05T12:00:00.000Z', status: 'in-progress' },
    { _id: '3', title: 'Task 3', description: 'Description 3', dueDate: '2024-01-10T12:00:00.000Z', status: 'completed' },
  ];

  const mockTask = [
    { _id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2024-01-01T12:00:00.000Z', status: 'pending' },
  ];

  const mockTasksBefore = [
    { _id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2024-01-01T12:00:00.000Z', status: 'pending' },
  ];

  const mockTasksAfter = [
    { _id: '2', title: 'Task 2', description: 'Description 2', dueDate: '2024-01-01T12:00:00.000Z', status: 'pending' },
  ];  

  beforeEach(() => {
    // Reset mocks before each test
    fetchTasks.mockReset();
    createTask.mockReset();
    updateTask.mockReset();
    deleteTask.mockReset();

    // Mock the CSRF token fetch
    AppBackendApi.get.mockResolvedValue({ data: { csrfToken: 'mock-csrf-token' } });    
  });

  it('renders tasks from the API', async () => {
    fetchTasks.mockResolvedValueOnce({ data: mockTasks, totalTasks: 3 });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(await screen.findByText('Task 2')).toBeInTheDocument();
    expect(await screen.findByText('Task 3')).toBeInTheDocument();
  });

  it('displays an error message if fetching tasks fails', async () => {
    const errorMessage = 'Error fetching tasks';
    fetchTasks.mockRejectedValueOnce(errorMessage);

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('creates a new task', async () => {
    const newTask = {
      _id: '1',
      title: 'New Task',
      description: 'New Description',
      dueDate: '2024-12-25',
      status: 'pending',
    };
    createTask.mockResolvedValueOnce(newTask);
    fetchTasks.mockResolvedValueOnce({ data: [], totalTasks: 0 }); // Initially no tasks

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add')); // Open the task form
    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: newTask.title } });
    fireEvent.change(screen.getByLabelText('Description:'), { target: { value: newTask.description } });
    fireEvent.change(screen.getByLabelText('Due Date:'), { target: { value: newTask.dueDate } });
    fireEvent.click(screen.getByText('Save')); // Submit the form

    await act(() => Promise.resolve()); // Wait for the promise to resolve
    
    expect(createTask).toHaveBeenCalled();
  });

  it('updates an existing task', async () => {
    const updatedTask = { ...mockTask[0], title: 'Updated Task', status: 'completed' };
    updateTask.mockResolvedValueOnce(updatedTask);
    fetchTasks.mockResolvedValueOnce({ data: mockTask, totalTasks: 1 });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    await screen.findByText('Task 1'); // Wait for the task to be rendered
    fireEvent.click(screen.getByText('Edit')); // Open the edit form
    fireEvent.change(screen.getByLabelText('Title:'), { target: { value: updatedTask.title } });
    fireEvent.click(screen.getByText('Save')); // Submit the form

    await act(() => Promise.resolve()); // Wait for the promise to resolve

    expect(updateTask).toHaveBeenCalled();
  });

  it('deletes an existing task', async () => {
    deleteTask.mockResolvedValueOnce();
    fetchTasks
      .mockResolvedValueOnce({ data: mockTasksBefore, totalTasks: 2 })
      .mockResolvedValueOnce({ data: mockTasksAfter, totalTasks: 1 });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    await screen.findByText('Task 1'); // Wait for the task to be rendered
    fireEvent.click(screen.getByText('Delete')); // Click the delete button
    fireEvent.click(screen.getByText('Confirm')); // Confirm the deletion in the modal

    await act(() => Promise.resolve()); // Wait for the promise to resolve

    expect(deleteTask).toHaveBeenCalled();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument(); // Check if the task is no longer displayed
  });

  it('filters tasks by status', async () => {
    fetchTasks.mockResolvedValue({ data: mockTask, totalTasks: 3 }); // Only pending tasks

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Filter by Status:'), { target: { value: 'pending' } });

    await act(() => Promise.resolve()); // Wait for the state update and re-render

    expect(fetchTasks).toHaveBeenLastCalledWith('status=pending&sortBy=dueDate&sortOrder=asc&page=1&limit=5', "mock-csrf-token");
  });

  it('sorts tasks by due date in ascending order', async () => {
    fetchTasks.mockResolvedValue({ data: mockTasks, totalTasks: 3 });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Sort by Due Date:'), { target: { value: 'dueDate:asc' } });

    await act(() => Promise.resolve()); // Wait for the state update and re-render

    expect(fetchTasks).toHaveBeenCalledWith('status=all&sortBy=dueDate&sortOrder=asc&page=1&limit=5', "mock-csrf-token");
    // Check if tasks are rendered in ascending order of due date
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('sorts tasks by due date in descending order', async () => {
    fetchTasks.mockResolvedValue({ data: [...mockTasks].reverse(), totalTasks: 3 }); // Reverse the mockTasks array

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Sort by Due Date:'), { target: { value: 'dueDate:desc' } });

    await act(() => Promise.resolve()); // Wait for the state update and re-render

    expect(fetchTasks).toHaveBeenLastCalledWith('status=all&sortBy=dueDate&sortOrder=desc&page=1&limit=5', "mock-csrf-token");
    // Check if tasks are rendered in descending order of due date
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('paginates tasks correctly', async () => {
    fetchTasks
      .mockResolvedValueOnce({ data: [mockTasks[0]], totalTasks: 11, currentPage: 1, totalPages: 3, pagination: { next: { page: 2, limit: 5 } } })
      .mockResolvedValueOnce({ data: [mockTasks[1]], totalTasks: 11, currentPage: 2, totalPages: 3, pagination: { prev: { page: 1, limit: 5 }, next: { page: 3, limit: 5 } } })
      .mockResolvedValueOnce({ data: [mockTasks[2]], totalTasks: 11, currentPage: 3, totalPages: 3, pagination: { prev: { page: 2, limit: 5 } } });

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    );

    // Page 1
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();

    // Go to Page 2
    fireEvent.click(screen.getByText('2'));
    await act(() => Promise.resolve());

    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(await screen.findByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();

    // Go to Page 3
    fireEvent.click(screen.getByText('3'));
    await act(() => Promise.resolve());

    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(await screen.findByText('Task 3')).toBeInTheDocument();
  });
});