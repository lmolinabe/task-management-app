import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending'); // Default status
  const [errors, setErrors] = useState({});

  // Populate form fields if editing an existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
    // Format the dueDate to YYYY-MM-DD for the date input (in local time)
    if (task.dueDate) {
      const dueDateObject = new Date(task.dueDate);
      const year = dueDateObject.getFullYear();
      const month = (dueDateObject.getMonth() + 1).toString().padStart(2, '0');
      const day = dueDateObject.getDate().toString().padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    } else {
      setDueDate('');
    }
      setStatus(task.status || 'pending');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation (you can add more rules)
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!dueDate) validationErrors.dueDate = 'Due date is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare task data for submission
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
    };

    // Set dueDate to the end of the selected day (23:59:59.999)
    if (dueDate) {
      var dueDateEod = dueDate + ' ' + '23:59:59.999';
      const dueDateLocalTime = new Date(dueDateEod);
      taskData.dueDate = dueDateLocalTime;
    }
  
    // Call the onSubmit function (passed from the parent component)
    onSubmit(taskData);

    // Clear the form (if creating a new task)
    if (!task) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
    }

    // Close the form (if onClose is provided)
    if (onClose) {
      onClose();
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
    
  return (
    <div className="modal-overlay"> {/* Add modal overlay */}
      <div className="modal-content"> {/* Add modal content wrapper */}
        <form onSubmit={handleSubmit} className="task-form">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='task-description'
            />
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              min={!task ? today : ''}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-buttons">
            <button className='action-button' type="submit">{task ? 'Edit' : 'Add'}</button>
            <button className='cancel-button' type="button" onClick={onClose}>Cancel</button> {/* Close the modal */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;