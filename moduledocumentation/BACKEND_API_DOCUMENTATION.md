# CareUp Backend API Documentation

## Project Overview

CareUp is a healthcare companion service platform connecting Non-Resident Indians (NRIs) with local companions who assist their family members during hospital visits in Kerala, India.

### System Actors

- **NRI Users**: Book services, make payments, view care updates, provide feedback
- **Companions**: Provide care services, post updates, manage availability
- **Admins**: Approve companions, manage bookings/payments, handle complaints, monitor system

### Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Access + Refresh tokens)
- **Password Hashing**: bcrypt with SHA256 pre-hash

---

## A. Authentication Flow

### Overview
JWT-based authentication with role-based access control. Each user type (Admin, NRI, Companion) has separate tables but shares a unified authentication mechanism.

### Endpoints

#### 1. User Registration

**POST /auth/register/nri**
- **Role**: Public (Guest)
- **Description**: Register new NRI user account

**Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+919876543210",
  "country": "USA"
}
```

**Success Response (201)**:
```json
{
  "message": "NRI user registered successfully",
  "user_id": "uuid-here"
}
```

**POST /auth/register/companion**
- **Role**: Public (Guest)
- **Description**: Register new companion account (requires admin approval)

**Request Body**:
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "phone": "+919876543210"
}
```

**Success Response (201)**:
```json
{
  "message": "Companion registered successfully. Awaiting admin approval.",
  "user_id": "uuid-here"
}
```

#### 2. Login

**POST /auth/login**
- **Role**: Public (Guest)
- **Description**: Login with email and password, returns access and refresh tokens

**Request Body**:
```json
{
  "username": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "nri"
}
```

**Error Responses**:
- **401**: Invalid credentials
- **403**: Companion not approved yet

#### 3. Refresh Token

**POST /auth/refresh**
- **Role**: Authenticated users
- **Description**: Get new access token using refresh token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 4. Logout

**POST /auth/logout**
- **Role**: Authenticated users
- **Description**: Revoke refresh token (single session per user)

**Headers**: `Authorization: Bearer <access_token>`

**Success Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

### Authentication Rules

- Access tokens expire in 30 minutes
- Refresh tokens expire in 7 days
- Single active session per user (new login revokes previous refresh token)
- Password hashing: SHA256 pre-hash + bcrypt
- JWT payload contains: `user_id`, `role`, `exp`, `type`

---

## 1. Users Module

### Overview
Manages user profile viewing and updating for authenticated users.

### Endpoints

#### GET /users/me
- **Role**: NRI, Admin, Companion
- **Description**: View own profile information

**Headers**: `Authorization: Bearer <access_token>`

**Success Response (200)** - NRI:
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "country": "USA",
  "created_at": "2024-01-01T10:00:00"
}
```

#### PUT /users/me
- **Role**: NRI, Admin, Companion
- **Description**: Update own profile (role-specific fields)

**Request Body** - NRI:
```json
{
  "full_name": "John Updated",
  "phone": "+919876543211",
  "country": "Canada"
}
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  "full_name": "John Updated",
  "email": "john@example.com",
  "phone": "+919876543211",
  "country": "Canada",
  "created_at": "2024-01-01T10:00:00"
}
```

### Business Rules

- Email cannot be changed
- Password updates not supported in this endpoint
- Each role can only update role-specific fields
- Companions cannot update approval status

---

## 2. Companions Module

### Overview
Manages companion approval workflow and availability status.

### Endpoints

#### GET /companions/pending
- **Role**: Admin only
- **Description**: View all companions awaiting approval

**Success Response (200)**:
```json
{
  "companions": [
    {
      "id": "uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+919876543210",
      "status": false,
      "created_at": "2024-01-01T10:00:00"
    }
  ]
}
```

#### PATCH /companions/{companion_id}/approve
- **Role**: Admin only
- **Description**: Approve companion (sets status to true)
- **Logs**: Admin action logged

**Success Response (200)**:
```json
{
  "id": "uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+919876543210",
  "status": true,
  "created_at": "2024-01-01T10:00:00"
}
```

#### PATCH /companions/{companion_id}/deactivate
- **Role**: Admin only
- **Description**: Deactivate companion (sets status to false)
- **Logs**: Admin action logged

#### GET /companions/me
- **Role**: Companion only
- **Description**: View own companion profile

**Success Response (200)**:
```json
{
  "id": "uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+919876543210",
  "availability_status": "available",
  "status": true
}
```

#### PUT /companions/me
- **Role**: Companion only
- **Description**: Update own profile information

**Request Body**:
```json
{
  "full_name": "Jane Smith Updated",
  "phone": "+919876543211",
  "experience_years": 5,
  "specialization": "Elderly Care"
}
```

#### PUT /companions/me/availability
- **Role**: Companion only
- **Description**: Update own availability status

**Request Body**:
```json
{
  "availability_status": "unavailable"
}
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  "full_name": "Jane Smith",
  "availability_status": "unavailable",
  "status": true
}
```

**Allowed values**: `"available"`, `"unavailable"`

#### GET /companions/availability
- **Role**: Admin only
- **Description**: View all companions with availability status

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "full_name": "Jane Smith",
    "availability_status": "available",
    "status": true
  }
]
```

