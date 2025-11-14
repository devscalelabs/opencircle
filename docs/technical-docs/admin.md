# Admin App Documentation

## Overview

The Admin App is a React + TypeScript application that provides a comprehensive dashboard for managing the OpenCircle platform. It's built for administrators to manage users, courses, articles, channels, invite codes, and platform settings.

## Technology Stack

- **React 19**: Latest React with concurrent features
- **TypeScript 5.9**: Type-safe JavaScript
- **TanStack Router**: Type-safe file-based routing
- **TanStack Query**: Data fetching, caching, and synchronization
- **Tailwind CSS 4**: Utility-first styling with Vite plugin
- **Jotai**: Atomic state management
- **Vite**: Fast build tool and dev server
- **Radix UI**: Accessible component primitives
- **Biome**: Fast linting and formatting

## Project Structure

```
apps/admin/
├── src/
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   ├── routeTree.gen.ts    # Generated route tree (don't edit)
│   ├── routes/             # File-based routes
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Login page
│   │   └── _dashboardLayout/   # Protected dashboard routes
│   │       ├── dashboard.tsx   # Dashboard home
│   │       ├── users.tsx       # User management
│   │       ├── courses/        # Course management
│   │       ├── articles.*      # Article management
│   │       ├── channels.tsx    # Channel management
│   │       ├── invite-codes/   # Invite code management
│   │       ├── app-settings.tsx # App settings
│   │       ├── broadcast.tsx   # Broadcast messages
│   │       ├── activity.tsx    # Activity monitoring
│   │       └── settings.tsx    # Admin settings
│   ├── features/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── user/          # User management
│   │   ├── course/        # Course management
│   │   ├── section/       # Course sections
│   │   ├── lesson/        # Course lessons
│   │   ├── articles/      # Article management
│   │   ├── channels/      # Channel management
│   │   ├── inviteCode/    # Invite code management
│   │   └── app-settings/  # App settings
│   ├── components/         # Shared components
│   │   ├── dashboardLayout.tsx  # Main layout
│   │   └── sidebar.tsx          # Navigation sidebar
│   └── utils/
│       └── api.ts          # API client configuration
├── public/                 # Static assets
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── Dockerfile             # Production build
```

## Architecture Patterns

### 1. File-Based Routing (TanStack Router)

Routes are defined by the file structure in `src/routes/`:

```
routes/
├── __root.tsx              → Layout wrapper for all routes
├── index.tsx               → /
└── _dashboardLayout/       → Protected layout
    ├── dashboard.tsx       → /dashboard
    ├── users.tsx          → /users
    ├── courses/
    │   ├── index.tsx      → /courses
    │   ├── new.tsx        → /courses/new
    │   └── edit.$id.tsx   → /courses/edit/:id
    └── articles.index.tsx → /articles
```

**Route Conventions**:
- `_dashboardLayout/` - Layout route (wraps children)
- `$id` - Dynamic parameter
- `.` separates nested routes without nesting directories

### 2. Feature-Based Organization

Each feature is self-contained with hooks, components, and types:

```
features/course/
├── index.ts               # Public exports
├── hooks/                 # React Query hooks
│   ├── useCourse.ts      # Fetch single course
│   ├── useCourses.ts     # Fetch course list
│   ├── useCourseSubmission.ts  # Create/update
│   └── useCourseDelete.ts      # Delete course
├── components/            # Feature-specific components
│   ├── courseTable.tsx
│   ├── courseEditor.tsx
│   └── courseContentManager.tsx
└── types/                 # TypeScript types (optional)
    └── course.ts
```

### 3. Custom Hooks Pattern

All data fetching uses TanStack Query through custom hooks:

```typescript
// Fetch list
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getCourses(),
  });
}

// Fetch single item
export function useCourse(id: string) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
  });
}

// Mutation (create/update)
export function useCourseSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => courseService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
```

### 4. Shared Packages

**@opencircle/core**:
- API service clients
- Type-safe HTTP client
- Shared types

**@opencircle/ui**:
- Reusable UI components
- Button, Dialog, Input, etc.
- Consistent design system

## Key Features

### Authentication

**Location**: `features/auth/`

**Features**:
- Admin login with email/password
- JWT token management
- Protected routes
- Account information

**Hooks**:
```typescript
// Login mutation
const { mutate: login, isPending } = useLogin();

// Get current admin account
const { data: account, isLoading } = useAccount();
```

