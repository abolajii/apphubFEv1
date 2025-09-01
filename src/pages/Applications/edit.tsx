import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Monitor,
  Globe,
  Code,
  ImagePlus,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Textarea,
  MultiSelect,
  Toggle,
  FileUpload,
  Alert,
} from "abolaji-ux-kit";
import {
  CleanModal,
  ModalButton,
  ModalFooter,
} from "../../components/ui/CleanModal";
import {
  useApplication,
  useUpdateApplicationWithImages,
  useUpdateApplicationStatus,
} from "../../hooks/useApi";
import { useAlert } from "../../hooks/useAlert";
import { showAlertAndNavigate } from "../../utils/navigation";

interface ApplicationFormData {
  name: string;
  description: string;
  backendUrl: string;
  frontendUrl: string;
  githubUrl: string;
  stacks: string[];
  status: "running" | "stopped" | "maintenance";
  onGoing: boolean;
  newImages: {
    small: File[];
    large: File[];
  };
  existingImages: {
    small: string[];
    large: string[];
  };
}

const TECH_STACK_OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "nextjs", label: "Next.js" },
  { value: "nodejs", label: "Node.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "aws", label: "AWS" },
  { value: "docker", label: "Docker" },
];

export default function ApplicationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alert, showSuccess, showError, clearAlert } = useAlert();
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    description: "",
    backendUrl: "",
    frontendUrl: "",
    githubUrl: "",
    stacks: [],
    status: "running",
    onGoing: true,
    newImages: {
      small: [],
      large: [],
    },
    existingImages: {
      small: [],
      large: [],
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalFormData, setOriginalFormData] =
    useState<ApplicationFormData | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: "start" | "stop" | "maintenance" | null;
    title: string;
    message: string;
  }>({ isOpen: false, action: null, title: "", message: "" });

  // Use React Query hooks
  const { data: application, isLoading } = useApplication(id || "");
  const updateWithImagesMutation = useUpdateApplicationWithImages();
  const updateStatusMutation = useUpdateApplicationStatus();

  // Confirmation modal functions
  const showConfirmation = (action: "start" | "stop" | "maintenance") => {
    const confirmationData = {
      start: {
        title: "Start Application",
        message:
          "Are you sure you want to start this application? This will make it available to users.",
      },
      stop: {
        title: "Stop Application",
        message:
          "Are you sure you want to stop this application? Users will not be able to access it.",
      },
      maintenance: {
        title: "Set Maintenance Mode",
        message:
          "Are you sure you want to put this application in maintenance mode? Users will see a maintenance page.",
      },
    };

    setConfirmationModal({
      isOpen: true,
      action,
      title: confirmationData[action].title,
      message: confirmationData[action].message,
    });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmationModal;
    setConfirmationModal({
      isOpen: false,
      action: null,
      title: "",
      message: "",
    });

    if (!action || !id) return;

    try {
      await updateStatusMutation.mutateAsync({
        appId: id,
        status:
          action === "start"
            ? "running"
            : action === "stop"
            ? "stopped"
            : "maintenance",
      });

      const successMessages = {
        start: "Application started successfully! 🟢",
        stop: "Application stopped successfully! 🔴",
        maintenance: "Application set to maintenance mode! 🟡",
      };

      const statusMap = {
        start: "running" as const,
        stop: "stopped" as const,
        maintenance: "maintenance" as const,
      };

      showSuccess(successMessages[action], "Status Updated");
      setFormData((prev) => ({ ...prev, status: statusMap[action] }));
    } catch (error) {
      showError(`Failed to ${action} application`, "Update Failed");
    }
  };

  // Populate form when application data is loaded
  useEffect(() => {
    if (application) {
      // Extract existing images safely
      let existingSmall: string[] = [];
      let existingLarge: string[] = [];

      if (application.images) {
        if (
          typeof application.images === "object" &&
          application.images !== null
        ) {
          // Handle object format { small: [...], large: [...] }
          existingSmall = (application.images as any).small || [];
          existingLarge = (application.images as any).large || [];
        } else if (typeof application.images === "string") {
          // Handle string format - could be JSON or simple string
          try {
            const parsed = JSON.parse(application.images);
            if (parsed.small) existingSmall = parsed.small;
            if (parsed.large) existingLarge = parsed.large;
          } catch {
            // If it's not JSON, treat as a single image URL
            if (application.images.trim()) {
              existingLarge = [application.images];
            }
          }
        }
      }

      const formDataToSet = {
        name: application.name || "",
        description: application.description || "",
        backendUrl: application.backendUrl || "",
        frontendUrl: application.frontendUrl || "",
        githubUrl: application.githubUrl || "",
        stacks: application.stacks
          ? application.stacks.split(",").map((s: string) => s.trim())
          : [],
        status: application.status || "running",
        onGoing: application.onGoing !== undefined ? application.onGoing : true,
        newImages: {
          small: [],
          large: [],
        },
        existingImages: {
          small: existingSmall,
          large: existingLarge,
        },
      };

      setFormData(formDataToSet);
      setOriginalFormData(formDataToSet); // Store original data for reset
    }
  }, [application]);

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleMultiSelectChange = (values: (string | number)[]) => {
    setFormData((prev) => ({ ...prev, stacks: values as string[] }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, onGoing: checked }));
  };

  const handleSmallImageUpload = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      newImages: {
        ...prev.newImages,
        small: [...prev.newImages.small, file],
      },
    }));
  };

  const handleLargeImageUpload = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      newImages: {
        ...prev.newImages,
        large: [...prev.newImages.large, file],
      },
    }));
  };

  const handleDeleteNewSmallImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: {
        ...prev.newImages,
        small: prev.newImages.small.filter((_, i) => i !== index),
      },
    }));
  };

  const handleDeleteNewLargeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: {
        ...prev.newImages,
        large: prev.newImages.large.filter((_, i) => i !== index),
      },
    }));
  };

  const handleDeleteExistingImage = (
    type: "small" | "large",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: {
        ...prev.existingImages,
        [type]: prev.existingImages[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!id) {
        throw new Error("Application ID is required");
      }

      // Create FormData for handling both text data and images
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("backendUrl", formData.backendUrl);
      formDataToSubmit.append("frontendUrl", formData.frontendUrl);
      formDataToSubmit.append("githubUrl", formData.githubUrl);
      formDataToSubmit.append("stacks", formData.stacks.join(", "));
      formDataToSubmit.append("status", formData.status);
      formDataToSubmit.append("onGoing", formData.onGoing.toString());

      // Add new small images
      formData.newImages.small.forEach((file) => {
        formDataToSubmit.append(`newSmallImages`, file);
      });

      // Add new large images
      formData.newImages.large.forEach((file) => {
        formDataToSubmit.append(`newLargeImages`, file);
      });

      // Add existing images data (to know what to keep/delete)
      formDataToSubmit.append(
        "existingImages",
        JSON.stringify(formData.existingImages)
      );

      // Debug: Log what we're sending
      console.log("📤 Submitting form with:");
      console.log("- New small images:", formData.newImages.small.length);
      console.log("- New large images:", formData.newImages.large.length);
      console.log("- Existing images:", formData.existingImages);

      // Debug: Show FormData contents
      console.log("📋 FormData contents:");
      for (let [key, value] of formDataToSubmit.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Use the React Query mutation for image uploads
      await updateWithImagesMutation.mutateAsync({
        appId: id,
        formData: formDataToSubmit,
      });

      // Show success alert and navigate after delay
      showAlertAndNavigate(
        showSuccess,
        navigate,
        "Application updated successfully! 🎉",
        `/applications/${id}`,
        "Update Successful",
        3000
      );
    } catch (error) {
      console.error("Error updating application:", error);
      showError(
        "Failed to update application. Please check your input and try again.",
        "Update Failed"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalFormData) {
      setFormData({ ...originalFormData });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="running">🟢 Running</Badge>;
      case "stopped":
        return <Badge variant="stopped">🔴 Stopped</Badge>;
      case "maintenance":
        return <Badge variant="warning">🟡 Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/applications/${id}`)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-xl">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Application
                  </h1>
                  <p className="text-sm text-gray-500">
                    Update application details and configuration
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-8">
        <form onSubmit={handleSubmit} className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-visible">
            {/* Main Form */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="p-6 overflow-visible">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📋 Basic Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Core details about your application
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      placeholder="Enter application name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      placeholder="Describe your application"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        🚧 Ongoing Project
                      </label>
                      <p className="text-xs text-gray-500">
                        Mark if this project is still in development
                      </p>
                    </div>
                    <Toggle
                      checked={formData.onGoing}
                      onChange={handleToggleChange}
                    />
                  </div>
                </div>
              </Card>

              {/* URLs & Links */}
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    🌐 URLs & Links
                  </h3>
                  <p className="text-sm text-gray-600">
                    External links and deployment URLs
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔧 Backend URL
                    </label>
                    <Input
                      value={formData.backendUrl}
                      onChange={handleInputChange("backendUrl")}
                      placeholder="https://api.example.com"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎨 Frontend URL
                    </label>
                    <Input
                      value={formData.frontendUrl}
                      onChange={handleInputChange("frontendUrl")}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📂 GitHub Repository
                    </label>
                    <Input
                      value={formData.githubUrl}
                      onChange={handleInputChange("githubUrl")}
                      placeholder="https://github.com/user/repo"
                      type="url"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technology Stack */}
              <Card className="p-6 relative z-20 overflow-visible">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-600" />
                    💻 Technology Stack
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select the technologies used in this project
                  </p>
                </div>

                <div className="space-y-4 relative z-30">
                  <div className="relative z-40">
                    <MultiSelect
                      label="Select Technologies"
                      value={formData.stacks}
                      onChange={(e) => handleMultiSelectChange(e.target.value)}
                      options={TECH_STACK_OPTIONS}
                      placeholder="Choose technologies..."
                    />
                  </div>

                  {formData.stacks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        📦 Selected Technologies ({formData.stacks.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.stacks.map((tech, index) => {
                          const techOption = TECH_STACK_OPTIONS.find(
                            (option) => option.value === tech
                          );
                          return (
                            <Badge
                              key={index}
                              variant="default"
                              className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200"
                            >
                              {techOption?.label || tech}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Application Status Control */}
              <Card className="p-6 relative z-15 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Monitor className="w-4 h-4 text-purple-600" />
                    </div>
                    Status Control
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage application state instantly
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Current Status Display */}
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Current Status
                      </span>
                      {getStatusBadge(formData.status)}
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        formData.status === "running" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 transition-all duration-200 ${
                        formData.status === "running"
                          ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                          : "hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showConfirmation("start");
                      }}
                      disabled={
                        formData.status === "running" ||
                        updateStatusMutation.isPending
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {updateStatusMutation.isPending &&
                        updateStatusMutation.variables?.status === "running" ? (
                          <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        )}
                        <span className="text-xs font-medium">
                          {formData.status === "running" ? "Running" : "Start"}
                        </span>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant={
                        formData.status === "stopped" ? "default" : "outline"
                      }
                      size="sm"
                      className={`flex-1 transition-all duration-200 ${
                        formData.status === "stopped"
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                          : "hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showConfirmation("stop");
                      }}
                      disabled={
                        formData.status === "stopped" ||
                        updateStatusMutation.isPending
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {updateStatusMutation.isPending &&
                        updateStatusMutation.variables?.status === "stopped" ? (
                          <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        )}
                        <span className="text-xs font-medium">
                          {formData.status === "stopped" ? "Stopped" : "Stop"}
                        </span>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant={
                        formData.status === "maintenance"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`flex-1 transition-all duration-200 ${
                        formData.status === "maintenance"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                          : "hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showConfirmation("maintenance");
                      }}
                      disabled={
                        formData.status === "maintenance" ||
                        updateStatusMutation.isPending
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {updateStatusMutation.isPending &&
                        updateStatusMutation.variables?.status ===
                          "maintenance" ? (
                          <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                        )}
                        <span className="text-xs font-medium">Maintenance</span>
                      </div>
                    </Button>
                  </div>

                  {/* Status Info */}
                  <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-xs text-blue-600 flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      Changes apply instantly across all systems
                    </p>
                  </div>
                </div>
              </Card>

              {/* Images */}
              <Card className="p-6 relative z-10">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-purple-600" />
                    🖼️ Application Images
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload screenshots or images of your application
                  </p>
                </div>

                {/* Existing Images */}
                {(formData.existingImages.large.length > 0 ||
                  formData.existingImages.small.length > 0) && (
                  <div className="mb-6 border border-green-300 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      📷 Current Images ({formData.existingImages.large.length}{" "}
                      large, {formData.existingImages.small.length} small)
                    </h4>

                    <div className="space-y-6">
                      {/* Large Images */}
                      {formData.existingImages.large.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            📱 Full-size Images
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.existingImages.large.map(
                              (imageUrl, index) => (
                                <div
                                  key={index}
                                  className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Large screenshot ${index + 1}`}
                                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <button
                                      type="button"
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
                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteExistingImage("large", index);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Small Images */}
                      {formData.existingImages.small.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            🖼️ Thumbnails
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {formData.existingImages.small.map(
                              (imageUrl, index) => (
                                <div
                                  key={index}
                                  className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 w-24 h-24"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Small thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">No Image</text></svg>';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <button
                                      type="button"
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
                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteExistingImage("small", index);
                                    }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload New Images - Small */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      🖼️ Upload Small Images (Thumbnails)
                    </h4>
                    <FileUpload
                      label="Upload Small Images"
                      onChange={(event) => {
                        let files: File[] | undefined;
                        if ("target" in event && event.target.files) {
                          files = Array.from(event.target.files);
                        } else if (Array.isArray(event)) {
                          files = event as File[];
                        }
                        if (files && files.length > 0) {
                          handleSmallImageUpload(files[0]);
                        }
                      }}
                      accept="image/*"
                      multiple
                    />

                    {/* Preview Newly Uploaded Small Images */}
                    {formData.newImages.small.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          📸 New Small Images ({formData.newImages.small.length}
                          )
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {formData.newImages.small.map((file, index) => (
                            <div
                              key={index}
                              className="group relative w-24 h-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Small preview ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedImage(URL.createObjectURL(file));
                                    setIsModalOpen(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-1 transition-all duration-300"
                                >
                                  <ExternalLink className="w-3 h-3 text-gray-700" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteNewSmallImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                {file.name.substring(0, 8)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload New Images - Large */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      📱 Upload Large Images (Full-size)
                    </h4>
                    <FileUpload
                      label="Upload Large Images"
                      onChange={(event) => {
                        let files: File[] | undefined;
                        if ("target" in event && event.target.files) {
                          files = Array.from(event.target.files);
                        } else if (Array.isArray(event)) {
                          files = event as File[];
                        }
                        if (files && files.length > 0) {
                          handleLargeImageUpload(files[0]);
                        }
                      }}
                      accept="image/*"
                      multiple
                    />

                    {/* Preview Newly Uploaded Large Images */}
                    {formData.newImages.large.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          📸 New Large Images ({formData.newImages.large.length}
                          )
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.newImages.large.map((file, index) => (
                            <div
                              key={index}
                              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Large preview ${index + 1}`}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedImage(URL.createObjectURL(file));
                                    setIsModalOpen(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2 transition-all duration-300"
                                >
                                  <ExternalLink className="w-4 h-4 text-gray-700" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteNewLargeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 relative z-10">
                <h4 className="font-semibold text-gray-800 mb-4">
                  ⚡ Quick Actions
                </h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(formData.frontendUrl, "_blank")}
                    disabled={!formData.frontendUrl}
                  >
                    🌐 View Live Site
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(formData.githubUrl, "_blank")}
                    disabled={!formData.githubUrl}
                  >
                    📂 View Repository
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(formData.backendUrl, "_blank")}
                    disabled={!formData.backendUrl}
                  >
                    🔧 View API
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                💡 Changes are automatically saved as draft
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  🔄 Reset Changes
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "⏳ Saving..." : "💾 Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      <CleanModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log("Modal closing");
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

      {/* Confirmation Modal */}
      <CleanModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({
            isOpen: false,
            action: null,
            title: "",
            message: "",
          })
        }
        title={confirmationModal.title}
        size="md"
        footer={
          <ModalFooter>
            <ModalButton
              variant="secondary"
              onClick={() => {
                setConfirmationModal({
                  isOpen: false,
                  action: null,
                  title: "",
                  message: "",
                });
              }}
            >
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={handleConfirmAction}>
              {confirmationModal.action === "start" && "Start Application"}
              {confirmationModal.action === "stop" && "Stop Application"}
              {confirmationModal.action === "maintenance" && "Set Maintenance"}
            </ModalButton>
          </ModalFooter>
        }
      >
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {confirmationModal.message}
          </p>
        </div>
      </CleanModal>
    </div>
  );
}