### Business Rules

- Companions must be approved before login
- Only approved companions can be assigned to bookings
- Availability status is self-managed by companions
- Availability does not auto-update based on bookings

---

## 3. Hospitals Module

### Overview
Master data for hospitals where services are provided.

### Endpoints

#### POST /hospitals
- **Role**: Admin only
- **Description**: Create new hospital

**Request Body**:
```json
{
  "name": "Kerala Medical Center",
  "location": "Kochi",
  "address": "MG Road, Kochi, Kerala 682001",
  "phone": "+914842345678"
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "name": "Kerala Medical Center",
  "location": "Kochi",
  "address": "MG Road, Kochi, Kerala 682001",
  "phone": "+914842345678",
  "created_at": "2024-01-01T10:00:00"
}
```

#### GET /hospitals
- **Role**: Authenticated users
- **Description**: List all hospitals

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Kerala Medical Center",
    "location": "Kochi",
    "address": "MG Road, Kochi, Kerala 682001",
    "phone": "+914842345678",
    "created_at": "2024-01-01T10:00:00"
  }
]
```

### Business Rules

- Admin-only write access
- All authenticated users can read
- No update or delete operations (MVP scope)

---

## 4. Services & Pricing Module

### Overview
Defines available services and their pricing tiers.

### Endpoints

#### POST /services
- **Role**: Admin only
- **Description**: Create new service

**Request Body**:
```json
{
  "name": "Hospital Visit Companion",
  "description": "Full-day companion service for hospital visits",
  "is_active": true
}
```

#### POST /services/{service_id}/pricing
- **Role**: Admin only
- **Description**: Add pricing tier for service

**Request Body**:
```json
{
  "price": 2500.00,
  "currency": "INR"
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "service_id": "uuid",
  "price": 2500.00,
  "currency": "INR",
  "created_at": "2024-01-01T10:00:00"
}
```

#### GET /services
- **Role**: Authenticated users
- **Description**: List all active services with pricing

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Hospital Visit Companion",
    "description": "Full-day companion service",
    "is_active": true,
    "pricing": [
      {
        "id": "uuid",
        "price": 2500.00,
        "currency": "INR"
      }
    ],
    "created_at": "2024-01-01T10:00:00"
  }
]
```

### Business Rules

- Service names must be unique
- Multiple pricing tiers allowed per service
- Pricing is locked at booking time (price stability)
- No update or delete operations (MVP scope)

---

## 5. Bookings Module

### Overview
Core booking workflow connecting NRI users with services, hospitals, and companions.

### Endpoints

#### POST /bookings
- **Role**: NRI only
- **Description**: Create new booking

**Request Body**:
```json
{
  "hospital_id": "uuid",
  "service_id": "uuid",
  "pricing_id": "uuid",
  "scheduled_date": "2024-02-15T09:00:00"
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "nri_id": "uuid",
  "hospital_id": "uuid",
  "service_id": "uuid",
  "pricing_id": "uuid",
  "companion_id": null,
  "status": "pending",
  "scheduled_date": "2024-02-15T09:00:00",
  "created_at": "2024-01-01T10:00:00"
}
```