**Route Protection**:
```typescript
// _dashboardLayout.tsx - wraps all protected routes
function RouteComponent() {
  const { isAccountLoading, isAccountError } = useAccount();
  
  if (isAccountLoading || isAccountError) {
    return null; // Redirect to login
  }
  
  return <DashBoardLayout><Outlet /></DashBoardLayout>;
}
```

### User Management

**Location**: `features/user/`

**Features**:
- View all users
- User search and filtering
- View user details
- Update user roles
- Deactivate/activate users

**Components**:
- `userTable.tsx` - Data table with pagination

**Hooks**:
```typescript
const { data: users, isLoading } = useUsers();
```

### Course Management

**Location**: `features/course/`, `features/section/`, `features/lesson/`

**Features**:
- Create and edit courses
- Manage course status (draft/published/archived)
- Section and lesson management
- Course content organization
- Lesson types (video, text, quiz, assignment)

**Components**:
- `courseTable.tsx` - Course list with filters
- `courseEditor.tsx` - Course form
- `courseContentManager.tsx` - Section and lesson management
- `sectionEditor.tsx` - Section form
- `lessonEditor.tsx` - Lesson form with markdown support

**Hooks**:
```typescript
// Courses
const { data: courses } = useCourses();
const { data: course } = useCourse(id);
const { mutate: saveCourse } = useCourseSubmission();
const { mutate: deleteCourse } = useCourseDelete();

// Sections
const { data: sections } = useSections(courseId);
const { data: section } = useSection(id);

// Lessons
const { data: lessons } = useLessons(sectionId);
const { data: lesson } = useLesson(id);
```

**Routes**:
- `/courses` - Course list
- `/courses/new` - Create course
- `/courses/edit/:id` - Edit course
- `/courses/lessons/edit/:lessonId` - Edit lesson

### Article Management

**Location**: `features/articles/`

**Features**:
- Create and publish articles
- Markdown editor with preview
- Cover image upload
- Article slug management
- Draft/published status

**Components**:
- `ArticleList.tsx` - Article table
- `ArticleEditor.tsx` - Markdown editor with preview
- `ArticleView.tsx` - Article preview

**Hooks**:
```typescript
const { data: articles } = useArticles();
const { data: article } = useArticle(id);
const { mutate: saveArticle } = useArticleSubmission();
```

**Routes**:
- `/articles` - Article list
- `/articles/new` - Create article
- `/articles/edit/:id` - Edit article
- `/articles/:id` - Preview article

**Editor Features**:
- Split view (editor + preview)
- Markdown toolbar
- Image upload
- Emoji picker

### Channel Management

**Location**: `features/channels/`

**Features**:
- Create channels
- Set channel visibility (public/private)
- View channel members
- Channel descriptions with emoji

**Components**:
- `channelTable.tsx` - Channel list
- `createChannelDialog.tsx` - Channel creation form

**Hooks**:
```typescript
const { data: channels } = useChannels();
const { mutate: createChannel } = useChannelCreation();
```

### Invite Code Management

**Location**: `features/inviteCode/`

**Features**:
- Generate invite codes
- Set usage limits
- Set expiration dates
- Auto-join channels
- Track usage

**Components**:
- `InviteCodeList.tsx` - Invite code table
- `CreateInviteCode.tsx` - Creation form
- `inviteCodeView.tsx` - Code details

**Hooks**:
```typescript
const { data: inviteCodes } = useInviteCodes();
const { data: inviteCode } = useInviteCode(id);
const { mutate: createCode } = useInviteCodeSubmission();
```

**Routes**:
- `/invite-codes` - Code list
- `/invite-codes/new` - Generate code
- `/invite-codes/edit/:id` - Edit code

### App Settings

**Location**: `features/app-settings/`

**Features**:
- Set app name
- Upload app logo
- Toggle sign-up enabled/disabled
- Platform branding

**Components**:
- `AppSettings.tsx` - Settings form

**Hooks**:
```typescript
const { data: settings } = useAppSettings();
const { mutate: updateSettings } = useAppSettingsMutation();
```

**Route**: `/app-settings`

## Shared Components

### Layout Components

**DashboardLayout** (`components/dashboardLayout.tsx`):
- Main application shell
- Sidebar navigation
- Content area
- Responsive design

**Sidebar** (`components/sidebar.tsx`):
- Navigation menu
- Active route highlighting
- Collapsible on mobile

### UI Components (from @opencircle/ui)

- **Button**: Primary, secondary, ghost variants
- **Dialog**: Modal dialogs
- **Input**: Form inputs with validation
- **Label**: Form labels
- **Avatar**: User avatars
- **Table**: Data tables with sorting

