import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Skeleton } from "../../components/layout/SkeletonLoader";
import {
  Calendar,
  User,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  createdAt: string;
  assignedTo?: UserInfo | null;
  createdBy?: UserInfo | null;
  createdById: string;
  assignedToId?: string | null;
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Fetch Task details
  const { data: response, isLoading, error: fetchError } = useQuery<{
    success: boolean;
    data: Task;
  }>({
    queryKey: ["task", id],
    queryFn: () => apiClient.get(`/tasks/${id}`),
    enabled: !!id,
  });

  const task = response?.data;

  // Mutation to update task status (optimistic update)
  const statusMutation = useMutation({
    mutationFn: (newStatus: Task["status"]) =>
      apiClient.patch(`/tasks/${id}/status`, { status: newStatus }),
    
    // Optimistic Update
    onMutate: async (newStatus) => {
      // Cancel outstanding refetches
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      // Snapshot the previous state
      const previousTask = queryClient.getQueryData<{ success: boolean; data: Task }>(["task", id]);

      // Optimistically update cache
      if (previousTask) {
        queryClient.setQueryData(["task", id], {
          ...previousTask,
          data: {
            ...previousTask.data,
            status: newStatus,
          },
        });
      }

      return { previousTask };
    },
    onError: (err, newStatus, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(["task", id], context.previousTask);
      }
      error("Failed to update status", err.message || "An error occurred");
    },
    onSuccess: () => {
      success("Status updated", "The task status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutation to delete task
  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      success("Task deleted", "The task has been permanently deleted.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tasks"] });
      navigate("/tasks");
    },
    onError: (err: any) => {
      error("Delete failed", err.message || "Could not delete task.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (fetchError || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center max-w-4xl mx-auto">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-[#0f172a]">Task not found</h3>
        <p className="text-sm text-[#64748b] mt-1 max-w-sm">
          The task might have been deleted, or you may not have view permissions.
        </p>
        <Link to="/tasks" className="mt-4">
          <Button variant="outline">Back to Tasks</Button>
        </Link>
      </div>
    );
  }

  // Permissions checks
  const isCreator = task.createdById === user?.id;
  const isAssignee = task.assignedToId === user?.id;
  const canEditOrDelete = isAdmin || isCreator;
  const canUpdateStatus = isAdmin || isCreator || isAssignee;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task["status"];
    statusMutation.mutate(newStatus);
  };

  const getPriorityBadge = (p: Task["priority"]) => {
    switch (p) {
      case "HIGH":
        return <Badge variant="destructive">High Priority</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium Priority</Badge>;
      default:
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks list
      </Link>

      {/* Main card */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {getPriorityBadge(task.priority)}
              <span className="text-xs text-[#64748b]">
                Created on {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-[#0f172a]">
              {task.title}
            </CardTitle>
          </div>

          {/* Action buttons */}
          {canEditOrDelete && (
            <div className="flex gap-2">
              <Link to={`/tasks/${task.id}/edit`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1.5 h-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Status Mutation dropdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold text-[#0f172a]">Task Status</span>
            </div>
            
            {canUpdateStatus ? (
              <div className="w-full sm:w-48">
                <select
                  value={task.status}
                  onChange={handleStatusChange}
                  disabled={statusMutation.isPending}
                  className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring text-[#0f172a] shadow-subtle cursor-pointer disabled:opacity-55"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="TESTING">Testing</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>
            ) : (
              <div className="text-sm font-semibold">
                <Badge variant={task.status === "DONE" ? "success" : "info"}>
                  {task.status}
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap bg-slate-50/20 p-4 rounded-xl border border-slate-100">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Metadata attributes grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Due date */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Due Date
              </span>
              <div className="flex items-center gap-2 text-sm text-[#0f172a] font-medium">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Assigned to */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Assignee
              </span>
              <div className="flex items-center gap-2 text-sm text-[#0f172a] font-medium">
                <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold">
                  <User className="h-4 w-4" />
                </div>
                {task.assignedTo ? (
                  <div>
                    <p className="leading-tight">{task.assignedTo.name}</p>
                    <span className="text-[10px] text-[#64748b] font-normal leading-none">
                      {task.assignedTo.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#64748b] italic text-xs">Unassigned</span>
                )}
              </div>
            </div>

            {/* Created by */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Creator
              </span>
              <div className="flex items-center gap-2 text-sm text-[#0f172a] font-medium">
                <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-semibold">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="leading-tight">{task.createdBy?.name || "System"}</p>
                  {task.createdBy && (
                    <span className="text-[10px] text-[#64748b] font-normal leading-none">
                      {task.createdBy.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
