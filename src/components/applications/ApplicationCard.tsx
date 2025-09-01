import { useState, useMemo } from "react";
import {
  Monitor,
  ExternalLink,
  Activity,
  Clock,
  Zap,
  Globe,
  TrendingUp,
  Eye,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "abolaji-ux-kit";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Application {
  id: number;
  bg: string;
  description: string;
  name: string;
  link: string;
  stacks: string;
  onGoing: boolean;
  appId: string | number;
  status: "running" | "stopped" | "maintenance";
  uptime: number;
  downtime: number;
  lastChecked: Date;
  backendUrl: string;
  frontendUrl: string;
  githubUrl: string;
  images: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Computed fields for UI
  uptimePercentage?: number;
  url?: string;
}

interface ApplicationCardProps {
  application: Application;
  onDelete: (app: Application) => void;
  refetchAfterPing?: () => void;
}

export function ApplicationCard({
  application,
  refetchAfterPing,
}: ApplicationCardProps) {
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate uptime percentage
  const uptimePercentage = useMemo(() => {
    const uptime = application.uptime || 0;
    const downtime = application.downtime || 0;
    const total = uptime + downtime;
    if (total === 0) return 100;
    return Math.round((uptime / total) * 100);
  }, [application.uptime, application.downtime]);

  const getStatusBadge = (
    status: string
  ):
    | "outline"
    | "running"
    | "stopped"
    | "warning"
    | "default"
    | "destructive"
    | "secondary"
    | "success"
    | "info"
    | "pending"
    | null
    | undefined => {
    switch (status) {
      case "running":
        return "running";
      case "stopped":
        return "stopped";
      case "maintenance":
        return "warning";
      default:
        return "outline";
    }
  };

  const getUptimeColor = (percentage?: number) => {
    if ((percentage ?? 0) >= 99) return "text-emerald-600";
    if ((percentage ?? 0) >= 95) return "text-amber-600";
    return "text-rose-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-3 h-3 text-emerald-600" />;
      case "stopped":
        return <div className="w-3 h-3 rounded-full bg-rose-500" />;
      case "maintenance":
        return <Clock className="w-3 h-3 text-amber-600" />;
      default:
        return <Monitor className="w-3 h-3 text-gray-400" />;
    }
  };

  const handlePing = async () => {
    if (!application.backendUrl) return;
    setPingLoading(true);
    setPingResult(null);
    try {
      const res = await fetch(`${application.backendUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        setPingResult("Healthy");

        // Update application data with latest health check info
        if (data.success && data.data) {
          const healthData = data.data;
          // Update the application object with new uptime and timestamp
          application.uptime = healthData.uptime || application.uptime;
          application.lastChecked = new Date(
            healthData.timestamp || new Date()
          );

          // Convert uptime to percentage (API returns decimal, multiply by 100)
          const uptime = (application.uptime || 0) * 100;
          const downtime = application.downtime || 0;
          if (uptime > 0) {
            const total = uptime + downtime;
            application.uptimePercentage = Math.round((uptime / total) * 100);
          }
        }

        if (typeof refetchAfterPing === "function") {
          refetchAfterPing();
        }
      } else {
        setPingResult("Unhealthy");
      }
    } catch (e) {
      setPingResult("Unreachable");
    } finally {
      setPingLoading(false);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border-0 bg-gradient-to-br from-white via-white to-gray-50/50">
        <CardHeader className="relative pb-3 border-b border-gray-100/50">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg shadow-lg shadow-blue-500/25">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                  {getStatusIcon(application.status)}
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900 mb-0">
                  {application.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-600"
                  >
                    #{application.appId}
                  </Badge>
                  <Badge
                    variant={getStatusBadge(application.status)}
                    className="px-2 py-0.5 text-xs font-semibold capitalize"
                  >
                    {application.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/applications/${application.appId}`)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                title="View Details"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                disabled={pingLoading}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                title="Ping Application"
              >
                <Zap className="w-3 h-3 mr-1" />
                {pingLoading ? "Pinging..." : "Ping"}
              </Button>

              {pingResult && (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    pingResult === "Healthy"
                      ? "bg-emerald-100 text-emerald-700"
                      : pingResult === "Unhealthy"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {pingResult}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {/* URL and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {application.backendUrl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={application.backendUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium hover:underline transition-colors"
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {application.frontendUrl &&
                isValidUrl(application.frontendUrl) && (
                  <a
                    href={application.frontendUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 font-medium hover:underline transition-colors"
                    style={{ marginLeft: 8 }}
                  >
                    <span>Visit Frontend</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
            </div>
          </div>

          {/* Description */}
          {application.description && (
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">
                {application.description}
              </p>
            </div>
          )}

          {/* Tech Stack */}
          {application.stacks && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {application.stacks
                  .split(",")
                  .slice(0, 3)
                  .map((stack, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50"
                    >
                      {stack.trim()}
                    </Badge>
                  ))}
                {application.stacks.split(",").length > 3 && (
                  <Badge
                    variant="default"
                    className="text-xs px-2 py-1 border-dashed border-gray-300 text-gray-500"
                  >
                    +{application.stacks.split(",").length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  Uptime
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span
                  className={`text-lg font-bold ${getUptimeColor(
                    uptimePercentage
                  )}`}
                >
                  {uptimePercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  Last Check
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {formatDistanceToNow(new Date(application.lastChecked), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Utility function for URL validation
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
