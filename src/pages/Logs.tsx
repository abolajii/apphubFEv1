import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "abolaji-ux-kit";
import { apiClient } from "../services/api";
import { formatDistanceToNow } from "date-fns";

export default function LogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => apiClient.getLogs(),
  });

  const logs = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application Logs</h1>
        <p className="text-gray-600">
          Monitor and review application activity logs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {logs.length}
            </div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((log: any) => log.logType === "error").length}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter((log: any) => log.logType === "warning").length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((log: any) => log.logType === "success").length}
            </div>
            <div className="text-sm text-gray-600">Success</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs found
              </div>
            ) : (
              logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.logType === "error"
                          ? "destructive"
                          : log.logType === "warning"
                          ? "warning"
                          : log.logType === "success"
                          ? "success"
                          : "default"
                      }
                    >
                      {log.logType}
                    </Badge>
                    <div>
                      <div className="font-medium">{log.message}</div>
                      <div className="text-sm text-gray-600">
                        {log.appName} • {log.method} {log.endpoint}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
