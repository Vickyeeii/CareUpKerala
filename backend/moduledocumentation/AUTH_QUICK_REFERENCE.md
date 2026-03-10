# Auth Module Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup environment
cp .env.example .env
# Edit .env with your SECRET_KEY and DATABASE_URL

# 3. Run server
uvicorn main:app --reload

# 4. Visit API docs
http://localhost:8000/docs
```

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/nri/signup` | Register NRI user | No |
| POST | `/auth/companion/signup` | Register companion | No |
| POST | `/auth/logout` | Logout user | No |

## 🔑 Using Authentication in Routes

```python
from fastapi import Depends
from middleware.auth_utils import get_current_user

@app.get("/my-route")
def my_route(current_user: dict = Depends(get_current_user)):
    # current_user = {"user_id": "uuid-string", "role": "admin|nri|companion"}
    user_id = current_user["user_id"]
    role = current_user["role"]
    return {"message": f"Hello {role}"}
```

## 🔐 User Roles

- **admin** - Full access
- **nri** - NRI users (can login immediately after signup)
- **companion** - Companions (requires admin approval, status=true)

## 📝 Example Requests

### Register NRI
```bash
curl -X POST http://localhost:8000/auth/nri/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "phone": "+1234567890",
    "country": "USA"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:8000/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## 🗄️ Database Models

```python
# Admin
id, full_name, email, password_hash, phone, created_at

# NRIUser
id, full_name, email, password_hash, phone, country, created_at

# Companion
id, full_name, email, password_hash, phone, status, created_at

# RefreshToken
id, user_id, role, token, expires_at, created_at
```

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/careup_db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Generate SECRET_KEY: `openssl rand -hex 32`

## 🛠️ Utilities

### Get user by email
```python
from middleware.auth_utils import get_user_by_email

user, role = get_user_by_email(db, "user@example.com")
# Returns (user_object, "admin"|"nri"|"companion") or None
```

### Hash password
```python
from middleware.security import hash_password

hashed = hash_password("plaintext")
```

### Verify password
```python
from middleware.security import verify_password

is_valid = verify_password("plaintext", hashed)
```

### Create tokens
```python
from middleware.security import create_access_token, create_refresh_token

access_token = create_access_token(user_id, role)
refresh_token, expires_at = create_refresh_token(user_id, role)
```

## ⚠️ Important Notes

1. **Companions must be approved**: Set `status=True` in database for companions to login
2. **Single session**: Login deletes old refresh tokens
3. **Token types**: Access tokens cannot be used for refresh, and vice versa
4. **Email uniqueness**: Email must be unique across all user types

## 📚 Full Documentation

See `AUTH_MODULE_README.md` for complete documentation.

## 🧪 Testing

Run `python test_auth_example.py` for automated testing (requires `requests` library).

## 🆘 Troubleshooting

**Can't login as companion**: Check if `status=True` in database
**Invalid token**: Token might be expired or wrong type
**Email already exists**: Email must be unique across all user types
**Database error**: Check DATABASE_URL and ensure PostgreSQL is running
