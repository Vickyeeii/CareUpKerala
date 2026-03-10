# Hospitals Module Quick Reference

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/hospitals` | Admin | Create hospital |
| PUT | `/hospitals/{id}` | Admin | Update hospital |
| GET | `/hospitals` | All authenticated | List hospitals |

## 🔑 Authentication

All endpoints require Bearer token:
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 👤 Role Access

| Role | Create | Update | List |
|------|--------|--------|------|
| Admin | ✅ | ✅ | ✅ |
| NRI | ❌ | ❌ | ✅ |
| Companion | ❌ | ❌ | ✅ |
| Guest | ❌ | ❌ | ❌ |

## 📝 Example Requests

### Admin: Create Hospital
```bash
curl -X POST http://localhost:8000/hospitals \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "location": "Downtown",
    "address": "123 Main Street",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "name": "City General Hospital",
  "location": "Downtown",
  "address": "123 Main Street",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00"
}
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

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Hospital Name",
  "location": "Downtown",
  "address": "123 Main Street",
  "phone": "+9876543210",
  "created_at": "2024-01-01T00:00:00"
}
```

### Any Authenticated User: List Hospitals
```bash
curl -X GET http://localhost:8000/hospitals \
  -H "Authorization: Bearer USER_TOKEN"
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "City General Hospital",
    "location": "Downtown",
    "address": "123 Main Street",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

## ⚠️ Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Wrong role for endpoint |
| 404 | Not Found | Hospital ID doesn't exist |

## 🔒 Security Rules

- ✅ All endpoints require authentication
- ✅ Only admins can create/update
- ✅ All authenticated users can list
- ✅ Role checks enforced in services
- ✅ Guests have no access

## 📋 Schemas

### HospitalCreate
```python
{
    "name": str,
    "location": str,
    "address": str,
    "phone": str
}
```

### HospitalUpdate (all optional)
```python
{
    "name": Optional[str],
    "location": Optional[str],
    "address": Optional[str],
    "phone": Optional[str]
}
```

### HospitalResponse
```python
{
    "id": UUID,
    "name": str,
    "location": str,
    "address": str,
    "phone": str,
    "created_at": datetime
}
```

## 🧪 Quick Test

```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.access_token')

# 2. Create hospital
HOSPITAL=$(curl -X POST http://localhost:8000/hospitals \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "location": "Test Location",
    "address": "Test Address",
    "phone": "+1234567890"
  }')

HOSPITAL_ID=$(echo $HOSPITAL | jq -r '.id')

# 3. Update hospital
curl -X PUT http://localhost:8000/hospitals/$HOSPITAL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Hospital"}'

# 4. List hospitals (as any user)
curl -X GET http://localhost:8000/hospitals \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🎯 Key Points

1. **Master Data**: Hospitals are master data managed by admins
2. **Read Access**: All authenticated users can view hospitals
3. **No Delete**: Hospitals cannot be deleted (master data)
4. **Partial Updates**: Update endpoint accepts partial data
5. **Role Enforcement**: Role checks in service layer

## 📚 Full Documentation

See `README.md` in the hospitals module for complete documentation.
