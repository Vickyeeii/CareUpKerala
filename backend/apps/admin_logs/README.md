# Admin Action Logs (Audit Trail) Module

## Purpose
Provides accountability and traceability for administrative actions performed in the CareUp platform. This append-only audit trail ensures transparency and supports compliance requirements.

## Why Logs Are Append-Only
- **Immutability**: Once logged, actions cannot be modified or deleted
- **Integrity**: Maintains complete historical record of admin activities
- **Accountability**: Prevents tampering with audit evidence
- **Compliance**: Standard practice for audit trails in regulated systems
- **Trust**: Builds confidence in system governance

## Why No Foreign Keys Are Used
- **Independence**: Logs must survive even if referenced entities are deleted
- **Durability**: Audit trail remains intact regardless of data lifecycle
- **Simplicity**: Avoids cascade delete complications
- **Historical Record**: Preserves evidence of actions on deleted entities
- **Best Practice**: Standard pattern for audit/logging tables

## Which Actions Are Logged

### Companion Management
- Approve companion
- Deactivate companion

### Complaint Management
- Update complaint status
- Add admin response to complaint

### Payment Management
- Update payment status

### Future Actions (Extensible)
- Hospital creation/updates
- Service pricing changes
- Booking modifications
- User account actions

## Log Entry Structure
Each log entry contains:
- **admin_id**: UUID of admin who performed the action
- **action_type**: Type of action (e.g., "approve", "deactivate", "update_status")
- **entity_type**: Type of entity affected (e.g., "companion", "complaint", "payment")
- **entity_id**: UUID of the affected entity (nullable for bulk actions)
- **description**: Human-readable description of the action
- **created_at**: Timestamp when action was performed

## API Endpoints
- `GET /admin-logs` - Admin views all action logs (ordered by newest first)

## Usage Example
```python
from apps.admin_logs.services import log_admin_action

# After approving a companion
log_admin_action(
    db=db,
    current_user=current_user,
    action_type="approve",
    entity_type="companion",
    entity_id=companion.id,
    description=f"Approved companion: {companion.full_name}"
)
```

## Integration Points
This module is designed to be called internally by other admin-facing services:
- Companion approval/deactivation
- Complaint status updates
- Payment status changes
- Any future admin actions requiring audit trail

## Security Considerations
- Only admins can view logs
- Logs cannot be created via API (internal use only)
- No update or delete operations allowed
- Logs persist independently of user accounts

## Academic Context
This module demonstrates:
- Audit trail implementation
- Append-only data patterns
- Separation of concerns (logging vs business logic)
- Compliance-ready architecture
- Defensive database design (no FKs for logs)

## Future Enhancements (Out of Scope for MVP)
- Pagination for large log volumes
- Filtering by action_type, entity_type, date range
- Search by admin_id or entity_id
- Export logs to CSV/JSON
- Log retention policies
- Automated log analysis and alerting
