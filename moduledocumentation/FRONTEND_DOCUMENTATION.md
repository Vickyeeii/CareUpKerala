# CareUp Kerala - Frontend Documentation

## 1. Project Overview
The frontend is built using **React + Vite**, styled with **Tailwind CSS**. It follows a modular component-based architecture designed for scalability and maintainability.

### Tech Stack
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Routing**: React Router DOM v6
- **State Management**: Context API (Auth, Toast)
- **HTTP Client**: Axios (with interceptors)

---

## 2. Directory Structure

```
frontend/src/
├── api/                # API service layers (axios wrappers)
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
│   ├── auth/           # Auth-related guards (ProtectedRoute)
│   ├── bookings/       # Booking modals and forms
│   ├── care-feed/      # Care feed timeline and modals
│   ├── complaints/     # Complaint management modals
│   ├── feedback/       # Feedback/Rating modals
│   ├── layout/         # Shared layouts (Navbar, Sidebar)
│   ├── notifications/  # Notification logic and bells
│   ├── payments/       # Payment modals
│   └── ui/             # Core UI atoms (Button, Card, Input)
├── context/            # Global state providers
├── pages/              # Route views/pages
│   ├── auth/           # Login, Signup
│   └── dashboard/      # Role-specific dashboards
└── utils/              # Helper functions
```

---

## 3. Key Components & Architecture

### 3.1 Dashboards (Role-Based)
The application features three distinct dashboard experiences secured by `ProtectedRoute`:

1.  **Admin Dashboard** (`/dashboard/admin`)
    *   **Features**: Bento Grid Analytics, User Management, Booking Oversight, Payments, Global Care Feed.
    *   **Components**: `AdminDashboard.jsx`, Sidebar Layout.
    
2.  **Companion Dashboard** (`/dashboard/companion`)
    *   **Features**: Availability Toggle, "My Assignments" List, Task Management, Care Feed Updates.
    *   **Components**: `CompanionDashboard.jsx`.

3.  **User (NRI) Dashboard** (`/dashboard/profile`)
    *   **Features**: My Bookings, Book Service, Make Payments, View Feed, Submit Complaints.
    *   **Components**: `UserProfilePage.jsx`.

### 3.2 Design System (`components/ui`)
We use a centralized set of headless-styled components for consistency:
- **`Button.jsx`**: Supports variants (`default`, `outline`, `ghost`, `link`) and sizes.
- **`Card.jsx`**: Standard container for dashboard widgets.
- **`Input.jsx`**: Standardized form inputs with focus states.
- **`Modal.jsx`**: Accessible overlay for forms (Bookings, Payments, etc.).

### 3.3 Pagination System
Frontend implements server-side pagination for large datasets:
- **UserProfilePage**: "My Bookings" and "My Complaints" are paginated (server-side).
- **AdminDashboard**: "Bookings", "Activity Logs", and "Complaints" are paginated.
- **API Pattern**: Clients accept `page`/`limit` params and handle standard `{ items: [], total: N }` response.

---

## 4. API Services (`src/api/`)
All backend communication is centralized in specific service files utilizing a configured `axios` instance.

| Service | File | Purpose |
| :--- | :--- | :--- |
| **Auth** | `axios.js` | Base config, Interceptors (Token handling) |
| **Users** | `users.js` | Profile management (`/users/me`) |
| **Companions** | `companions.js` | Availability public search, Profile updates |
| **Bookings** | `bookings.js` | Create, List, Assign, Update Status |
| **Payments** | `payments.js` | Process payments, View history |
| **Care Feed** | `careFeed.js` | Live updates, Fetch history |
| **Notifications** | `notifications.js` | Fetch, Mark as Read |

---

## 5. Workflows

### 5.1 Booking Flow
1.  **User**: Selects Service -> `BookingModal` opens.
2.  **User**: Fills Patient Details -> Submits (Status: `pending`).
3.  **Admin**: Receives Notification -> Assigns Companion via `sidebar`.
4.  **Companion**: Sees Assignment -> Posts Updates via `CareFeed`.
5.  **User/Admin**: Views Live Updates.
6.  **Admin/Companion**: Marks Complete -> User leaves Feedback.

### 5.2 Payment Flow
1.  **User**: Clicks "Pay Now" on Booking Card (`UserProfilePage`).
2.  **System**: Calculates amount based on Service Pricing.
3.  **Admin**: Verifies Transaction -> Updates Status to `paid`.

---

## 6. Access Control
- **`ProtectedRoute.jsx`**: Wrapper component that checks:
    - If user is logged in.
    - If user has the required `allowedRoles` (e.g., `['admin', 'nri']`).
    - Redirects to `/login` or correct dashboard if unauthorized.
