# Platform App Documentation

## Overview

The Platform App is the user-facing React + TypeScript application for OpenCircle. It provides a social learning experience where users can take courses, engage in discussions, share posts, read articles, and interact with the community.

## Technology Stack

- **React 19**: Latest React with concurrent features
- **TypeScript 5.9**: Type-safe JavaScript
- **TanStack Router**: Type-safe file-based routing
- **TanStack Query**: Data fetching, caching, and synchronization
- **Tailwind CSS 4**: Utility-first styling with Vite plugin
- **Jotai**: Atomic state management
- **Vite**: Fast build tool and dev server
- **Radix UI**: Accessible component primitives
- **Zod**: Runtime type validation
- **Biome**: Fast linting and formatting

## Project Structure

```
apps/platform/
├── src/
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   ├── routeTree.gen.ts    # Generated route tree (don't edit)
│   ├── routes/             # File-based routes
│   │   ├── __root.tsx      # Root layout
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Registration page
│   │   ├── github-callback.tsx  # OAuth callback
│   │   ├── _socialLayout/  # Main app layout
│   │   │   ├── index.tsx   # Home timeline
│   │   │   ├── about.tsx   # About page
│   │   │   ├── $username.tsx   # User profile
│   │   │   ├── edit-profile.tsx # Edit profile
│   │   │   ├── courses/    # Course routes
│   │   │   ├── articles/   # Article routes
│   │   │   ├── posts/      # Post detail routes
│   │   │   └── notifications/  # Notifications
│   │   └── _learningLayout/    # Learning layout
│   │       └── lessons/    # Lesson viewer
│   ├── features/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── user/          # User profiles
│   │   ├── courses/       # Course browsing
│   │   ├── lessons/       # Lesson viewing
│   │   ├── sections/      # Course sections
│   │   ├── enrollment/    # Course enrollment
│   │   ├── articles/      # Article reading
│   │   ├── posts/         # Post creation & viewing
│   │   ├── timeline/      # Social timeline
│   │   ├── channels/      # Channel management
│   │   ├── reactions/     # Reactions
│   │   ├── notifications/ # Notifications
│   │   ├── mention/       # Mention system
│   │   ├── media/         # Media display
│   │   ├── extras/        # URL previews
│   │   └── appSettings/   # App settings
│   ├── components/         # Shared components
│   │   ├── header.tsx
│   │   ├── leftSidebar.tsx
│   │   ├── rightSidebar.tsx
│   │   ├── mobileBottomNav.tsx
│   │   ├── menuItem.tsx
│   │   └── channelItem.tsx
│   └── utils/
│       ├── api.ts          # API client
│       └── common.ts       # Utilities
├── public/                 # Static assets
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── Dockerfile             # Production build
```

## Architecture Patterns

### 1. File-Based Routing (TanStack Router)

Routes follow file structure conventions:

```
routes/
├── __root.tsx              → Root layout
├── login.tsx               → /login
├── register.tsx            → /register
├── _socialLayout/          → Main app (requires auth)
│   ├── index.tsx          → /
│   ├── $username.tsx      → /:username (user profile)
│   ├── courses/
│   │   ├── index.tsx      → /courses
│   │   └── $id.tsx        → /courses/:id
│   └── articles/
│       ├── index.tsx      → /articles
│       └── $id.tsx        → /articles/:id
└── _learningLayout/        → Learning view
    └── lessons/
        └── $id.tsx        → /lessons/:id
```

**Route Features**:
- Automatic code splitting
- Type-safe navigation
- Search params validation with Zod
- Layout nesting

### 2. Feature-Based Organization

Each feature contains hooks, components, and utilities:

```
features/posts/
├── hooks/                  # Data hooks
│   ├── usePost.ts         # Fetch single post
│   ├── usePosts.ts        # Fetch post list
│   ├── usePostSubmission.ts    # Create post
│   ├── usePostDelete.ts        # Delete post
│   ├── useReplySubmission.ts   # Create reply
│   └── usePostMention.ts       # Mention handling
├── components/             # UI components
│   ├── postCard.tsx
│   ├── postCardCompact.tsx
│   ├── postCardReactions.tsx
│   ├── postCommentSummary.tsx
│   ├── postForm.tsx
│   ├── replyForm.tsx
│   └── RepliesList.tsx
└── utils/                  # Feature utilities
    ├── contentParsing.ts   # Parse mentions, links
    ├── contentRendering.tsx # Render with markdown
    └── nameFormatting.ts   # Format usernames
```

### 3. Layout System

**Three Main Layouts**:

