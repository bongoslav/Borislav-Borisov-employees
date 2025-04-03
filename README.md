# Employee Management Application
## Prerequisites

- npm  
or
- Docker
- Docker Compose


## Run the application
```
npm install
```

```
npm run dev
```

Tests:
```
npm run test
```

## Docker Setup


### Running with Docker

Build and start the container:

```bash
docker compose up
```

## Database

This application uses SQLite with Prisma ORM. The database file is located at `prisma/dev.db`.

## Tests

There are integration tests in Jest for the main functionalities.

## API Documentation

The API is accessible at `localhost:3000/api/v1` endpoint.

Authentication is done through JWT for all GET requests.

There are 4 tables: User, Employee, Project, EmployeeProject.  
The User table is used for Authentication and the others have basic CRUD functionalities.  
Uploading the CSV creates records for Employees and Projects.

### Authentication Endpoints

- **POST /api/v1/auth/register**
  - Description: Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Returns: User data with token

- **POST /api/v1/auth/login**
  - Description: Login an existing user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: User data with authentication token

### Employee Endpoints

- **GET /api/v1/employees**
  - Description: Get all employees
  - Auth: Required
  - Returns: Array of employees

- **GET /api/v1/employees/:id**
  - Description: Get a specific employee by ID
  - Auth: Required
  - Returns: Employee data

- **POST /api/v1/employees**
  - Description: Create a new employee
  - Body: `{ "id": number }`
  - Returns: Created employee data

- **PUT /api/v1/employees/:id**
  - Description: Update an employee
  - Body: `{ "id": number }`
  - Returns: Updated employee data

- **DELETE /api/v1/employees/:id**
  - Description: Delete an employee
  - Returns: Deletion confirmation

### Project Endpoints

- **GET /api/v1/projects**
  - Description: Get all projects
  - Auth: Required
  - Returns: Array of projects

- **GET /api/v1/projects/:id**
  - Description: Get a specific project by ID
  - Auth: Required
  - Returns: Project data

- **POST /api/v1/projects**
  - Description: Create a new project
  - Body: `{ "name": "string", "description": "string" }`
  - Returns: Created project data

- **PUT /api/v1/projects/:id**
  - Description: Update a project
  - Body: `{ "name": "string", "description": "string" }`
  - Returns: Updated project data

- **DELETE /api/v1/projects/:id**
  - Description: Delete a project
  - Returns: Deletion confirmation

### Analytics Endpoints

- **GET /api/v1/analytics/longest-collaboration**
  - Description: Find the pair of employees who worked together the longest
  - Auth: Required
  - Returns: `{ "emp1Id": number, "emp2Id": number, "totalDays": number }`

- **POST /api/v1/analytics/upload**
  - Description: Upload CSV file with employee-project data - **named as "file"**
  - Content-Type: multipart/form-data
  - Body: CSV file with columns "EmpID,ProjectID,DateFrom,DateTo"
  - Returns: Processing confirmation
