import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/layout/SkeletonLoader";
import { Calendar, User, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  createdAt: string;
  assignedTo?: { name: string; email: string } | null;
  createdBy?: { name: string; email: string } | null;
  createdById: string;
  assignedToId?: string | null;
}

type ColumnStatus = Task["status"];

const COLUMNS: { id: ColumnStatus; title: string; colorClass: string; bgClass: string }[] = [
  { id: "OPEN", title: "Open", colorClass: "text-slate-600 border-slate-200", bgClass: "bg-slate-50/50" },
  { id: "IN_PROGRESS", title: "In Progress", colorClass: "text-blue-600 border-blue-100", bgClass: "bg-blue-50/20" },
  { id: "TESTING", title: "Testing", colorClass: "text-purple-600 border-purple-100", bgClass: "bg-purple-50/20" },
  { id: "DONE", title: "Completed", colorClass: "text-emerald-600 border-emerald-100", bgClass: "bg-emerald-50/20" },
];

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<ColumnStatus | null>(null);

  // Fetch tasks
  const { data, isLoading, error: fetchError } = useQuery<{
    success: boolean;
    data: { tasks: Task[] };
  }>({
    queryKey: ["tasks-kanban"],
    queryFn: () =>
      apiClient.get("/tasks", {
        params: { page: 1, limit: 100, sortBy: "dueDate", sortOrder: "asc" },
      }),
  });

  const tasks = data?.data?.tasks || [];

  // Mutation to update task status
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: ColumnStatus }) =>
      apiClient.patch(`/tasks/${taskId}/status`, { status }),
    
    // Optimistic Update
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks-kanban"] });

      // Snapshot previous tasks
      const previousData = queryClient.getQueryData<{ success: boolean; data: { tasks: Task[] } }>(["tasks-kanban"]);

      // Update local cache
      if (previousData) {
        queryClient.setQueryData(["tasks-kanban"], {
          ...previousData,
          data: {
            tasks: previousData.data.tasks.map((t) =>
              t.id === taskId ? { ...t, status } : t
            ),
          },
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on failure
      if (context?.previousData) {
        queryClient.setQueryData(["tasks-kanban"], context.previousData);
      }
      error("Update failed", err.message || "Could not save card position.");
    },
    onSuccess: (_, variables) => {
      success("Board updated", `Task moved to ${variables.status.replace("_", " ")}`);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tasks"] });
    },
  });

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, task: Task) => {
    // Check permission to update status (Admin, Creator, or Assignee)
    const canMove = isAdmin || task.createdById === user?.id || task.assignedToId === user?.id;
    if (!canMove) {
      e.preventDefault();
      error("Permission denied", "You are not authorized to change the status of this task.");
      return;
    }
    
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setActiveDragId(taskId);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== columnId) {
        updateStatusMutation.mutate({ taskId, status: columnId });
      }
    }
    
    setDragOverColumn(null);
    setActiveDragId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-[#0f172a]">Failed to load Kanban board</h3>
        <p className="text-sm text-[#64748b] mt-1 max-w-sm">{(fetchError as Error).message}</p>
      </div>
    );
  }

  const getPriorityBadge = (p: Task["priority"]) => {
    switch (p) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* Title */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Kanban Board</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Drag cards between columns to optimistically update task statuses.
          </p>
        </div>
        {updateStatusMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-2xl border p-4 h-full min-h-[300px] md:min-h-0 transition-all duration-200 ${
                isOver ? "border-blue-300 bg-blue-50/10 shadow-elevation" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-2 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full inline-block bg-[#a6c2fa]" />
                  <h3 className="font-semibold text-sm text-[#0f172a]">{column.title}</h3>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600 font-bold border-slate-200">
                  {columnTasks.length}
                </Badge>
              </div>

              {/* Cards Container */}
              <div
                className="flex-1 overflow-y-auto space-y-3 pr-1"
                onDragLeave={() => dragOverColumn === column.id && setDragOverColumn(null)}
              >
                {columnTasks.map((task) => {
                  const canMove = isAdmin || task.createdById === user?.id || task.assignedToId === user?.id;
                  const isDraggingThis = activeDragId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={canMove}
                      onDragStart={(e) => handleDragStart(e, task.id, task)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-grab active:cursor-grabbing ${
                        isDraggingThis ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      <motion.div
                        layoutId={task.id}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <Card className="border-slate-200 shadow-subtle hover:border-slate-300 hover:shadow-card transition-all p-4 bg-white relative overflow-hidden group">
                          <div className="flex flex-col gap-3">
                            {/* Title */}
                            <Link
                              to={`/tasks/${task.id}`}
                              className="text-sm font-semibold text-[#0f172a] hover:text-blue-600 hover:underline line-clamp-2 leading-snug"
                            >
                              {task.title}
                            </Link>

                            {/* Description */}
                            <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                              {task.description || "No description provided."}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                              {/* Due date */}
                              <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>

                              {/* Priority */}
                              {getPriorityBadge(task.priority)}
                            </div>

                            {/* Assignee display */}
                            {task.assignedTo && (
                              <div className="flex items-center gap-1.5 text-[10px] text-[#0f172a] font-medium pt-1.5 border-t border-slate-100/50">
                                <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-[9px] font-bold">
                                  <User className="h-3 w-3" />
                                </div>
                                <span className="truncate">{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-300/60 rounded-xl flex items-center justify-center text-xs text-[#64748b]/70 select-none">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
