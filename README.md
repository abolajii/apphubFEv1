# 🚀 AppHub - Application Management Platform

> A comprehensive application management platform built with React, TypeScript, and modern web technologies.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-apphub--seven.vercel.app-brightgreen)](https://apphub-seven.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ Features

### 🎯 Core Functionality

- **Application Management**: Create, edit, delete, and monitor applications
- **Task Management**: Assign and track tasks for specific applications
- **Real-time Monitoring**: Health checks and application status monitoring
- **Beautiful Dashboard**: Modern, responsive UI with gradient effects and glass morphism
- **User Authentication**: Secure login and session management

### 🎨 UI/UX Features

- **Modern Design**: Beautiful gradient backgrounds and glass morphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready**: Built with modern design principles
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Alert System**: Comprehensive success/error notifications with delayed navigation

### 🛠️ Technical Features

- **TypeScript**: Full type safety and excellent developer experience
- **React Query**: Advanced data fetching with caching and synchronization
- **Form Validation**: Robust form handling with error states
- **File Upload**: Image upload with preview capabilities
- **Priority System**: Task prioritization (Low, Medium, High, Urgent)
- **Status Tracking**: Application and task status management
- **API Integration**: RESTful API with proper error handling

## 🚀 Live Demo

Check out the live application: **[https://apphub-seven.vercel.app](https://apphub-seven.vercel.app)**

## 📱 Screenshots

### Dashboard

Beautiful, modern dashboard with application overview and quick actions.

### Task Management

Comprehensive task creation and management with application selection and priority settings.

### Application Monitoring

Real-time application monitoring with health checks and status updates.

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Lucide React** - Beautiful icons

### UI Components

- **abolaji-ux-kit** - Custom UI component library
- **Custom Components** - Buttons, Cards, Forms, Modals, Alerts
- **Responsive Design** - Mobile-first approach

### Development Tools

- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **Vite HMR** - Hot module replacement
- **Git** - Version control

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/abolajii/apphubFEv1.git
   cd apphubFEv1
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── login/          # Authentication components
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Applications/   # Application management pages
│   │   ├── add.tsx     # Create application
│   │   ├── edit.tsx    # Edit application
│   │   └── view.tsx    # View application details
│   ├── Tasks/          # Task management pages
│   │   └── AddTask.tsx # Create tasks
│   └── Login/          # Authentication pages
├── services/           # API services and configurations
│   └── api.ts          # API endpoints and methods
├── hooks/              # Custom React hooks
│   ├── useApi.ts       # API data fetching hooks
│   └── useAlert.ts     # Alert management hook
├── utils/              # Utility functions
│   └── navigation.ts   # Navigation helpers
└── types/              # TypeScript type definitions
```

## 🎯 Key Features Breakdown

### Application Management

- Create applications with image uploads
- Edit application details and status
- Delete applications with confirmation
- Monitor application health
- Technology stack tracking

### Task Management

- Create tasks for specific applications
- Priority assignment (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Done)
- Due date management
- Task assignment

### Alert System

- Success notifications for completed actions
- Error alerts for failed operations
- 3-second delayed navigation after alerts
- Consistent alert styling across the app

### Beautiful UI

- Modern gradient backgrounds
- Glass morphism effects
- Smooth hover animations
- Responsive design
- Color-coded priority system
- Professional typography

## 🔧 Configuration

### Environment Variables

The application uses the following API configuration:

- **Production API**: `https://apphub-seven.vercel.app/api/v1`
- **Health Check**: `https://apphub-seven.vercel.app/health`

### Custom Styling

The project uses a custom design system with:

- Gradient backgrounds
- Glass morphism effects
- Custom color palette
- Responsive breakpoints
- Modern shadows and borders

## 📝 API Endpoints

### Applications

- `GET /application` - Get all applications
- `POST /application` - Create new application
- `PUT /application/:id` - Update application
- `DELETE /application/:id` - Delete application
- `POST /application/:id/status` - Update application status

### Tasks

- `POST /tasks` - Create new task
- `GET /tasks` - Get all tasks
- `PUT /tasks/:id` - Update task

### Monitoring

- `GET /health` - Health check endpoint
- `POST /ping/:id` - Ping specific application

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abolaji**

- GitHub: [@abolajii](https://github.com/abolajii)
- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/abolaji-ade-ajayi-063b051b9)

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- UI components from abolaji-ux-kit
- Icons by Lucide React
- Deployed on Vercel

---

<div align="center">
  <strong>Made with ❤️ by Abolaji</strong>
  <br />
  <a href="https://apphub-seven.vercel.app">Live Demo</a> • 
  <a href="#installation">Getting Started</a> • 
  <a href="#contributing">Contributing</a>
</div>
