# Companions Module

## Purpose

The Companions module provides admin-controlled approval workflow for companion users and read-only self-access for companions to view their approval status.

## Features

### Admin Capabilities
- View all pending companions (status = false)
- Approve companions (set status = true)
- Deactivate companions (set status = false)

### Companion Capabilities
- View own profile including approval status

### NRI Users
- No access to this module

## Admin Approval Flow

1. **Companion Registration**
   - Companion signs up via `/auth/companion/signup`
   - Account is created with `status = false` (pending approval)
   - Companion cannot login until approved

2. **Admin Reviews Pending Companions**
   - Admin calls `GET /companions/pending`
   - Returns list of all companions with `status = false`

3. **Admin Approves Companion**
   - Admin calls `PATCH /companions/{companion_id}/approve`
   - Sets `status = true`
   - Companion can now login

4. **Admin Can Deactivate**
   - Admin calls `PATCH /companions/{companion_id}/deactivate`
   - Sets `status = false`
   - Companion can no longer login

5. **Companion Checks Status**
   - Companion calls `GET /companions/me`
   - Views current approval status

## API Endpoints

### GET /companions/pending
**Access:** Admin only

Returns all companions with `status = false`.

**Response:**
```json
{
  "companions": [
    {
      "id": "uuid",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "status": false,
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

### PATCH /companions/{companion_id}/approve
**Access:** Admin only

Approves a companion by setting `status = true`.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": true,
  "created_at": "2024-01-01T00:00:00"
}
```

### PATCH /companions/{companion_id}/deactivate
**Access:** Admin only

Deactivates a companion by setting `status = false`.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### GET /companions/me
**Access:** Companion only

Returns the companion's own profile including approval status.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": true,
  "created_at": "2024-01-01T00:00:00"
}
```

## Why No Schema Changes?

The `companions` table already exists with all required fields:
- `id` - Unique identifier
- `full_name` - Companion's name
- `email` - Companion's email
- `phone` - Companion's phone
- `status` - Approval status (boolean)
- `created_at` - Registration timestamp

The existing schema perfectly supports the approval workflow:
- `status = false` means pending approval
- `status = true` means approved

No additional fields or tables are needed for this functionality.

## Security

- All endpoints require authentication via Bearer token
- Role checks are enforced in service layer
- Admins cannot access companion-only endpoints
- Companions cannot access admin-only endpoints
- NRI users have no access to this module
- Users can only view their own companion profile

## Error Handling

- **403 Forbidden**: User lacks required role
- **404 Not Found**: Companion ID doesn't exist
- **401 Unauthorized**: Invalid/missing authentication token

## Integration

The module integrates with:
- **Auth Module**: Uses existing Companion model and authentication
- **Middleware**: Uses `get_current_user` for authentication
- **Database**: Uses existing `companions` table

No modifications to existing modules were required.

## Usage Examples

### Admin: View Pending Companions
```bash
curl -X GET http://localhost:8000/companions/pending \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Admin: Approve Companion
```bash
curl -X PATCH http://localhost:8000/companions/{companion_id}/approve \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Admin: Deactivate Companion
```bash
curl -X PATCH http://localhost:8000/companions/{companion_id}/deactivate \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Companion: View Own Profile
```bash
curl -X GET http://localhost:8000/companions/me \
  -H "Authorization: Bearer COMPANION_ACCESS_TOKEN"
```

## Design Decisions

1. **No Status Request Body**: Approve/deactivate endpoints don't require a request body since the action is clear from the endpoint name.

2. **Service-Level Role Checks**: All role validation happens in services, not routers, for better separation of concerns.

3. **Reuse Existing Model**: The Companion model from auth.models is reused to avoid duplication.

4. **Minimal Schema**: Only essential Pydantic schemas are created.

5. **Clear Error Messages**: ValueError messages clearly indicate permission or logic errors.

## Testing

1. **Test Admin Approval Flow**
   - Create companion via signup
   - Login as admin
   - List pending companions
   - Approve companion
   - Verify companion can now login

2. **Test Companion Self-Access**
   - Login as approved companion
   - View own profile
   - Verify status is visible

3. **Test Permission Enforcement**
   - Try companion accessing admin endpoints (should fail)
   - Try admin accessing companion-only endpoints (should fail)
   - Try NRI accessing any endpoint (should fail)