#### GET /bookings/me
- **Role**: NRI only
- **Description**: View own bookings (paginated)
- **Parameters**: `page` (default 1), `limit` (default 100)
- **Response**: `{ items: [Booking], total: int }`

#### GET /bookings
- **Role**: Admin only
- **Description**: View all bookings (paginated)
- **Parameters**: `page` (default 1), `limit` (default 100)
- **Response**: `{ items: [Booking], total: int }`

#### PUT /bookings/{booking_id}/status
- **Role**: Admin only
- **Description**: Update booking status
- **Logs**: Admin action logged

**Request Body**:
```json
{
  "status": "completed"
}
```

**Allowed statuses**: `"pending"`, `"assigned"`, `"completed"`, `"cancelled"`

#### PUT /bookings/{booking_id}/assign-companion
- **Role**: Admin only
- **Description**: Assign approved companion to booking

**Request Body**:
```json
{
  "companion_id": "uuid"
}
```

### Business Rules

- Pricing must belong to selected service
- Companion must be approved before assignment
- Status transitions managed by admin
- Booking status independent of payment status

---

## 6. Payments Module

### Overview
Handles payment creation and status tracking (mocked payment gateway).

### Endpoints

#### POST /payments
- **Role**: NRI only
- **Description**: Create payment for booking

**Request Body**:
```json
{
  "booking_id": "uuid",
  "payment_method": "credit_card"
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 2500.00,
  "currency": "INR",
  "status": "pending",
  "payment_method": "credit_card",
  "created_at": "2024-01-01T10:00:00"
}
```

**Error Responses**:
- **400**: Payment already exists for booking
- **403**: Booking does not belong to user
- **404**: Booking not found

#### GET /payments/me
- **Role**: NRI only
- **Description**: View own payments

#### GET /payments
- **Role**: Admin only
- **Description**: View all payments

#### PUT /payments/{payment_id}/status
- **Role**: Admin only
- **Description**: Update payment status
- **Logs**: Admin action logged

**Request Body**:
```json
{
  "status": "paid"
}
```

**Allowed statuses**: `"pending"`, `"paid"`, `"failed"`

### Business Rules

- One payment per booking (unique constraint)
- Amount auto-calculated from booking pricing
- Currency fixed to INR
- Payment status independent of booking status
- Admin manually updates status (mocked gateway)

---

## 7. Live Care Feed Module

### Overview
Timeline system for companions to post care updates for assigned bookings.

### Endpoints

#### POST /care-feed
- **Role**: Companion only
- **Description**: Post care update for assigned booking

**Request Body**:
```json
{
  "booking_id": "uuid",
  "message": "Patient vitals checked. All normal. Waiting for doctor consultation."
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "message": "Patient vitals checked. All normal.",
  "created_at": "2024-01-01T10:00:00"
}
```

**Error Responses**:
- **403**: Booking not assigned to companion
- **404**: Booking not found

#### GET /care-feed/my-bookings
- **Role**: Companion only
- **Description**: View care feed for own assigned bookings

#### GET /care-feed/assigned
- **Role**: Companion only
- **Description**: View care feeds for all currently assigned bookings

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "message": "Patient vitals checked.",
    "created_at": "2024-01-01T10:00:00"
  }
]
```

#### GET /care-feed/booking/{booking_id}
- **Role**: NRI (own bookings), Admin (all)
- **Description**: View care feed for specific booking

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "message": "Patient vitals checked. All normal.",
    "created_at": "2024-01-01T10:00:00"
  }
]
```

#### GET /care-feed
- **Role**: Admin only
- **Description**: View all care feed entries

#### DELETE /care-feed/{care_feed_id}
- **Role**: Admin only
- **Description**: Delete care feed entry

### Business Rules

- Companion must be assigned to booking
- Entries are immutable (no editing)
- Only admin can delete entries
- NRI users can only view feed for own bookings

---

## 8. Notifications Module

