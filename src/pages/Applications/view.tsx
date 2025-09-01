import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Monitor,
  Globe,
  Github,
  ExternalLink,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Edit,
  Calendar,
  Code,
  Trash2,
  FileText,
  CheckCircle,
  Star,
} from "lucide-react";
import { Badge, Button, Card, Alert } from "abolaji-ux-kit";
import {
  CleanModal,
  ModalButton,
  ModalFooter,
} from "../../components/ui/CleanModal";
import { formatDistanceToNow, format } from "date-fns";
import {
  useApplication,
  usePingApplication,
  useDeleteApplication,
} from "../../hooks/useApi";
import { useAlert } from "../../hooks/useAlert";
import { showAlertAndNavigate } from "../../utils/navigation";

// Extend the Application interface for view-specific fields
interface LogItem {
  id: number;
  appId: string;
  appName: string;
  logType: "success" | "error" | "info" | "warning";
  message: string;
  statusCode: number;
  responseTime: number;
  endpoint: string;
  userAgent: string;
  ip: string;
  method: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskItem {
  id: number;
  appId: string;
  description: string;
  status: "pending" | "inprogress" | "done";
  dateToFinish: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewItem {
  id: number;
  appId: string;
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: number;
  appId: string | number;
  name: string;
  description?: string;
  backendUrl: string;
  frontendUrl?: string;
  githubUrl?: string;
  stacks?: string;
  status: string;
  uptime?: number;
  downtime?: number;
  lastChecked: Date;
  createdAt?: Date;
  updatedAt?: Date;
  onGoing?: boolean;
  bg?: string;
  uptimePercentage?: number;
  url?: string;
  images?: {
    small?: string[];
    large?: string[];
  };
  logs?: {
    items: LogItem[];
    total: number;
  };
  tasks?: {
    items: TaskItem[];
    total: number;
  };
  reviews?: {
    items: ReviewItem[];
    total: number;
  };
}

export default function ApplicationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Use React Query hooks for data fetching
  const { data: applicationData, isLoading } = useApplication(id || "");

  console.log(applicationData);
  const pingMutation = usePingApplication();
  const deleteMutation = useDeleteApplication();

  // Transform data and add computed fields
  const application: Application | null = applicationData
    ? {
        ...applicationData,
        appId: applicationData.appId,
        lastChecked: new Date(applicationData.lastChecked || new Date()),
        createdAt: applicationData.createdAt
          ? new Date(applicationData.createdAt)
          : undefined,
        updatedAt: applicationData.updatedAt
          ? new Date(applicationData.updatedAt)
          : undefined,
        uptimePercentage: (() => {
          const uptime = applicationData.uptime || 0;
          const downtime = applicationData.downtime || 0;
          const total = uptime + downtime;
          return total === 0 ? 100 : Math.round((uptime / total) * 100);
        })(),
        images:
          typeof applicationData.images === "string"
            ? undefined
            : (applicationData.images as {
                small?: string[];
                large?: string[];
              }),
      }
    : null;

  const handlePing = async () => {
    if (!application?.appId) return;

    try {
      await pingMutation.mutateAsync(application.appId);
      setPingResult("Healthy");
      showSuccess(
        `Application "${application.name}" is responding correctly!`,
        "Ping Successful"
      );
    } catch (error) {
      console.error("Ping failed:", error);
      setPingResult("Unreachable");
      showError(
        `Application "${application.name}" is not responding. Please check the application status.`,
        "Ping Failed"
      );
    }
  };

  const handleDelete = async () => {
    if (!application?.appId) return;

    try {
      await deleteMutation.mutateAsync(application.appId);

      // Show success alert and navigate after 3 seconds
      showAlertAndNavigate(
        showSuccess,
        navigate,
        `"${application.name}" has been deleted successfully! 🗑️`,
        "/applications",
        "Application Deleted",
        3000
      );
    } catch (error) {
      console.error("Delete failed:", error);
      showError(
        "Failed to delete application. Please try again.",
        "Deletion Failed"
      );
    }

    // Close confirmation modal
    setShowDeleteConfirmation(false);
  };

  const handleDeleteConfirm = () => {
    handleDelete();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };
  const getStatusBadge = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case "stopped":
        return <div className="w-5 h-5 rounded-full bg-rose-500" />;
      case "maintenance":
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUptimeColor = (percentage?: number) => {
    if ((percentage ?? 0) >= 99) return "text-emerald-600";
    if ((percentage ?? 0) >= 95) return "text-amber-600";
    return "text-rose-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Application Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The application you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/applications")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/applications")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl shadow-lg shadow-blue-500/25">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                    {getStatusIcon(application.status)}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {application.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="default"
                      className="px-2 py-0.5 text-xs font-mono"
                    >
                      #{application.appId}
                    </Badge>
                    <Badge
                      variant={getStatusBadge(application.status)}
                      className="px-2 py-0.5 text-xs font-semibold capitalize"
                    >
                      {application.status === "running" && "🟢 "}
                      {application.status === "stopped" && "🔴 "}
                      {application.status === "maintenance" && "🟡 "}
                      {application.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                disabled={pingMutation.isPending}
              >
                <Zap className="w-4 h-4 mr-2" />
                {pingMutation.isPending ? "Pinging..." : "Ping"}
              </Button>

              {pingResult && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
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

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/applications/${application.appId}/edit`)
                }
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={deleteMutation.isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Logs Count */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">📋 Logs</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {application.logs?.total || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Tasks Count */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    ✅ Tasks
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {application.tasks?.total || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Reviews Count */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    ⭐ Reviews
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {application.reviews?.total || 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    📊 Rating
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    {application.reviews && application.reviews.items.length > 0
                      ? (
                          application.reviews.items.reduce(
                            (acc, review) => acc + review.rating,
                            0
                          ) / application.reviews.items.length
                        ).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                <Star className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Success/Error Alert */}
        {alert && (
          <div className="max-w-7xl mb-6">
            <Alert
              variant={alert.type}
              title={alert.title}
              dismissible
              onClose={clearAlert}
            >
              {alert.message}
            </Alert>
          </div>
        )}

        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Info */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📋 Application Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed information about this application
                  </p>
                </div>
                <div className="space-y-4">
                  {application.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        📝 Description
                      </h4>
                      <p className="text-gray-900 leading-relaxed">
                        {application.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        🔧 Backend URL
                      </h4>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={application.backendUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          {application.backendUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {application.frontendUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          🎨 Frontend URL
                        </h4>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a
                            href={application.frontendUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            {application.frontendUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {application.githubUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          📂 GitHub Repository
                        </h4>
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-gray-400" />
                          <a
                            href={application.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 hover:underline flex items-center gap-1 font-medium"
                          >
                            {application.githubUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Tech Stack */}
              {application.stacks && (
                <Card className="p-6 border-0 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Code className="w-5 h-5 text-green-600" />
                      💻 Technology Stack
                    </h3>
                    <p className="text-sm text-gray-600">
                      Technologies and frameworks used in this project
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {application.stacks.split(",").map((stack, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border border-blue-200 font-medium"
                      >
                        {stack.trim()}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Application Images */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    🖼️ Application Screenshots
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visual previews and screenshots of the application
                  </p>
                </div>

                {application.images &&
                (application.images.small?.length ||
                  application.images.large?.length) ? (
                  <div className="space-y-6">
                    {/* Large Images */}
                    {application.images.large &&
                      application.images.large.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            📱 Full-size Images
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {application.images.large.map((imageUrl, index) => (
                              <div
                                key={index}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`${application.name} screenshot ${
                                    index + 1
                                  }`}
                                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        "Large image clicked:",
                                        imageUrl
                                      );
                                      setSelectedImage(imageUrl);
                                      setIsModalOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2 transition-all duration-300"
                                  >
                                    <ExternalLink className="w-4 h-4 text-gray-700" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Small Images */}
                    {application.images.small &&
                      application.images.small.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            🖼️ Thumbnails
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {application.images.small.map((imageUrl, index) => (
                              <div
                                key={index}
                                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 w-24 h-24"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`${application.name} thumbnail ${
                                    index + 1
                                  }`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">No Image</text></svg>';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                  <button
                                    onClick={() => {
                                      console.log(
                                        "Small image clicked:",
                                        imageUrl
                                      );
                                      setSelectedImage(imageUrl);
                                      setIsModalOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-1 transition-all duration-300"
                                  >
                                    <ExternalLink className="w-3 h-3 text-gray-700" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      No screenshots or images available for this application
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      You can add images by editing the application
                    </p>
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-4">
                  ⚡ Quick Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      window.open(application.frontendUrl, "_blank")
                    }
                    disabled={!application.frontendUrl}
                  >
                    🌐 View Live Site
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(application.githubUrl, "_blank")}
                    disabled={!application.githubUrl}
                  >
                    📂 View Repository
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      window.open(application.backendUrl, "_blank")
                    }
                    disabled={!application.backendUrl}
                  >
                    🔧 View API
                  </Button>
                </div>
              </Card>

              {/* Application Logs */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    📋 Application Logs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Recent logs and activity from your application
                  </p>
                </div>

                {application.logs && application.logs.items.length > 0 ? (
                  <div className="space-y-3">
                    {application.logs.items.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full mt-2 ${
                                log.logType === "success"
                                  ? "bg-green-500"
                                  : log.logType === "error"
                                  ? "bg-red-500"
                                  : log.logType === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    log.logType === "success"
                                      ? "bg-green-100 text-green-700"
                                      : log.logType === "error"
                                      ? "bg-red-100 text-red-700"
                                      : log.logType === "warning"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {log.logType.toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {log.statusCode}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {log.method}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {log.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>📍 {log.endpoint}</span>
                                <span>⏱️ {log.responseTime}ms</span>
                                <span>🌐 {log.ip}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(log.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {application.logs.total > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          View All {application.logs.total} Logs
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm">No logs available</p>
                  </div>
                )}
              </Card>

              {/* Application Tasks */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />✅ Tasks
                    & Todos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Project tasks and development milestones
                  </p>
                </div>

                {application.tasks && application.tasks.items.length > 0 ? (
                  <div className="space-y-3">
                    {application.tasks.items.map((task) => (
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
                                  {format(
                                    new Date(task.dateToFinish),
                                    "MMM dd, yyyy"
                                  )}
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
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm">No tasks available</p>
                  </div>
                )}
              </Card>

              {/* Application Reviews */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />⭐ Reviews &
                    Feedback
                  </h3>
                  <p className="text-sm text-gray-600">
                    User reviews and feedback for this application
                  </p>
                </div>

                {application.reviews && application.reviews.items.length > 0 ? (
                  <div className="space-y-4">
                    {application.reviews.items.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.reviewer.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.reviewer}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-2">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {format(new Date(review.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm">
                      No reviews available
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Metrics */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 Performance Metrics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Real-time performance and health metrics
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">
                        ⬆️ Uptime
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span
                        className={`text-2xl font-bold ${getUptimeColor(
                          application.uptimePercentage
                        )}`}
                      >
                        {application.uptimePercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">
                        🕐 Last Check
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {formatDistanceToNow(new Date(application.lastChecked), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="text-sm text-gray-500">
                      📈 Status Details
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <Badge
                        variant={getStatusBadge(application.status)}
                        className="px-2 py-0.5 text-xs font-semibold capitalize"
                      >
                        {application.status === "running" && "🟢 "}
                        {application.status === "stopped" && "🔴 "}
                        {application.status === "maintenance" && "🟡 "}
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-6 border-0 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    📅 Timeline
                  </h3>
                  <p className="text-sm text-gray-600">
                    Important dates and milestones
                  </p>
                </div>
                <div className="space-y-4">
                  {application.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">🎉 Created</p>
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(application.createdAt),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.updatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">🔄 Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(application.updatedAt),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">
                        🩺 Last Health Check
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(application.lastChecked),
                          "MMM dd, yyyy 'at' HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <CleanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
        }}
        title="Image Preview"
        size="lg"
      >
        <div className="flex justify-center items-center p-4">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              onLoad={() =>
                console.log("Image loaded successfully:", selectedImage)
              }
              onError={(e) => {
                console.error("Image failed to load:", selectedImage);
                e.currentTarget.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="16">Image failed to load</text></svg>';
              }}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No image selected</p>
            </div>
          )}
        </div>
      </CleanModal>

      {/* Delete Confirmation Modal */}
      <CleanModal
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        title="🗑️ Delete Application"
        size="md"
        footer={
          <ModalFooter>
            <ModalButton
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Forever"}
            </ModalButton>
          </ModalFooter>
        }
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Are you sure?
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              You are about to permanently delete{" "}
              <span className="font-semibold">"{application?.name}"</span>.
            </p>
            <p className="text-red-700 text-sm mt-2">
              This will remove the application and all its data forever.
            </p>
          </div>
        </div>
      </CleanModal>
    </div>
  );
}
