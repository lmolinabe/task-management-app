import React, { useState } from 'react';

const TaskList = ({ tasks, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    const newTask = {
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: new Date(),
      status: 'pending',
    };
    onCreateTask(newTask);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  return (
    <div>
      <h2>Tasks</h2>
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Task description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task._id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p>Due Date: {task.dueDate}</p>
              <button onClick={() => onUpdateTask(task._id, { status: 'completed' })}>Complete</button>
              <button onClick={() => onDeleteTask(task._id)}>Delete</button>
            </li>
            ))
        ) : (
          <div>Loading tasks...</div>
        )}
      </ul>
    </div>
  );
};

// Set default props for TaskList
TaskList.defaultProps = {
  tasks: [],
};

export default TaskList;