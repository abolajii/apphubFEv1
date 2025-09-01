import { useState, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
  Server,
  Zap,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
} from "abolaji-ux-kit";

import { formatDistanceToNow } from "date-fns";

const logTypeIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const logTypeColors = {
  success: "text-emerald-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

const logTypeBadgeColors = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-300",
  error: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
};

const methodColors = {
  GET: "bg-emerald-500 text-white",
  POST: "bg-blue-500 text-white",
  PUT: "bg-amber-500 text-white",
  DELETE: "bg-red-500 text-white",
  PATCH: "bg-purple-500 text-white",
  OPTIONS: "bg-gray-500 text-white",
};

export interface LogTableFilters {
  search?: string;
  logType?: string;
}

interface Log {
  id: number;
  logType: "success" | "error" | "warning" | "info";
  message: string;
  appName: string;
  appId: string;
  method: string;
  endpoint?: string;
  responseTime?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  updatedAt?: string;
  additionalData?: Record<string, any>;
}

interface LogTableProps {
  logs: Log[];
  loading: boolean;
  onFilter: (filters: LogTableFilters) => void;
  filters?: LogTableFilters;
  onDeleteLog?: (logId: string) => void;
  selectedLogs?: Set<string>;
  onLogSelection?: (logId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onPageChange?: (page: number) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  initialLoading?: boolean;
}

export function LogTable({
  logs,
  onFilter,
  filters = {},
  onDeleteLog,
  selectedLogs,
  onLogSelection,
  onSelectAll,
  onPageChange,
  pagination,
  initialLoading,
}: LogTableProps) {
  logs = Array.isArray(logs) ? logs : [];
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

  // Reset selectedLogType when filters change externally
  useEffect(() => {
    if (!filters.logType) {
      setSelectedLogType("");
    }
  }, [filters.logType]);

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  if (initialLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Application Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded-md w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Application Logs
            <Badge variant="outline" className="ml-2 bg-white">
              {logs.length} entries
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-72 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>

            {/* Log Type Filters */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-gray-200">
              {Object.keys(logTypeIcons).map((logType) => {
                const Icon = logTypeIcons[logType as keyof typeof logTypeIcons];
                const isSelected = selectedLogType === logType;

                return (
                  <Button
                    key={logType}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLogTypeFilter(logType)}
                    className={`capitalize transition-all duration-200 ${
                      isSelected
                        ? logTypeBadgeColors[
                            logType as keyof typeof logTypeBadgeColors
                          ]
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {logType}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No logs found
            </h3>
            <p className="text-gray-500 text-lg">
              {filters.search || filters.logType
                ? "Try adjusting your filters to see more results"
                : "No logs have been recorded yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
                  {/* Select All Checkbox */}
                  {onSelectAll && (
                    <TableHead className="w-12 font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={
                          selectedLogs?.size === logs.length && logs.length > 0
                        }
                        onChange={(e) => onSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </TableHead>
                  )}
                  <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Message
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Application
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Endpoint
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Response Time
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Time
                  </TableHead>
                  <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
                  {/* Actions Column */}
                  {onDeleteLog && (
                    <TableHead className="w-12 font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => {
                  const Icon = logTypeIcons[log.logType];
                  const isExpanded = expandedRows.has(log.id.toString());
                  const isSelected =
                    selectedLogs?.has(log.id.toString()) || false;

                  return (
                    <>
                      <TableRow
                        key={log.id}
                        className={`
                          hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                          transition-all duration-200 border-b border-gray-100
                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                          ${isSelected ? "bg-blue-50" : ""}
                        `}
                      >
                        {/* Row Checkbox */}
                        {onLogSelection && (
                          <TableCell className="py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                onLogSelection(
                                  log.id.toString(),
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </TableCell>
                        )}
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                            <Icon
                              className={`w-4 h-4 ${
                                logTypeColors[log.logType]
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`
                              capitalize font-medium px-3 py-1 border
                              ${logTypeBadgeColors[log.logType]}
                            `}
                          >
                            {log.logType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs py-4">
                          <div
                            className="truncate font-medium text-gray-800"
                            title={log.message}
                          >
                            {log.message}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-800 mb-1">
                              {log.appName}
                            </div>
                            <div className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full inline-block">
                              ID: {log.appId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                methodColors[
                                  log.method as keyof typeof methodColors
                                ] || methodColors.OPTIONS
                              }`}
                            >
                              {log.method}
                            </span>
                            <span className="text-sm text-gray-600 font-mono">
                              {log.endpoint || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {log.responseTime ? (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-gray-400" />
                              <span
                                className={`
                                  text-sm font-semibold px-2 py-1 rounded-full
                                  ${
                                    log.responseTime > 1000
                                      ? "bg-red-100 text-red-700"
                                      : log.responseTime > 500
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }
                                `}
                              >
                                {log.responseTime}ms
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              {log.createdAt &&
                              !isNaN(new Date(log.createdAt).getTime())
                                ? formatDistanceToNow(new Date(log.createdAt), {
                                    addSuffix: true,
                                  })
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {log.additionalData && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleRowExpansion(log.id.toString())
                              }
                              className="w-8 h-8 rounded-full hover:bg-blue-100 transition-colors duration-200"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded
                                    ? "rotate-180 text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </Button>
                          )}
                        </TableCell>
                        {/* Delete Button */}
                        {onDeleteLog && (
                          <TableCell className="py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteLog(log.id.toString())}
                              className="w-8 h-8 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Expanded row for additional data */}
                      {isExpanded && log.additionalData && (
                        <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50">
                          <TableCell
                            colSpan={onDeleteLog ? 10 : 9}
                            className="py-0"
                          >
                            <div className="p-6 border-l-4 border-blue-400">
                              <h4 className="text-sm font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Additional Data
                              </h4>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <pre className="text-xs p-4 overflow-x-auto text-gray-700 leading-relaxed">
                                  {JSON.stringify(log.additionalData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}{" "}
                of {pagination.total} entries
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => onPageChange?.(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
