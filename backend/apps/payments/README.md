# Payments Module

## Purpose

The Payments module provides a mocked payment workflow for recording payment attempts and status for bookings. This is NOT a real payment gateway integration.

## Mocked Payment Design

This module simulates payment processing without actual payment gateway integration:

1. **No Real Transactions**: No money is actually processed
2. **Status Tracking**: Records payment status (pending, paid, failed)
3. **Amount Derivation**: Payment amount is automatically derived from booking pricing
4. **Manual Status Updates**: Admin manually updates payment status to simulate payment completion

### Why Mocked?

- Simplifies development and testing
- Avoids payment gateway complexity
- Allows workflow testing without real transactions
- Admin can manually mark payments as paid/failed

## One-Payment-Per-Booking Rule

Each booking can have exactly ONE payment record:

- **UNIQUE constraint** on `booking_id` enforces this at database level
- Prevents duplicate payment attempts for the same booking
- If payment fails, admin updates status rather than creating new payment

### Why One Payment?

1. **Simplicity**: One booking = one payment record
2. **Data Integrity**: Clear 1:1 relationship
3. **Audit Trail**: Single source of truth for payment status
4. **No Refunds**: Refund logic not implemented (future feature)

## Role-Based Access Rules

### NRI Users
✅ Can create payment for own booking
✅ Can view own payments
❌ Cannot view other users' payments
❌ Cannot update payment status

### Admin
✅ Can view all payments
✅ Can update payment status
❌ Cannot create payments (NRI only)

### Companion
❌ No access to payments module

### Guests (Unauthenticated)
❌ No access to any endpoint

## Database Schema

### tbl_payment

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK → tbl_booking.id (UNIQUE) |
| amount | Numeric | Payment amount (from pricing) |
| currency | String | Currency code (default "INR") |
| status | String | pending/paid/failed |
| payment_method | String | Payment method (optional) |
| created_at | DateTime | Payment creation time |

**Constraints:**
- UNIQUE constraint on `booking_id` (one payment per booking)
- Foreign key to `tbl_booking.id`

## Payment Workflow

1. **NRI Creates Booking**
   - Booking created with service and pricing

2. **NRI Initiates Payment**
   - POST /payments with booking_id
   - Amount automatically derived from booking.pricing.price
   - Status: `pending`

3. **Admin Reviews Payment**
   - GET /payments to view all payments
   - Manually verify payment (external process)

4. **Admin Updates Status**
   - PUT /payments/{id}/status
   - Set to `paid` or `failed`

## API Endpoints

### POST /payments
**Access:** NRI only

Create payment for a booking.

**Request:**
```json
{
  "booking_id": "uuid",
  "payment_method": "Credit Card"
}
```

**Response:**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 500.00,
  "currency": "INR",
  "status": "pending",
  "payment_method": "Credit Card",
  "created_at": "2024-01-01T00:00:00"
}
```

**Validation:**
- Booking must exist
- Booking must belong to the NRI user
- No existing payment for this booking

### GET /payments/me
**Access:** NRI only

Get own payments.

**Response:**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "amount": 500.00,
    "currency": "INR",
    "status": "paid",
    "payment_method": "Credit Card",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### GET /payments
**Access:** Admin only

Get all payments.

**Response:** Same as GET /payments/me but includes all users' payments.

### PUT /payments/{payment_id}/status
**Access:** Admin only

Update payment status.

**Request:**
```json
{
  "status": "paid"
}
```

**Allowed statuses:**
- `pending`
- `paid`
- `failed`

**Response:**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 500.00,
  "currency": "INR",
  "status": "paid",
  "payment_method": "Credit Card",
  "created_at": "2024-01-01T00:00:00"
}
```

## Security

- All endpoints require authentication
- Role checks enforced in service layer
- Booking ownership validation
- Duplicate payment prevention

## Error Handling

- **401 Unauthorized**: Invalid/missing authentication token
- **403 Forbidden**: User lacks required role or booking doesn't belong to user
- **404 Not Found**: Payment or booking not found

## Design Decisions

1. **Mocked Payments**: No real gateway integration for simplicity
2. **Amount Derivation**: Amount automatically pulled from booking pricing
3. **One Payment Per Booking**: UNIQUE constraint enforces this
4. **Manual Status Updates**: Admin manually updates status (simulates payment processing)
5. **No Auto-Update**: Payment status doesn't automatically update booking status

## Validation Rules

1. **Booking Ownership**: NRI can only create payment for own booking
2. **Duplicate Prevention**: Cannot create second payment for same booking
3. **Status Validation**: Only allowed statuses can be set
4. **Amount Immutable**: Amount set at creation, cannot be changed

## Usage Examples

### NRI: Create Payment
```bash
curl -X POST http://localhost:8000/payments \
  -H "Authorization: Bearer NRI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "uuid",
    "payment_method": "Credit Card"
  }'
```

### NRI: View Own Payments
```bash
curl -X GET http://localhost:8000/payments/me \
  -H "Authorization: Bearer NRI_TOKEN"
```

### Admin: View All Payments
```bash
curl -X GET http://localhost:8000/payments \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin: Update Payment Status
```bash
curl -X PUT http://localhost:8000/payments/{payment_id}/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

## Limitations (By Design)

1. **No Real Gateway**: This is a mock, not real payment processing
2. **No Refunds**: Refund logic not implemented
3. **No Invoices**: Invoice generation not included
4. **No Payment History**: Only one payment record per booking
5. **Manual Processing**: Admin must manually update status

## Future Enhancements (Not Implemented)

- Real payment gateway integration (Razorpay, Stripe, etc.)
- Automatic status updates via webhooks
- Refund handling
- Invoice generation
- Payment history/audit log
- Multiple payment attempts
- Partial payments

These are intentionally not implemented as per requirements.
