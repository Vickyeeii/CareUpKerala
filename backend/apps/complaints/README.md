# Complaints Module

## Purpose
Allows NRI users to raise complaints against bookings and enables Admin users to review and resolve them.

## Complaint Lifecycle
1. **Open** - NRI user creates complaint (default status)
2. **In Review** - Admin acknowledges and is investigating
3. **Resolved** - Admin has resolved the issue
4. **Rejected** - Complaint deemed invalid or not actionable

## Role Responsibilities

### NRI Users
- Create complaints for their own bookings
- View their own complaints
- Cannot edit or delete complaints once created

### Admin Users
- View all complaints across all users
- Update complaint status
- Add admin response to complaints
- Cannot delete complaints (audit trail)

### Companions
- No access to complaints module

## Why Complaints Are Not Editable by Users
- **Audit Trail**: Maintains integrity of original complaint for investigation
- **Accountability**: Prevents users from changing complaint details after admin review
- **Transparency**: Admin responses are tied to original complaint context
- **Best Practice**: Standard complaint management workflow in service industries

## API Endpoints
- `POST /complaints` - NRI creates complaint for own booking
- `GET /complaints/me` - NRI views own complaints
- `GET /complaints` - Admin views all complaints
- `PUT /complaints/{complaint_id}` - Admin updates status and response

## Database Design
No foreign key constraint to nri_users table (follows Notification pattern) to avoid polymorphic FK complexity. The nri_user_id is validated at service layer against booking ownership.
