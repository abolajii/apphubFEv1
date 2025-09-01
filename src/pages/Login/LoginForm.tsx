// import React from 'react'

import { useState } from "react";
import { LoadingSpinner, Button, Checkbox, Input, Alert } from "abolaji-ux-kit";
import { Lock, Mail } from "lucide-react";

interface LoginProps {
  layout?: "split" | "full";
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showRememberMe?: boolean;
  showSocialLogins?: boolean;
  className?: string;
  redirectLink: string;
}

const LoginForm: React.FC<LoginProps> = ({
  title = "Welcome back",
  subtitle = "Please sign in to your account",
  onForgotPassword,
  onSignUp,
  showRememberMe = true,
  showSocialLogins = true,
  className,
  redirectLink,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [showAlert, setShowAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    title?: string;
  } | null>(null);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      // Clear alert when user starts making changes
      if (showAlert) {
        setShowAlert(null);
      }
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      setLoading(false);
      setShowAlert({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields correctly.",
      });
      return;
    }

    setLoading(true);
    setShowAlert(null);

    // Simulate API call
    setTimeout(() => {
      // Simulate random success/failure for demo
      const isSuccess = true; // Change this to test different scenarios

      if (isSuccess) {
        setShowAlert({
          type: "success",
          title: "Login Successful!",
          message: "Welcome back! Redirecting to dashboard...",
        });

        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = redirectLink;
        }, 2000);
      } else {
        setShowAlert({
          type: "error",
          title: "Login Failed",
          message: "Invalid email or password. Please try again.",
        });
      }

      setLoading(false);
    }, 2000);
  };
  const handleSocialLogin = (provider: string) => {
    alert(`${provider} login clicked! Integrate with your OAuth provider.`);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }));
  };

  // Helper function to check if form is ready to submit
  const isFormValid = () => {
    return (
      formData.email.trim() &&
      formData.password.trim() &&
      formData.email.includes("@") &&
      formData.password.length >= 6
    );
  };

  // Helper function to get field validation status
  const getFieldError = (field: string) => {
    return touched[field] ? errors[field] : "";
  };

  // Handle field blur for real-time validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate specific field
    const newErrors = { ...errors };

    if (field === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    if (field === "password") {
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>

      {showAlert && (
        <Alert
          variant={showAlert.type}
          title={showAlert.title}
          dismissible
          onClose={() => setShowAlert(null)}
        >
          {showAlert.message}
        </Alert>
      )}

      {showSocialLogins && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Example */}
      <div className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange("email")}
          onBlur={() => handleBlur("email")}
          icon={Mail}
          error={getFieldError("email")}
          required
          className={className}
          colorTheme="gray"
          helperText="We'll never share your email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          className={className}
          value={formData.password}
          onChange={handleChange("password")}
          onBlur={() => handleBlur("password")}
          icon={Lock}
          showToggle
          error={getFieldError("password")}
          required
          colorTheme="gray"
          helperText="Don't share with anyone"
        />

        <div className="flex items-center justify-between">
          {showRememberMe && (
            <Checkbox
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleCheckboxChange}
              disabled={loading}
            />
          )}
          {onForgotPassword && (
            <button
              type="button"
              onClick={() =>
                onForgotPassword
                  ? onForgotPassword()
                  : alert("Forgot password clicked!")
              }
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={loading}
            >
              Forgot your password?
            </button>
          )}
        </div>

        <div className="mt-5">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !isFormValid()}
            onClick={handleSubmit}
            fullWidth
          >
            <div className="flex justify-center align-center gap-2">
              {loading && <LoadingSpinner size={20} />}
              {loading ? "Signing in..." : "Sign in"}
            </div>
          </Button>

          {/* Form status indicator */}
          {!isFormValid() && (formData.email || formData.password) && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Please fill in all required fields correctly
            </p>
          )}
        </div>

        {onSignUp && (
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() =>
                onSignUp ? onSignUp() : alert("Sign up clicked!")
              }
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