1. **Root Layout** (`__root.tsx`): Base layout for all pages
2. **Social Layout** (`_socialLayout.tsx`): Main app with sidebar
3. **Learning Layout** (`_learningLayout.tsx`): Full-screen lesson viewer

**Social Layout Structure**:
```tsx
<div className="flex">
  <LeftSidebar />  {/* Navigation & channels */}
  <main>           {/* Main content */}
    <Header />
    <Outlet />     {/* Page content */}
  </main>
  <RightSidebar /> {/* Notifications & suggestions */}
</div>
```

### 4. Responsive Design

- **Desktop**: Three-column layout (left sidebar, main, right sidebar)
- **Tablet**: Two-column layout (main + one sidebar)
- **Mobile**: Single column with bottom navigation

## Key Features

### Authentication

**Location**: `features/auth/`

**Features**:
- Email/password login
- Email/password registration
- GitHub OAuth
- JWT token management
- Persistent auth state

**Hooks**:
```typescript
// Login
const { mutate: login, isPending } = useLogin();

// Register
const { mutate: register, isPending } = useRegister();

// GitHub OAuth
const { handleGitHubAuth } = useGitHubAuth();

// Get current user
const { data: account, isLoading } = useAccount();
```

**Routes**:
- `/login` - Login page
- `/register` - Registration page
- `/github-callback` - OAuth callback handler

**Auth Flow**:
```typescript
// Login flow
login(credentials, {
  onSuccess: (data) => {
    localStorage.setItem("token", data.token);
    navigate("/");
  },
});

// Protected routes
const { isAccountLoading, isAccountError } = useAccount();
if (isAccountError) navigate("/login");
```

### Social Timeline

**Location**: `features/timeline/`, `features/posts/`

**Features**:
- Infinite scroll feed
- Post creation with markdown
- Mention autocomplete (@username)
- URL preview embeds
- Emoji reactions
- Threaded replies
- Channel filtering

**Components**:
- `postsList.tsx` - Infinite scroll timeline
- `postCard.tsx` - Full post card with reactions
- `postCardCompact.tsx` - Compact version
- `postForm.tsx` - Create/edit post with mention
- `replyForm.tsx` - Reply to posts
- `RepliesList.tsx` - Nested replies

**Hooks**:
```typescript
// Timeline posts
const { data, fetchNextPage, hasNextPage } = usePosts({
  channelId: selectedChannel,
});

// Single post with comments
const { data: post } = usePost(id);

// Create post
const { mutate: createPost } = usePostSubmission();

// Create reply
const { mutate: createReply } = useReplySubmission();

// Delete post
const { mutate: deletePost } = usePostDelete();
```

**Post Features**:
- **Mentions**: `@username` with autocomplete
- **URL Previews**: Automatic link preview generation
- **Markdown**: Rich text formatting
- **Reactions**: Emoji reactions with counts
- **Threading**: Nested comment replies

### Courses & Learning

**Location**: `features/courses/`, `features/lessons/`, `features/sections/`, `features/enrollment/`

**Features**:
- Browse available courses
- Course detail view with syllabus
- Enroll in courses
- Lesson viewer with navigation
- Progress tracking
- Video and text lessons

**Components**:
- `courseList.tsx` - Grid of courses
- `courseSidebar.tsx` - Course navigation
- `EnrollButton.tsx` - Enroll/unenroll
- Lesson viewer (in routes)

**Hooks**:
```typescript
// Browse courses
const { data: courses } = useCourses();

// Course details
const { data: course } = useCourse(id);

// Course sections
const { data: sections } = useSections(courseId);

// Lessons
const { data: lessons } = useLessons(sectionId);
const { data: lesson } = useLesson(id);

// Enrollment
const { data: enrollment } = useCheckEnrollment(courseId);
const { mutate: enroll } = useEnrollCourse();
```

**Routes**:
- `/courses` - Course catalog
- `/courses/:id` - Course detail
- `/lessons/:id` - Lesson viewer (learning layout)

**Lesson Viewer Features**:
- Full-screen distraction-free view
- Previous/Next navigation
- Section navigation sidebar
- Video player (for video lessons)
- Markdown content (for text lessons)

### Articles

**Location**: `features/articles/`

**Features**:
- Browse article list
- Read full articles
- Markdown rendering with syntax highlighting
- Cover images
- Author information

**Components**:
- `articleList.tsx` - Article grid/list
- Article viewer (in routes)

**Hooks**:
```typescript
const { data: articles } = useArticles();
const { data: article } = useArticle(id);
```