### Overview
In-app notification system for NRI and Admin users.

### Endpoints

#### GET /notifications
- **Role**: NRI, Admin
- **Description**: View own notifications (newest first)

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "title": "Booking Created",
    "message": "Your booking has been successfully created.",
    "related_entity": "booking",
    "related_entity_id": "uuid",
    "is_read": false,
    "created_at": "2024-01-01T10:00:00"
  }
]
```

#### PUT /notifications/{notification_id}/read
- **Role**: NRI, Admin
- **Description**: Mark notification as read

**Request Body**:
```json
{
  "is_read": true
}
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  "title": "Booking Created",
  "message": "Your booking has been successfully created.",
  "related_entity": "booking",
  "related_entity_id": "uuid",
  "is_read": true,
  "created_at": "2024-01-01T10:00:00"
}
```

### Business Rules

- Notifications filtered by user_id and role
- Users can only mark own notifications as read
- is_read is the only mutable field
- No foreign keys (survives user deletion)
- Companions have no access

### Notification Types

- Booking created
- Companion assigned
- Payment pending
- Payment successful
- New care update

---

## 9. Complaints Module

### Overview
Allows NRI users to raise complaints and admins to manage them.

### Endpoints

#### POST /complaints
- **Role**: NRI only
- **Description**: Create complaint for own booking

**Request Body**:
```json
{
  "booking_id": "uuid",
  "title": "Companion arrived late",
  "description": "The companion arrived 30 minutes late to the hospital."
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "title": "Companion arrived late",
  "description": "The companion arrived 30 minutes late.",
  "status": "open",
  "admin_response": null,
  "created_at": "2024-01-01T10:00:00"
}
```

#### GET /complaints/me
- **Role**: NRI only
- **Description**: View own complaints (paginated)
- **Parameters**: `page` (default 1), `limit` (default 10)
- **Response**: `{ items: [Complaint], total: int }`

#### GET /complaints
- **Role**: Admin only
- **Description**: View all complaints (paginated)
- **Parameters**: `page` (default 1), `limit` (default 10)
- **Response**: `{ items: [Complaint], total: int }`

#### PUT /complaints/{complaint_id}
- **Role**: Admin only
- **Description**: Update complaint status and add response
- **Logs**: Admin action logged

**Request Body**:
```json
{
  "status": "resolved",
  "admin_response": "We apologize for the delay. Companion has been counseled."
}
```

**Allowed statuses**: `"open"`, `"in_review"`, `"resolved"`, `"rejected"`

### Business Rules

- Booking must belong to NRI user
- Complaints are immutable by NRI once created
- Only admin can update status and add response
- No deletion allowed (audit trail)

### Complaints vs Feedback

- **Complaints**: Problem-focused, requires admin action
- **Feedback**: Post-service evaluation, no admin action required

---

## 10. Feedback & Ratings Module

### Overview
Post-service feedback and ratings for completed bookings.

### Endpoints

#### POST /feedback
- **Role**: NRI only
- **Description**: Submit feedback for completed booking

**Request Body**:
```json
{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Excellent service. Companion was very caring and professional."
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Excellent service. Companion was very caring.",
  "created_at": "2024-01-01T10:00:00"
}
```

**Error Responses**:
- **400**: Booking not completed
- **409**: Feedback already submitted for booking

#### GET /feedback/me
- **Role**: NRI only
- **Description**: View own feedback history

#### GET /feedback
- **Role**: Admin only
- **Description**: View all feedback for analysis

### Business Rules

- Booking must have status "completed"
- Booking must belong to NRI user
- One feedback per booking (unique constraint)
- Rating must be 1-5
- Feedback is immutable once submitted
- No foreign keys (survives booking deletion)

---

## 11. Admin Dashboard Module

### Overview
Read-only aggregated statistics for admin monitoring.

### Endpoints

#### GET /dashboard/admin/overview
- **Role**: Admin only
- **Description**: Platform overview statistics

**Success Response (200)**:
```json
{
  "total_bookings": 150,
  "active_bookings": 25,
  "completed_bookings": 100,
  "total_nri_users": 75,
  "total_companions": 30,
  "pending_companions": 5,
  "total_hospitals": 10
}
```

#### GET /dashboard/admin/revenue
- **Role**: Admin only
- **Description**: Financial metrics

**Success Response (200)**:
```json
{
  "total_revenue": 250000.00,
  "pending_payments": 15,
  "failed_payments": 3
}
```

#### GET /dashboard/admin/bookings/status
- **Role**: Admin only
- **Description**: Booking counts by status

**Success Response (200)**:
```json
{
  "status_counts": {
    "pending": 10,
    "assigned": 15,
    "completed": 100,
    "cancelled": 5
  }
}
```

#### GET /dashboard/admin/complaints/summary
- **Role**: Admin only
- **Description**: Complaint counts by status

**Success Response (200)**:
```json
{
  "status_counts": {
    "open": 5,
    "in_review": 3,
    "resolved": 20,
    "rejected": 2
  }
}
```

#### GET /dashboard/admin/companions/summary
- **Role**: Admin only
- **Description**: Companion statistics

**Success Response (200)**:
```json
{
  "approved": 25,
  "pending": 5,
  "deactivated": 0
}
```

### Business Rules

- Read-only (no modifications)
- Uses database-level aggregation (efficient)
- No pagination (MVP scope)
- No date range filters (MVP scope)

---

## 12. Admin Action Logs Module

### Overview
Append-only audit trail for admin actions.

### Endpoints

#### GET /admin-logs
- **Role**: Admin only
- **Description**: View all admin action logs (paginated)
- **Parameters**: `page` (default 1), `limit` (default 10)

**Success Response (200)**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "action_type": "approve",
      "entity_type": "companion",
      "entity_id": "uuid",
      "description": "Approved companion: Jane Smith",
      "created_at": "2024-01-01T10:00:00"
    }
  ],
  "total": 50
}
```


