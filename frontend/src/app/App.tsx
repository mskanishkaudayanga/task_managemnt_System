import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { AuthProvider } from '../context/auth-context';
import { ToastProvider } from '../components/ui/toast';
import { ProtectedRoute, PublicRoute } from '../components/layout/RouteGuards';
import { AppLayout } from '../components/layout/AppLayout';

// Features
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Dashboard from '../features/dashboard/Dashboard';
import TaskList from '../features/tasks/TaskList';
import TaskDetail from '../features/tasks/TaskDetail';
import TaskForm from '../features/tasks/TaskForm';
import KanbanBoard from '../features/tasks/KanbanBoard';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <AppLayout>
                      <TaskList />
                    </AppLayout>
                  }
                />
                <Route
                  path="/tasks/new"
                  element={
                    <AppLayout>
                      <TaskForm />
                    </AppLayout>
                  }
                />
                <Route
                  path="/tasks/:id"
                  element={
                    <AppLayout>
                      <TaskDetail />
                    </AppLayout>
                  }
                />
                <Route
                  path="/tasks/:id/edit"
                  element={
                    <AppLayout>
                      <TaskForm />
                    </AppLayout>
                  }
                />
                <Route
                  path="/kanban"
                  element={
                    <AppLayout>
                      <KanbanBoard />
                    </AppLayout>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
