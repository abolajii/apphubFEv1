import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LogTable } from "../components/applications/LogTable";
import type { LogTableFilters } from "../components/applications/LogTable";
import { apiClient } from "../services/api";

export default function LogsPage() {
  const [filters, setFilters] = useState<LogTableFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ["logs", filters],
    queryFn: () => apiClient.getLogs(filters),
  });

  // Ensure logs have the required _id property
  const logs =
    (data?.data?.data || []).map((log: any) => ({
      _id: log._id ?? "",
      logType: log.logType,
      message: log.message,
      appName: log.appName,
      appId: log.appId,
      method: log.method,
      endpoint: log.endpoint,
      responseTime: log.responseTime,
      createdAt: log.createdAt,
      additionalData: log.additionalData,
    })) || [];

  const handleFilter = (newFilters: LogTableFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application Logs</h1>
        <p className="text-gray-600">
          Monitor and review application activity logs
        </p>
      </div>

      <LogTable
        logs={logs}
        loading={isLoading}
        onFilter={handleFilter}
        filters={filters}
      />
    </div>
  );
}
