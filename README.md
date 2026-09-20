# Project Management Platform

A full-stack project management platform designed for collaborative teams to organize projects, manage team members, track tasks and subtasks, maintain project notes, and control access through role-based authorization.

The application consists of a **React.js frontend** and a **Node.js + Express.js REST API** backed by **MongoDB/Mongoose**.

---

## ✨ Overview

**Project Management Platform** provides a centralized workspace for managing projects and team workflows.

Users can:

* Create and manage projects
* Add and manage project members
* Assign project-level roles
* Create, assign, and track tasks
* Organize tasks using subtasks
* Track task status
* Upload task attachments
* Create and manage project notes
* Authenticate securely using JWT
* Access resources according to their role and project membership

The system follows a layered backend architecture with **controllers, routes, middleware, validators, models, and utility modules**.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Access and refresh token mechanism
* Secure password hashing using `bcrypt`
* HTTP-only authentication cookies
* Protected API routes
* Role-based access control
* Project-level authorization
* Current-user endpoint
* Secure logout
* Token refresh support

### 📁 Project Management

* Create projects
* View accessible projects
* View project details
* Update projects according to permissions
* Delete projects according to permissions
* Project membership management
* Project-level role assignment
* Project member count and project information

### 👥 Team Member Management

* Add users to projects using email
* List project members
* Assign project roles
* Change member roles
* Remove members
* Enforce project-level permissions

### ✅ Task Management

* Create tasks
* Assign tasks to team members
* View project tasks
* View individual task details
* Update task status
* Update task information
* Delete tasks
* Track task ownership
* Attach files to tasks
* Support up to 5 attachments per request
* Support image and PDF attachments
* Maximum attachment size of 5 MB per file

### 📌 Subtask Management

* Create subtasks
* View subtasks through task details
* Mark subtasks as completed
* Update subtask status
* Delete subtasks according to permissions
* Support hierarchical task organization

### 📝 Project Notes

* Create project notes
* View project notes
* View individual notes
* Update notes
* Delete notes
* Restrict note modification to authorized project administrators

### ❤️ API Health Monitoring

A dedicated health-check endpoint is available for verifying API availability.

---

# 🛠️ Tech Stack

## Frontend

| Technology              | Purpose                            |
| ----------------------- | ---------------------------------- |
| React.js                | User interface                     |
| Vite                    | Frontend development/build tooling |
| JavaScript (ES Modules) | Application logic                  |
| CSS                     | Responsive application styling     |
| Fetch API               | Backend API communication          |

## Backend

| Technology        | Purpose                       |
| ----------------- | ----------------------------- |
| Node.js           | Runtime environment           |
| Express.js        | REST API framework            |
| MongoDB           | Database                      |
| Mongoose          | ODM and data modeling         |
| JWT               | Authentication                |
| bcrypt            | Password hashing              |
| Multer            | File uploads                  |
| express-validator | Request validation            |
| CORS              | Cross-origin request handling |
| cookie-parser     | Cookie handling               |
| dotenv            | Environment configuration     |

---

# 🏗️ Architecture

The application follows a client-server architecture:

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│  Authentication             │
│  Projects                   │
│  Tasks / Subtasks           │
│  Members                    │
│  Notes                      │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               │ JWT Authentication
               ▼
┌─────────────────────────────┐
│      Express.js API         │
│                             │
│ Routes                      │
│ Middleware                  │
│ Validators                  │
│ Controllers                 │
│ Error Handling              │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│          MongoDB            │
│                             │
│ Users                       │
│ Projects                    │
│ Project Members             │
│ Tasks                       │
│ Subtasks                    │
│ Notes                       │
└─────────────────────────────┘
```

---

# 📂 Project Structure

```text
project-management-platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controllers.js
│   │   │   ├── healthcheck.controllers.js
│   │   │   ├── notes.controllers.js
│   │   │   ├── projects.controllers.js
│   │   │   └── tasks.controllers.js
│   │   │
│   │   ├── db/
│   │   │   └── index.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── multer.middleware.js
│   │   │   ├── project.middleware.js
│   │   │   └── validator.middleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── note.models.js
│   │   │   ├── project.models.js
│   │   │   ├── projectmember.models.js
│   │   │   ├── subtask.models.js
│   │   │   ├── task.models.js
│   │   │   └── user.models.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── healthcheck.routes.js
│   │   │   ├── note.routes.js
│   │   │   ├── project.routes.js
│   │   │   └── task.routes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── api-error.js
│   │   │   ├── api-response.js
│   │   │   ├── async-handler.js
│   │   │   └── constants.js
│   │   │
│   │   ├── validators/
│   │   │   └── index.js
│   │   │
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── scripts/
│   │   ├── integration-test.js
│   │   ├── promote-admin.js
│   │   └── seed-demo-data.js
│   │
│   ├── PRD.md
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# 🔑 Role-Based Access Control

