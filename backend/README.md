# Task Management System REST API

A production-ready, highly secure, and layered Task Management System REST API built from scratch.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript (Strict Mode)
- **Database ORM**: Prisma ORM (MySQL connection)
- **Authentication**: JSON Web Token (JWT) with bcrypt hashing
- **Input Validation**: Zod Schema validation
- **Security**: Helmet headers, CORS policies, rate limiting, and morgan logging

---

## 📂 Project Directory Structure
```
src/
├── config/                  # Configuration loaders (env, database singleton)
├── middlewares/             # Request parsers, error boundary, validation, auth
├── modules/
│   ├── auth/                # Register, Login, Me flow (controller, service, validation)
│   ├── users/               # User querying & RBAC rules (controller, service, repository, validation)
│   └── tasks/               # Tasks CRUD & ownership rules (controller, service, repository, validation)
├── prisma/                  # Prisma schema, database configuration, and seeds
├── routes/                  # Combined routing layers
├── app.ts                   # Express server config (CORS, Rate limits, error binders)
└── server.ts                 # HTTP server bootstrap & graceful shutdown hooks
```

---

## ⚙️ Getting Started

### 1. Installation
Clone the project, navigate to the folder, and run npm install:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` into a new `.env` file:
```bash
cp .env.example .env
```
Adjust variables to match your configuration:
- `PORT`: Port the server will listen on (default `3000`).
- `DATABASE_URL`: Connection string for your external MySQL server (e.g. `mysql://user:pass@host:3306/db`).
- `JWT_SECRET`: Secret signing key for JWT.

### 3. Run Database Migrations
Generate Prisma files and apply migrations to your MySQL database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations
npm run prisma:migrate
```

### 4. Database Seeding
Populate the database with dummy records (1 admin user, 2 regular users, and 5 sample tasks):
```bash
npm run prisma:seed
```
*Note: User credentials seeded are:*
- **Admin**: `admin@task.com` (password: `admin123`)
- **User 1**: `john@task.com` (password: `user123`)
- **User 2**: `jane@task.com` (password: `user123`)

### 5. Start the Server
Launch the server in development mode (with hot-reload):
```bash
npm run dev
```
To run the built production code:
```bash
npm run build
npm start
```

---

## 🚀 API Endpoint Reference

### 🔐 Authentication

#### 1. Register a User
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@task.com",
    "password": "user123",
    "role": "USER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
      "name": "Jane Smith",
      "email": "jane@task.com",
      "role": "USER",
      "createdAt": "2026-06-27T09:00:00.000Z",
      "updatedAt": "2026-06-27T09:00:00.000Z"
    }
  }
  ```

#### 2. Log In
- **Endpoint**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "jane@task.com",
    "password": "user123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
        "name": "Jane Smith",
        "email": "jane@task.com",
        "role": "USER",
        "createdAt": "2026-06-27T09:00:00.000Z",
        "updatedAt": "2026-06-27T09:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

#### 3. Fetch Current Profile
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
      "name": "Jane Smith",
      "email": "jane@task.com",
      "role": "USER",
      "createdAt": "2026-06-27T09:00:00.000Z",
      "updatedAt": "2026-06-27T09:00:00.000Z"
    }
  }
  ```

---

### 📋 Tasks Resource
All Task routes require authentication headers (`Authorization: Bearer <token>`).

#### 1. Create a Task
- **Endpoint**: `POST /api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Configure DB Connection",
    "description": "Set up external MySQL connection.",
    "priority": "MEDIUM",
    "dueDate": "2026-07-04T12:00:00.000Z",
    "assignedToId": "e44d3209-7d87-43eb-8d4e-375df421bd45"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": "fa2c3210-9b88-4cda-8aa9-873dfa10fd34",
      "title": "Configure DB Connection",
      "description": "Set up external MySQL connection.",
      "priority": "MEDIUM",
      "status": "OPEN",
      "dueDate": "2026-07-04T12:00:00.000Z",
      "createdById": "ad1a3209-2d88-44ee-8d4e-123dfa21bd99",
      "assignedToId": "e44d3209-7d87-43eb-8d4e-375df421bd45",
      "createdAt": "2026-06-27T09:10:00.000Z",
      "updatedAt": "2026-06-27T09:10:00.000Z"
    }
  }
  ```

#### 2. Get Tasks (Paginated, Filtered, Sorted)
- **Endpoint**: `GET /api/tasks?page=1&limit=10&sortBy=dueDate&sortOrder=asc&status=OPEN`
- **Role Permissions**:
  - `ADMIN`: Fetches all matching tasks in system.
  - `USER`: Fetches tasks where they are creator **OR** assignee.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": {
      "tasks": [
        {
          "id": "fa2c3210-9b88-4cda-8aa9-873dfa10fd34",
          "title": "Configure DB Connection",
          "description": "Set up external MySQL connection.",
          "priority": "MEDIUM",
          "status": "OPEN",
          "dueDate": "2026-07-04T12:00:00.000Z",
          "createdById": "ad1a3209-2d88-44ee-8d4e-123dfa21bd99",
          "assignedToId": "e44d3209-7d87-43eb-8d4e-375df421bd45",
          "createdAt": "2026-06-27T09:10:00.000Z",
          "updatedAt": "2026-06-27T09:10:00.000Z",
          "createdBy": {
            "id": "ad1a3209-2d88-44ee-8d4e-123dfa21bd99",
            "name": "System Admin",
            "email": "admin@task.com",
            "role": "ADMIN"
          },
          "assignedTo": {
            "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
            "name": "Jane Smith",
            "email": "jane@task.com",
            "role": "USER"
          }
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
  }
  ```

