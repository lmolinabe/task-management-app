# Task Management App

## Running the Application with Docker Compose

This application is built using a microservices architecture with separate frontend and backend services. We use Docker Compose for easy setup and execution.

### Prerequisites

- **Docker:** Make sure you have Docker installed on your system. You can download it from [https://www.docker.com/](https://www.docker.com/).
- **Docker Compose:** Docker Compose is usually included with Docker installations. If not, you can find installation instructions at [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/).

## Steps

1. **Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd task-management-app
   ```

2. **Build and Start the Services:**
   ```bash
   docker-compose up -d --build
   ```

    This command will:
    - Build the Docker images for the frontend, backend, and MongoDB.
    - Create and start the containers in the background (-d flag).

3. **Access the Application:**

    - Frontend: Open your web browser and navigate to http://localhost:3000.
    - Backend: The backend API will be accessible at http://localhost:5000.

### Stopping the Application

   To stop the containers, run:

   ```bash
   docker-compose down
   ```

   This will stop and remove the containers, but your data in the MongoDB container will persist due to the volume mapping.

## Steps

- Make sure the ports specified in the docker-compose.yml (3000 for frontend, 5000 for backend, 27017 for MongoDB) are not in use by other applications on your system.
- You can customize the environment variables for the backend by modifying the ./backend/.env file.
- For more advanced Docker Compose commands and options, refer to the official documentation: https://docs.docker.com/compose/.