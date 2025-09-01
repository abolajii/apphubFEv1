// Layout components
export { Layout } from "./MainLayout";
export { Sidebar } from "./Sidebar";
export { Header } from "./Header";

// Types
export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPath?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
}
