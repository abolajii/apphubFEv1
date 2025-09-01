import { Button, Card } from "abolaji-ux-kit";
import {
  Monitor,
  FileText,
  CheckSquare,
  Star,
  Activity,
  AlertCircle,
  TrendingUp,
  Plus,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useApplications,
  useSystemStats,
  useLogTrends,
  useLogAnalytics,
  useTasks,
  useReviews,
} from "../hooks/useApi";
import type { Application, SystemStats } from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // Fetch applications
  const { data: applications, isLoading: appsLoading } = useApplications();
  const navigate = useNavigate();

  // Fetch system stats
  const { data: systemStats } = useSystemStats();

  // Fetch log trends
  const { data: logTrendsData, isLoading: logTrendsLoading } = useLogTrends(7);

  // Fetch log analytics for total logs count
  const { data: logAnalytics } = useLogAnalytics(7);

  // Fetch tasks and reviews for actual counts
  const { data: tasksData } = useTasks({ limit: 1 }); // Just need the pagination info
  const { data: reviewsData } = useReviews({ limit: 1 }); // Just need the pagination info

  // Debug logs
  console.log("systemStats:", systemStats);
  console.log("applications:", applications);
  console.log("logTrendsData:", logTrendsData);
  console.log("logAnalytics:", logAnalytics);
  console.log("tasksData:", tasksData);
  console.log("reviewsData:", reviewsData);

  const stats: SystemStats = {
    applications: systemStats?.applications || applications?.length || 0,
    logs: logAnalytics?.totalLogs || systemStats?.logs || 0,
    tasks: tasksData?.pagination?.total || systemStats?.tasks || 0,
    reviews: reviewsData?.pagination?.total || systemStats?.reviews || 0,
  };

  // Calculate application status distribution
  const runningApps =
    applications?.filter((app: Application) => app.status === "running")
      .length || 0;
  const stoppedApps =
    applications?.filter((app: Application) => app.status === "stopped")
      .length || 0;
  const maintenanceApps =
    applications?.filter((app: Application) => app.status === "maintenance")
      .length || 0;
  const totalApps = applications?.length || 0;

  const avgUptime = applications?.length
    ? (
        applications.reduce(
          (sum: number, app: Application) => sum + app.uptime,
          0
        ) / applications.length
      ).toFixed(1)
    : "0";

  const handleNavigateToApplications = () => {
    // window.location.href = "#/applications";

    navigate("/applications/add");
  };

  const statusChartData = [
    { name: "Running", value: runningApps, color: "#10b981" },
    { name: "Stopped", value: stoppedApps, color: "#ef4444" },
    { name: "Maintenance", value: maintenanceApps, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button onClick={handleNavigateToApplications}>
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.applications || 0}
                </p>
                <p className="text-xs text-gray-500">{runningApps} running</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.logs || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">System activities</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.tasks || 0}
                </p>
                <p className="text-xs text-gray-500">Active items</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.reviews || 0}
                </p>
                <p className="text-xs text-gray-500">User feedback</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Trends Chart */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Log Trends (Last 7 Days)
              </h3>
            </div>
            {logTrendsLoading ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logTrendsData && logTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={logTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Success"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="error"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Error"
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="warning"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Warning"
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="info"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Info"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No log data available for the last 7 days</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Application Status
              </h3>
            </div>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No applications found</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Apps</p>
                <p className="text-3xl font-bold text-green-600">
                  {runningApps}
                </p>
                <p className="text-xs text-gray-500">of {totalApps} total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
                <p className="text-3xl font-bold text-blue-600">{avgUptime}%</p>
                <p className="text-xs text-gray-500">across all apps</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Issues</p>
                <p className="text-3xl font-bold text-red-600">{stoppedApps}</p>
                <p className="text-xs text-gray-500">stopped apps</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToApplications}
            >
              <Monitor className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          {appsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app: Application) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        app.status === "running"
                          ? "bg-green-500"
                          : app.status === "stopped"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">
                        {app.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">
                      {app.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.uptime}% uptime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No applications found</p>
              <Button
                onClick={handleNavigateToApplications}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Add your first application
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="#/logs"
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
            >
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">
                View Logs
              </span>
            </a>
            <a
              href="#/tasks"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
            >
              <CheckSquare className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">
                Manage Tasks
              </span>
            </a>
            <a
              href="#/reviews"
              className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200"
            >
              <Star className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">
                Reviews
              </span>
            </a>
            <button
              onClick={handleNavigateToApplications}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Add App</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