### Logged Actions

- Companion approval/deactivation
- Booking status updates
- Payment status updates
- Complaint status updates

### Business Rules

- Append-only (no updates or deletes)
- No foreign keys (logs survive entity deletion)
- Logs created automatically by system
- No API endpoint to create logs (internal only)
- Admin_id stored but not displayed in response

---

## B. Complete Booking Lifecycle

### Step-by-Step Flow

1. **NRI Creates Booking**
   - POST /bookings
   - Status: "pending"
   - Companion: null

2. **NRI Creates Payment**
   - POST /payments
   - Status: "pending"
   - Amount auto-calculated from pricing

3. **Admin Assigns Companion**
   - PUT /bookings/{id}/assign-companion
   - Companion must be approved
   - Booking status remains "pending"

4. **Admin Updates Payment Status**
   - PUT /payments/{id}/status
   - Status: "paid"
   - Logged in admin action logs

5. **Admin Updates Booking Status**
   - PUT /bookings/{id}/status
   - Status: "assigned"
   - Logged in admin action logs

6. **Companion Posts Care Updates**
   - POST /care-feed
   - Multiple updates allowed
   - NRI can view in real-time

7. **Admin Marks Booking Complete**
   - PUT /bookings/{id}/status
   - Status: "completed"
   - Logged in admin action logs

8. **NRI Submits Feedback**
   - POST /feedback
   - Only allowed for completed bookings
   - One feedback per booking

### Important Notes

- Payment status independent of booking status
- Booking can be completed even if payment is pending
- Feedback only allowed after booking completion
- Care feed accessible throughout booking lifecycle

---

## C. Payment Flow Details

### Payment Creation

1. NRI selects booking
2. System validates:
   - Booking exists
   - Booking belongs to NRI
   - No existing payment for booking
3. Amount auto-calculated from booking pricing
4. Payment created with status "pending"

### Payment Status Update

1. Admin reviews payment
2. Admin updates status to "paid" or "failed"
3. Action logged in admin action logs
4. No automatic booking status change

### Why Payment is Decoupled

- **Flexibility**: Booking can proceed before payment confirmation
- **Real-world scenario**: Advance booking with later payment
- **Admin control**: Manual verification of payment
- **Audit trail**: Clear separation of concerns

