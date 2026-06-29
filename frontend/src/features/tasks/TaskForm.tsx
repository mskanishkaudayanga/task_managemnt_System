import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { NativeSelect } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Skeleton } from "../../components/layout/SkeletonLoader";
import { ArrowLeft, Save } from "lucide-react";

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid due date",
  }),
  assignedToId: z.string().nullable().optional(),
});

type TaskFormFields = z.infer<typeof taskSchema>;

interface UserListItem {
  id: string;
  name: string;
  email: string;
}

interface TaskDetailResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
    dueDate: string;
    assignedToId?: string | null;
    createdById: string;
  };
}

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  // 1. Fetch task details if in edit mode
  const { data: taskResponse, isLoading: isTaskLoading } = useQuery<TaskDetailResponse>({
    queryKey: ["task-edit", id],
    queryFn: () => apiClient.get(`/tasks/${id}`),
    enabled: isEditMode,
  });

  const task = taskResponse?.data;

  // 2. Fetch users list (admin only)
  const { data: usersResponse, isLoading: isUsersLoading } = useQuery<{
    success: boolean;
    data: UserListItem[];
  }>({
    queryKey: ["users-list"],
    queryFn: () => apiClient.get("/users"),
    enabled: isAdmin,
  });

  const usersList = usersResponse?.data || [];

  // Setup form hook
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormFields>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "LOW",
      assignedToId: "",
    },
  });

  // Populate form with task details if in edit mode
  React.useEffect(() => {
    if (task) {
      // Security: Only creator or admin can update task details
      if (!isAdmin && task.createdById !== user?.id) {
        error("Unauthorized", "Only the task creator or an admin can edit task details.");
        navigate(`/tasks/${task.id}`);
        return;
      }

      setValue("title", task.title);
      setValue("description", task.description);
      setValue("priority", task.priority);
      
      // Format ISO string to YYYY-MM-DD for date input
      const formattedDate = new Date(task.dueDate).toISOString().split("T")[0];
      setValue("dueDate", formattedDate);
      setValue("assignedToId", task.assignedToId || "");
    }
  }, [task, setValue, user, isAdmin, navigate, error]);

  // Mutation: Create or Update Task
  const saveMutation = useMutation({
    mutationFn: (data: TaskFormFields) => {
      // Normalize empty/unset assignee ID to null
      const requestData = {
        ...data,
        assignedToId: data.assignedToId === "" ? null : data.assignedToId,
      };

      if (isEditMode) {
        return apiClient.patch(`/tasks/${id}`, requestData);
      }
      return apiClient.post("/tasks", requestData);
    },
    onSuccess: (res: any) => {
      success(
        isEditMode ? "Task updated" : "Task created",
        isEditMode
          ? "The task has been updated successfully."
          : "Your new task has been created successfully."
      );
      
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-tasks"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["task", id] });
      }

      // Navigate to list or details
      navigate(isEditMode ? `/tasks/${id}` : "/tasks");
    },
    onError: (err: any) => {
      error("Saving failed", err.message || "Failed to save task. Please try again.");
    },
  });

  const onSubmit = (data: TaskFormFields) => {
    saveMutation.mutate(data);
  };

  const isLoading = isTaskLoading || (isAdmin && isUsersLoading);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={isEditMode ? `/tasks/${id}` : "/tasks"}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel and return
      </Link>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Task Details" : "Create New Task"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Modify the details of your existing task."
              : "Define the parameters for a new team action item."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Task Title
              </label>
              <Input
                type="text"
                placeholder="e.g. Implement API route validations"
                {...register("title")}
                className={errors.title ? "border-red-300 focus:ring-red-200" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Task Description
              </label>
              <textarea
                placeholder="Provide details about what needs to be accomplished..."
                rows={4}
                {...register("description")}
                className={`flex w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                  errors.description ? "border-red-300 focus:ring-red-200" : ""
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Priority and Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                  Priority level
                </label>
                <NativeSelect {...register("priority")}>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </NativeSelect>
                {errors.priority && (
                  <p className="text-xs text-red-500 mt-1">{errors.priority.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                  Due date
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className={`flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-[#0f172a] ${
                    errors.dueDate ? "border-red-300 focus:ring-red-200" : ""
                  }`}
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Assignee select (admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                  Assign To User
                </label>
                <NativeSelect {...register("assignedToId")}>
                  <option value="">Leave Unassigned</option>
                  {usersList.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name} ({usr.email})
                    </option>
                  ))}
                </NativeSelect>
                {errors.assignedToId && (
                  <p className="text-xs text-red-500 mt-1">{errors.assignedToId.message}</p>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving changes..." : isEditMode ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
