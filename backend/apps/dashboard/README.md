# Admin Dashboard Module

## Purpose
Provides read-only aggregated statistics and metrics for Admin users to monitor the CareUp platform. This module is designed for MVP and academic evaluation purposes.

## Design Decisions

### Read-Only Architecture
- **No Database Modifications**: Dashboard only queries existing data
- **No New Tables**: Uses existing tables (bookings, payments, users, companions, hospitals, complaints)
- **No Migrations**: No schema changes required
- **Aggregation Queries**: Uses SQLAlchemy's `func.count()` and `func.sum()` for efficient data aggregation

### Admin-Only Access
- All endpoints enforce admin role check in service layer
- Non-admin users receive 403 Forbidden response
- Follows existing RBAC pattern from other modules

### Simplicity for Academic Evaluation
- Clear, explicit aggregation logic
- Easy to understand SQL queries
- Minimal complexity for demonstration purposes
- Each endpoint has single responsibility

## API Endpoints

### 1. GET /dashboard/admin/overview
Returns high-level platform statistics:
- Total bookings (all statuses)
- Active bookings (pending, confirmed, in_progress)
- Completed bookings
- Total NRI users
- Total companions
- Pending companions (awaiting approval)
- Total hospitals

**Use Case**: Quick snapshot of platform activity

### 2. GET /dashboard/admin/revenue
Returns financial metrics:
- Total revenue (sum of all paid payments)
- Pending payments count
- Failed payments count

**Use Case**: Financial monitoring and payment tracking

### 3. GET /dashboard/admin/bookings/status
Returns booking counts grouped by status (pending, confirmed, in_progress, completed, cancelled)

**Use Case**: Booking pipeline analysis

### 4. GET /dashboard/admin/complaints/summary
Returns complaint counts grouped by status (open, in_review, resolved, rejected)

**Use Case**: Customer service monitoring

### 5. GET /dashboard/admin/companions/summary
Returns companion statistics:
- Approved companions (status = true)
- Pending companions (status = false)
- Deactivated companions (currently 0, placeholder for future)

**Use Case**: Companion management overview

## Technical Implementation

### Aggregation Queries
Uses SQLAlchemy's aggregate functions:
```python
func.count(Model.id)  # Count records
func.sum(Model.field)  # Sum numeric fields
group_by(Model.field)  # Group results
```

### Error Handling
- Service layer raises `ValueError` for permission errors
- Router converts to `HTTPException` with 403 status
- Follows existing error handling pattern

### Performance Considerations
- Queries use database-level aggregation (efficient)
- No in-memory processing of large datasets
- Suitable for MVP scale (thousands of records)
- For production scale, consider caching or materialized views

## Future Enhancements (Out of Scope for MVP)
- Date range filters
- Trend analysis (week-over-week, month-over-month)
- Average ratings from feedback
- Companion performance metrics
- Hospital utilization rates
- Export to CSV/PDF
- Real-time updates via WebSocket
- Caching layer for frequently accessed metrics

## Why This Design?
1. **Academic Clarity**: Easy to explain and demonstrate
2. **MVP Appropriate**: Sufficient for initial launch
3. **Maintainable**: Simple queries, no complex logic
4. **Extensible**: Easy to add more metrics later
5. **Consistent**: Follows existing project patterns
