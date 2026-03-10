# Auth Module Documentation

## Overview
Complete JWT-based authentication system for CareUp backend with support for three user roles: Admin, NRI, and Companion.

## Architecture

### File Structure
```
backend/
├── auth/
│   ├── models.py       # Database models (Admin, NRIUser, Companion, RefreshToken)
│   ├── schemas.py      # Pydantic validation schemas
│   ├── services.py     # Business logic
│   └── routes.py       # API endpoints
├── middleware/
│   ├── config.py       # Environment configuration
│   ├── security.py     # Password hashing & JWT functions
│   └── auth_utils.py   # OAuth2 bearer & user utilities
```

## Database Models

### Admin
- `id` (UUID, primary key)
- `full_name`, `email` (unique), `password_hash`, `phone`
- `created_at`

### NRIUser
- `id` (UUID, primary key)
- `full_name`, `email` (unique), `password_hash`, `phone`, `country`
- `created_at`

### Companion
- `id` (UUID, primary key)
- `full_name`, `email` (unique), `password_hash`, `phone`
- `status` (boolean, default false - requires admin approval)
- `created_at`

### RefreshToken
- `id` (UUID, primary key)
- `user_id` (UUID, NOT a foreign key - supports multiple user types)
- `role` (string: admin/nri/companion)
- `token` (unique string)
- `expires_at`, `created_at`

## Security Features

### Password Hashing
- SHA256 pre-hash + bcrypt
- Prevents bcrypt 72-byte limitation issues

### JWT Tokens
- **Access Token**: Short-lived (30 min default), contains `user_id`, `role`, `exp`, `type: "access"`
- **Refresh Token**: Long-lived (7 days default), contains `user_id`, `role`, `exp`, `type: "refresh"`
- Token type validation prevents refresh tokens from being used as access tokens

### Session Management
- Single session per user (old refresh tokens deleted on login)
- Refresh token revocation on logout

## API Endpoints

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "uuid",
  "role": "nri"
}
```

**Notes:**
- Companions with `status=false` cannot login
- Returns 401 for invalid credentials

### POST /auth/refresh
Get new access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### POST /auth/nri/signup
Register new NRI user.

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "country": "USA"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "message": "NRI user registered successfully"
}
```

### POST /auth/companion/signup
Register new companion (requires admin approval).

**Request:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "message": "Companion registered, pending approval"
}
```

### POST /auth/logout
Revoke refresh token.

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Usage in Protected Routes

```python
from fastapi import Depends
from middleware.auth_utils import get_current_user

@app.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    # current_user = {"user_id": "uuid", "role": "nri"}
    return {"message": f"Hello {current_user['role']} user {current_user['user_id']}"}
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/careup_db
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file with required variables

3. Run migrations (if using Alembic):
```bash
alembic upgrade head
```

4. Start server:
```bash
uvicorn main:app --reload
```

## Dependencies Added

- `python-jose[cryptography]>=3.3.0` - JWT token handling
- `bcrypt>=4.0.0` - Password hashing
- `email-validator>=2.0.0` - Email validation

## Design Decisions

### Why no foreign keys in RefreshToken?
To support multiple user types (Admin, NRIUser, Companion) without complex polymorphic associations. The `role` field identifies which table the `user_id` belongs to.

### Why SHA256 pre-hash before bcrypt?
Bcrypt has a 72-byte input limit. SHA256 pre-hashing ensures consistent behavior for all password lengths.

### Why single session per user?
Security best practice - prevents token accumulation and ensures clean session management.

## Testing

Test the endpoints using curl or Postman:

```bash
# Register NRI
curl -X POST http://localhost:8000/auth/nri/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"pass123","phone":"+1234567890","country":"USA"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Access protected route
curl -X GET http://localhost:8000/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Error Handling

All service functions raise `ValueError` for business logic errors, which routes convert to appropriate HTTP exceptions:
- 401 Unauthorized - Invalid credentials, expired tokens
- 400 Bad Request - Validation errors, duplicate emails

## Security Checklist

- ✅ Passwords hashed with SHA256 + bcrypt
- ✅ JWT tokens with expiration
- ✅ Token type validation (access vs refresh)
- ✅ Refresh token storage and revocation
- ✅ Single session enforcement
- ✅ Companion approval requirement
- ✅ Email uniqueness across all user types
- ✅ No sensitive data in JWT payload
