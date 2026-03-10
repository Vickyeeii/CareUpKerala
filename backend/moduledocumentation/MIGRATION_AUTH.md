# Alembic Migration for Auth Module

## Auto-generate migration

The auth models are already imported in `middleware/models.py`, so Alembic will automatically detect them.

To create a migration:

```bash
# Generate migration
alembic revision --autogenerate -m "Add auth tables"

# Apply migration
alembic upgrade head
```

## Manual Migration (if needed)

If you prefer to create tables manually without Alembic:

```python
from middleware.db import engine, Base
from auth.models import Admin, NRIUser, Companion, RefreshToken

# Create all tables
Base.metadata.create_all(bind=engine)
```

Or run this command:

```bash
python -c "from middleware.db import init_db; init_db()"
```

## SQL Schema (for reference)

```sql
-- Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NRI Users table
CREATE TABLE nri_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companions table
CREATE TABLE companions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    status BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role VARCHAR NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_nri_users_email ON nri_users(email);
CREATE INDEX idx_companions_email ON companions(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

## Verification

After migration, verify tables exist:

```bash
# PostgreSQL
psql -U postgres -d careup_db -c "\dt"

# Or using Python
python -c "from middleware.db import engine, inspect; print(inspect(engine).get_table_names())"
```

Expected tables:
- admins
- nri_users
- companions
- refresh_tokens
