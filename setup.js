const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const projectName = process.argv[2] || "my-vite-app";

log(
  `Setting up Vite + TypeScript + Tailwind CSS project: ${projectName}`,
  "cyan"
);

try {
  // Step 1: Create Vite project with TypeScript template
  log("\nCreating Vite project with TypeScript template...", "yellow");
  execSync(`npm create vite@latest ${projectName} -- --template react-ts`, {
    stdio: "inherit",
  });

  // Change to project directory
  process.chdir(projectName);

  // Step 2: Install dependencies
  log("\nInstalling dependencies...", "yellow");
  execSync("npm install", { stdio: "inherit" });

  // Step 3: Install Tailwind CSS and additional dependencies
  log("\nInstalling Tailwind CSS and additional dependencies...", "yellow");
  execSync("npm install -D tailwindcss postcss autoprefixer @types/node", {
    stdio: "inherit",
  });
  execSync("npm install lucide-react clsx", { stdio: "inherit" });

  // Step 4: Initialize Tailwind CSS
  log("\nInitializing Tailwind CSS...", "yellow");
  execSync("npx tailwindcss init -p", { stdio: "inherit" });

  // Step 5: Configure Tailwind CSS
  log("\nConfiguring Tailwind CSS...", "yellow");

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}`;

  fs.writeFileSync("tailwind.config.js", tailwindConfig);

  // Step 6: Update CSS file
  log("\nSetting up Tailwind CSS styles...", "yellow");

  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
  
  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }
  
  .input {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}`;

  fs.writeFileSync("src/index.css", cssContent);

  // Step 7: Create components directory and add the component library
  log(
    "\nCreating components directory and adding component library...",
    "yellow"
  );

  const componentsDir = "src/components";
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Create the main component library file
  const componentLibrary = `import React, { useState, useEffect } from 'react';

// Modal Component
const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium', closable = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsVisible(false), 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  if (!isVisible) return null;

  return (
    <div className={\`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 \${
      isOpen ? 'opacity-100' : 'opacity-0'
    }\`}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className={\`fixed inset-0 transition-opacity duration-300 \${
            isOpen ? 'opacity-100' : 'opacity-0'
          }\`}
          onClick={closable ? onClose : undefined}
        >
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
        </div>

        <div
          className={\`inline-block w-full \${sizes[size]} p-6 my-8 text-left align-middle transition-all duration-300 transform bg-white shadow-xl rounded-2xl \${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }\`}
        >
          {(title || closable) && (
            <div className="flex items-center justify-between mb-4">
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {closable && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="mb-6">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, variant = 'info', position = 'top-right', duration = 5000, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  if (!isVisible) return null;

  return (
    <div className={\`fixed \${positions[position]} z-50 transition-all duration-300 \${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }\`}>
      <div className={\`max-w-sm w-full \${variants[variant]} shadow-lg rounded-lg pointer-events-auto border\`}>
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Button Component
const Button = ({ children, variant = 'primary', size = 'medium', disabled = false, onClick, type = 'button', className = '', ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 inline-flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300 disabled:bg-blue-300",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300 disabled:bg-gray-300",
    outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-300 disabled:border-blue-300 disabled:text-blue-300",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300 disabled:text-gray-400"
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-xs",
    medium: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-base"
  };

  return (
    <button
      type={type}
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className} \${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }\`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ label, type = 'text', value, onChange, placeholder, error, required, disabled, className = '', ...props }) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={\`w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:border-blue-500 \${className} \${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
        } \${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
        }\`}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
};

// Card Component
const Card = ({ children, title, subtitle, footer, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  return (
    <div className={\`rounded-lg overflow-hidden \${variants[variant]} \${className}\`} {...props}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 'medium', variant = 'primary', className = '', ...props }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    primary: 'text-blue-500',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  return (
    <div className={\`inline-block \${className}\`} {...props}>
      <svg
        className={\`animate-spin \${sizes[size]} \${variants[variant]}\`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export { Modal, Toast, Button, Input, Card, LoadingSpinner };`;

  fs.writeFileSync(`${componentsDir}/ComponentLibrary.tsx`, componentLibrary);

  // Step 8: Create a demo App component
  log("\nCreating demo App component...", "yellow");

  const appContent = `import React, { useState } from 'react';
import { Modal, Toast, Button, Input, Card, LoadingSpinner } from './components/ComponentLibrary';
import './App.css';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vite + TypeScript + Tailwind CSS
          </h1>
          <p className="text-xl text-gray-600">
            Complete setup with component library
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            title="Interactive Components"
            subtitle="Modal, Toast, and more"
            variant="elevated"
            footer={
              <div className="flex space-x-2">
                <Button onClick={() => setShowModal(true)} size="small">
                  Open Modal
                </Button>
                <Button onClick={() => setShowToast(true)} variant="secondary" size="small">
                  Show Toast
                </Button>
              </div>
            }
          >
            <p className="text-gray-600 text-sm">
              Test the interactive components with smooth animations and transitions.
            </p>
          </Card>

          <Card
            title="Form Components"
            subtitle="Inputs with validation"
            variant="elevated"
          >
            <Input
              label="Sample Input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type something..."
              className="mb-4"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !inputValue.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" variant="white" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </Card>

          <Card
            title="Tailwind Features"
            subtitle="Responsive & modern"
            variant="elevated"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">TypeScript Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Tailwind CSS</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Vite Build Tool</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Component Library</span>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title="Setup Complete!"
          variant="elevated"
          className="text-center"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Your Vite + TypeScript + Tailwind CSS project is ready to go!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="small">npm run dev</Button>
              <Button variant="outline" size="small">npm run build</Button>
              <Button variant="outline" size="small">npm run preview</Button>
            </div>
            <p className="text-sm text-gray-500">
              Start developing with hot reload, TypeScript support, and Tailwind CSS utilities.
            </p>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Sample Modal"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-gray-600 mb-4">
          This is a sample modal with smooth animations and backdrop blur.
        </p>
        <Input
          label="Modal Input"
          placeholder="Type something in the modal..."
          onChange={() => {}}
        />
      </Modal>

      <Toast
        message="Action completed successfully!"
        variant="success"
        position="top-right"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}

export default App;`;

  fs.writeFileSync("src/App.tsx", appContent);

  // Final success message
  log("\nSetup completed successfully!", "green");
  log("\nNext steps:", "cyan");
  log(`   cd ${projectName}`, "yellow");
  log("   npm run dev", "yellow");
  log("\nYour app will be available at: http://localhost:3000", "green");
} catch (error) {
  log(`\nError during setup: ${error.message}`, "red");
  process.exit(1);
}
