# Task Management Application Backend

This repository contains the backend code for a Task Management Application built using Node.js, Express, and MongoDB.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Task Management Application allows users to create, read, update, and delete tasks. It includes user authentication and authorization, secure password management, and task filtering and sorting.

## Features

- **User Authentication**: Users can sign up, log in, and log out.
- **Task Management**: CRUD operations for tasks.
- **Task Filtering and Sorting**: By status and due date.
- **Secure Passwords**: Passwords are hashed using bcrypt.
- **JWT Authentication**: Secure session management with JSON Web Tokens.

## Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Tokens)**
- **bcrypt**

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MongoDB** (local instance or MongoDB Atlas)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/task-manager-backend.git
   cd task-manager-backend
   ```

2. **Install dependencies::**

   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables:**

    Create a .env file in the root directory of the project and add the following variables:

   ```bash
   PORT=5000
   MONGO_URI=mongodb://mongo:27017/task_management_db
   JWT_SECRET=3e4f1a605ab08c76c7efdde245b9a32e3f8e879368061efebfb6465631a2e899
   JWT_EXPIRES_IN=1h
   REFRESH_JWT_SECRET=13301d2d6ca9b786acea34ac18986eb551ad9ecc67e1ec1218752ec3fd5a5e69
   REFRESH_JWT_EXPIRES_IN=12h
   APP_FRONTEND_URL=http://localhost:3000
   NOTIFICATIONS_JOB_SCHEDULE=*/30 * * * *
   RATE_LIMIT_WINDOW_TIME=15
   NODE_ENV=development
   ```

## Usage

### Starting the Application

1. **Start MongoDB (if running locally):**

   ```bash
   mongod
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

    The server will start on http://localhost:5000.

## API Endpoints

### Authentication

- POST /api/auth/signup: Register a new user.
- POST /api/auth/login: Log in a user.
- POST /api/auth/logout: Log out a user.

### Tasks

- GET /api/tasks: Retrieve all tasks for the authenticated user.
- POST /api/tasks: Create a new task.
- GET /api/tasks/: Retrieve a specific task by ID.
- PUT /api/tasks/: Update a specific task by ID.
- DELETE /api/tasks/: Delete a specific task by ID.

## Testing

### Running Tests

   To run the test suite, use:

   ```bash
   npm test
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE]() file for details.