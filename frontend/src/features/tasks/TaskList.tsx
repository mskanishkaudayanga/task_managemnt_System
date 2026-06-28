import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { apiClient } from "../../lib/api-client";
import { useDebounce } from "../../hooks/use-debounce";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { TaskListSkeleton } from "../../components/layout/SkeletonLoader";
import {
  Calendar,
  Grid,
  List,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowUpDown,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

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

export default function TaskList() {
  const { isAdmin } = useAuth();

  // Filter & Search states
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = React.useState<string>("");
  const [priority, setPriority] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"createdAt" | "dueDate">("dueDate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  const limit = 8;

  // React Query Fetch tasks
  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data: {
      tasks: Task[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }>({
    queryKey: ["tasks", debouncedSearch, status, priority, sortBy, sortOrder, page],
    queryFn: () =>
      apiClient.get("/tasks", {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
          status: status || undefined,
          priority: priority || undefined,
          sortBy,
          sortOrder,
        },
      }),
  });

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, sortBy, sortOrder]);

  if (isLoading) return <TaskListSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-[#0f172a]">Failed to load tasks</h3>
        <p className="text-sm text-[#64748b] mt-1 max-w-sm">{(error as Error).message}</p>
      </div>
    );
  }

  const tasks = data?.data?.tasks || [];
  const meta = data?.data?.pagination || { total: 0, page: 1, limit: 8, totalPages: 1 };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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

  const getStatusBadge = (s: Task["status"]) => {
    switch (s) {
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

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Tasks Directory</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Search, filter, and organize tasks across your workspace.
          </p>
        </div>
        {isAdmin && (
          <Link to="/tasks/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        )}
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="TESTING">Testing</option>
            <option value="DONE">Completed</option>
          </Select>

          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "createdAt" | "dueDate")}
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="createdAt">Sort by Date Created</option>
          </Select>

          {/* Toggle sort order */}
          <Button variant="outline" onClick={toggleSortOrder} className="flex gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
        </div>

        {/* View toggles */}
        <div className="flex bg-slate-100 p-1 rounded-xl items-center self-start xl:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "table" ? "bg-white shadow-subtle text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-white shadow-subtle text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task List / Grid Display */}
      {tasks.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-[#0f172a]">No tasks found</h3>
            <p className="text-sm text-[#64748b] mt-1 max-w-sm">
              Try adjusting your search query, sorting order, or filter rules.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* Table Layout */
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Task Title
                </th>
                <th className="p-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Priority
                </th>
                <th className="p-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Due Date
                </th>
                <th className="p-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="p-4">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm font-semibold text-[#0f172a] hover:text-blue-600 hover:underline"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="p-4">{getStatusBadge(task.status)}</td>
                  <td className="p-4">{getPriorityBadge(task.priority)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-[#0f172a]">
                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                          <User className="h-3 w-3" />
                        </div>
                        {task.assignedTo.name}
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748b] italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border-slate-200 hover:shadow-card hover:-translate-y-[1px] transition-all"
            >
              <CardContent className="p-5 flex flex-col justify-between h-[180px]">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm font-bold text-[#0f172a] hover:text-blue-600 truncate block flex-1"
                    >
                      {task.title}
                    </Link>
                    {getStatusBadge(task.status)}
                  </div>
                  <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-1 text-[11px] text-[#64748b]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-[#64748b]">
            Showing page <span className="font-semibold text-[#0f172a]">{meta.page}</span> of{" "}
            <span className="font-semibold text-[#0f172a]">{meta.totalPages}</span> ({meta.total} tasks)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 border-slate-200"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
