import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Textarea,
  Select,
  DatePicker,
  Alert,
} from "abolaji-ux-kit";
import {
  ArrowLeft,
  CheckSquare,
  Save,
  X,
  Calendar,
  Clock,
  Target,
  Flag,
  Zap,
} from "lucide-react";
import { useApplications, useCreateTask } from "../../hooks/useApi";
import { useAlert } from "../../hooks/useAlert";
import { showAlertAndNavigate } from "../../utils/navigation";

interface TaskFormData {
  appId: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "inprogress" | "done";
  dateToFinish: string;
}

const AddTask: React.FC = () => {
  const navigate = useNavigate();
  const { data: applications = [], isLoading: applicationsLoading } =
    useApplications();
  const createTaskMutation = useCreateTask();
  const { alert, showSuccess, showError, clearAlert } = useAlert();

  const [formData, setFormData] = useState<TaskFormData>({
    appId: "",
    description: "",
    priority: "medium",
    status: "pending",
    dateToFinish: "",
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Priority options with beautiful styling
  const priorityOptions = [
    {
      value: "low",
      label: "🟢 Low Priority",
      description: "Nice to have, no rush",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      value: "medium",
      label: "🟡 Medium Priority",
      description: "Important, should be done soon",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      value: "high",
      label: "🟠 High Priority",
      description: "Important, needs attention",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      value: "urgent",
      label: "🔴 Urgent",
      description: "Critical, needs immediate action",
      color: "bg-red-100 text-red-800 border-red-200",
    },
  ];

  const statusOptions = [
    {
      value: "pending",
      label: "⏳ Pending",
      description: "Task is waiting to be started",
      icon: Clock,
    },
    {
      value: "inprogress",
      label: "🚀 In Progress",
      description: "Task is currently being worked on",
      icon: Zap,
    },
    {
      value: "done",
      label: "✅ Done",
      description: "Task has been completed",
      icon: CheckSquare,
    },
  ];

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear alert when user starts making changes
    if (alert) {
      clearAlert();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.appId) {
      newErrors.appId = "Please select an application";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required";
    }
    if (!formData.dateToFinish) {
      newErrors.dateToFinish = "Deadline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTaskMutation.mutateAsync({
        appId: formData.appId,
        description: formData.description.trim(),
        status: formData.status,
        dateToFinish: formData.dateToFinish,
        priority: formData.priority,
      });

      // Show success alert and navigate after 3 seconds
      showAlertAndNavigate(
        showSuccess,
        navigate,
        `Task "${formData.description.trim()}" has been created successfully!`,
        "/tasks",
        "Task Created",
        3000
      );
    } catch (error) {
      console.error("Failed to create task:", error);
      showError(
        "Failed to create task. Please check your input and try again.",
        "Creation Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/tasks");
  };

  const selectedApplication = applications.find(
    (app) => app.appId?.toString() === formData.appId
  );
  const selectedPriority = priorityOptions.find(
    (p) => p.value === formData.priority
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-999">
        <div className="">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Create New Task
                  </h1>
                  <p className="text-sm text-gray-500">
                    Assign a task to an application
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || applicationsLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:px-6 lg:px-8 py-8">
        <div className="">
          {/* Alert */}
          {alert && (
            <div className="mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar - Priority and Status */}
              <div className="space-y-6">
                {/* Task Preview */}
                {formData.appId && formData.description && (
                  <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        👁️ Preview
                      </h3>
                      <p className="text-sm text-gray-600">
                        How your task will appear
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">App:</span>
                        <div className="text-gray-600 mt-1">
                          {selectedApplication?.name || "Not selected"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Task:</span>
                        <div className="text-gray-600 mt-1 line-clamp-3">
                          {formData.description || "No description"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Priority:
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              selectedPriority?.color ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {selectedPriority?.label || "Medium"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Deadline:
                        </span>
                        <div className="text-gray-600 mt-1">
                          {formData.dateToFinish || "No deadline set"}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Priority Selection */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-orange-500/10">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-orange-600" />
                      🚩 Priority Level
                    </h3>
                    <p className="text-sm text-gray-600">
                      How urgent is this task?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("priority", option.value)
                        }
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.priority === option.value
                            ? option.color + " border-current"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Status Selection */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-green-500/10">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />⚡ Initial
                      Status
                    </h3>
                    <p className="text-sm text-gray-600">
                      What's the starting status?
                    </p>
                  </div>

                  <div className="space-y-3">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleInputChange("status", option.value)
                          }
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                            formData.status === option.value
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-sm">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {option.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Application Selection */}
                <Card
                  className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 relative z-[100] overflow-visible"
                  style={{ zIndex: 100 }}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      🎯 Target Application
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select which application this task belongs to
                    </p>
                  </div>

                  <div
                    className="space-y-4 relative z-[9999]"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="relative z-[9999]" style={{ zIndex: 9999 }}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application *
                      </label>
                      <div
                        className="relative z-[9999]"
                        style={{ zIndex: 9999 }}
                      >
                        <Select
                          value={formData.appId}
                          onChange={(e) =>
                            handleInputChange("appId", String(e.target.value))
                          }
                          placeholder="Choose an application..."
                          error={errors.appId}
                          options={applications.map((app) => ({
                            value: app.appId?.toString() || "",
                            label: `${app.name} (${app.appId})`,
                          }))}
                          className="relative z-[9999]"
                          style={{ zIndex: 9999 }}
                        />
                      </div>
                    </div>

                    {/* Selected Application Preview */}
                    {selectedApplication && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {selectedApplication.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ID: {selectedApplication.appId} • Status:{" "}
                              <span
                                className={`font-medium ${
                                  selectedApplication.status === "running"
                                    ? "text-green-600"
                                    : selectedApplication.status === "stopped"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {selectedApplication.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Task Details */}
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl shadow-purple-500/10 relative z-[1]">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                      📋 Task Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Describe what needs to be done
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Description *
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe what needs to be done..."
                        rows={4}
                        error={errors.description}
                        className="resize-none w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md shadow-sm p-2"
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        Be specific about the requirements and expected outcome
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline *
                      </label>
                      <div className="relative">
                        <DatePicker
                          value={formData.dateToFinish}
                          onChange={(e) =>
                            handleInputChange("dateToFinish", e.target.value)
                          }
                          placeholder="Select deadline..."
                          error={errors.dateToFinish}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
