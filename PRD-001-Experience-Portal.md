# Product Requirements Document: Frontend Web Portal

**Status:** Draft
**Created:** 2025-02-28
**Author:** Product Team
**Issue Type:** Feature Request

---

## Problem Statement

We need a modern, responsive frontend-only web portal that integrates with an existing backend API and AWS Cognito for authentication. The portal should provide role-based experiences for authenticated users (USER, VENDOR, SUPER_ADMIN) to manage and view Experiences, Activities, and Tickets. Currently, there is no unified frontend interface for users to interact with the backend services. Users need a secure, intuitive dashboard to search, filter, and view detailed information about experiences and activities, as well as a dedicated section for customers to view their ticket bookings.

## Solution

Build a Next.js 13+ (App Router) application using TypeScript, Tailwind CSS, and shadcn/ui components. Implement authentication via AWS Cognito (mobile number + password) with HTTP-only cookies for session management. The app will consume existing REST APIs, enforce protected routes, and display data according to user roles. The backend will handle all authorization logic and return only data the user is permitted to see.

**Key Architecture Decisions:**

- **Framework:** Next.js 13+ with App Router (SSR-capable)
- **Styling:** Tailwind CSS with shadcn/ui component library
- **State Management:** React Query (TanStack Query) for server state
- **Auth:** `amazon-cognito-identity-js` with HTTP-only secure cookies
- **API:** RESTful endpoints at `http://api.invixp.com/api/v1`
- **Roles:** USER, VENDOR, SUPER_ADMIN (no complex frontend RBAC)

## User Stories

### Authentication & Authorization
1. As a registered user, I want to log in using my mobile number and password so that I can securely access the portal.
2. As a logged-in user, I want my session to be automatically refreshed so that I don't get logged out unexpectedly.
3. As a user, I want to be automatically logged out if my session expires or refresh fails so that my account remains secure.
4. As an authenticated user, I want protected routes to redirect me to login if I'm not authenticated so that only authorized users can access the portal.

### Experience List Page
5. As a USER, VENDOR, or SUPER_ADMIN, I want to view a paginated list of all experiences so that I can browse available content.
6. As a user, I want to search experiences by title, description, location, address, or creator so that I can quickly find specific experiences.
7. As a user, I want to filter experiences by status (isDisabled, isPined, isProtected), type (isOnline, experienceFor, controlBy), cost ranges, date ranges, and owner so that I can narrow down results.
8. As an authorized user, I want to see the total count of matching experiences so that I understand the scope of results.
9. As an authorized user, I want to adjust page size and navigate through pages so that I can browse large datasets efficiently.
10. As an authorized user with delete permissions, I want to soft-delete an experience (isDeleted = true) so that it disappears from the list but remains recoverable in the backend.
11. As an authorized user with management permissions, I want to enable or disable an experience so that I can control its availability.

### Experience Detail Page
12. As a user, I want to click on an experience from the list to view its full details so that I can learn more about it.
13. As a user, I want to see all experience metadata including title, description, cost, location, schedule, social links, and streaming information so that I have a complete understanding.
14. As a user, I want to view all tickets associated with an experience so that I can see what ticket types are available.
15. As a user, I want to view all activities linked to an experience so that I can understand the full context and related content.

### Activity List Page
16. As a user, I want to view a paginated list of all activities so that I can browse through them.
17. As a user, I want to search activities (likely by title, description, etc.) so that I can find specific activities.
18. As a user, I want to filter activities by relevant fields so that I can narrow down the list to relevant items.
19. As a user, I want to paginate through activities so that I can handle large volumes of data.

### Activity Detail Page
20. As a user, I want to view full details of an activity so that I can understand its context and content.
21. As a user, I want to see whether an activity is linked to an experience or exists independently so that I understand its relationship.
22. As a user, I want to see the full activity metadata so that I have all relevant information.

### User Bookings Page (Customer-facing)
23. As a customer who has purchased tickets, I want to view a list of all my bookings so that I can manage my purchases.
24. As a customer, I want to search my bookings by experience name, activity, or other relevant fields so that I can locate specific bookings.
25. As a customer, I want to filter my bookings by date, status, or other criteria so that I can organize my view.
26. As a customer, I want to see booking details including tickets, dates, and associated experiences so that I have complete information.
27. As a customer, I want pagination support for my bookings so that I can navigate through lists efficiently.