The platform uses three primary roles:

| Permission             | Admin | Project Admin | Member |
| ---------------------- | :---: | :-----------: | :----: |
| Create Project         |   ✅   |       ❌       |    ❌   |
| Update Project         |   ✅   |       ❌       |    ❌   |
| Delete Project         |   ✅   |       ❌       |    ❌   |
| Manage Project Members |   ✅   |       ❌       |    ❌   |
| View Projects          |   ✅   |       ✅       |    ✅   |
| Create Tasks           |   ✅   |       ✅       |    ❌   |
| Update Tasks           |   ✅   |       ✅       |    ❌   |
| Delete Tasks           |   ✅   |       ✅       |    ❌   |
| View Tasks             |   ✅   |       ✅       |    ✅   |
| Create Subtasks        |   ✅   |       ✅       |    ❌   |
| Update Subtask Status  |   ✅   |       ✅       |    ✅   |
| Delete Subtasks        |   ✅   |       ✅       |    ❌   |
| Create Notes           |   ✅   |       ❌       |    ❌   |
| Update Notes           |   ✅   |       ❌       |    ❌   |
| Delete Notes           |   ✅   |       ❌       |    ❌   |
| View Notes             |   ✅   |       ✅       |    ✅   |

Authorization is enforced at the API layer using authentication and project-level middleware rather than relying only on frontend UI restrictions.

---

# 🔄 Task Workflow

Tasks support three states:

```text
┌──────────┐
│   TODO   │
└────┬─────┘
     │
     ▼
┌─────────────┐
│ IN PROGRESS │
└──────┬──────┘
       │
       ▼
┌──────────┐
│   DONE   │
└──────────┘
```

Tasks can also contain multiple subtasks.

```text
Project
   │
   ├── Task
   │    ├── Subtask
   │    ├── Subtask
   │    └── Subtask
   │
   ├── Task
   │    ├── Subtask
   │    └── Subtask
   │
   └── Task
```

---

# 🗃️ Data Model

The application uses MongoDB with Mongoose models for:

### User

Stores:

* Username
* Email
* Full name
* Password hash
* System role
* Refresh token
* Avatar information
* Timestamps

### Project

Stores:

* Project name
* Description
* Creator
* Timestamps

### Project Member

Represents the relationship between users and projects.

Stores:

* User reference
* Project reference
* Project role
* Timestamps

### Task

Stores:

* Title
* Description
* Project reference
* Assigned by
* Assigned user
* Status
* File attachments
* Timestamps

### Subtask

Stores:

* Title
* Parent task
* Completion state
* Creator
* Timestamps

### Note

Stores project-specific notes and their creator information.

---

# 🔌 REST API

Base URL:

```text
/api/v1
```

---

## Authentication API

### Register

```http
POST /api/v1/auth/register
```

Creates a new user account.

### Login

```http
POST /api/v1/auth/login
```

Authenticates a user and generates access and refresh tokens.

### Logout

```http
POST /api/v1/auth/logout
```

Requires authentication.

### Current User

```http
GET /api/v1/auth/current-user
```

Returns the currently authenticated user.

### Refresh Token

```http
POST /api/v1/auth/refresh-token
```

Generates a new access token using a valid refresh token.

---

# 📁 Project API

### List Projects

```http
GET /api/v1/projects/
```

Returns projects accessible to the authenticated user.

### Create Project

```http
POST /api/v1/projects/
```

Admin-only operation.

### Get Project

```http
GET /api/v1/projects/:projectId
```

Returns project details for an authorized member.

### Update Project

```http
PUT /api/v1/projects/:projectId
```

Updates project information.

### Delete Project

```http
DELETE /api/v1/projects/:projectId
```

Deletes a project according to authorization rules.

---

# 👥 Project Member API

### List Members

```http
GET /api/v1/projects/:projectId/members
```

### Add Member

```http
POST /api/v1/projects/:projectId/members
```

### Update Member Role

```http
PUT /api/v1/projects/:projectId/members/:userId
```

### Remove Member

```http
DELETE /api/v1/projects/:projectId/members/:userId
```

---

# ✅ Task API

### List Tasks

