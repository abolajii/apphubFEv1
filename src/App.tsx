import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout";
import Dashboard from "./pages/Dashboard";
import AddApplicationPage from "./pages/Applications/add";
import ApplicationView from "./pages/Applications/view";
import ApplicationEdit from "./pages/Applications/edit";
import LogsPage from "./pages/Logs/LogsPage";
import TasksPage from "./pages/Tasks/TasksPage";
import AddTask from "./pages/Tasks/AddTask";
import ReviewsPage from "./pages/Reviews/ReviewsPage";
import SystemPage from "./pages/System/SystemPage";
import Login from "./pages/Login/Login";
import All from "./pages/Applications/all";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="applications" element={<All />} />
              <Route path="applications/add" element={<AddApplicationPage />} />
              <Route path="applications/:id" element={<ApplicationView />} />
              <Route
                path="applications/:id/edit"
                element={<ApplicationEdit />}
              />
              <Route path="logs" element={<LogsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/add" element={<AddTask />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="system" element={<SystemPage />} />
            </Route>

            {/* Catch all route - redirects to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
