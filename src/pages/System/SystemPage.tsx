import React, { useState } from "react";
import { Button, Card, Badge } from "abolaji-ux-kit";
import {
  Settings,
  Server,
  Database,
  Shield,
  HardDrive,
  Cpu,
  Monitor,
  Network,
  RefreshCw,
} from "lucide-react";

interface SystemMetric {
  id: number;
  name: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  icon: React.ComponentType<any>;
}

const mockSystemMetrics: SystemMetric[] = [
  {
    id: 1,
    name: "CPU Usage",
    value: "45%",
    status: "healthy",
    icon: Cpu,
  },
  {
    id: 2,
    name: "Memory Usage",
    value: "78%",
    status: "warning",
    icon: Monitor,
  },
  {
    id: 3,
    name: "Disk Space",
    value: "23%",
    status: "healthy",
    icon: HardDrive,
  },
  {
    id: 4,
    name: "Network I/O",
    value: "145 MB/s",
    status: "healthy",
    icon: Network,
  },
];

interface SystemService {
  id: number;
  name: string;
  status: "running" | "stopped" | "error";
  uptime: string;
  description: string;
}

const mockServices: SystemService[] = [
  {
    id: 1,
    name: "Web Server",
    status: "running",
    uptime: "24d 15h 30m",
    description: "Main HTTP server handling requests",
  },
  {
    id: 2,
    name: "Database",
    status: "running",
    uptime: "24d 15h 30m",
    description: "Primary database server",
  },
  {
    id: 3,
    name: "Cache Service",
    status: "running",
    uptime: "12h 45m",
    description: "Redis caching service",
  },
  {
    id: 4,
    name: "Backup Service",
    status: "stopped",
    uptime: "0h 0m",
    description: "Automated backup system",
  },
];

const SystemPage: React.FC = () => {
  const [metrics, _] = useState<SystemMetric[]>(mockSystemMetrics);
  const [services, __] = useState<SystemService[]>(mockServices);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return "success";
      case "warning":
        return "secondary";
      case "critical":
      case "error":
        return "destructive";
      case "stopped":
        return "default";
      default:
        return "default";
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System</h2>
            <p className="text-gray-600">Monitor system health and services</p>
          </div>
        </div>
        <Button
          variant="primary"
          className="flex items-center space-x-2"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <Badge
                      variant={getStatusColor(metric.status) as any}
                      className="mt-2"
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${getMetricColor(
                      metric.status
                    )}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Services */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                System Services
              </h3>
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {services.filter((s) => s.status === "running").length} of{" "}
                  {services.length} running
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Server className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(service.status) as any}>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                System Information
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Operating System</span>
                <span className="text-sm font-medium text-gray-900">
                  Ubuntu 22.04 LTS
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <span className="text-sm font-medium text-gray-900">
                  24 days, 15 hours
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Memory</span>
                <span className="text-sm font-medium text-gray-900">16 GB</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Available Storage</span>
                <span className="text-sm font-medium text-gray-900">
                  250 GB
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">CPU Cores</span>
                <span className="text-sm font-medium text-gray-900">
                  8 cores
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Load Average</span>
                <span className="text-sm font-medium text-gray-900">
                  0.45, 0.52, 0.48
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Security Status
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Firewall</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SSL Certificate</span>
                <Badge variant="success">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Updates</span>
                <Badge variant="warning">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Antivirus</span>
                <Badge variant="success">Protected</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <Button fullWidth variant="secondary" className="justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Services
              </Button>
              <Button fullWidth variant="secondary" className="justify-start">
                <Database className="w-4 h-4 mr-2" />
                Database Backup
              </Button>
              <Button fullWidth variant="secondary" className="justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Security Scan
              </Button>
              <Button fullWidth variant="secondary" className="justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemPage;
