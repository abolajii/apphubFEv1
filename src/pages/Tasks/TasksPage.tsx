import React, { useState, useEffect } from "react";
import { Button, Card, Input, Select } from "abolaji-ux-kit";
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks, useApplications } from "../../hooks/useApi";
import type { Task as ApiTask } from "../../services/api";
import { format, formatDistanceToNow } from "date-fns";

interface Task extends ApiTask {}

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [taskCounts, setTaskCounts] = useState({
    total: 0,
    pending: 0,
    inprogress: 0,
    done: 0,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch applications for filter dropdown
  const { data: applicationsData } = useApplications();
  const applications = applicationsData || [];

  // Fetch tasks with filters and pagination
  const { data: tasksData, isLoading } = useTasks({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(applicationFilter && { appId: applicationFilter }),
    page: pagination.page,
    limit: pagination.pageSize,
  });

  // Update current tasks when new data arrives
  useEffect(() => {
    if (tasksData) {
      // Handle nested data structure from API response
      const tasks = tasksData.data || tasksData;
      const paginationData = tasksData.pagination;
      const countsData = tasksData.counts;

      setCurrentTasks(Array.isArray(tasks) ? tasks : []);

      // Update task counts from API response
      if (countsData) {
        setTaskCounts({
          total: countsData.total || 0,
          pending: countsData.pending || 0,
          inprogress: countsData.inprogress || 0,
          done: countsData.done || 0,
        });
      }

      // Update pagination with actual API response data
      if (paginationData) {
        setPagination({
          page: paginationData.page,
          pageSize: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
          hasNext: paginationData.page < paginationData.totalPages,
          hasPrev: paginationData.page > 1,
        });
      }
    }
  }, [tasksData, pagination.page, pagination.pageSize]);

  // Mark initial load as complete after first data fetch
  useEffect(() => {
    if (isInitialLoad && tasksData) {
      setIsInitialLoad(false);
    }
  }, [tasksData, isInitialLoad]);

  const tasks = currentTasks;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle filter changes
  const handleApplicationFilterChange = (event: {
    target: { value: string | number };
  }) => {
    const appId = String(event.target.value);
    setApplicationFilter(appId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CheckSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <p className="text-gray-600">Track and manage your tasks</p>
          </div>
        </div>
        <Button
          variant="primary"
          className="flex items-center space-x-2"
          onClick={() => navigate("/tasks/add")}
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isLoading && isInitialLoad ? (
          // Loading skeleton cards
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Actual data cards
          <>
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {taskCounts.total}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {taskCounts.inprogress}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {taskCounts.done}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {taskCounts.pending}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Tasks</label>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              placeholder="All Status"
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "inprogress" },
                { label: "Completed", value: "done" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(String(e.target.value))}
            />
          </div>

          {/* Application Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Application</label>
            <Select
              placeholder="All Applications"
              options={[
                { label: "All Applications", value: "" },
                ...applications.map((app) => ({
                  label: app.name,
                  value: app.appId.toString(),
                })),
              ]}
              value={applicationFilter}
              onChange={handleApplicationFilterChange}
            />
          </div>

          {/* Page Size Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Items per page</label>
            <Select
              placeholder="Page Size"
              options={[
                { label: "10 per page", value: "10" },
                { label: "20 per page", value: "20" },
                { label: "30 per page", value: "30" },
                { label: "50 per page", value: "50" },
              ]}
              value={pagination.pageSize.toString()}
              onChange={(e) => {
                const newPageSize = parseInt(String(e.target.value));
                setPagination((prev) => ({
                  ...prev,
                  pageSize: newPageSize,
                  page: 1,
                }));
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks Display - Similar to View Application */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />✅ Tasks & Todos
          </h3>
          <p className="text-sm text-gray-600">
            Project tasks and development milestones
          </p>
        </div>

        {filteredTasks && filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                        task.status === "done"
                          ? "bg-green-100 text-green-600"
                          : task.status === "inprogress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.status === "done"
                        ? "✓"
                        : task.status === "inprogress"
                        ? "⏳"
                        : "⏸"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full font-medium ${
                            task.status === "done"
                              ? "bg-green-100 text-green-700"
                              : task.status === "inprogress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status === "done"
                            ? "Completed"
                            : task.status === "inprogress"
                            ? "In Progress"
                            : "Pending"}
                        </span>
                        <span>
                          📅 Due:{" "}
                          {format(new Date(task.dateToFinish), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {isLoading ? "Loading tasks..." : "No tasks found"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total tasks)
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TasksPage;