```http
GET /api/v1/tasks/:projectId
```

### Create Task

```http
POST /api/v1/tasks/:projectId
```

Supports multipart file uploads.

### Get Task

```http
GET /api/v1/tasks/:projectId/t/:taskId
```

### Update Task

```http
PUT /api/v1/tasks/:projectId/t/:taskId
```

### Delete Task

```http
DELETE /api/v1/tasks/:projectId/t/:taskId
```

---

# 📌 Subtask API

### Create Subtask

```http
POST /api/v1/tasks/:projectId/t/:taskId/subtasks
```

### Update Subtask

```http
PUT /api/v1/tasks/:projectId/st/:subTaskId
```

### Delete Subtask

```http
DELETE /api/v1/tasks/:projectId/st/:subTaskId
```

---

# 📝 Notes API

### List Notes

```http
GET /api/v1/notes/:projectId
```

### Create Note

```http
POST /api/v1/notes/:projectId
```

### Get Note

```http
GET /api/v1/notes/:projectId/n/:noteId
```

### Update Note

```http
PUT /api/v1/notes/:projectId/n/:noteId
```

### Delete Note

```http
DELETE /api/v1/notes/:projectId/n/:noteId
```

---

# ❤️ Health Check

```http
GET /api/v1/healthcheck/
```

Used to verify that the API service is running.

Example:

```text
GET http://localhost:3000/api/v1/healthcheck/
```

---

# 🔒 Security

The backend implements multiple layers of security.

### Authentication

JWT access and refresh tokens are used to authenticate users.

Authentication middleware supports tokens supplied through:

```text
HTTP-only Cookie
```

or:

```text
Authorization: Bearer <access-token>
```

### Password Security

Passwords are hashed using:

```text
bcrypt
```

Passwords are never returned in authenticated user responses.

### Authorization

Protected resources use middleware to verify:

1. User authentication
2. Project membership
3. Project role
4. System-level admin privileges

### Input Validation

API requests are validated using:

```text
express-validator
```

### File Upload Security

Task attachments are restricted to:

* Images
* PDF files

Upload limits:

```text
Maximum files per request: 5
Maximum file size: 5 MB per file
```

### CORS

Cross-origin requests are controlled using the configured `CORS_ORIGIN` environment variable.

---

# 📎 File Uploads

Task attachments are uploaded using `Multer`.

Files are stored under:

```text
backend/public/images/tasks/
```

Each attachment stores metadata including:

* URL
* MIME type
* File size

Supported attachment types:

```text
Images
PDF
```

---

# ⚙️ Requirements

Before running the project locally, make sure you have:

* **Node.js** 18+ recommended
* **npm**
* **MongoDB** running locally or a MongoDB Atlas connection
* Git

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd project-management-platform
```

---

# 🖥️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Backend Environment Variables

Create:

```text
backend/.env
```

Add:

```env
MONGO_URI=mongodb://127.0.0.1:27017/project-management-platform

PORT=3000

CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```

### Environment Variables

| Variable               | Description                        |
| ---------------------- | ---------------------------------- |
| `MONGO_URI`            | MongoDB connection string          |
| `PORT`                 | Backend server port                |
| `CORS_ORIGIN`          | Allowed frontend origin            |
| `ACCESS_TOKEN_SECRET`  | Secret used to sign access tokens  |
| `ACCESS_TOKEN_EXPIRY`  | Access token lifetime              |
| `REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime             |

> Never commit `.env` files or production secrets to GitHub.

---

## Start Backend

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/v1/healthcheck/
```

---

# 🌐 Frontend Setup

Open another terminal.

From the project root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Start Frontend

```bash
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# ▶️ Run the Complete Application

You need two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🧪 Testing & Utility Scripts

The backend provides several utility scripts.

## Integration Test

```bash
cd backend
npm test
```

Runs the project's integration test script.

## Seed Demo Data

```bash
npm run seed-demo
```

Seeds demo data into the configured MongoDB database.

## Promote User to Admin

```bash
npm run promote-admin
```

Runs the admin-promotion utility script.

Check the script implementation before using it so the intended user/account is correctly configured.

---

# 📜 Available Scripts

## Backend

| Command                 | Description                |
| ----------------------- | -------------------------- |
| `npm run dev`           | Start backend with Nodemon |
| `npm start`             | Start backend              |
| `npm test`              | Run integration test       |
| `npm run seed-demo`     | Seed demo data             |
| `npm run promote-admin` | Promote a user to admin    |

