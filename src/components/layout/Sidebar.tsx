import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Monitor,
  FileText,
  CheckSquare,
  Star,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import {
  useApplications,
  useSystemStats,
  useLogAnalytics,
  useTasks,
  useReviews,
} from "../../hooks/useApi";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Overview & Analytics",
    countKey: null,
  },
  {
    name: "Applications",
    href: "/applications",
    icon: Monitor,
    description: "Manage Apps",
    countKey: "applications",
  },
  {
    name: "Logs",
    href: "/logs",
    icon: FileText,
    description: "View Logs",
    countKey: "logs",
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    description: "Track Tasks",
    countKey: "tasks",
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: Star,
    description: "App Reviews",
    countKey: "reviews",
  },
  {
    name: "System",
    href: "/system",
    icon: Settings,
    description: "Admin Tools",
    countKey: null,
  },
];

// Add prop types
interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  // Fetch data for counts
  const { data: applications } = useApplications();
  const { data: systemStats } = useSystemStats();
  const { data: logAnalytics } = useLogAnalytics(7);
  const { data: tasksData } = useTasks({ limit: 1 });
  const { data: reviewsData } = useReviews({ limit: 1 });

  // Safely extract data with fallbacks
  const counts = systemStats || {
    applications: 0,
    logs: 0,
    tasks: 0,
    reviews: 0,
  };
  const applicationsArray = applications || [];
  const analytics = logAnalytics || {};

  // Helper function to get count for navigation items
  const getNavItemCount = (countKey: string | null): number | null => {
    if (!countKey) return null;
    switch (countKey) {
      case "applications":
        return applicationsArray.length || counts.applications || 0;
      case "logs":
        return analytics.totalLogs || counts.logs || 0;
      case "tasks":
        return tasksData?.pagination?.total || counts.tasks || 0;
      case "reviews":
        return reviewsData?.pagination?.total || counts.reviews || 0;
      default:
        return counts[countKey as keyof typeof counts] || 0;
    }
  };

  // Helper function to format count display
  const formatCount = (count: number | null | undefined): string | null => {
    if (count === null || count === undefined) return null;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  // Calculate real quick stats with safe fallbacks
  const runningApps = applicationsArray.filter(
    (app: any) => app?.status === "running"
  ).length;
  const totalApps = applicationsArray.length;

  // Safe error rate extraction
  let errorRate = "0%";
  if (analytics.errorRate) {
    errorRate = analytics.errorRate;
  } else if (analytics.logTypes) {
    const total = analytics.totalLogs || 0;
    const errors = analytics.logTypes.error || 0;
    errorRate = total > 0 ? ((errors / total) * 100).toFixed(1) + "%" : "0%";
  }

  // Safe uptime calculation
  let avgUptime = "0%";
  if (applicationsArray.length > 0) {
    const validUptimes = applicationsArray
      .map((app: any) => parseFloat(app?.uptime || 0))
      .filter((uptime: number) => !isNaN(uptime));

    if (validUptimes.length > 0) {
      avgUptime =
        (
          validUptimes.reduce(
            (sum: number, uptime: number) => sum + uptime,
            0
          ) / validUptimes.length
        ).toFixed(1) + "%";
    }
  }

  const quickStats = [
    {
      name: "Active Apps",
      value: `${runningApps}/${totalApps}`,
      icon: Activity,
      color: runningApps > 0 ? "text-green-600" : "text-gray-400",
    },
    {
      name: "Error Rate",
      value: errorRate,
      icon: AlertCircle,
      color:
        parseFloat(errorRate) > 5
          ? "text-red-600"
          : parseFloat(errorRate) > 2
          ? "text-yellow-600"
          : "text-green-600",
    },
    {
      name: "Uptime",
      value: avgUptime,
      icon: TrendingUp,
      color:
        parseFloat(avgUptime) > 95
          ? "text-green-600"
          : parseFloat(avgUptime) > 90
          ? "text-yellow-600"
          : parseFloat(avgUptime) > 0
          ? "text-red-600"
          : "text-gray-400",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                App Tracker
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const itemCount = getNavItemCount(item.countKey);
              const formattedCount = formatCount(itemCount);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => onClose && onClose()}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {formattedCount && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            isActive
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-200 text-gray-600"
                          )}
                        >
                          {formattedCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-4 py-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm text-gray-600">{stat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              App Tracker v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
