const API_BASE = "https://apphub-seven.vercel.app/api/v1";

export interface Application {
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
}

export interface Log {
  id: number;
  logType: "success" | "error" | "warning" | "info";
  message: string;
  appName: string;
  appId: string;
  method: string;
  endpoint?: string;
  responseTime?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  updatedAt?: string;
  additionalData?: Record<string, any>;
}

export interface Task {
  id: number;
  appId: string;
  description: string;
  status: "pending" | "inprogress" | "done";
  dateToFinish: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  appId: string;
  appName: string;
  rating: number;
  reviewer: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogsResponse {
  message: string;
  data: Log[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    total: number;
    success: number;
    error: number;
    warning: number;
    info: number;
  };
}

export interface TasksResponse {
  message: string;
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    total: number;
    pending: number;
    inprogress: number;
    done: number;
  };
}

export interface ReviewsResponse {
  message: string;
  data: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  ratingStats: {
    distribution: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
    summary: {
      totalReviews: number;
      averageRating: number;
      fiveStarReviews: number;
      lowRatings: number;
    };
  };
}

export interface SystemStats {
  applications: number;
  logs: number;
  tasks: number;
  reviews: number;
}

export interface LogTrendData {
  day: string;
  success: number;
  error: number;
  warning: number;
  info: number;
  date: string;
}

export interface LogTrendsResponse {
  message: string;
  data: {
    summary: {
      totalLogs: number;
      dateRange: {
        startDate: string;
        endDate: string;
        days: number;
      };
      logTypeDistribution: {
        success: { count: number; avgResponseTime: number };
        error: { count: number; avgResponseTime: number };
        info: { count: number; avgResponseTime: number };
        warning: { count: number; avgResponseTime: number };
      };
      averageLogsPerDay: number;
    };
    dailyTrends: Array<{
      date: string;
      log_type: string;
      count: number;
      avg_response_time: string;
      max_response_time: number;
      min_response_time: number;
    }>;
    errorRateTrend: Array<{
      date: string;
      error_count: string;
      total_count: number;
      error_rate: string;
    }>;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch("https://apphub-seven.vercel.app/health");
    return response.json();
  }

  // Applications
  async getApplications(): Promise<ApiResponse<Application[]>> {
    return this.request<Application[]>("/application");
  }

  async getApplication(appId: string): Promise<ApiResponse<Application>> {
    return this.request<Application>(`/application/${appId}`);
  }

  async createApplication(
    application: Omit<Application, "id" | "appId" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Application>> {
    return this.request<Application>("/application", {
      method: "POST",
      body: JSON.stringify(application),
    });
  }

  async createApplicationWithImages(
    formData: FormData
  ): Promise<ApiResponse<Application>> {
    const url = `${this.baseUrl}/application`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData, // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for /application:`, error);
      throw error;
    }
  }

  async updateApplication(
    appId: string,
    application: Partial<Application>
  ): Promise<ApiResponse<Application>> {
    return this.request<Application>(`/application/${appId}`, {
      method: "PUT",
      body: JSON.stringify(application),
    });
  }

  async updateApplicationWithImages(
    appId: string,
    formData: FormData
  ): Promise<ApiResponse<Application>> {
    const url = `${this.baseUrl}/application/${appId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        body: formData, // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for /application/${appId}:`, error);
      throw error;
    }
  }

  async deleteApplication(appId: string | number): Promise<ApiResponse<void>> {
    return this.request<void>(`/application/${appId}`, {
      method: "DELETE",
    });
  }

  async pingApplication(appId: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/application/${appId}/ping`, {
      method: "POST",
    });
  }

  // Application status updates
  async updateApplicationStatus(
    appId: string | number,
    status: "running" | "stopped" | "maintenance"
  ): Promise<ApiResponse<void>> {
    const appIdString = typeof appId === "string" ? appId : appId.toString();
    return this.request<void>(`/application/${appIdString}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Logs
  async getLogs(params?: {
    appId?: string;
    logType?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<LogsResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.appId) searchParams.append("appId", params.appId);
    if (params?.logType) searchParams.append("logType", params.logType);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/log${queryString ? `?${queryString}` : ""}`;

    return this.request<LogsResponse>(endpoint);
  }

  // Delete log by ID
  async deleteLog(logId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/log/${logId}`, {
      method: "DELETE",
    });
  }

  // Delete multiple logs by IDs
  async deleteBulkLogs(logIds: string[]): Promise<ApiResponse<void>> {
    return this.request<void>(`/log/bulk`, {
      method: "DELETE",
      body: JSON.stringify({ ids: logIds }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Delete all logs
  async deleteAllLogs(): Promise<ApiResponse<void>> {
    return this.request<void>(`/log/all`, {
      method: "DELETE",
    });
  }

  // Tasks
  async getTasks(params?: {
    appId?: string;
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<TasksResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.appId) searchParams.append("appId", params.appId);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/task${queryString ? `?${queryString}` : ""}`;

    return this.request<TasksResponse>(endpoint);
  }

  async createTask(taskData: {
    appId: string;
    description: string;
    status: "pending" | "inprogress" | "done";
    dateToFinish: string;
    priority?: string;
  }): Promise<ApiResponse<Task>> {
    return this.request<Task>("/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
  }

  // Reviews
  async getReviews(params?: {
    appId?: string;
    rating?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<ReviewsResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.appId) searchParams.append("appId", params.appId);
    if (params?.rating) searchParams.append("rating", params.rating);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/review${queryString ? `?${queryString}` : ""}`;

    return this.request<ReviewsResponse>(endpoint);
  }

  // System stats
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request<SystemStats>("/system/stats");
  }

  // Log trends
  async getLogTrends(
    days: number = 7
  ): Promise<ApiResponse<LogTrendsResponse>> {
    return this.request<LogTrendsResponse>(`/log/trends?days=${days}`);
  }

  // Log analytics
  async getLogAnalytics(days: number = 7): Promise<ApiResponse<any>> {
    return this.request<any>(`/log/analytics?days=${days}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