## Frontend

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite development server    |
| `npm run build`   | Create production frontend build |
| `npm run preview` | Preview production build         |

---

# 📋 Product Requirements

The original product requirements define the platform around the following areas:

## Authentication

The product specification includes:

* User registration
* User login
* JWT authentication
* Password management
* Email verification
* Access token refresh
* Role-based access control
* Forgot-password workflow
* Password reset
* Email verification resend

### Current implementation

The current codebase implements:

* Registration
* Login
* Logout
* Current-user retrieval
* Access/refresh token generation
* Access-token refresh
* JWT authorization
* Role-based authorization

Email verification and password reset workflows are part of the original PRD but are not currently implemented in the codebase.

---

## Project Management Requirements

The product specification covers:

* Project creation
* Project listing
* Project details
* Project updates
* Project deletion
* Project membership
* Member roles
* Project-level authorization

These capabilities are implemented through the project and project-member APIs.

---

## Task Management Requirements

The platform supports:

* Task creation
* Task listing
* Task details
* Task updates
* Task deletion
* Task assignment
* Status tracking
* File attachments
* Subtasks

Supported statuses:

```text
todo
in_progress
done
```

---

## Subtask Requirements

The platform supports:

* Creating subtasks
* Updating subtasks
* Completing subtasks
* Deleting subtasks
* Role-based subtask permissions

---

## Project Notes

The platform supports:

* Creating notes
* Listing notes
* Viewing individual notes
* Updating notes
* Deleting notes
* Role-based note permissions

---

## System Health

The platform provides a health-check API endpoint for basic service availability monitoring.

---

# 🧩 Design Principles

The backend is organized around separation of responsibilities.

```text
Request
   │
   ▼
Route
   │
   ▼
Authentication Middleware
   │
   ▼
Validation Middleware
   │
   ▼
Project Authorization
   │
   ▼
Controller
   │
   ▼
Mongoose Model
   │
   ▼
MongoDB
```

This structure keeps authentication, authorization, validation, business logic, and persistence concerns separated.

---

# 🛡️ Error Handling

The backend uses centralized API error/response utilities and asynchronous request handling.

Common HTTP status categories include:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

API responses follow a consistent response structure through the application's response utility.

---

# 🌱 Future Improvements

The following improvements can be added as the platform evolves:

* Email verification
* Forgot-password workflow
* Password reset emails
* Email notification service
* Automated task notifications
* Pagination for large project/task lists
* Search and filtering
* Task priority levels
* Task due dates
* Project dashboards and analytics
* Activity/audit logs
* Cloud object storage for attachments
* API documentation with OpenAPI/Swagger
* Automated unit and integration test coverage
* Docker-based development environment
* CI/CD pipeline
* Production deployment
* Rate limiting
* More granular permission policies
* Real-time collaboration using WebSockets

---

# 📈 Scalability Considerations

The current architecture provides a foundation for extending the application into a larger production system.

Potential scaling strategies include:

* Database indexing for frequently queried fields
* API pagination
* Redis-based caching
* Background job processing
* Object storage for attachments
* Stateless API instances behind a load balancer
* Containerized deployment
* Horizontal backend scaling
* Centralized logging and monitoring
* Automated CI/CD

---

# 📊 Product Success Criteria

The platform is designed around the following product outcomes:

* Secure authentication and authorization
* Complete project lifecycle management
* Team collaboration
* Hierarchical task and subtask management
* Role-based access control
* File attachment support
* Project-level permissions
* Maintainable REST API architecture
* Clear separation between frontend and backend responsibilities

---

# 🤝 Contributing

Contributions are welcome.

### Recommended workflow

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Test the application
5. Commit your changes

```bash
git commit -m "feat: add your feature"
```

6. Push the branch

```bash
git push origin feature/your-feature
```

7. Open a Pull Request

---

# 📄 License

This project currently uses the license configuration specified in the backend package metadata.

If this repository is intended for public distribution, consider adding a dedicated `LICENSE` file such as MIT, Apache-2.0, or another license appropriate for the project.

---

# 👨‍💻 Project

**Project:** Project Management Platform

**Architecture:** Full Stack Client–Server Application

**Frontend:** React.js + Vite

**Backend:** Node.js + Express.js

**Database:** MongoDB + Mongoose

**Authentication:** JWT + HTTP-only Cookies

**Authorization:** Role-Based Access Control (RBAC)

**File Uploads:** Multer

**Validation:** express-validator

---

## ⭐ If you find this project useful

Consider giving the repository a ⭐ and sharing feedback or improvements through an issue or pull request.
