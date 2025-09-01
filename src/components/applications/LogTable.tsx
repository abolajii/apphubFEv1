import { useState } from "react";
import {
  ChevronDown,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  CardTitle,
} from "abolaji-ux-kit";

import { formatDistanceToNow } from "date-fns";

interface Log {
  _id: string;
  logType: "success" | "error" | "warning" | "info";
  message: string;
  appName: string;
  appId: string;
  method: string;
  endpoint?: string;
  responseTime?: number;
  createdAt: string;
  additionalData?: Record<string, any>;
}

export interface LogTableFilters {
  search?: string;
  logType?: string;
}

interface LogTableProps {
  logs: Log[];
  loading: boolean;
  onFilter: (filters: LogTableFilters) => void;
  filters?: LogTableFilters;
}

const logTypeIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const logTypeColors = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
};

export function LogTable({
  logs,
  loading,
  onFilter,
  filters = {},
}: LogTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedLogType, setSelectedLogType] = useState(filters.logType || "");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilter({ ...filters, search: value });
  };

  const handleLogTypeFilter = (logType: string) => {
    const newLogType = selectedLogType === logType ? "" : logType;
    setSelectedLogType(newLogType);
    onFilter({ ...filters, logType: newLogType });
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Application Logs</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Log Type Filters */}
            <div className="flex items-center space-x-1">
              {Object.keys(logTypeIcons).map((logType) => (
                <Button
                  key={logType}
                  variant={selectedLogType === logType ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLogTypeFilter(logType)}
                  className="capitalize"
                >
                  {logType}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No logs found
            </h3>
            <p className="text-gray-500">
              {filters.search || filters.logType
                ? "Try adjusting your filters"
                : "No logs have been recorded yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const Icon = logTypeIcons[log.logType];
                const isExpanded = expandedRows.has(log._id);

                return (
                  <>
                    <TableRow key={log._id} className="hover:bg-gray-50">
                      <TableCell>
                        <Icon
                          className={`w-4 h-4 ${logTypeColors[log.logType]}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.logType === "error"
                              ? "destructive"
                              : log.logType
                          }
                          className="capitalize"
                        >
                          {log.logType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.appName}</div>
                          <div className="text-gray-500">ID: {log.appId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {log.method}
                          </span>
                          <span className="text-sm text-gray-600">
                            {log.endpoint || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.responseTime ? (
                          <span
                            className={`text-sm ${
                              log.responseTime > 1000
                                ? "text-red-600"
                                : log.responseTime > 500
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {log.responseTime}ms
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.additionalData && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRowExpansion(log._id)}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded row for additional data */}
                    {isExpanded && log.additionalData && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium mb-2">
                              Additional Data:
                            </h4>
                            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                              {JSON.stringify(log.additionalData, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
