# Task Management Application Frontend

This repository contains the frontend code for a Task Management Application built using React.js. The application allows users to manage their tasks effectively with a clean and intuitive interface.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Task Management Application frontend is a React-based single-page application (SPA) that interacts with a backend API to manage user tasks. It includes features such as task creation, updating, deletion, filtering, and sorting.

## Features

- **User Authentication**: Users can sign up, log in, and log out.
- **Task Management**: CRUD operations for tasks (Create, Read, Update, Delete).
- **Task Filtering and Sorting**: By status (e.g., pending, in-progress, completed) and due date.
- **Responsive Design**: Mobile and desktop-friendly user interface.
- **Form Validation**: Client-side validation for user inputs.

## Technologies

- **React.js**: JavaScript library for building user interfaces.
- **React Router**: For routing and navigation.
- **Axios**: For making HTTP requests to the backend API.
- **Bootstrap**: For responsive design and styling.
- **ESLint**: For code linting and formatting.
- **PropTypes**: For type-checking of props.

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/task-manager-frontend.git
   cd task-manager-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables:**

    Create a .env file in the root directory of the project to configure environment-specific variables:

   ```bash
   APP_BACKEND_URL=http://localhost:5000/api
   ```

    APP_BACKEND_URL: The base URL for the backend API.

## Usage

### Running the Application

1. **Start the frontend development server:**

    Using npm:

    ```bash
    npm install
    ```

    The application should now be running on http://localhost:3000.


## Usage

In the project directory, you can run:

- npm start or yarn start: Runs the app in the development mode.
- npm run build or yarn build: Builds the app for production to the build folder.
- npm test or yarn test: Launches the test runner in the interactive watch mode.
- npm run lint or yarn lint: Runs ESLint to analyze the code for potential issues.

## Usage

The frontend interacts with the backend API via Axios. The API base URL is configured in the .env file, and all HTTP requests are managed in the services/api.js file. Ensure the backend server is running on http://localhost:5000 (or another specified port) to successfully connect with the frontend.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE]() file for details.