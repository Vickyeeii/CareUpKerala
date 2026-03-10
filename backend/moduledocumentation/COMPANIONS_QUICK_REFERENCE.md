# Companions Module Quick Reference

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/companions/pending` | Admin | List pending companions |
| PATCH | `/companions/{id}/approve` | Admin | Approve companion |
| PATCH | `/companions/{id}/deactivate` | Admin | Deactivate companion |
| GET | `/companions/me` | Companion | View own profile |

## 🔑 Authentication

All endpoints require Bearer token:
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 👤 Role Access

| Role | Pending | Approve | Deactivate | Me |
|------|---------|---------|------------|-----|
| Admin | ✅ | ✅ | ✅ | ❌ |
| Companion | ❌ | ❌ | ❌ | ✅ |
| NRI | ❌ | ❌ | ❌ | ❌ |

## 📝 Example Requests

### Admin: List Pending Companions
```bash
curl -X GET http://localhost:8000/companions/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

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

### Admin: Approve Companion
```bash
curl -X PATCH http://localhost:8000/companions/{companion_id}/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

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

### Admin: Deactivate Companion
```bash
curl -X PATCH http://localhost:8000/companions/{companion_id}/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

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

### Companion: View Own Profile
```bash
curl -X GET http://localhost:8000/companions/me \
  -H "Authorization: Bearer COMPANION_TOKEN"
```

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

## 🔄 Approval Workflow

```
1. Companion signs up
   POST /auth/companion/signup
   → status = false (pending)

2. Admin views pending
   GET /companions/pending
   → Lists all status = false

3. Admin approves
   PATCH /companions/{id}/approve
   → status = true

4. Companion can login
   POST /auth/login
   → Success (status = true required)

5. Companion checks status
   GET /companions/me
   → Views approval status
```

## ⚠️ Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Wrong role for endpoint |
| 404 | Not Found | Companion ID doesn't exist |

## 🔒 Security Rules

- ✅ All endpoints require authentication
- ✅ Role checks enforced in services
- ✅ Admins cannot access `/companions/me`
- ✅ Companions cannot access admin endpoints
- ✅ NRI users have no access
- ✅ Companions can only view own profile

## 📋 Schemas

### CompanionResponse
```python
{
    "id": UUID,
    "full_name": str,
    "email": str,
    "phone": str,
    "status": bool,
    "created_at": datetime
}
```

### CompanionListResponse
```python
{
    "companions": List[CompanionResponse]
}
```

## 🧪 Quick Test

```bash
# 1. Create companion
curl -X POST http://localhost:8000/auth/companion/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@example.com","password":"pass","phone":"+123"}'

# 2. Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.access_token')

# 3. View pending
curl -X GET http://localhost:8000/companions/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Approve companion
curl -X PATCH http://localhost:8000/companions/{id}/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Login as companion
COMPANION_TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' \
  | jq -r '.access_token')

# 6. View own profile
curl -X GET http://localhost:8000/companions/me \
  -H "Authorization: Bearer $COMPANION_TOKEN"
```

## 🎯 Key Points

1. **Pending = status false**: Companions with `status = false` cannot login
2. **Approved = status true**: Companions with `status = true` can login
3. **Admin Control**: Only admins can approve/deactivate
4. **Self-Access Only**: Companions can only view their own profile
5. **No Schema Changes**: Uses existing `companions` table

## 📚 Full Documentation

See `README.md` in the companions module for complete documentation.
