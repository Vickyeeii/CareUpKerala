# Hospitals Module

## Purpose

The Hospitals module provides master-data management for hospitals with admin-controlled write access and authenticated read access for all users.

## Features

### Admin Capabilities
- Create new hospitals
- Update existing hospitals

### NRI & Companion Capabilities
- View list of all hospitals (read-only)

### Guest Users
- No access (authentication required)

## Role-Based Access Rules

### Admin
✅ Can create hospitals
✅ Can update hospitals
✅ Can view all hospitals

### NRI
❌ Cannot create hospitals
❌ Cannot update hospitals
✅ Can view all hospitals

### Companion
❌ Cannot create hospitals
❌ Cannot update hospitals
✅ Can view all hospitals

### Guests (Unauthenticated)
❌ No access to any endpoint

## API Endpoints

### POST /hospitals
**Access:** Admin only

Creates a new hospital.

**Request Body:**
```json
{
  "name": "City General Hospital",
  "location": "Downtown",
  "address": "123 Main Street, City",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "City General Hospital",
  "location": "Downtown",
  "address": "123 Main Street, City",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00"
}
```

### PUT /hospitals/{hospital_id}
**Access:** Admin only

Updates an existing hospital. All fields are optional.

**Request Body:**
```json
{
  "name": "Updated Hospital Name",
  "location": "New Location",
  "address": "New Address",
  "phone": "+9876543210"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Hospital Name",
  "location": "New Location",
  "address": "New Address",
  "phone": "+9876543210",
  "created_at": "2024-01-01T00:00:00"
}
```

### GET /hospitals
**Access:** All authenticated users (Admin, NRI, Companion)

Returns list of all hospitals.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "City General Hospital",
    "location": "Downtown",
    "address": "123 Main Street, City",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00"
  },
  {
    "id": "uuid",
    "name": "Regional Medical Center",
    "location": "Suburbs",
    "address": "456 Oak Avenue, City",
    "phone": "+1234567891",
    "created_at": "2024-01-02T00:00:00"
  }
]
```

## Database Schema

### Table: tbl_hospital

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Hospital name |
| location | String | Hospital location |
| address | String | Full address |
| phone | String | Contact phone |
| created_at | DateTime | Creation timestamp |

## Why No Schema Changes?

The `tbl_hospital` table already exists with all required fields for basic hospital master data:
- `id` - Unique identifier
- `name` - Hospital name
- `location` - Location/area
- `address` - Full address
- `phone` - Contact number
- `created_at` - Record creation timestamp

This schema is sufficient for the current requirements:
- Master data management (create, update, list)
- No complex relationships needed
- No additional metadata required

Future enhancements (departments, doctors, services) would be implemented as separate modules with their own tables and relationships.

## Security

- All endpoints require authentication via Bearer token
- Role checks are enforced in service layer
- Admins have full write access
- NRI and Companion users have read-only access
- Guests have no access

## Error Handling

- **401 Unauthorized**: Invalid/missing authentication token
- **403 Forbidden**: User lacks required role
- **404 Not Found**: Hospital ID doesn't exist

## Integration

The module integrates with:
- **Auth Module**: Uses Hospital model defined in auth.models
- **Middleware**: Uses `get_current_user` for authentication
- **Database**: Uses existing `tbl_hospital` table

No modifications to existing modules were required.

## Usage Examples

### Admin: Create Hospital
```bash
curl -X POST http://localhost:8000/hospitals \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "location": "Downtown",
    "address": "123 Main St",
    "phone": "+1234567890"
  }'
```

### Admin: Update Hospital
```bash
curl -X PUT http://localhost:8000/hospitals/{hospital_id} \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Hospital Name",
    "phone": "+9876543210"
  }'
```

### Any Authenticated User: List Hospitals
```bash
curl -X GET http://localhost:8000/hospitals \
  -H "Authorization: Bearer USER_TOKEN"
```

## Design Decisions

1. **No Delete Functionality**: Hospitals are master data and should not be deleted. Deactivation could be added in the future if needed.

2. **Service-Level Role Checks**: All role validation happens in services for better separation of concerns.

3. **Reuse Existing Model**: The Hospital model is defined in auth.models to keep all database models in one place.

4. **Optional Update Fields**: All fields in HospitalUpdate are optional to allow partial updates.

5. **Read Access for All Authenticated Users**: NRI and Companion users need to view hospitals for booking purposes.

## Testing

### Test Admin Create
1. Login as admin
2. POST /hospitals with hospital data
3. Verify hospital is created

### Test Admin Update
1. Login as admin
2. PUT /hospitals/{id} with updated data
3. Verify hospital is updated

### Test Read Access
1. Login as NRI user
2. GET /hospitals
3. Verify list is returned

4. Login as Companion user
5. GET /hospitals
6. Verify list is returned

### Test Permission Enforcement
1. Try NRI creating hospital (should fail with 403)
2. Try Companion updating hospital (should fail with 403)
3. Try unauthenticated access (should fail with 401)

## Future Enhancements (Not Implemented)

- Hospital departments
- Doctor listings
- Services/specialties
- Operating hours
- Ratings/reviews
- Soft delete/deactivation

These are intentionally not implemented as per requirements.
