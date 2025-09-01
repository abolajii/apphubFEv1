import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import type { Application, SystemStats, LogTrendData } from "../services/api";

// Applications hooks
export const useApplications = () => {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await apiClient.getApplications();
      return response.data;
    },
  });
};

export const useApplication = (appId: string | number) => {
  const appIdString = typeof appId === "string" ? appId : appId.toString();
  return useQuery({
    queryKey: ["applications", appIdString],
    queryFn: async () => {
      const response = await apiClient.getApplication(appIdString);
      return response.data;
    },
    enabled: !!appId,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      application: Omit<Application, "id" | "appId" | "createdAt" | "updatedAt">
    ) => apiClient.createApplication(application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useCreateApplicationWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.createApplicationWithImages(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      application,
    }: {
      appId: string;
      application: Partial<Application>;
    }) => apiClient.updateApplication(appId, application),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", variables.appId],
      });
    },
  });
};

export const useUpdateApplicationWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, formData }: { appId: string; formData: FormData }) =>
      apiClient.updateApplicationWithImages(appId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", variables.appId],
      });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string | number) => apiClient.deleteApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

// Application status update hook
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      status,
    }: {
      appId: string | number;
      status: "running" | "stopped" | "maintenance";
    }) => apiClient.updateApplicationStatus(appId, status),
    onSuccess: (_, { appId }) => {
      const appIdString = typeof appId === "string" ? appId : appId.toString();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", appIdString],
      });
    },
  });
};

export const usePingApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string | number) => apiClient.pingApplication(appId),
    onSuccess: (_, appId) => {
      const appIdString = typeof appId === "string" ? appId : appId.toString();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", appIdString],
      });
    },
  });
};

// Logs hooks
export const useLogs = (params?: {
  appId?: string;
  logType?: string;
  search?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ["logs", params],
    queryFn: async () => {
      const response = await apiClient.getLogs(params);
      return response.data;
    },
  });
};

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
};

// System stats hook
export const useSystemStats = () => {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: async (): Promise<SystemStats> => {
      try {
        const response = await apiClient.getSystemStats();
        return response.data;
      } catch (error) {
        console.error("Error fetching system stats:", error);
        return {
          applications: 0,
          logs: 0,
          tasks: 0,
          reviews: 0,
        };
      }
    },
  });
};

// Tasks hooks
export const useTasks = (params?: {
  appId?: string;
  status?: string;
  search?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await apiClient.getTasks(params);
      return response.data; // This will be TasksResponse with data and pagination
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData: {
      appId: string;
      description: string;
      status: "pending" | "inprogress" | "done";
      dateToFinish: string;
      priority?: string;
    }) => apiClient.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

// Reviews hooks
export const useReviews = (params?: {
  appId?: string;
  rating?: string;
  search?: string;
  limit?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: async () => {
      const response = await apiClient.getReviews(params);
      return response.data; // This will be ReviewsResponse with data and pagination
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// Log trends hook
export const useLogTrends = (days: number = 7) => {
  return useQuery({
    queryKey: ["log-analytics", days],
    queryFn: async (): Promise<LogTrendData[]> => {
      try {
        const response = await apiClient.getLogAnalytics(days);
        console.log("Raw API response:", response); // Debug log

        // The data is nested in response.data.data based on the provided response structure
        const analytics = response.data?.data || {};
        console.log("Analytics data:", analytics); // Debug log

        // Process log trends data from analytics - match the API response structure
        const logTrendsData =
          analytics.dailyBreakdown &&
          typeof analytics.dailyBreakdown === "object"
            ? Object.entries(analytics.dailyBreakdown as Record<string, any>)
                .map(([date, data]) => ({
                  day: new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  }),
                  success: data?.success || 0,
                  error: data?.error || 0,
                  warning: data?.warning || 0,
                  info: data?.info || 0,
                  date: date,
                }))
                .slice(-7) // Take last 7 days
            : [];

        console.log("Final result:", logTrendsData); // Debug log
        return logTrendsData;
      } catch (error) {
        console.error("Error fetching log trends:", error);
        // Return empty array if API fails
        return [];
      }
    },
  });
};

// Log analytics hook for dashboard stats
export const useLogAnalytics = (days: number = 7) => {
  return useQuery({
    queryKey: ["log-analytics-stats", days],
    queryFn: async () => {
      try {
        const response = await apiClient.getLogAnalytics(days);
        return response.data?.data || {};
      } catch (error) {
        console.error("Error fetching log analytics:", error);
        return {};
      }
    },
  });
};
