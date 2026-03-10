# Bookings Module

## Purpose

The Bookings module connects NRI users with hospitals, services, and companions to facilitate medical service bookings in Kerala.

## Booking Lifecycle

1. **Creation (NRI)**
   - NRI user creates booking with hospital, service, pricing, and scheduled date
   - Status: `pending`
   - Service and pricing are locked at creation time

2. **Assignment (Admin)**
   - Admin assigns approved companion to booking
   - Status can be updated to: `assigned`

3. **Completion/Cancellation (Admin)**
   - Admin marks booking as `completed` or `cancelled`

## Role-Based Access

### NRI Users
✅ Can create bookings
✅ Can view own bookings
❌ Cannot view other users' bookings
❌ Cannot update status
❌ Cannot assign companions

### Admin
✅ Can view all bookings
✅ Can update booking status
✅ Can assign companions to bookings
❌ Cannot create bookings (NRI only)

### Companion
✅ Can view assigned bookings (future feature)
❌ Cannot create bookings
❌ Cannot update status

### Guests (Unauthenticated)
❌ No access to any endpoint

## Why Pricing is Locked at Booking Time

When a booking is created, both `service_id` and `pricing_id` are stored:

1. **Price Stability**: The price at booking time is locked, even if pricing changes later
2. **Historical Accuracy**: Maintains accurate records of what was charged
3. **Audit Trail**: Clear record of pricing at the time of booking
4. **No Surprises**: NRI users know exact cost upfront

Example:
- Service: "Medical Consultation"
- Pricing at booking: ₹500
- If pricing later changes to ₹600, the booking still references ₹500

## Database Schema

### tbl_booking

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| nri_id | UUID | FK → nri_users.id |
| hospital_id | UUID | FK → tbl_hospital.id |
| service_id | UUID | FK → tbl_service.id |
| pricing_id | UUID | FK → tbl_service_pricing.id |
| companion_id | UUID | FK → companions.id (nullable) |
| status | String | pending/assigned/completed/cancelled |
| scheduled_date | DateTime | When service is scheduled |
| created_at | DateTime | Booking creation time |

**Relationships:**
- One booking → One NRI user
- One booking → One hospital
- One booking → One service
- One booking → One pricing record
- One booking → One companion (optional)

## API Endpoints

### POST /bookings
**Access:** NRI only

Create a new booking.

**Request:**
```json
{
  "hospital_id": "uuid",
  "service_id": "uuid",
  "pricing_id": "uuid",
  "scheduled_date": "2024-01-15T10:00:00"
}
```

**Response:**
```json
{
  "id": "uuid",
  "nri_id": "uuid",
  "hospital_id": "uuid",
  "service_id": "uuid",
  "pricing_id": "uuid",
  "companion_id": null,
  "status": "pending",
  "scheduled_date": "2024-01-15T10:00:00",
  "created_at": "2024-01-01T00:00:00"
}
```

### GET /bookings/me
**Access:** NRI only

Get own bookings.

**Response:**
```json
[
  {
    "id": "uuid",
    "nri_id": "uuid",
    "hospital_id": "uuid",
    "service_id": "uuid",
    "pricing_id": "uuid",
    "companion_id": "uuid",
    "status": "assigned",
    "scheduled_date": "2024-01-15T10:00:00",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### GET /bookings
**Access:** Admin only

Get all bookings.

**Response:** Same as GET /bookings/me but includes all users' bookings.

### PUT /bookings/{booking_id}/status
**Access:** Admin only

Update booking status.

**Request:**
```json
{
  "status": "completed"
}
```

**Allowed statuses:**
- `pending`
- `assigned`
- `completed`
- `cancelled`

### PUT /bookings/{booking_id}/assign-companion
**Access:** Admin only

Assign companion to booking.

**Request:**
```json
{
  "companion_id": "uuid"
}
```

**Validation:**
- Companion must exist
- Companion must be approved (status = true)

## Security

- All endpoints require authentication
- Role checks enforced in service layer
- Foreign key validation before booking creation
- Companion approval check before assignment

## Error Handling

- **401 Unauthorized**: Invalid/missing authentication token
- **403 Forbidden**: User lacks required role
- **404 Not Found**: Booking, hospital, service, pricing, or companion not found

## Design Decisions

1. **Locked Pricing**: Pricing ID stored at booking time for price stability
2. **Nullable Companion**: Companion assigned later by admin
3. **Status Enum**: Limited set of allowed statuses for consistency
4. **NRI-Only Creation**: Only NRI users can create bookings
5. **Admin Control**: Only admins can update status and assign companions

## Validation Rules

1. **Foreign Key Validation**: All referenced entities must exist
2. **Pricing-Service Match**: Pricing must belong to the specified service
3. **Companion Approval**: Only approved companions can be assigned
4. **Status Validation**: Only allowed statuses can be set

## Usage Examples

### NRI: Create Booking
```bash
curl -X POST http://localhost:8000/bookings \
  -H "Authorization: Bearer NRI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hospital_id": "uuid",
    "service_id": "uuid",
    "pricing_id": "uuid",
    "scheduled_date": "2024-01-15T10:00:00"
  }'
```

### NRI: View Own Bookings
```bash
curl -X GET http://localhost:8000/bookings/me \
  -H "Authorization: Bearer NRI_TOKEN"
```

### Admin: View All Bookings
```bash
curl -X GET http://localhost:8000/bookings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin: Update Status
```bash
curl -X PUT http://localhost:8000/bookings/{booking_id}/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Admin: Assign Companion
```bash
curl -X PUT http://localhost:8000/bookings/{booking_id}/assign-companion \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companion_id": "uuid"}'
```

## Future Enhancements (Not Implemented)

- Payment integration
- Booking cancellation by NRI
- Companion view of assigned bookings
- Booking notifications
- Availability checking
- Booking modifications
- Refund handling

These are intentionally not implemented as per requirements.