### Layout & Navigation
28. As a user, I want a consistent dashboard layout with sidebar navigation so that I can easily move between modules.
29. As a user, I want a topbar with profile information and logout so that I can manage my session.
30. As a user, I want responsive design that works on desktop and mobile so that I can use the portal on any device.

## Implementation Decisions

### Modules & Architecture
- **`app/`** - Next.js App Router structure with page.tsx and layout.tsx files
- **`components/`** - Reusable UI components (shadcn/ui + custom)
- **`lib/`** - Utility functions, API clients, authentication helpers, React Query configuration
- **`hooks/`** - Custom React hooks for auth, API calls, and state management
- **`types/`** - TypeScript interfaces and type definitions for all domain models
- **`services/`** - API service layer that encapsulates all backend communication

#### Key Module Breakdown

**Authentication Module (Deep Module)**
- **Interface:** `login(mobileNumber, password): Promise<AuthResponse>`, `logout(): void`, `getCurrentUser(): User | null`, `isAuthenticated(): boolean`
- **Responsibilities:** Cognito authentication, token management, HTTP-only cookie handling, automatic refresh, session validation
- **Why deep:** Encapsulates all auth complexity behind simple functions, rarely changes once implemented

**API Client Module (Deep Module)**
- **Interface:** `apiClient.get<T>(endpoint, config), apiClient.post<T>(endpoint, body), etc.`
- **Responsibilities:** Base URL configuration, automatic auth headers, error handling, retry logic
- **Why deep:** Centralizes all HTTP concerns, consistent error handling, testable

**React Query Integration Module (Deep Module)**
- **Interface:** `useQuery<T>(key, fetcher), useMutation<T>(mutationFn)`
- **Responsibilities:** Configure QueryClient, provide default options, cache management, background refetching
- **Why deep:** Wraps TanStack Query in a project-specific API

**Experience Service Module (Deep Module)**
- **Interface:** `getExperiences(params), getExperience(id), softDeleteExperience(id), toggleExperienceStatus(id, isEnabled)`
- **Responsibilities:** Construct query params, transform API responses, handle experience-specific endpoints
- **Why deep:** Encapsulates all experience-related API logic, including search/filter construction

**Activity Service Module (Deep Module)**
- **Interface:** `getActivities(params), getActivity(id)`
- **Responsibilities:** Similar to Experience service but for activities
- **Why deep:** Isolated responsibilities

**Ticket/Booking Service Module (Deep Module)**
- **Interface:** `getUserBookings(params), getBookingDetails(id)`
- **Responsibilities:** Fetch user-specific ticket/booking data
- **Why deep:** Encapsulates user booking queries

**UI Component Modules**
- **`components/experience/`** - Experience-specific components (ExperienceCard, ExperienceFilters, ExperienceList, ExperienceDetail)
- **`components/activity/`** - Activity-specific components (ActivityCard, ActivityList, ActivityDetail)
- **`components/bookings/`** - Booking components (BookingCard, BookingList, BookingFilters)
- **`components/layout/`** - DashboardLayout, Sidebar, Topbar, ProtectedRoute
- **`components/ui/`** - shadcn/ui components (Button, Input, Select, Table, Pagination, etc.)

**Page Modules (App Router)**
- `app/experiences/page.tsx` - List view with search/filter
- `app/experiences/[id]/page.tsx` - Detail view with tickets & activities
- `app/activities/page.tsx` - Activity list
- `app/activities/[id]/page.tsx` - Activity detail
- `app/bookings/page.tsx` - User bookings list
- `app/bookings/[id]/page.tsx` - Booking detail (optional)
- `app/login/page.tsx` - Login page

**Page Modules:**
- `/experiences`: Shows list of experiences with comprehensive search/filter UI. Uses `useExperiences` query with filter params. Supports pagination controls.
- `/experiences/[id]`: Shows full experience details, embedded tickets list, and related activities list. Implements enable/disable and soft-delete actions (with permissions check).
- `/activities`: Shows list of activities with search/filter/pagination.
- `/activities/[id]`: Shows activity details and its relationship to experience (if any).
- `/bookings`: Shows current user's ticket bookings with search/filter/pagination. Backend filters by authenticated user.