#### 3. Get Task by ID
- **Endpoint**: `GET /api/tasks/:id`
- **Role Permissions**: ADMIN, creator, or assignee.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully",
    "data": { ... }
  }
  ```

#### 4. Update Task Details
- **Endpoint**: `PATCH /api/tasks/:id`
- **Role Permissions**: ADMIN or task creator only.
- **Request Body**:
  ```json
  {
    "title": "Configured database instance",
    "priority": "HIGH"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": { ... }
  }
  ```

#### 5. Update Task Status
- **Endpoint**: `PATCH /api/tasks/:id/status`
- **Role Permissions**: ADMIN, task creator, or assigned user.
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task status updated successfully",
    "data": { ... }
  }
  ```

#### 6. Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Role Permissions**: ADMIN or task creator only.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": null
  }
  ```

---

### 👤 Users Resource

#### 1. Get All Users
- **Endpoint**: `GET /api/users`
- **Role Permissions**: `ADMIN` only.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
        "name": "John Doe",
        "email": "john@task.com",
        "role": "USER",
        "createdAt": "2026-06-27T08:00:00.000Z",
        "updatedAt": "2026-06-27T08:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Get User Profile by ID
- **Endpoint**: `GET /api/users/:id`
- **Role Permissions**: `ADMIN` or the user matching the ID.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "id": "e44d3209-7d87-43eb-8d4e-375df421bd45",
      "name": "John Doe",
      "email": "john@task.com",
      "role": "USER",
      "createdAt": "2026-06-27T08:00:00.000Z",
      "updatedAt": "2026-06-27T08:00:00.000Z"
    }
  }
  ```

---

## 🌩️ Deployment Notes (Render or Railway Free Tier)

### 📌 General Production Setup
1. **Host a MySQL Database**:
   - Create a database cluster using Railway (MySQL database service) or Aiven / PlanetScale.
   - Obtain the MySQL connection string format: `mysql://<username>:<password>@<host>:<port>/<database>`.
2. **Build Server Environment**:
   - Set environmental production values: `NODE_ENV=production`.
   - Set high-entropy tokens: `JWT_SECRET=generate-a-secure-32-character-random-hex`.

### 🚢 Deploying on Render (Free Web Service)
1. Register on **Render.com** and connect your GitHub repository.
2. Click **New +** -> **Web Service**.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
4. Expand **Advanced** -> Add **Environment Variables**:
   - `DATABASE_URL`: *Your hosted MySQL connection string*
   - `JWT_SECRET`: *Your JWT token signing key*
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**.

### 🚂 Deploying on Railway (Free Web Service)
1. Log in to **Railway.app** and link your GitHub account.
2. Click **New Project** -> **Deploy from GitHub repo** and select this project.
3. Railway automatically detects Node.js and builds the server.
4. Navigate to **Variables** tab on your service dashboard and add:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV`
5. Go to **Settings** and modify **Build & Start commands** if necessary:
   - Build Command: `npm install && npm run build && npx prisma generate`
   - Start Command: `npx prisma migrate deploy && npm start`
6. Deployments are triggered automatically on every repository commit.
