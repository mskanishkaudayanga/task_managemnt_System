import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DashboardSkeleton } from "../../components/layout/SkeletonLoader";
import { AlertCircle, Calendar, CheckCircle2, ClipboardList, Clock, Plus, HelpCircle } from "lucide-react";

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
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  // Fetch tasks to calculate dashboard statistics
  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: { tasks: Task[]; pagination: { total: number } };
  }>({
    queryKey: ["dashboard-tasks"],
    queryFn: () =>
      apiClient.get("/tasks", {
        params: { page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" },
      }),
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-[#0f172a]">Failed to load dashboard data</h3>
        <p className="text-sm text-[#64748b] mt-1 max-w-sm">{(error as Error).message}</p>
      </div>
    );
  }

  const tasks = data?.data?.tasks || [];
  const totalTasks = tasks.length;

  const openCount = tasks.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const testingCount = tasks.filter((t) => t.status === "TESTING").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  const recentTasks = tasks.slice(0, 5);

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "DONE":
        return <Badge variant="success">Completed</Badge>;
      case "TESTING":
        return <Badge variant="purple">Testing</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Open</Badge>;
    }
  };

  // Calculate percentages
  const openPercentage = totalTasks > 0 ? Math.round((openCount / totalTasks) * 100) : 0;
  const progressPercentage = totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0;
  const testingPercentage = totalTasks > 0 ? Math.round((testingCount / totalTasks) * 100) : 0;
  const donePercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0f172a]">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Here's an overview of your workspace and active tasks.
          </p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Open Tasks Card */}
        <Card className="border-slate-100 hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#64748b]">Open Tasks</CardTitle>
            <ClipboardList className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0f172a]">{openCount}</div>
            <p className="text-xs text-[#64748b] mt-1">Ready to be worked on</p>
          </CardContent>
        </Card>

        {/* In Progress Card */}
        <Card className="border-slate-100 hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#64748b]">In Progress / Testing</CardTitle>
            <Clock className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0f172a]">
              {inProgressCount + testingCount}
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              {inProgressCount} in progress, {testingCount} in testing
            </p>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="border-slate-100 hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#64748b]">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0f172a]">{doneCount}</div>
            <p className="text-xs text-[#64748b] mt-1">Successfully resolved tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Task Progress Breakdown and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Progress Breakdown */}
        <Card className="lg:col-span-2 border-slate-100">
          <CardHeader>
            <CardTitle>Task Progress Breakdown</CardTitle>
            <CardDescription>Visual metrics representing your task distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {totalTasks === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-[#64748b]">No active tasks to analyze.</p>
              </div>
            ) : (
              <>
                {/* Horizontal Progress Bar */}
                <div className="h-6 w-full rounded-full bg-slate-100 flex overflow-hidden">
                  <div style={{ width: `${openPercentage}%` }} className="bg-slate-300 h-full transition-all" title={`Open: ${openPercentage}%`} />
                  <div style={{ width: `${progressPercentage}%` }} className="bg-blue-300 h-full transition-all" title={`In Progress: ${progressPercentage}%`} />
                  <div style={{ width: `${testingPercentage}%` }} className="bg-purple-300 h-full transition-all" title={`Testing: ${testingPercentage}%`} />
                  <div style={{ width: `${donePercentage}%` }} className="bg-emerald-300 h-full transition-all" title={`Done: ${donePercentage}%`} />
                </div>

                {/* Legend and percentage list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-slate-300 inline-block" />
                      <span className="text-xs font-semibold text-[#0f172a]">Open</span>
                    </div>
                    <p className="text-lg font-bold pl-5">{openPercentage}% <span className="text-xs text-[#64748b] font-normal">({openCount})</span></p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-300 inline-block" />
                      <span className="text-xs font-semibold text-[#0f172a]">In Progress</span>
                    </div>
                    <p className="text-lg font-bold pl-5">{progressPercentage}% <span className="text-xs text-[#64748b] font-normal">({inProgressCount})</span></p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-purple-300 inline-block" />
                      <span className="text-xs font-semibold text-[#0f172a]">Testing</span>
                    </div>
                    <p className="text-lg font-bold pl-5">{testingPercentage}% <span className="text-xs text-[#64748b] font-normal">({testingCount})</span></p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-300 inline-block" />
                      <span className="text-xs font-semibold text-[#0f172a]">Completed</span>
                    </div>
                    <p className="text-lg font-bold pl-5">{donePercentage}% <span className="text-xs text-[#64748b] font-normal">({doneCount})</span></p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Recent Tasks list */}
        <Card className="border-slate-100 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your 5 most recently created tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {recentTasks.length === 0 ? (
              <div className="text-center py-12 flex flex-col justify-center items-center">
                <HelpCircle className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-[#64748b]">No recent activity found.</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm font-semibold text-[#0f172a] hover:text-blue-600 truncate block"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#64748b]">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
