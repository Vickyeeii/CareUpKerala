# Users Module Documentation

## Overview
User profile management module for CareUp backend. Handles viewing and updating authenticated user profiles with role-based field restrictions.

## Architecture

### File Structure
```
backend/
└── users/
    ├── models.py       # Imports existing auth models
    ├── schemas.py      # Pydantic validation schemas
    ├── services.py     # Business logic
    └── routers.py      # API endpoints
```

## Module Scope

### Responsibilities
- Fetch current authenticated user's profile
- Update allowed profile fields based on role
- Return role-specific profile data
- Enforce role-based field restrictions

### NOT Responsible For
- Authentication (handled by auth module)
- Password changes
- Email updates
- Cross-user access
- Admin profile updates

## User Roles & Permissions

### NRI User
**Can View:**
- id, full_name, email, phone, country, created_at, role

**Can Update:**
- full_name
- phone
- country

**Cannot:**
- Change email
- Change role
- Access other users' data

### Companion
**Can View:**
- id, full_name, email, phone, status, created_at, role

**Can Update:**
- full_name
- phone

**Cannot:**
- Change email
- Change status
- Update country field
- Access admin-only fields

### Admin
**Can View:**
- id, full_name, email, phone, created_at, role

**Cannot:**
- Update profile (admin updates not implemented)

## API Endpoints

### GET /users/me
Get current authenticated user's profile.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "nri",
  "created_at": "2024-01-01T00:00:00",
  "country": "USA"
}
```

**Role-Specific Fields:**
- NRI: includes `country`
- Companion: includes `status`
- Admin: no extra fields

**Status Codes:**
- 200: Success
- 401: Unauthorized (invalid/missing token)
- 404: User not found

### PUT /users/me
Update current authenticated user's profile.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "full_name": "John Updated",
  "phone": "+9876543210",
  "country": "Canada"
}
```

**Notes:**
- All fields are optional
- Only allowed fields for the role will be updated
- Attempting to update restricted fields returns 400 error

**Response:**
```json
{
  "id": "uuid",
  "full_name": "John Updated",
  "email": "john@example.com",
  "phone": "+9876543210",
  "role": "nri",
  "created_at": "2024-01-01T00:00:00",
  "country": "Canada"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid update (restricted field or admin update attempt)
- 401: Unauthorized (invalid/missing token)
- 404: User not found

## Usage Examples

### Get Profile
```bash
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile (NRI)
```bash
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "phone": "+1234567890",
    "country": "USA"
  }'
```

### Update Profile (Companion)
```bash
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "phone": "+1234567890"
  }'
```

## Using in Code

### Get Current User Profile
```python
from fastapi import Depends
from middleware.auth_utils import get_current_user
from users.services import get_user_profile

@app.get("/some-route")
def some_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_user_profile(db, current_user["user_id"], current_user["role"])
    return {"profile": profile}
```

## Database Tables Used

### admins
- id, full_name, email, password_hash, phone, created_at

### nri_users
- id, full_name, email, password_hash, phone, country, created_at

### companions
- id, full_name, email, password_hash, phone, status, created_at

**Note:** No new tables created. Uses existing auth tables.

## Schemas

### UserProfileResponse
```python
{
    "id": UUID,
    "full_name": str,
    "email": str,
    "phone": str,
    "role": str,
    "created_at": datetime,
    "country": Optional[str],  # NRI only
    "status": Optional[bool]   # Companion only
}
```

### UserProfileUpdate
```python
{
    "full_name": Optional[str],
    "phone": Optional[str],
    "country": Optional[str]  # NRI only
}
```

## Business Logic

### get_user_profile(db, user_id, role)
- Fetches user from appropriate table based on role
- Returns role-specific profile data
- Raises ValueError if user not found

### update_user_profile(db, user_id, role, update_data)
- Validates role-based field restrictions
- Updates only allowed fields
- Commits changes to database
- Returns updated profile
- Raises ValueError for invalid updates

## Error Handling

All service functions raise `ValueError` for business logic errors, which routers convert to appropriate HTTP exceptions:

- **404 Not Found**: User not found
- **400 Bad Request**: Invalid update (restricted field, admin update)
- **401 Unauthorized**: Invalid/missing authentication token

## Security Features

✅ All endpoints require authentication
✅ Users can only access their own profile
✅ Role-based field restrictions enforced
✅ Email updates blocked
✅ Status/role changes blocked
✅ No password exposure

## Design Decisions

### Why minimal models.py?
Reuses existing auth models to avoid duplication and maintain single source of truth.

### Why block admin updates?
Admin profile management is intentionally not implemented as per requirements.

### Why block country for companions?
Companions don't have a country field in the database schema.

### Why separate get and update services?
Clear separation of concerns and easier to maintain role-specific logic.

## Testing

### Test NRI Profile
```python
# 1. Login as NRI
# 2. Get profile
GET /users/me

# 3. Update profile
PUT /users/me
{
  "full_name": "New Name",
  "country": "Canada"
}
```

### Test Companion Profile
```python
# 1. Login as Companion (must be approved)
# 2. Get profile
GET /users/me

# 3. Update profile
PUT /users/me
{
  "full_name": "New Name",
  "phone": "+123456"
}

# 4. Try to update country (should fail)
PUT /users/me
{
  "country": "USA"
}
# Expected: 400 Bad Request
```

### Test Admin Profile
```python
# 1. Login as Admin
# 2. Get profile
GET /users/me

# 3. Try to update (should fail)
PUT /users/me
{
  "full_name": "New Name"
}
# Expected: 400 Bad Request - "Admin profile updates not allowed"
```

## Integration

The users module is automatically registered in `main.py`:

```python
from users.routers import router as users_router
app.include_router(users_router)
```

## Dependencies

Uses only existing dependencies:
- FastAPI
- SQLAlchemy
- Pydantic
- python-jose (for JWT, via auth_utils)

No new dependencies required.

## Quality Assurance

✅ No circular imports
✅ All imports resolve correctly
✅ Profile data isolated per user
✅ Unauthorized updates rejected
✅ Code is minimal and readable
✅ No modifications to auth module
✅ No database schema changes
✅ Flat module structure maintained

## Troubleshooting

**401 Unauthorized**: Check if access token is valid and not expired

**404 User not found**: User ID in token doesn't match any user in database

**400 Bad Request - "Companions cannot update country field"**: Companion tried to update country

**400 Bad Request - "Admin profile updates not allowed"**: Admin tried to update profile

**400 Bad Request - "Invalid role"**: Token contains invalid role value

## Future Enhancements (Not Implemented)

- Admin profile updates
- Password change functionality
- Email change with verification
- Profile picture upload
- Account deletion
- Activity history

These are intentionally not implemented as per requirements.
