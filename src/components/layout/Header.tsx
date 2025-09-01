import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Monitor,
  FileText,
  CheckSquare,
  Star,
  Settings,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button, Input } from "abolaji-ux-kit";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Overview & Analytics",
    countKey: null,
  },
  {
    name: "Applications",
    href: "/applications",
    icon: Monitor,
    description: "Manage Apps",
    countKey: "applications",
  },
  {
    name: "Logs",
    href: "/logs",
    icon: FileText,
    description: "View Logs",
    countKey: "logs",
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    description: "Track Tasks",
    countKey: "tasks",
  },
  {
    name: "Reviews",
    href: "/reviews",
    icon: Star,
    description: "App Reviews",
    countKey: "reviews",
  },
  {
    name: "System",
    href: "/system",
    icon: Settings,
    description: "Admin Tools",
    countKey: null,
  },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 space-x-8">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                App Tracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Search */}
            {/* <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div> */}

            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="primary"
              //   size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Input
                value=""
                onChange={() => {}}
                type="text"
                placeholder="Search..."
                className="pl-10 w-full"
              />
            </div>
            {/* Mobile Navigation Links */}
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
