import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { LogTable } from "../components/logs/LogTable";
import type { LogTableFilters } from "../components/logs/LogTable";
import { Button, Input } from "abolaji-ux-kit";
import { CleanModal } from "../components/ui/CleanModal";
import { Trash2, Filter } from "lucide-react";
import { apiClient } from "../services/api";
import { useApplications } from "../hooks/useApi";

const Logs = () => {
  const [filters, setFilters] = useState<LogTableFilters>({});
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"single" | "bulk" | "all">(
    "single"
  );
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [dateFilters, setDateFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [applicationFilter, setApplicationFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentLogs, setCurrentLogs] = useState<any[]>([]);
  const [alertState, setAlertState] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const queryClient = useQueryClient();

  // Fetch applications for filter dropdown
  const { data: applicationsData } = useApplications();
  const applications = applicationsData || [];

  // Fetch logs with enhanced filters and pagination
  const { data: logsData, isLoading } = useQuery({
    queryKey: [
      "logs",
      filters,
      dateFilters,
      applicationFilter,
      pagination.page,
      pagination.pageSize,
    ],
    queryFn: () => {
      const allFilters = {
        ...filters,
        ...(dateFilters.startDate && { startDate: dateFilters.startDate }),
        ...(dateFilters.endDate && { endDate: dateFilters.endDate }),
        ...(applicationFilter && { appId: applicationFilter }),
        page: pagination.page,
        limit: pagination.pageSize,
      };

      return apiClient.getLogs(allFilters);
    },
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Update current logs when new data arrives
  useEffect(() => {
    if (logsData?.data) {
      setCurrentLogs(Array.isArray(logsData.data) ? logsData.data : []);
      // Mock pagination for now - you can update this based on your API response
      setPagination((prev) => ({
        ...prev,
        total: Array.isArray(logsData.data) ? logsData.data.length : 0,
        totalPages: Math.ceil(
          (Array.isArray(logsData.data) ? logsData.data.length : 0) /
            prev.pageSize
        ),
        hasNext:
          prev.page <
          Math.ceil(
            (Array.isArray(logsData.data) ? logsData.data.length : 0) /
              prev.pageSize
          ),
        hasPrev: prev.page > 1,
      }));
    }
  }, [logsData, pagination.page, pagination.pageSize]);

  const logs = currentLogs;

  // Mark initial load as complete after first data fetch
  useEffect(() => {
    if (isInitialLoad && logsData) {
      setIsInitialLoad(false);
    }
  }, [logsData, isInitialLoad]);

  // Show alert function
  const showAlert = (type: "success" | "error", message: string) => {
    setAlertState({ show: true, type, message });
    setTimeout(() => {
      setAlertState({ show: false, type: "success", message: "" });
    }, 5000);
  };

  // Delete single log mutation (mock for now)
  const deleteSingleLogMutation = useMutation({
    mutationFn: async (_logId: string) => {
      // Mock API call - replace with actual API when available
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 1000);
      });
    },
    onSuccess: () => {
      showAlert("success", "Log deleted successfully!");
      setShowDeleteModal(false);
      setLogToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: () => {
      showAlert("error", "Failed to delete log.");
    },
  });

  // Delete multiple logs mutation (mock for now)
  const deleteBulkLogsMutation = useMutation({
    mutationFn: async (_logIds: string[]) => {
      // Mock API call - replace with actual API when available
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 1000);
      });
    },
    onSuccess: () => {
      showAlert("success", `${selectedLogs.size} logs deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedLogs(new Set());
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: () => {
      showAlert("error", "Failed to delete logs.");
    },
  });

  // Delete all logs mutation (mock for now)
  const deleteAllLogsMutation = useMutation({
    mutationFn: async () => {
      // Mock API call - replace with actual API when available
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 1000);
      });
    },
    onSuccess: () => {
      showAlert("success", "All logs deleted successfully!");
      setShowDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: () => {
      showAlert("error", "Failed to delete all logs.");
    },
  });

  // Handle single log delete
  const handleDeleteLog = (logId: string) => {
    setLogToDelete(logId);
    setDeleteType("single");
    setShowDeleteModal(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedLogs.size === 0) {
      showAlert("error", "Please select logs to delete.");
      return;
    }
    setDeleteType("bulk");
    setShowDeleteModal(true);
  };

  // Handle delete all
  const handleDeleteAll = () => {
    setDeleteType("all");
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    switch (deleteType) {
      case "single":
        if (logToDelete) {
          deleteSingleLogMutation.mutate(logToDelete);
        }
        break;
      case "bulk":
        deleteBulkLogsMutation.mutate(Array.from(selectedLogs));
        break;
      case "all":
        deleteAllLogsMutation.mutate();
        break;
    }
  };

  // Handle log selection
  const handleLogSelection = (logId: string, selected: boolean) => {
    const newSelected = new Set(selectedLogs);
    if (selected) {
      newSelected.add(logId);
    } else {
      newSelected.delete(logId);
    }
    setSelectedLogs(newSelected);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLogs(new Set(logs.map((log: { _id: string }) => log._id)));
    } else {
      setSelectedLogs(new Set());
    }
  };

  // Handle date filter changes
  const handleDateFilterChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDateFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  // Handle application filter change
  const handleApplicationFilterChange = (appId: string) => {
    setApplicationFilter(appId);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    setSelectedLogs(new Set()); // Clear selection when changing pages
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setDateFilters({ startDate: "", endDate: "" });
    setApplicationFilter("");
    setSelectedLogs(new Set());
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  return (
    <div className="p-6 space-y-6">
      {/* Alert */}
      {alertState.show && (
        <div
          className={`p-4 rounded-md ${
            alertState.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {alertState.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{alertState.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() =>
                    setAlertState({ show: false, type: "success", message: "" })
                  }
                  className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleBulkDelete}
            disabled={selectedLogs.size === 0}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedLogs.size})
          </Button>
          <Button onClick={handleDeleteAll} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) =>
                  handleDateFilterChange("startDate", e.target.value)
                }
                placeholder="Start Date"
                className="flex-1"
              />
              <Input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) =>
                  handleDateFilterChange("endDate", e.target.value)
                }
                placeholder="End Date"
                className="flex-1"
              />
            </div>
          </div>

          {/* Application Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Application</label>
            <select
              value={applicationFilter}
              onChange={(e) => handleApplicationFilterChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilters({ logType: "error" })}
                variant={filters.logType === "error" ? "default" : "outline"}
                size="sm"
              >
                Errors Only
              </Button>
              <Button
                onClick={() => setFilters({ logType: "warning" })}
                variant={filters.logType === "warning" ? "default" : "outline"}
                size="sm"
              >
                Warnings Only
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <LogTable
          logs={logs}
          selectedLogs={selectedLogs}
          onLogSelection={handleLogSelection}
          onSelectAll={handleSelectAll}
          onDeleteLog={handleDeleteLog}
          loading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          filters={filters}
          onFilter={setFilters}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CleanModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {deleteType === "single" &&
              "Are you sure you want to delete this log?"}
            {deleteType === "bulk" &&
              `Are you sure you want to delete ${selectedLogs.size} selected logs?`}
            {deleteType === "all" &&
              "Are you sure you want to delete ALL logs? This action cannot be undone."}
          </p>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setShowDeleteModal(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="destructive"
              disabled={
                deleteSingleLogMutation.isPending ||
                deleteBulkLogsMutation.isPending ||
                deleteAllLogsMutation.isPending
              }
            >
              {(deleteSingleLogMutation.isPending ||
                deleteBulkLogsMutation.isPending ||
                deleteAllLogsMutation.isPending) &&
                "Deleting..."}
              {!(
                deleteSingleLogMutation.isPending ||
                deleteBulkLogsMutation.isPending ||
                deleteAllLogsMutation.isPending
              ) && "Delete"}
            </Button>
          </div>
        </div>
      </CleanModal>
    </div>
  );
};

export default Logs;