**Routes**:
- `/articles` - Article listing
- `/articles/:id` - Article reader

**Article Rendering**:
- Markdown with syntax highlighting
- Typography plugin styling
- GitHub-flavored markdown
- Code block highlighting

### User Profiles

**Location**: `features/user/`

**Features**:
- View user profiles
- User activity tabs (posts, articles)
- Edit own profile
- Avatar upload
- Bio and social links

**Components**:
- `userCard.tsx` - Profile header
- `userTabs.tsx` - Activity tabs

**Hooks**:
```typescript
const { data: user } = useUser(username);
const { mutate: updateProfile } = useEditProfile();
```

**Routes**:
- `/:username` - User profile
- `/edit-profile` - Edit own profile

### Channels

**Location**: `features/channels/`

**Features**:
- Browse channels
- Join/leave channels
- Filter timeline by channel
- Channel descriptions

**Components**:
- `ChannelList.tsx` - Channel list in sidebar

**Hooks**:
```typescript
const { data: channels } = useChannels();
```

**Channel Integration**:
- Posts can be associated with channels
- Timeline can be filtered by channel
- Users auto-join channels via invite codes

### Notifications

**Location**: `features/notifications/`

**Features**:
- Real-time notification count
- Notification list
- Mark as read
- Notification types (mention, reaction, comment)

**Components**:
- `NotificationList.tsx` - Full notification list
- `notificationItem.tsx` - Single notification
- `notificatioNumbers.tsx` - Unread count badge

**Hooks**:
```typescript
const { data: notifications } = useNotifications();
const { mutate: markAsRead } = useMarkNotificationRead();
```

**Routes**:
- `/notifications` - All notifications
- `/notifications/:id` - Single notification (redirects to content)

**Notification Types**:
- **Mention**: When someone mentions you
- **Reaction**: When someone reacts to your post
- **Comment**: When someone replies to your post

### Reactions

**Location**: `features/reactions/`

**Features**:
- Emoji picker
- Add/remove reactions
- Reaction counts
- User reaction tracking

**Hooks**:
```typescript
const { mutate: addReaction } = useReactionSubmission();
const { mutate: removeReaction } = useReactionDeletion();
```

**Usage**:
```tsx
<PostCardReactions
  postId={post.id}
  reactions={post.reactions}
  onReact={addReaction}
/>
```

### Mentions

**Location**: `features/mention/`

**Features**:
- @username mention detection
- Autocomplete dropdown
- Navigate to mentioned user
- Mention highlighting

**Components**:
- `MentionList.tsx` - Autocomplete suggestions

**Hooks**:
```typescript
const { data: users, search } = useMention(query);
```

**Integration**:
- Used in `postForm.tsx` and `replyForm.tsx`
- Parses mentions on submission
- Creates notifications for mentioned users

### Media

**Location**: `features/media/`

**Features**:
- Image display
- Media optimization
- Lazy loading

**Components**:
- `media.tsx` - Image component with fallback

### URL Previews

**Location**: `features/extras/`

**Features**:
- Automatic link detection
- Open Graph metadata extraction
- Preview cards for links

**Components**:
- `UrlPreview.tsx` - Link preview card

**Hooks**:
```typescript
const { data: preview } = useUrlPreview(url);
```

## Shared Components

### Navigation Components

**Header** (`components/header.tsx`):
- App logo and name
- Search bar (future)
- User menu
- Mobile menu toggle

**LeftSidebar** (`components/leftSidebar.tsx`):
- Main navigation menu
- Channel list
- Collapsible on mobile

**RightSidebar** (`components/rightSidebar.tsx`):
- Notification preview
- Suggested users (future)
- Trending topics (future)

**MobileBottomNav** (`components/mobileBottomNav.tsx`):
- Home, Courses, Notifications, Profile
- Fixed bottom navigation for mobile

### Utility Components

**MenuItem** (`components/menuItem.tsx`):
- Navigation link with active state
- Icon + label

**ChannelItem** (`components/channelItem.tsx`):
- Channel link in sidebar
- Unread indicator

## State Management

### TanStack Query (Server State)

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

**Infinite Scroll Pattern**:
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// In component
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loading={isFetchingNextPage}
>
  {data.pages.map((page) =>
    page.posts.map((post) => <PostCard key={post.id} post={post} />)
  )}
</InfiniteScroll>
```

### Jotai (Client State)

**Common Atoms**:
```typescript
// Selected channel filter
export const selectedChannelAtom = atom<string | null>(null);

// Sidebar visibility
export const sidebarOpenAtom = atom(false);

