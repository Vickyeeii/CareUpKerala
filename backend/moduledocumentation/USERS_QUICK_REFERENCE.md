# Users Module Quick Reference

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update current user profile | Yes |

## 🔑 Authentication

All endpoints require Bearer token:
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 👤 Role Permissions

### NRI User
**Can Update:**
- ✅ full_name
- ✅ phone
- ✅ country

**Cannot Update:**
- ❌ email
- ❌ role

### Companion
**Can Update:**
- ✅ full_name
- ✅ phone

**Cannot Update:**
- ❌ email
- ❌ status
- ❌ country

### Admin
**Can Update:**
- ❌ Nothing (admin updates not implemented)

## 📝 Example Requests

### Get Profile
```bash
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response (NRI):**
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

**Response (Companion):**
```json
{
  "id": "uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+9876543210",
  "role": "companion",
  "created_at": "2024-01-01T00:00:00",
  "status": true
}
```

### Update Profile (NRI)
```bash
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Updated",
    "phone": "+1111111111",
    "country": "Canada"
  }'
```

### Update Profile (Companion)
```bash
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Updated",
    "phone": "+2222222222"
  }'
```

## 🛠️ Using in Code

```python
from fastapi import Depends
from middleware.auth_utils import get_current_user
from users.services import get_user_profile, update_user_profile

@app.get("/my-route")
def my_route(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # current_user = {"user_id": "uuid", "role": "nri|companion|admin"}
    profile = get_user_profile(db, current_user["user_id"], current_user["role"])
    return {"profile": profile}
```

## ⚠️ Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 401 | Unauthorized | Invalid/missing token |
| 404 | User not found | User doesn't exist |
| 400 | Admin profile updates not allowed | Admin tried to update |
| 400 | Companions cannot update country field | Companion tried to update country |

## 🔒 Security Rules

- ✅ Users can only view/update their own profile
- ✅ Email cannot be changed
- ✅ Role cannot be changed
- ✅ Status cannot be changed (companions)
- ✅ All endpoints require authentication

## 📚 Full Documentation

See `USERS_MODULE_README.md` for complete documentation.

## 🧪 Quick Test

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | jq -r '.access_token')

# 2. Get profile
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Update profile
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated Name"}'
```

## 📋 Schemas

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
    "country": Optional[str]  # NRI only, ignored for companions
}
```

## 🎯 Key Points

1. **Authentication Required**: All endpoints need valid access token
2. **Own Profile Only**: Users can only access their own data
3. **Role-Based Updates**: Different roles have different update permissions
4. **No Email Changes**: Email updates are blocked for security
5. **No Admin Updates**: Admin profile updates not implemented