### API Contracts

**Base Configuration:**
```
NEXT_PUBLIC_API_BASE_URL = http://api.invixp.com/api/v1
```

**Authentication:**
- **API expects** Authorization header with Bearer token
- Token obtained via Cognito and stored in HTTP-only cookie by auth middleware
- API routes will read cookie, validate token, and process request

**Experience Endpoints:**
- `GET /experiences?page=1&limit=20&title=...&location=...&isDisabled=false&...` - List with filters
  - Query params: All searchable/filterable fields (title, description, location, address, createdBy, isDisabled, isDeleted, isPined, isProtected, isOnline, experienceFor, controlBy, experienceCost, freeExpCost, experienceStartDateTime, experienceEndDateTime, createdAt, experienceOwnerId, pagination)
- `GET /experiences/:id` - Detail view (includes associated activities, media, tickets)
- `DELETE /experiences/:id` - Soft delete (sets isDeleted = true)
- `PATCH /experiences/:id/status` - Enable/disable (isEnabled toggle)

**Activity Endpoints:**
- `GET /activities?page=1&limit=20&...` - List with filters
- `GET /activities/:id` - Detail view

**Booking Endpoints:**
- `GET /bookings?page=1&limit=20&...` - Current user's bookings (backend filters by authenticated user)
- `GET /bookings/:id` - Booking detail

**Response Formats:**
All list endpoints return paginated responses:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

Detail endpoints return single resource object.

### Authorization Strategy

**Frontend Role Handling:**
- Frontend will NOT implement complex RBAC
- Backend returns only permitted data based on user's Cognito role (USER, VENDOR, SUPER_ADMIN)
- Frontend renders whatever data the API returns
- UI may hide/show buttons (e.g., Delete, Enable/Disable) based on presence of `canDelete` or `canUpdate` flags in the response (if backend provides them) or based on a simple `user.role` check if role-based permissions are straightforward

**Login Permissions:**
- Allowed: USER, VENDOR, SUPER_ADMIN
- Denied: GUEST, SALES_PERSON (Cognito groups or backend auth should enforce this)

### Error Handling Strategy
- **API Errors:** All API errors caught and displayed via toast notifications (shadcn/ui toast). Error messages parsed from response or generic fallback.
- **Network Errors:** Display offline indicator and retry button.
- **Auth Errors:** Token expiration/refresh failures redirect to login page with session expired message.
- **404 on Detail Pages:** Show "Not Found" UI with link back to list.
- **Validation Errors:** Display server-side validation messages near form fields (if any forms in future phases).

### Loading States
- **List Pages:** Show skeleton loaders for initial load; show loading spinner on subsequent pagination/filter changes.
- **Detail Pages:** Show skeleton screens matching the detail layout.
- **Buttons:** Disable buttons during mutations with loading spinners.

### Responsive Design
- Mobile-first approach with Tailwind breakpoints (sm, md, lg, xl).
- Sidebar collapsible to icon-only on smaller screens.
- Tables scroll horizontally on mobile; consider card layout for very small screens if needed.
- Topbar remains consistent across all pages.

### Environment Strategy
```
.env.local                 # Local development (Cognito credentials, API base URL)
.env.staging              # Staging overrides
.env.production           # Production overrides
```

