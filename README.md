# Task Management System (Monorepo)

A production-ready, full-stack Task Management System featuring role-based access control, real-time board updates, and robust JWT session security.

## Project Structure

```text
Task/
├── backend/            # Express.js REST API with TypeScript & Prisma ORM
│   ├── src/            # Layered Backend Architecture (Controller -> Service -> Repository)
│   └── package.json
├── frontend/           # React 18 SPA built with Vite & TypeScript
│   ├── src/            # Modular Feature Architecture (auth, dashboard, tasks)
│   └── package.json
└── README.md           # Setup & Operation documentation
```

---

## Technical Stack

### Backend
- **Core**: Node.js + Express.js + TypeScript (strict mode)
- **Database**: MySQL (integrated via Prisma ORM)
- **Security**: JWT tokens, bcrypt hash verification, helmet headers, express-rate-limiter
- **Validations**: Zod schema validation

### Frontend
- **Core**: React 18 + Vite + TypeScript (strict compiler)
- **Styling**: Tailwind CSS + shadcn/ui custom light theme
- **Routing**: React Router v6 (protected layouts & fallback redirects)
- **State Management**: TanStack React Query v5 (caching & optimistic mutations)
- **Form Controls**: React Hook Form + Zod validation resolver
- **Animations**: Framer Motion (page transitions & drag-and-drop Kanban layout)
- **HTTP Client**: Axios (configured with auth interceptors & 401 redirection logic)

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server running locally

### 1. Database Setup
Create a new schema in MySQL named `task_management_db`:
```sql
CREATE DATABASE task_management_db;
```

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependency packages:
   ```bash
   npm install
   ```
3. Configure the environment file:
   - Create a `.env` file from the example template:
     ```bash
     cp .env.example .env
     ```
   - Update `DATABASE_URL` with your MySQL credentials:
     ```text
     DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/task_management_db"
     ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed initial data (creates demo admin & standard users):
   ```bash
   npm run prisma:seed
   ```
   *Seeded credentials:*
   - **Admin User**: `admin@taskly.com` / `Password123` (Role: `ADMIN`)
   - **Standard User**: `user@taskly.com` / `Password123` (Role: `USER`)
6. Spin up the Express development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:3000/api`.

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependency packages:
   ```bash
   npm install
   ```
3. Configure environment parameters:
   - Create a `.env` file (Vite links backend API endpoints via this path):
     ```bash
     cp .env.example .env
     ```
   - Set the Vite API URL variable:
     ```text
     VITE_API_URL=http://localhost:3000/api
     ```
4. Launch the local dev server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## Core Features & Functionality

### Authentication
- Fully secure registration and login pages centered around a clean, modern SaaS card layout.
- JWT token stored securely in `localStorage` and appended to all subsequent requests via Axios request interceptors.
- Automatic session invalidation and redirection to `/login` if any request returns a `401 Unauthorized` response.

### Role-Based Workspace Access Control
- **ADMIN**: Access to create, assign, update, and delete any task. Admins have access to the user index endpoint (`/users`) to choose assignees.
- **USER**: Users are restricted to tasks they created or were assigned to. Other tasks are hidden and secure from view or manipulation.

### Task Management Suite
- Toggle between a dense tabular list view and a visual grid of task card states.
- Search tasks with an integrated **300ms debounced search bar** to optimize backend queries.
- Filter task list by **Priority** (LOW, MEDIUM, HIGH) and **Status** (OPEN, IN_PROGRESS, TESTING, DONE).
- Sort dynamically by **Due Date** or **Date Created** in ascending/descending order.
- Full page pagination controls.
- Status updates utilize **optimistic UI rendering** to feel fast, with auto-rollback on server failures.

### Interactive Kanban Board
- Columns representing statuses (`Open`, `In Progress`, `Testing`, `Completed`).
- Drag-and-drop cards between statuses. Drag actions perform optimistic React Query updates for high-speed feel, with automated rollback and toast notifications on API errors.
- Respects task edit rights (users can only drag tasks they created or are assigned to).

---

## Production Deployment

### Frontend Deployment (Vercel / Netlify)
Vite projects are easily deployed to static hosts like Vercel or Netlify.

#### Vercel
1. Install Vercel CLI globally or use the dashboard:
   - Connect your GitHub repository.
   - Choose **Vite** as the framework template.
   - Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
2. Configure Environment Variables in the project settings:
   - Add `VITE_API_URL` pointing to your hosted production backend API.
3. Configure rewrite rules (in `vercel.json` at the frontend root) to handle SPA routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

#### Netlify
1. Connect your repository to Netlify:
   - Build Settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
2. Add environment variable `VITE_API_URL` in project settings.
3. Define redirect rules for SPA routers by creating a `public/_redirects` file:
   ```text
   /*    /index.html   200
   ```

### Backend Deployment (Render / Heroku)
1. Deploy Express database connections on a managed DB provider (e.g. Aiven, AWS RDS, Supabase MySQL).
2. Set Environment Variables:
   - `DATABASE_URL` pointing to your live production MySQL server.
   - `JWT_SECRET` configured to a long cryptographic key.
   - `PORT` defaults to `3000` (static providers override this automatically).
