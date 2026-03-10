# Live Care Feed Module

## Purpose

The Live Care Feed module provides a timeline of care updates that companions post for their assigned bookings. This allows NRI users to stay informed about the care being provided to their family members in real-time.

## Care Feed Purpose

### What is a Care Feed?

A care feed is a chronological log of updates posted by companions during the care process:

- **Real-time Updates**: Companions post messages about care activities
- **Transparency**: NRI users can see what's happening with their bookings
- **Accountability**: Creates a record of care provided
- **Peace of Mind**: Keeps NRI users informed remotely

### Use Cases

1. **Companion Posts Update**: "Arrived at hospital, patient checked in"
2. **Companion Posts Progress**: "Consultation completed, waiting for test results"
3. **Companion Posts Completion**: "All procedures done, heading home"
4. **NRI Views Timeline**: Sees all updates for their booking in chronological order

## Role-Based Access Rules

### Companion
✅ Can create care feed entries for assigned bookings
✅ Can view care feeds for assigned bookings
❌ Cannot edit or delete care feed entries
❌ Cannot view feeds for unassigned bookings

### NRI Users
✅ Can view care feed for own bookings
❌ Cannot create care feed entries
❌ Cannot view feeds for other users' bookings

### Admin
✅ Can view all care feeds
✅ Can delete any care feed entry
❌ Cannot create care feed entries (companion only)

### Guests (Unauthenticated)
❌ No access to any endpoint

## Why Feeds Are Immutable

Care feed entries are **immutable** (cannot be edited) by design:

### Reasons for Immutability

1. **Audit Trail**: Maintains accurate historical record
2. **Trust**: NRI users can trust the timeline hasn't been altered
3. **Accountability**: Companions are accountable for what they post
4. **Legal Protection**: Unaltered records for dispute resolution
5. **Simplicity**: No edit history or versioning needed

### What If Mistake?

If a companion posts incorrect information:
- Admin can delete the incorrect entry
- Companion can post a new corrected entry
- Timeline shows both actions transparently

## Database Schema

### tbl_care_feed

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK → tbl_booking.id |
| companion_id | UUID | FK → companions.id |
| message | TEXT | Care update message |
| created_at | DateTime | When update was posted |

**Relationships:**
- One care feed entry → One booking
- One care feed entry → One companion
- One booking → Many care feed entries

## API Endpoints

### POST /care-feed
**Access:** Companion only

Create a care feed entry.

**Request:**
```json
{
  "booking_id": "uuid",
  "message": "Patient arrived at hospital, consultation started"
}
```

**Response:**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "companion_id": "uuid",
  "message": "Patient arrived at hospital, consultation started",
  "created_at": "2024-01-01T10:00:00"
}
```

**Validation:**
- Booking must exist
- Companion must be assigned to the booking

### GET /care-feed/assigned
**Access:** Companion only

Get care feeds for all assigned bookings.

**Response:**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "companion_id": "uuid",
    "message": "Patient arrived at hospital",
    "created_at": "2024-01-01T10:00:00"
  }
]
```

### GET /care-feed/{booking_id}
**Access:** NRI only

Get care feed timeline for a specific booking.

**Response:**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "companion_id": "uuid",
    "message": "Patient arrived at hospital",
    "created_at": "2024-01-01T10:00:00"
  },
  {
    "id": "uuid",
    "booking_id": "uuid",
    "companion_id": "uuid",
    "message": "Consultation completed",
    "created_at": "2024-01-01T11:30:00"
  }
]
```

**Validation:**
- Booking must exist
- Booking must belong to the NRI user

### GET /care-feed
**Access:** Admin only

Get all care feeds across all bookings.

**Response:** Same as other GET endpoints but includes all bookings.

### DELETE /care-feed/{care_feed_id}
**Access:** Admin only

Delete a care feed entry.

**Response:**
```json
{
  "message": "Care feed entry deleted successfully"
}
```

## Security

- All endpoints require authentication
- Role checks enforced in service layer
- Booking ownership validation
- Assignment validation for companions

## Error Handling

- **401 Unauthorized**: Invalid/missing authentication token
- **403 Forbidden**: User lacks required role or not assigned to booking
- **404 Not Found**: Booking or care feed entry not found

## Design Decisions

1. **Immutable Entries**: Cannot edit, only create or delete (admin)
2. **Companion-Only Creation**: Only companions can post updates
3. **Assignment Validation**: Companions can only post for assigned bookings
4. **Chronological Order**: Entries ordered by created_at
5. **Simple Text Messages**: No rich media or attachments

## Validation Rules

1. **Companion Assignment**: Companion must be assigned to booking
2. **Booking Ownership**: NRI can only view own booking feeds
3. **Role Enforcement**: Strict role checks for all operations
4. **Message Required**: Cannot post empty messages

## Usage Examples

### Companion: Post Care Update
```bash
curl -X POST http://localhost:8000/care-feed \
  -H "Authorization: Bearer COMPANION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "uuid",
    "message": "Patient arrived at hospital, consultation started"
  }'
```

### Companion: View Assigned Feeds
```bash
curl -X GET http://localhost:8000/care-feed/assigned \
  -H "Authorization: Bearer COMPANION_TOKEN"
```

### NRI: View Booking Timeline
```bash
curl -X GET http://localhost:8000/care-feed/{booking_id} \
  -H "Authorization: Bearer NRI_TOKEN"
```

### Admin: View All Feeds
```bash
curl -X GET http://localhost:8000/care-feed \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin: Delete Feed Entry
```bash
curl -X DELETE http://localhost:8000/care-feed/{care_feed_id} \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Workflow Example

1. **Booking Created**: NRI creates booking for hospital visit
2. **Companion Assigned**: Admin assigns companion to booking
3. **Care Begins**: Companion starts accompanying patient
4. **Updates Posted**:
   - 10:00 AM: "Arrived at hospital"
   - 10:30 AM: "Checked in, waiting for doctor"
   - 11:00 AM: "Consultation started"
   - 12:00 PM: "Tests ordered, going to lab"
   - 2:00 PM: "All done, heading home"
5. **NRI Views Timeline**: Sees all updates in chronological order

## Limitations (By Design)

1. **No Editing**: Entries cannot be edited once posted
2. **No Rich Media**: Text-only messages (no images/files)
3. **No Real-time**: Not a chat system, just a timeline
4. **No Notifications**: Notification system not included
5. **No Reactions**: No likes, comments, or reactions

## Future Enhancements (Not Implemented)

- Real-time notifications when updates posted
- Image/file attachments
- Read receipts
- Automatic updates (location tracking)
- Video updates
- Translation support

These are intentionally not implemented as per requirements.
