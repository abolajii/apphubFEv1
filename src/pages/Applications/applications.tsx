import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Plus, Trash2 } from "lucide-react";
import { Button, LoadingCard } from "abolaji-ux-kit";
import { useNavigate } from "react-router-dom";
import {
  useApplications,
  useDeleteApplication,
  //   usePingApplication,
} from "../../hooks/useApi";
import { useMemo, useState } from "react";
import {
  CleanModal,
  ModalButton,
  ModalFooter,
} from "../../components/ui/CleanModal";

interface ApplicationsProps {
  searchTerm?: string;
  viewMode?: "grid" | "list";
}

const Applications = ({
  searchTerm = "",
  viewMode = "grid",
}: ApplicationsProps) => {
  const navigate = useNavigate();
  const { data: applications = [], isLoading, error } = useApplications();
  const deleteApplication = useDeleteApplication();
  //   const pingApplication = usePingApplication();

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;

    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [applications, searchTerm]);

  const handleDelete = async (app: any) => {
    setSelectedApp(app);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedApp) return;

    try {
      await deleteApplication.mutateAsync(selectedApp.id);
      setIsDeleteModalOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const handlePing = async () => {
    // This will be called without appId, so we'll need to modify this
    // For now, let's make it a no-op or handle it differently
    console.log("Ping all applications or handle this differently");
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load applications
        </h3>
        <p className="text-gray-500 mb-4">
          There was an error loading your applications. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  return (
    <div>
      {/* Applications Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first application"}
          </p>
          <Button onClick={() => navigate("/applications/add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onDelete={handleDelete}
              refetchAfterPing={handlePing}
            />
          ))}
        </div>
      )}

      {/* Clean Modal Examples */}

      {/* Delete Confirmation Modal */}
      <CleanModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedApp(null);
        }}
        title="Confirm Delete"
        size="md"
        footer={
          <ModalFooter>
            <ModalButton
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedApp(null);
              }}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteApplication.isPending}
            >
              {deleteApplication.isPending ? "Deleting..." : "Delete"}
            </ModalButton>
          </ModalFooter>
        }
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Application
          </h3>
          <p className="text-gray-500 mb-4">
            Are you sure you want to delete "{selectedApp?.name}"? This action
            cannot be undone.
          </p>
        </div>
      </CleanModal>
    </div>
  );
};

export default Applications;