// Theme
export const themeAtom = atom<"light" | "dark">("light");
```

## Content Rendering

### Markdown Rendering

**Library**: `react-markdown` with `rehype-highlight` and `remark-gfm`

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  className="prose prose-sm"
>
  {content}
</ReactMarkdown>
```

**Features**:
- GitHub-flavored markdown
- Syntax highlighting for code
- Tables, task lists, strikethrough
- Auto-linking URLs

### Mention Parsing

**Location**: `features/posts/utils/contentParsing.ts`

```typescript
function parseMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.matchAll(mentionRegex);
  return Array.from(matches, (m) => m[1]);
}
```

### Link Detection

```typescript
function extractUrls(content: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.match(urlRegex) || [];
}
```

## API Integration

### API Client

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
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      },
    ],
  },
});
```

### Using Services

```typescript
import { postService } from "@opencircle/core";

const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: () => postService.getPosts(),
});
```

## Styling

### Tailwind CSS 4

**Common Patterns**:

```tsx
// Layout
<div className="mx-auto max-w-2xl space-y-4 p-4">

// Cards
<div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">

// Responsive Grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// Flex with gap
<div className="flex items-center gap-2">
```

### Dark Mode (Future)

```tsx
// Dark mode classes
<div className="bg-white dark:bg-gray-900">
<p className="text-gray-900 dark:text-gray-100">
```

### Typography

```tsx
// Article content
<div className="prose prose-lg max-w-none dark:prose-invert">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>
```

## Forms and Validation

### Zod Validation

**Search Params**:
```typescript
const searchSchema = z.object({
  channelId: z.string().optional(),
  sort: z.enum(["latest", "popular"]).optional(),
});

// In route
export const Route = createFileRoute("/_socialLayout/")({
  validateSearch: searchSchema,
});
```

### Form Handling

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  mutation.mutate({
    content: formData.get("content") as string,
    channelId: selectedChannel,
  });
};
```

## Performance Optimization

### Code Splitting

- Automatic route-based splitting
- Lazy load heavy components
- Dynamic imports for modals

### Image Optimization

```tsx
<img
  src={user.avatar_url}
  alt={user.name}
  loading="lazy"
  className="h-10 w-10 rounded-full object-cover"
/>
```

### Virtual Scrolling (Future)

For long lists, implement virtual scrolling with `react-virtual`.

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter platform dev

# Build for production
pnpm --filter platform build

# Preview production build
pnpm --filter platform preview
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8000
```

### Dev Server

- **Port**: 3000
- **Hot Module Replacement**: Instant updates
- **TypeScript**: Type checking in IDE

## Building for Production

### Vite Build

```bash
pnpm --filter platform build
```

**Output**: `apps/platform/dist/`

**Optimizations**:
- Code splitting per route
- Tree shaking unused code
- Minification
- Asset hashing for cache busting

### Docker Build

Multi-stage build with Nginx:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter platform build

FROM nginx:alpine
COPY --from=builder /app/apps/platform/dist /usr/share/nginx/html
COPY apps/platform/nginx.conf /etc/nginx/conf.d/default.conf
```

## Code Quality

### Linting

```bash
pnpm --filter platform lint
pnpm --filter platform lint:fix
```

### Formatting

```bash
pnpm --filter platform format
```

### Type Checking

```bash
pnpm --filter platform build
```

## Best Practices

### 1. Component Patterns

```tsx
// Use proper types
interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  // Component logic
}
```

### 2. Custom Hooks

- Extract data fetching to custom hooks
- Reuse hooks across components
- Keep components focused on UI

### 3. Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Outlet />
</ErrorBoundary>
```

### 4. Loading States

```tsx
if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

### 5. Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

## Testing

### Recommended Testing

- **Vitest**: Unit testing
- **Testing Library**: Component testing
- **Playwright**: E2E testing

### Test Examples

```typescript
describe("PostCard", () => {
  it("renders post content", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(mockPost.content)).toBeInTheDocument();
  });
});
```

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] API URL points to production
- [ ] Build passes without errors
- [ ] Assets optimized
- [ ] HTTPS enabled
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (optional)

### Docker Deployment

```bash
# Build image
docker build -t opencircle-platform -f apps/platform/Dockerfile .

# Run container
docker run -p 3000:80 opencircle-platform
```

### Nginx Configuration

```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

## Future Enhancements

- Dark mode toggle
- Real-time updates (WebSockets)
- Advanced search
- Direct messaging
- User following
- Content bookmarking
- Mobile app (React Native)
