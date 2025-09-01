import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  Badge,
  Select,
  MultiSelect,
  FileUpload,
  Alert,
} from "abolaji-ux-kit";
import { CleanModal } from "../../components/ui/CleanModal";
import {
  Save,
  X,
  Plus,
  ArrowLeft,
  Globe,
  Code,
  ExternalLink,
  ImagePlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateApplicationWithImages } from "../../hooks/useApi";
import { useAlert } from "../../hooks/useAlert";
import { showAlertAndNavigate } from "../../utils/navigation";

interface ApplicationFormData {
  name: string;
  description: string;
  bg: string;
  link: string;
  stacks: string[];
  onGoing: boolean;
  status: "running" | "stopped" | "maintenance";
  backendUrl: string;
  frontendUrl: string;
  githubUrl: string;
  newImages: {
    small: File[];
    large: File[];
  };
}

const AddApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const createApplication = useCreateApplicationWithImages();
  const { alert, showSuccess, showError, clearAlert } = useAlert();

  // Predefined tech stack options
  const techStackOptions = [
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "React", value: "react" },
    { label: "Next.js", value: "nextjs" },
    { label: "Vue.js", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Node.js", value: "nodejs" },
    { label: "Express.js", value: "express" },
    { label: "MongoDB", value: "mongodb" },
    { label: "PostgreSQL", value: "postgresql" },
    { label: "MySQL", value: "mysql" },
    { label: "Redis", value: "redis" },
    { label: "Python", value: "python" },
    { label: "Django", value: "django" },
    { label: "Flask", value: "flask" },
    { label: "Docker", value: "docker" },
    { label: "Kubernetes", value: "kubernetes" },
    { label: "AWS", value: "aws" },
    { label: "Azure", value: "azure" },
    { label: "Google Cloud", value: "gcp" },
    { label: "Vercel", value: "vercel" },
    { label: "Netlify", value: "netlify" },
    { label: "Tailwind CSS", value: "tailwindcss" },
    { label: "Sass", value: "sass" },
    { label: "Webpack", value: "webpack" },
    { label: "Vite", value: "vite" },
    { label: "Java", value: "java" },
    { label: "C#", value: "csharp" },
    { label: "PHP", value: "php" },
    { label: "Go", value: "go" },
    { label: "Rust", value: "rust" },
  ];

  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    description: "",
    bg: "#3B82F6",
    link: "",
    stacks: [],
    onGoing: true,
    status: "stopped",
    backendUrl: "",
    frontendUrl: "",
    githubUrl: "",
    newImages: {
      small: [],
      large: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange =
    (field: keyof ApplicationFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleToggleChange = (field: keyof ApplicationFormData) => () => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange =
    (field: keyof ApplicationFormData) =>
    (event: { target: { value: string | number } }) => {
      setFormData((prev) => ({ ...prev, [field]: String(event.target.value) }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Log all form values to console
    console.log("=== FORM STATE DEBUG ===");
    console.log("Raw Form Data:", formData);
    console.log("Form Fields:");
    console.log("- Name:", formData.name);
    console.log("- Description:", formData.description);
    console.log("- Background Color:", formData.bg);
    console.log("- Demo Link:", formData.link);
    console.log("- Tech Stacks (Array):", formData.stacks);
    console.log("- Ongoing Project:", formData.onGoing);
    console.log("- Status:", formData.status);
    console.log("- Backend URL:", formData.backendUrl);
    console.log("- Frontend URL:", formData.frontendUrl);
    console.log("- GitHub URL:", formData.githubUrl);
    console.log("- Small Images Count:", formData.newImages.small.length);
    console.log("- Large Images Count:", formData.newImages.large.length);
    console.log(
      "- Small Images Details:",
      formData.newImages.small.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }))
    );
    console.log(
      "- Large Images Details:",
      formData.newImages.large.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }))
    );

    try {
      // Create FormData object for multipart form submission
      const formDataToSubmit = new FormData();

      // Add basic application data
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("bg", formData.bg);
      formDataToSubmit.append("link", formData.link);
      formDataToSubmit.append("stacks", formData.stacks.join(","));
      formDataToSubmit.append("onGoing", formData.onGoing.toString());
      formDataToSubmit.append("status", formData.status);
      formDataToSubmit.append("backendUrl", formData.backendUrl);
      formDataToSubmit.append("frontendUrl", formData.frontendUrl);
      formDataToSubmit.append("githubUrl", formData.githubUrl);

      // Add default values for required fields
      formDataToSubmit.append("lastChecked", new Date().toISOString());
      formDataToSubmit.append("uptime", "0");
      formDataToSubmit.append("downtime", "0");
      formDataToSubmit.append("images", ""); // Default empty string

      // Add small images
      formData.newImages.small.forEach((file) => {
        formDataToSubmit.append(`smallImages`, file);
      });

      // Add large images
      formData.newImages.large.forEach((file) => {
        formDataToSubmit.append(`largeImages`, file);
      });

      console.log("=== FORMDATA SUBMISSION DEBUG ===");
      console.log("FormData entries:");
      for (const [key, value] of formDataToSubmit.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `[File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log("========================");

      await createApplication.mutateAsync(formDataToSubmit);

      // Show success alert and navigate after 3 seconds
      showAlertAndNavigate(
        showSuccess,
        navigate,
        `Application "${formData.name}" has been created successfully!`,
        "/applications",
        "Application Created",
        3000
      );
    } catch (error) {
      console.error("Failed to create application:", error);
      showError(
        "Failed to create application. Please check your input and try again.",
        "Creation Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stacksList = formData.stacks;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl space-y-6">
        {/* Removed mx-auto for left alignment */}
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/applications")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <span>Add New Application</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new application in your system
              </p>
            </div>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-visible">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="overflow-visible">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Application Name"
                      placeholder="Enter application name"
                      value={formData.name}
                      onChange={handleChange("name")}
                      required
                    />
                    <Select
                      label="Status"
                      placeholder="Select status"
                      options={[
                        { label: "Running", value: "running" },
                        { label: "Stopped", value: "stopped" },
                        { label: "Maintenance", value: "maintenance" },
                      ]}
                      value={formData.status}
                      onChange={handleSelectChange("status")}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your application..."
                        value={formData.description}
                        onChange={handleChange("description")}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* URLs and Links */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>URLs & Links</span>
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Backend URL"
                      placeholder="https://api.example.com"
                      value={formData.backendUrl}
                      onChange={handleChange("backendUrl")}
                      type="url"
                    />
                    <Input
                      label="Frontend URL"
                      placeholder="https://app.example.com"
                      value={formData.frontendUrl}
                      onChange={handleChange("frontendUrl")}
                      type="url"
                    />
                    <Input
                      label="GitHub URL"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubUrl}
                      onChange={handleChange("githubUrl")}
                      type="url"
                    />
                    <Input
                      label="Demo/Live Link"
                      placeholder="https://demo.example.com"
                      value={formData.link}
                      onChange={handleChange("link")}
                      type="url"
                    />
                  </div>
                </div>
              </Card>

              {/* Technical Details */}
              <Card className="overflow-visible">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Technical Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tech Stack
                      </label>
                      <MultiSelect
                        options={techStackOptions}
                        value={formData.stacks}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            stacks: e.target.value.map(String),
                          }))
                        }
                        placeholder="Select tech stack"
                        className="w-full"
                      />
                      {stacksList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {stacksList.map((stack: string, index: number) => (
                            <Badge
                              key={index}
                              variant="default"
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700"
                            >
                              {techStackOptions.find(
                                (opt) => opt.value === stack
                              )?.label || stack}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Input
                      label="Background Color"
                      type="color"
                      value={formData.bg}
                      onChange={handleChange("bg")}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImagePlus className="w-5 h-5 text-purple-600" />
                        🖼️ Application Images
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload screenshots or images of your application
                      </p>

                      {/* Upload Small Images */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-800 mb-3">
                            🖼️ Upload Small Images (Thumbnails)
                          </h5>
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

                          {/* Preview Small Images */}
                          {formData.newImages.small.length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-sm font-medium text-gray-700 mb-3">
                                📸 Small Images (
                                {formData.newImages.small.length})
                              </h6>
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
                                          setSelectedImage(
                                            URL.createObjectURL(file)
                                          );
                                          setIsModalOpen(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-1 transition-all duration-300"
                                      >
                                        <ExternalLink className="w-3 h-3 text-gray-700" />
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteNewSmallImage(index)
                                      }
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

                        {/* Upload Large Images */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-800 mb-3">
                            📱 Upload Large Images (Full-size)
                          </h5>
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

                          {/* Preview Large Images */}
                          {formData.newImages.large.length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-sm font-medium text-gray-700 mb-3">
                                📸 Large Images (
                                {formData.newImages.large.length})
                              </h6>
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
                                          setSelectedImage(
                                            URL.createObjectURL(file)
                                          );
                                          setIsModalOpen(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2 transition-all duration-300"
                                      >
                                        <ExternalLink className="w-4 h-4 text-gray-700" />
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteNewLargeImage(index)
                                      }
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
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview Section */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📋 Preview
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <div className="text-gray-600 mt-1">
                        {formData.name || (
                          <em className="text-gray-400">Not set</em>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Description:
                      </span>
                      <div className="text-gray-600 mt-1">
                        {formData.description ? (
                          <div className="max-h-20 overflow-y-auto">
                            {formData.description}
                          </div>
                        ) : (
                          <em className="text-gray-400">Not set</em>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="mt-1">
                        <Badge
                          variant={
                            formData.status === "running"
                              ? "default"
                              : "secondary"
                          }
                          className={`text-xs ${
                            formData.status === "running"
                              ? "bg-green-100 text-green-700"
                              : formData.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {String(formData.status).charAt(0).toUpperCase() +
                            String(formData.status).slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Background Color:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-200"
                          style={{ backgroundColor: formData.bg }}
                        ></div>
                        <span className="text-gray-600">{formData.bg}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Tech Stack:
                      </span>
                      <div className="mt-1">
                        {formData.stacks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {formData.stacks.slice(0, 3).map((stack, index) => (
                              <Badge
                                key={index}
                                variant="default"
                                className="text-xs bg-blue-100 text-blue-700"
                              >
                                {techStackOptions.find(
                                  (opt) => opt.value === stack
                                )?.label || stack}
                              </Badge>
                            ))}
                            {formData.stacks.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{formData.stacks.length - 3} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <em className="text-gray-400">None selected</em>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">
                        Project Status:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            formData.onGoing ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="text-gray-600">
                          {formData.onGoing
                            ? "Ongoing Development"
                            : "Completed"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">URLs:</span>
                      <div className="mt-1 space-y-1">
                        {formData.backendUrl && (
                          <div className="text-xs">
                            <span className="text-gray-500">Backend:</span>
                            <div className="text-blue-600 truncate">
                              {formData.backendUrl}
                            </div>
                          </div>
                        )}
                        {formData.frontendUrl && (
                          <div className="text-xs">
                            <span className="text-gray-500">Frontend:</span>
                            <div className="text-blue-600 truncate">
                              {formData.frontendUrl}
                            </div>
                          </div>
                        )}
                        {formData.githubUrl && (
                          <div className="text-xs">
                            <span className="text-gray-500">GitHub:</span>
                            <div className="text-blue-600 truncate">
                              {formData.githubUrl}
                            </div>
                          </div>
                        )}
                        {formData.link && (
                          <div className="text-xs">
                            <span className="text-gray-500">Demo:</span>
                            <div className="text-blue-600 truncate">
                              {formData.link}
                            </div>
                          </div>
                        )}
                        {!formData.backendUrl &&
                          !formData.frontendUrl &&
                          !formData.githubUrl &&
                          !formData.link && (
                            <em className="text-gray-400">No URLs set</em>
                          )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Images:</span>
                      <div className="text-gray-600 mt-1">
                        {formData.newImages.small.length > 0 ||
                        formData.newImages.large.length > 0 ? (
                          <span>
                            {formData.newImages.small.length > 0 && (
                              <>
                                {formData.newImages.small.length} small
                                {formData.newImages.large.length > 0 && ", "}
                              </>
                            )}
                            {formData.newImages.large.length > 0 && (
                              <>{formData.newImages.large.length} large</>
                            )}
                            {" image(s)"}
                          </span>
                        ) : (
                          <div className="text-gray-500 text-xs">
                            <div className="mb-2">
                              <em>
                                Upload small images (thumbnails) or large images
                                (full-size)
                              </em>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span>• Small: For thumbnails and previews</span>
                              <span>• Large: For detailed screenshots</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Status and Settings */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Ongoing Project
                        </label>
                        <p className="text-xs text-gray-500">
                          Is this project still in development?
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleChange("onGoing")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.onGoing ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.onGoing ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card>
                <div className="p-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2"
                      disabled={isSubmitting || !formData.name}
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {isSubmitting ? "Creating..." : "Create Application"}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full flex items-center justify-center space-x-2"
                      onClick={() => navigate("/applications")}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Debug Section - Form State Viewer */}
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔍 Debug: Current Form State
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(
                    {
                      ...formData,
                      smallImages: formData.newImages.small.map((file) => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                      })),
                      largeImages: formData.newImages.large.map((file) => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                      })),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <span className="font-medium text-blue-700">
                    Fields Filled:
                  </span>
                  <div className="text-blue-600">
                    {
                      Object.entries(formData).filter(([key, value]) => {
                        if (key === "images") return value.length > 0;
                        if (key === "stacks") return value.length > 0;
                        if (typeof value === "boolean") return true;
                        return (
                          value !== "" && value !== null && value !== undefined
                        );
                      }).length
                    }{" "}
                    / {Object.keys(formData).length}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <span className="font-medium text-green-700">
                    Tech Stacks:
                  </span>
                  <div className="text-green-600">{formData.stacks.length}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <span className="font-medium text-purple-700">Images:</span>
                  <div className="text-purple-600">
                    {formData.newImages.small.length +
                      formData.newImages.large.length}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <span className="font-medium text-orange-700">Status:</span>
                  <div className="text-orange-600 capitalize">
                    {String(formData.status)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </form>
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
    </div>
  );
};

export default AddApplicationPage;
