# Layout Components Usage Guide

This guide shows how to use the reusable layout components in your application.

## Main Components

- **MainLayout**: The main wrapper component with sidebar and header
- **Sidebar**: Navigation sidebar with menu items
- **Header**: Top header with search, notifications, and user profile

## Basic Usage

```tsx
import React from "react";
import { MainLayout } from "../components/layout";

const MyPage: React.FC = () => {
  return (
    <MainLayout title="My Page" currentPath="/my-page">
      <div>
        {/* Your page content goes here */}
        <h1>Welcome to My Page</h1>
        <p>This content will be displayed in the main area.</p>
      </div>
    </MainLayout>
  );
};

export default MyPage;
```

## Props

### MainLayout Props

| Prop          | Type              | Default      | Description                           |
| ------------- | ----------------- | ------------ | ------------------------------------- |
| `children`    | `React.ReactNode` | -            | Content to display in the main area   |
| `title`       | `string`          | "Dashboard"  | Page title shown in header            |
| `currentPath` | `string`          | "/dashboard" | Current path for sidebar highlighting |

## Features

### Responsive Design

- Mobile-first design
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly navigation

### Sidebar Navigation

- Automatic active state highlighting
- Icon + text navigation items
- Badge support for notifications
- User profile section with logout

### Header Features

- Mobile hamburger menu
- Search functionality
- Notification bell with badge
- User profile dropdown

## Customization

### Adding New Navigation Items

Edit the `navigationItems` array in `Sidebar.tsx`:

```tsx
const navigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "users", label: "Users", icon: Users, path: "/users" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  // Add your new items here
  { id: "products", label: "Products", icon: Package, path: "/products" },
];
```

### Styling

The layout uses Tailwind CSS classes. You can customize:

- Colors by changing the color classes
- Spacing by modifying padding/margin classes
- Breakpoints by adjusting responsive prefixes

### Example Pages

See the following example implementations:

- `src/pages/App/add.tsx` - Form page example
- `src/pages/App/UsersPage.tsx` - Data table page example

## Best Practices

1. **Consistent Navigation**: Always pass the correct `currentPath` to highlight the active menu item
2. **Page Titles**: Use descriptive titles that match your navigation
3. **Content Structure**: Organize your page content with proper headings and spacing
4. **Mobile Responsive**: Test your content on different screen sizes
5. **Loading States**: Consider adding loading states for better UX

## Integration with Routing

### React Router Example

```tsx
import { useLocation } from "react-router-dom";

const MyPage: React.FC = () => {
  const location = useLocation();

  return (
    <MainLayout title="My Page" currentPath={location.pathname}>
      {/* Your content */}
    </MainLayout>
  );
};
```

### Next.js Example

```tsx
import { useRouter } from "next/router";

const MyPage: React.FC = () => {
  const router = useRouter();

  return (
    <MainLayout title="My Page" currentPath={router.pathname}>
      {/* Your content */}
    </MainLayout>
  );
};
```
