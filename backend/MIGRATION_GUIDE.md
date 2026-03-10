# Alembic Migration Guide

This guide explains how to use the Alembic migration system and the helper script for managing database migrations in this project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Helper Script Commands](#helper-script-commands)
- [Common Workflows](#common-workflows)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up Environment Variables**
   Make sure you have a `.env` file with your `DATABASE_URL`:
   ```env
   DATABASE_URL=sqlite:///./carrier_guide.db
   # OR for PostgreSQL:
   # DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

3. **Import Your Models**
   Before creating migrations, make sure to import all your SQLAlchemy models in `alembic/env.py` (around line 32-34):
   ```python
   # Import all models here to ensure they are registered with Base
   from app.models import User, Student, Parent, Admin
   # Add more imports as you create new models
   ```

## Quick Start

### 1. Create Your First Migration

After defining your models, create a migration:

```bash
# Using the helper script (recommended)
python migrate.py create "initial migration"

# Or using Alembic directly
alembic revision --autogenerate -m "initial migration"
```

### 2. Review the Generated Migration

Check the generated file in `alembic/versions/` to ensure it looks correct. Alembic will auto-detect:
- New tables
- New columns
- Column type changes
- New indexes
- New foreign keys

### 3. Apply the Migration

```bash
# Apply all pending migrations
python migrate.py upgrade head

# Or using Alembic directly
alembic upgrade head
```

### 4. Verify the Migration

```bash
# Check current database revision
python migrate.py current
```

## Helper Script Commands

The `migrate.py` script provides convenient wrappers around Alembic commands.

### Create a New Migration

Creates a new migration file with auto-detected changes.

```bash
python migrate.py create "add user table"
python migrate.py create "add email column to users"
```

**What it does:**
- Compares your current models with the database schema
- Generates a migration file in `alembic/versions/`
- Includes upgrade and downgrade functions

**Example Output:**
```
Generating alembic/versions/abc123_add_user_table.py ... done
```

### Upgrade Database

Applies migrations to update your database schema.

```bash
# Upgrade to the latest (head)
python migrate.py upgrade

# Upgrade to a specific revision
python migrate.py upgrade abc123

# Upgrade one step forward
python migrate.py upgrade +1
```

**What it does:**
- Applies all pending migrations in order
- Updates the `alembic_version` table in your database
- Executes the `upgrade()` function in each migration

**Example Output:**
```
INFO  [alembic.runtime.migration] Running upgrade  -> abc123, add user table
```

### Downgrade Database

Rolls back migrations to revert schema changes.

```bash
# Downgrade one revision
python migrate.py downgrade -1

# Downgrade to a specific revision
python migrate.py downgrade abc123

# Downgrade to base (removes all migrations)
python migrate.py downgrade base
```

**⚠️ Warning:** Downgrading can cause data loss if you've added data to tables that are being removed.

**What it does:**
- Reverts migrations in reverse order
- Executes the `downgrade()` function in each migration
- Updates the `alembic_version` table

### Check Current Revision

Shows the current database revision.

```bash
python migrate.py current
```

**Example Output:**
```
abc123 (head)
```

### View Migration History

Shows all migrations and their relationships.

```bash
python migrate.py history
```

**Example Output:**
```
abc123 -> def456 (head), add user table
def456 -> ghi789, add email column
```

### Show Migration Details

Displays the contents of a specific migration.

```bash
python migrate.py show abc123
```

**What it shows:**
- Revision ID
- Parent revision
- Upgrade operations
- Downgrade operations

### Stamp Database

Marks the database as being at a specific revision without running migrations.

```bash
# Stamp to a specific revision
python migrate.py stamp abc123

# Stamp to head (mark as up-to-date)
python migrate.py stamp head
```

**When to use:**
- When you've manually applied schema changes
- When migrating from a non-Alembic database
- When you want to skip certain migrations

## Common Workflows

### Workflow 1: Adding a New Model

1. **Create your model** in `app/models.py`:
   ```python
   from middleware.db import Base
   from sqlalchemy import Column, Integer, String
   
   class User(Base):
       __tablename__ = "users"
       id = Column(Integer, primary_key=True)
       name = Column(String(100))
   ```

2. **Import the model** in `alembic/env.py`:
   ```python
   from app.models import User
   ```

3. **Create migration**:
   ```bash
   python migrate.py create "add user model"
   ```

4. **Review the migration** file in `alembic/versions/`

5. **Apply migration**:
   ```bash
   python migrate.py upgrade head
   ```

### Workflow 2: Modifying an Existing Model

1. **Modify your model** (e.g., add a new column):
   ```python
   class User(Base):
       __tablename__ = "users"
       id = Column(Integer, primary_key=True)
       name = Column(String(100))
       email = Column(String(255))  # New column
   ```

2. **Create migration**:
   ```bash
   python migrate.py create "add email to users"
   ```

3. **Review and apply**:
   ```bash
   python migrate.py upgrade head
   ```

### Workflow 3: Rolling Back a Migration

1. **Check current revision**:
   ```bash
   python migrate.py current
   ```

2. **View history**:
   ```bash
   python migrate.py history
   ```

3. **Downgrade**:
   ```bash
   python migrate.py downgrade -1
   ```

### Workflow 4: Working with Multiple Environments

1. **Development**: Apply migrations as you develop
   ```bash
   python migrate.py upgrade head
   ```

2. **Production**: Review migrations before applying
   ```bash
   # Check what will be applied
   python migrate.py history
   
   # Apply migrations
   python migrate.py upgrade head
   ```

## Advanced Usage

### Manual Migration Editing

Sometimes you need to edit a migration file manually:

1. **Create the migration**:
   ```bash
   python migrate.py create "my migration"
   ```

2. **Edit the file** in `alembic/versions/` to add custom logic:
   ```python
   def upgrade():
       # Custom SQL or data migration
       op.execute("UPDATE users SET status = 'active' WHERE status IS NULL")
       op.add_column('users', sa.Column('email', sa.String(255)))
   ```

3. **Apply the migration**:
   ```bash
   python migrate.py upgrade head
   ```

### Data Migrations

For data migrations (not just schema changes):

```python
def upgrade():
    # Schema change
    op.add_column('users', sa.Column('full_name', sa.String(255)))
    
    # Data migration
    connection = op.get_bind()
    connection.execute(
        text("UPDATE users SET full_name = first_name || ' ' || last_name")
    )
```

### Branching Migrations

If you need to create a branch in your migration history:

```bash
# Create a branch
alembic revision -m "branch migration" --head=abc123

# Merge branches later
alembic merge -m "merge branches" abc123 def456
```

## Troubleshooting

### Issue: "Target database is not up to date"

**Solution:**
```bash
# Check current revision
python migrate.py current

# Upgrade to head
python migrate.py upgrade head
```

### Issue: "Can't locate revision identified by 'abc123'"

**Solution:**
- Check if the migration file exists in `alembic/versions/`
- Verify the revision ID in the file matches
- If migration was deleted, you may need to stamp the database:
  ```bash
  python migrate.py stamp <previous_revision>
  ```

### Issue: "Autogenerate didn't detect my changes"

**Possible causes:**
1. **Model not imported** in `alembic/env.py`
   - Solution: Add import statement

2. **Model not inheriting from Base**
   - Solution: Ensure `class MyModel(Base):`

3. **Changes are too complex for autogenerate**
   - Solution: Create manual migration

### Issue: "Migration conflicts with existing schema"

**Solution:**
1. Check what's different:
   ```bash
   python migrate.py current
   ```

2. If database was modified manually, you may need to:
   ```bash
   # Stamp to current state
   python migrate.py stamp head
   
   # Or create a migration to sync
   python migrate.py create "sync with existing schema"
   ```

### Issue: "Can't downgrade - data will be lost"

**Solution:**
- Review the downgrade function in the migration
- Consider creating a backup before downgrading
- You may need to modify the downgrade function to preserve data

## Direct Alembic Commands

If you prefer using Alembic directly instead of the helper script:

```bash
# Create migration
alembic revision --autogenerate -m "message"

# Upgrade
alembic upgrade head

# Downgrade
alembic downgrade -1

# Current
alembic current

# History
alembic history

# Show
alembic show <revision>

# Stamp
alembic stamp <revision>
```

## Best Practices

1. **Always review** generated migrations before applying
2. **Test migrations** on a development database first
3. **Commit migration files** to version control
4. **Never edit** applied migrations (create new ones instead)
5. **Use descriptive messages** when creating migrations
6. **Backup database** before major migrations in production
7. **Keep migrations small** and focused on one change when possible

## Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

**Need Help?** Check the migration files in `alembic/versions/` or review the Alembic logs for detailed error messages.