## State Management

### TanStack Query (Server State)

All server data is managed with TanStack Query:

```typescript
// Query configuration in main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

### Jotai (Client State)

Local state is managed with Jotai atoms:

```typescript
import { atom } from "jotai";

// Example: sidebar state
export const sidebarOpenAtom = atom(true);

// In component
const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
```

## API Integration

### API Client Setup

**Location**: `src/utils/api.ts`

```typescript
import ky from "ky";

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
  },
});
```

### Using Services from @opencircle/core

```typescript
import { courseService } from "@opencircle/core";

// In React Query hook
const { data } = useQuery({
  queryKey: ["courses"],
  queryFn: () => courseService.getCourses(),
});
```

## Styling

### Tailwind CSS 4

**Configuration**:
- Vite plugin for instant HMR
- Custom design tokens
- Component-specific utilities

**Common Patterns**:
```tsx
// Layout
<div className="flex flex-col gap-4">

// Card
<div className="rounded-lg border bg-white p-6 shadow-sm">

// Button variants (from @opencircle/ui)
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Delete</Button>
```

### Typography Plugin

```tsx
// Article content
<div className="prose prose-lg max-w-none">
  {content}
</div>
```

## Forms and Validation

### Form Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  mutation.mutate({
    title: formData.get("title"),
    description: formData.get("description"),
  });
};
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateCourse,
  onMutate: async (newCourse) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["courses"] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(["courses"]);
    
    // Optimistically update
    queryClient.setQueryData(["courses"], (old) => [...old, newCourse]);
    
    return { previous };
  },
  onError: (err, newCourse, context) => {
    // Rollback on error
    queryClient.setQueryData(["courses"], context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  },
});
```

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter admin dev

# Build for production
pnpm --filter admin build

# Preview production build
pnpm --filter admin preview
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8000
```

### Dev Server

- **Port**: 4000
- **Hot Module Replacement**: Instant updates
- **TypeScript**: Type checking in IDE

## Building for Production

### Vite Build

```bash
pnpm --filter admin build
```

**Output**: `apps/admin/dist/`

**Build Optimizations**:
- Code splitting
- Tree shaking
- Asset optimization
- Source maps (for debugging)

### Docker Build

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
# Build steps...

FROM nginx:alpine
# Copy dist and nginx config
```

**Production features**:
- Nginx for serving static files
- Gzip compression
- Caching headers
- SPA fallback

## Code Quality

### Linting

```bash
# Lint with Biome
pnpm --filter admin lint

# Auto-fix
pnpm --filter admin lint:fix
```

### Formatting

```bash
# Format with Biome
pnpm --filter admin format
```

### Type Checking

```bash
# TypeScript check
pnpm --filter admin build
```

## Best Practices

### 1. Component Structure

```tsx
// Imports
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Types
interface Props {
  id: string;
}

// Component
export function CourseEditor({ id }: Props) {
  // Hooks
  const { data, isLoading } = useCourse(id);
  const [title, setTitle] = useState("");
  
  // Event handlers
  const handleSubmit = () => {
    // ...
  };
  
  // Early returns
  if (isLoading) return <div>Loading...</div>;
  
  // Render
  return <div>{/* ... */}</div>;
}
```

### 2. Data Fetching

- Use custom hooks for all data fetching
- Enable queries conditionally with `enabled`
- Use proper query keys for cache management
- Handle loading and error states

### 3. Type Safety

```typescript
// Use proper types
interface Course {
  id: string;
  title: string;
  description: string;
}

// Type function parameters
function CourseCard({ course }: { course: Course }) {
  // ...
}
```

### 4. Error Handling

```tsx
const { data, error, isError } = useQuery({
  queryKey: ["courses"],
  queryFn: fetchCourses,
});

if (isError) {
  return <div>Error: {error.message}</div>;
}
```

### 5. Performance

- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize images
- Code split large pages

## Testing

### Test Setup

```bash
# Run tests (when implemented)
pnpm --filter admin test
```

### Recommended Testing Tools

- **Vitest**: Fast unit testing
- **Testing Library**: Component testing
- **Playwright**: E2E testing

## Deployment

### Production Checklist

- [ ] Build passes without errors
- [ ] Environment variables configured
- [ ] API URL points to production
- [ ] Nginx configuration correct
- [ ] HTTPS enabled
- [ ] CORS configured on API

### Docker Deployment

```bash
# Build image
docker build -t opencircle-admin -f apps/admin/Dockerfile .

# Run container
docker run -p 4000:80 opencircle-admin
```
