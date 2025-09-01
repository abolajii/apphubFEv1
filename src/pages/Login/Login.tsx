// import React from "react";

import LoginForm from "./LoginForm";

// Login component interfaces
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

interface LoginProps {
  layout?: "split" | "full";
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  onSubmit?: (data: LoginFormData, errors?: LoginErrors) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showRememberMe?: boolean;
  showSocialLogins?: boolean;
  loading?: boolean;
  className?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
  errors?: LoginErrors;
  showPassword?: boolean;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onRememberMeChange?: (checked: boolean) => void;
  onShowPasswordToggle?: (show: boolean) => void;
}

const Loginv1: React.FC<LoginProps> = ({
  layout = "split",
  imageSrc,
  imageAlt = "Login illustration",
  className = "",
}) => {
  if (layout === "full") {
    return (
      <div
        className={[
          "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8",
          className,
        ].join(" ")}
        // {...props}
      >
        <LoginForm
          redirectLink="https://apphub-seven.vercel.app/dashboard"
          className="border border-gray-300"
          onForgotPassword={() => alert("Forgot password clicked!")}
        />
      </div>
    );
  }

  return (
    <div
      className={["min-h-screen flex", className].join(" ")}

      // {...props}
    >
      {/* Image Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={
            imageSrc ||
            "https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          }
          alt={imageAlt}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to our platform</h2>
          <p className="text-xl opacity-90">
            Join thousands of users who trust us with their business.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <LoginForm
          redirectLink="https://apphub-seven.vercel.app/dashboard"
          className="border border-gray-300"
          onForgotPassword={() => alert("Forgot password clicked!")}
        />
      </div>
    </div>
  );
};

export default Loginv1;