### Revenue Calculation

- Dashboard counts only "paid" payments
- Sum of payment.amount where status = "paid"
- Currency fixed to INR (MVP scope)

---

## D. Admin Control & Accountability

### Admin Responsibilities

1. **Companion Management**
   - Approve new companions
   - Deactivate problematic companions
   - Monitor availability

2. **Booking Management**
   - Assign companions to bookings
   - Update booking status
   - Monitor booking pipeline

3. **Payment Management**
   - Verify payments
   - Update payment status
   - Track revenue

4. **Complaint Handling**
   - Review complaints
   - Update complaint status
   - Add admin responses

5. **System Monitoring**
   - View dashboard metrics
   - Analyze feedback
   - Review audit logs

### Accountability Mechanisms

1. **Admin Action Logs**
   - Every admin action logged
   - Immutable audit trail
   - Includes admin_id, timestamp, description

2. **Dashboard Visibility**
   - Real-time metrics
   - Status breakdowns
   - Financial tracking

3. **Complaint System**
   - User feedback channel
   - Admin response required
   - Status tracking

---

## E. Error Handling

### Standard Error Responses

**401 Unauthorized**:
```json
{
  "detail": "Invalid authentication credentials"
}
```

**403 Forbidden**:
```json
{
  "detail": "Only Admin users can perform this action"
}
```

**404 Not Found**:
```json
{
  "detail": "Booking not found"
}
```

**400 Bad Request**:
```json
{
  "detail": "Invalid status value"
}
```

**409 Conflict**:
```json
{
  "detail": "Payment already exists for this booking"
}
```

---

## F. Database Design Principles

### Foreign Keys

- Used for core relationships (Booking → Hospital, Service, Pricing)
- NOT used for logs (Notifications, Admin Logs)
- NOT used for cross-user references (Complaints, Feedback)

### Unique Constraints

- One payment per booking
- One feedback per booking
- Unique service names
- Unique user emails

### Immutability

- Care feed entries (no editing)
- Feedback records (no editing)
- Admin action logs (no editing)
- Complaints by NRI (no editing)

### Timestamps

- created_at: All tables
- updated_at: Complaints only
- Auto-managed by database

---

## G. Security Considerations

### Authentication

- JWT tokens with expiration
- Refresh token rotation
- Single session per user
- Password hashing (SHA256 + bcrypt)

### Authorization

- Role-based access control (RBAC)
- Ownership validation in service layer
- No cross-user data access
- Admin-only endpoints protected

### Data Privacy

- Users can only view own data
- No PII in logs
- No password in responses
- Email cannot be changed (prevents account takeover)

---

## H. MVP Scope Limitations

### Intentionally NOT Implemented

1. **Email/SMS Notifications**: Only in-app notifications
2. **Real-time Updates**: No WebSocket/SSE
3. **File Uploads**: No document/image support
4. **Advanced Search**: No filtering or pagination
5. **Refunds**: No payment reversal
6. **Scheduling**: No calendar or time slots
7. **Ratings Aggregation**: No average ratings display
8. **Multi-currency**: INR only
9. **Password Reset**: Not implemented
10. **Email Verification**: Not implemented

### Future Enhancements

- Pagination for large datasets
- Date range filters
- Export to CSV/PDF
- Real-time notifications
- Advanced analytics
- Multi-language support

---

## I. Testing Recommendations

### Manual Testing Flow

1. Register NRI and Companion
2. Admin approves companion
3. Admin creates hospital and service
4. NRI creates booking
5. NRI creates payment
6. Admin assigns companion
7. Companion posts care updates
8. Admin marks booking complete
9. NRI submits feedback
10. Admin views dashboard and logs

### Test Credentials

Create admin using `backend/scripts/create_admin.py`

---

## J. Conclusion

This documentation covers all implemented backend APIs for the CareUp platform. The system is designed for academic evaluation and demonstrates:

- RESTful API design
- Role-based access control
- Audit trail implementation
- Separation of concerns
- Database normalization
- Error handling
- Security best practices

All endpoints are functional and ready for frontend integration.
