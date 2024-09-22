import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/TaskService';
import TaskForm from '../components/TaskForm';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/Tasks.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  // const [sortBy, setSortBy] = useState(null);
  // const [sortOrder, setSortOrder] = useState('asc');
  const [dueDateSort, setDueDateSort] = useState('dueDate:asc'); // Default to ascending
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [totalTasks, setTotalTasks] = useState(0);
  // State to control the modal visibility
  const [showModal, setShowModal] = useState(false);
  // State to store the ID of the task to be deleted
  const [taskToDelete, setTaskToDelete] = useState(null);  
  // State to control the visibility of the form (for creating/updating)
  const [showForm, setShowForm] = useState(false);
  // State to store the task being edited (null for new task)
  const [editingTask, setEditingTask] = useState(null);  

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        // Construct the query parameters
        const queryParams = new URLSearchParams({
          status: filterStatus,
          // Use dueDateSort for both sortBy and sortOrder
          sortBy: dueDateSort ? dueDateSort.split(':')[0] : null, // Extract sortBy
          sortOrder: dueDateSort ? dueDateSort.split(':')[1] : null, // Extract sortOrder
          page: currentPage,
          limit: tasksPerPage,
        }).toString();

        const response = await fetchTasks(queryParams);
        setTasks(response.data);
        setTotalTasks(response.totalTasks);
      } catch (error) {
        setError(error || 'An error occurred during fetching tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasksData();
  }, [filterStatus, dueDateSort, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to handle creating a new task
  const handleCreateTask = async (taskData) => {
    try {
      const createdTask = await createTask(taskData);
      setTasks([createdTask, ...tasks]);
      setShowForm(false); // Close the form after creating
    } catch (error) {
      setError(error || 'An error occurred during creating task.');
    }
  };

  // Function to handle updating a task
  const handleUpdateTask = async (taskData) => {
    try {
      const updatedTask = await updateTask(editingTask._id, taskData);
      setTasks(tasks.map(task => (task._id === updatedTask._id ? updatedTask : task)));
      setShowForm(false); // Close the form after updating
      setEditingTask(null); // Clear the editing task
    } catch (error) {
      setError(error || 'An error occurred during updating task.');
    }
  };

  // Function to handle deleting a task
  const handleDeleteTask = async (taskId) => {
    setTaskToDelete(taskId);
    setShowModal(true);
  };

  // Function to handle confirmation from the modal
  const handleConfirmDelete = async () => {
    try {
      await deleteTask(taskToDelete);
      setTasks(tasks.filter(task => task._id !== taskToDelete));
      setShowModal(false); // Close the modal
      setTaskToDelete(null); // Clear the task to delete
    } catch (error) {
      setError(error.message);
    }
  };  

  return (
    <div className="tasks-page">
      <h2>My Tasks</h2>
      {/* Filtering Options */}
      <div className="filters">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        {/* Sorting Options */}
        <label htmlFor="due-date-sort">Sort by Due Date:</label>
        <select
          id="due-date-sort"
          value={dueDateSort}
          onChange={(e) => setDueDateSort(e.target.value)}
        >
          <option value="dueDate:asc">Ascending</option>
          <option value="dueDate:desc">Descending</option>
        </select>
      </div>
      <button id='new-task-button' className='create-button' onClick={() => setShowForm(true)}>Add</button>
      {/* Task Form (conditionally rendered as a modal) */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this task?"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowModal(false); setTaskToDelete(null); }}
        />
      )}       
      {loading && <div>Loading tasks...</div>}
      {error && (
          <div className="error-message">
          {Array.isArray(error) ? (
              <ul>
              {error.map((err, index) => (
                  <li key={index}>{err.msg || err}</li> // Display err.msg if available, otherwise err
              ))}
              </ul>
          ) : (
              <p>{error}</p>
          )}
          </div>
      )}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task-item">
            <h5 className='task-title'>{task.title}</h5> {/* Display task title */}
            <p className='task-description'>{task.description}</p> {/* Display task description */}
            <p className='task-due-date'>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p className='task-status'>Status: {task.status}</p> {/* Display task status */}
            <div className='task-actions'>
              <button className='update-button' onClick={() => {
                setEditingTask(task); // Set the task to be edited
                setShowForm(true); // Open the form
              }}>
                Edit
              </button>
              <button className='delete-button' onClick={() => handleDeleteTask(task._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        {/* "Previous" button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1} // Disable if on the first page
        >
          Previous
        </button>
        {/* Page number buttons */}
        {Array.from({ length: Math.ceil(totalTasks / tasksPerPage) }).map(
          (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          )
        )}
        {/* "Next" button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(totalTasks / tasksPerPage) || totalTasks === 0
          } // Disable if on the last page
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TasksPage;