Variables:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_REGION`
- (Optional) `NEXT_PUBLIC_APP_NAME`

## Testing Decisions

**Unit Tests (Jest + React Testing Library):**
- Test all custom hooks (`useAuth`, `useExperiences`, etc.)
- Test utility functions (filter building, date formatting, etc.)
- Test API service layer with mocked fetch
- Test UI components with mocked props and interactions
- **Prior Art:** Standard RTL patterns: `render`, `screen.findByText`, `fireEvent.click`, `waitFor`

**Integration Tests:**
- Test full login flow (mock Cognito)
- Test protected route guards (redirect to login when unauthenticated)
- Test React Query integrations with MSW (Mock Service Worker)

**E2E Tests (Playwright or Cypress):**
- Critical user journeys:
  - Login → Experience List → Search → Detail → Back
  - Activity List → Detail
  - Bookings List → Pagination → Filter
  - Enable/Disable experience
  - Soft-delete experience
- Run against staging environment

**What Makes a Good Test:**
- Test external behavior, not implementation details
- Mock external dependencies (Cognito, APIs)
- Use realistic data that matches backend responses
- Cover happy path, error states, loading states, empty states
- Avoid testing third-party libraries (React Query, shadcn/ui internals)

**Modules to Test:**
- All `lib/` utility modules
- All `services/` API modules
- All `hooks/` (except trivial ones)
- Complex UI components (SearchBar, Filters, DataTable)
- Critical page-level integrations

## Out of Scope

**Phase 1 Out of Scope:**
- Creating or editing experiences (CRUD operations beyond list/view/delete/status)
- Managing activities (create/edit/delete/associate)
- Managing tickets (create/edit/delete)
- Any form-based content creation
- User registration page (Cognito handles registration externally; no frontend registration flow)
- Admin user management
- Complex role-based permissions UI (backend handles authorization)
- Bulk operations on experiences/activities/bookings
- Export to CSV/PDF
- Advanced analytics dashboards
- Notifications/real-time updates
- Offline mode or PWA features
- Email notifications
- Payment gateway integration (if any)
- Multi-language support (i18n)
- Theme switching (dark mode beyond default)
- Any backend changes (API modifications, database schema changes)
- Testing data seeding utilities
- Performance testing
- Security audit (OWASP) - though security best practices will be followed

**Future Phases (Explicitly Out of Scope for PRD):**
- Activity management module (create/edit/delete activities)
- Ticket management module (create/edit ticket types)
- Experience creation wizard
- Rich media uploads for experiences
- Social features (likes, comments, reports) - though counts are displayed
- Streaming integration beyond displaying links
- Advanced mapping/geospatial UI beyond showing address/location
- Mobile app (native or React Native)

## Further Notes

### Performance Considerations
- Use Next.js Image component for optimized images
- Implement proper caching with React Query to minimize API calls
- Pagination ensures we never fetch more than needed
- Consider virtualization for very long lists (if needed)

### Security
- All authentication tokens stored in HTTP-only cookies (not accessible to JavaScript)
- SameSite=Strict/Lax as appropriate
- Use HTTPS in production
- Follow OWASP best practices for CSP, XSS prevention
- Never log sensitive data
- Input sanitization on any future forms

### Accessibility
- Use semantic HTML (button, nav, main, etc.)
- Ensure proper ARIA labels for custom components
- Keyboard navigation support
- Screen reader testing (basic)
- Color contrast compliance (WCAG AA minimum)

### Scalability
- Folder structure organized by feature/domain to scale cleanly
- Service layer abstracts API concerns
- Component composition with shadcn/ui allows easy customization
- React Query provides efficient data synchronization and caching
- App Router allows server components for performance where possible

### Error Monitoring & Logging
- Consider integrating Sentry or similar for error tracking in production
- Log errors to console with appropriate levels during development
- Provide user-friendly error messages, not stack traces

### DevOps
- GitHub repository with feature branches and PR process
- CI/CD pipeline (e.g., GitHub Actions) for lint, test, build on push
- Staging and production environments
- Environment variables managed securely (never commit secrets)

### Browser Support
- Target modern browsers (Chrome, Firefox, Safari, Edge - last 2 major versions)
- Graceful degradation acceptable for very old browsers (IE not supported)

### Timeline (High-Level)
- Phase 1 (Core Experience Module): 4-6 weeks
- Phase 2 (Activities Module): 2-3 weeks
- Phase 3 (Bookings Module): 2-3 weeks
- Phase 4 (Polish, Testing, Deploy): 2 weeks
- **Total:** ~10-14 weeks depending on team size and complexity

---

**Next Steps:** Break this PRD into GitHub issues with clear acceptance criteria and dependency ordering. Consider splitting by module (Auth, Layout, Experiences, Activities, Bookings, Shared). Assign estimates and milestones per phase.
