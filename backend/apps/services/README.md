# Services & Pricing Module

## Purpose

The Services & Pricing module provides master-data management for services offered and their pricing. This module separates service definitions from pricing to allow flexible pricing strategies.

## Service vs Pricing Separation

### Why Separate Tables?

1. **Service (tbl_service)**: Defines WHAT services exist
   - Service name and description
   - Active/inactive status
   - Independent of pricing

2. **Pricing (tbl_service_pricing)**: Defines HOW MUCH services cost
   - Multiple pricing records per service (historical pricing)
   - Currency support
   - Price updates without changing service definition

This separation allows:
- Price history tracking
- Multiple pricing tiers (future)
- Currency flexibility
- Service activation/deactivation without losing pricing data

## Role-Based Access Rules

### Admin
✅ Can create services
✅ Can update services
✅ Can add pricing
✅ Can update pricing
✅ Can list services

### NRI
❌ Cannot create/update services
❌ Cannot manage pricing
✅ Can list services

### Companion
❌ Cannot create/update services
❌ Cannot manage pricing
✅ Can list services

### Guests (Unauthenticated)
❌ No access to any endpoint

## Database Schema

### tbl_service
- id (UUID, primary key)
- name (String, unique, not null)
- description (String, nullable)
- is_active (Boolean, default true)
- created_at (DateTime)

### tbl_service_pricing
- id (UUID, primary key)
- service_id (UUID, foreign key → tbl_service.id)
- price (Numeric, not null)
- currency (String, default "INR")
- created_at (DateTime)

**Relationship**: One service → Many pricing records

## Why Migrations Are Required

Unlike the Hospitals module which used an existing table, this module introduces TWO NEW tables:
1. `tbl_service`
2. `tbl_service_pricing`

These tables do not exist in the database yet, so Alembic migrations are required to:
- Create both tables
- Establish foreign key relationship
- Set up proper constraints and indexes
- Provide rollback capability (downgrade)

## API Endpoints

### POST /services
**Access:** Admin only
Create a new service.

**Request:**
```json
{
  "name": "Medical Consultation",
  "description": "General medical consultation service",
  "is_active": true
}
```

### PUT /services/{service_id}
**Access:** Admin only
Update an existing service.

**Request:**
```json
{
  "name": "Updated Service Name",
  "is_active": false
}
```

### POST /services/pricing
**Access:** Admin only
Add pricing for a service.

**Request:**
```json
{
  "service_id": "uuid",
  "price": 500.00,
  "currency": "INR"
}
```

### PUT /services/pricing/{pricing_id}
**Access:** Admin only
Update pricing.

**Request:**
```json
{
  "price": 600.00,
  "currency": "INR"
}
```

### GET /services
**Access:** All authenticated users
List all services.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Medical Consultation",
    "description": "General medical consultation service",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

## Security

- All endpoints require authentication
- Role checks enforced in service layer
- Admin-only write access
- Read access for all authenticated users

## Error Handling

- **401 Unauthorized**: Invalid/missing authentication token
- **403 Forbidden**: User lacks required role
- **404 Not Found**: Service or pricing not found

## Design Decisions

1. **Separate Tables**: Service definition separate from pricing for flexibility
2. **is_active Flag**: Soft deactivation without data loss
3. **Numeric Price**: Supports decimal precision for accurate pricing
4. **Currency Field**: Multi-currency support (default INR)
5. **No Delete**: Services and pricing are master data (not deletable)
6. **Foreign Key**: Enforces referential integrity between service and pricing

## Usage Examples

### Admin: Create Service
```bash
curl -X POST http://localhost:8000/services \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Medical Consultation",
    "description": "General consultation",
    "is_active": true
  }'
```

### Admin: Add Pricing
```bash
curl -X POST http://localhost:8000/services/pricing \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "uuid",
    "price": 500.00,
    "currency": "INR"
  }'
```

### Any Authenticated User: List Services
```bash
curl -X GET http://localhost:8000/services \
  -H "Authorization: Bearer USER_TOKEN"
```

## Future Enhancements (Not Implemented)

- Service categories
- Pricing tiers (basic, premium)
- Discounts and coupons
- Service packages
- Time-based pricing
- Location-based pricing

These are intentionally not implemented as per requirements.
