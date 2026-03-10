"""
Database Configuration Module

This module supports both SQLite and PostgreSQL databases.
Switch between them by setting the DATABASE_URL environment variable.

Usage:
    1. For SQLite (default):
       DATABASE_URL=sqlite:///./carrier_guide.db
       or leave unset to use default SQLite database

    2. For PostgreSQL:
       DATABASE_URL=postgresql://username:password@localhost:5432/database_name
       Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/carrier_guide

Set DATABASE_URL in your .env file or as an environment variable.
"""

import os
from urllib.parse import urlparse
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Try to import psycopg2 for direct database operations
try:
    import psycopg2
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

# Load environment variables
load_dotenv()

# Database URL from environment variable, default to SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./carrier_guide.db"
)

# Determine database type
IS_SQLITE = DATABASE_URL.startswith("sqlite")
IS_POSTGRESQL = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

# Create engine with appropriate configuration
if IS_SQLITE:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL query logging
    )
    print(f"Using SQLite database: {DATABASE_URL.replace('sqlite:///', '')}")
elif IS_POSTGRESQL:
    # PostgreSQL configuration with connection pooling
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using
        echo=False  # Set to True for SQL query logging
    )
    print(f"Using PostgreSQL database")
else:
    # Other databases (MySQL, etc.)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False  # Set to True for SQL query logging
    )
    print(f"Using database: {DATABASE_URL.split('://')[0]}")

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def create_postgresql_database_if_not_exists():
    """
    Create PostgreSQL database if it doesn't exist.
    Uses template0 to avoid collation version issues.
    Tries multiple methods: psycopg2 direct connection, then SQLAlchemy.
    """
    try:
        # Parse the database URL
        parsed = urlparse(DATABASE_URL)
        db_name = parsed.path[1:]  # Remove leading '/'
        host = parsed.hostname or 'localhost'
        port = parsed.port or 5432
        user = parsed.username
        password = parsed.password
        
        # Method 1: Try using psycopg2 directly (often handles collation issues better)
        if PSYCOPG2_AVAILABLE:
            try:
                # Connect to postgres database to check/create our database
                admin_conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    database='postgres',
                    connect_timeout=5
                )
                admin_conn.autocommit = True
                admin_cursor = admin_conn.cursor()
                
                # Fix collation warning for postgres database
                try:
                    admin_cursor.execute('ALTER DATABASE postgres REFRESH COLLATION VERSION')
                except Exception:
                    pass
                
                # Check if database exists
                admin_cursor.execute(
                    "SELECT 1 FROM pg_database WHERE datname = %s",
                    (db_name,)
                )
                exists = admin_cursor.fetchone() is not None
                
                if not exists:
                    # Try creating with template0 first (avoids collation issues)
                    try:
                        admin_cursor.execute(f'CREATE DATABASE "{db_name}" WITH TEMPLATE template0')
                        print(f"✓ Created PostgreSQL database: {db_name}")
                        admin_cursor.close()
                        admin_conn.close()
                        return False
                    except Exception as template_error:
                        # If template0 fails, try without template
                        try:
                            admin_cursor.execute(f'CREATE DATABASE "{db_name}"')
                            print(f"✓ Created PostgreSQL database: {db_name}")
                            admin_cursor.close()
                            admin_conn.close()
                            return False
                        except Exception as create_error:
                            admin_cursor.close()
                            admin_conn.close()
                            raise create_error
                else:
                    # Database exists, try to refresh collation version to fix warnings
                    try:
                        admin_cursor.execute(f'ALTER DATABASE "{db_name}" REFRESH COLLATION VERSION')
                    except Exception:
                        pass  # Ignore if refresh fails
                    admin_cursor.close()
                    admin_conn.close()
                    return True
            except Exception as psycopg_error:
                # If psycopg2 fails, fall through to SQLAlchemy method
                pass
        
        # Method 2: Try using SQLAlchemy
        admin_databases = ['postgres', 'template1']
        admin_engine = None
        
        for admin_db in admin_databases:
            try:
                admin_url = f"postgresql://{user}:{password}@{host}:{port}/{admin_db}"
                admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 5})
                # Test connection
                with admin_engine.connect() as test_conn:
                    test_conn.execute(text("SELECT 1"))
                break
            except Exception:
                continue
        
        if admin_engine is None:
            print("⚠ Warning: Could not connect to PostgreSQL admin database.")
            return None
        
        # Check if database exists
        with admin_engine.connect() as conn:
            result = conn.execute(text(
                "SELECT 1 FROM pg_database WHERE datname = :db_name"
            ), {"db_name": db_name})
            exists = result.fetchone() is not None
            
            if not exists:
                # Create the database using template0 to avoid collation issues
                try:
                    conn.execute(text(f'CREATE DATABASE "{db_name}" WITH TEMPLATE template0'))
                    print(f"✓ Created PostgreSQL database: {db_name}")
                    return False
                except Exception as template_error:
                    # If template0 fails, try without template
                    try:
                        conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                        print(f"✓ Created PostgreSQL database: {db_name}")
                        return False
                    except Exception as create_error:
                        raise create_error
            else:
                # Database exists, try to refresh collation version to fix warnings
                try:
                    conn.execute(text(f'ALTER DATABASE "{db_name}" REFRESH COLLATION VERSION'))
                except Exception:
                    pass  # Ignore if refresh fails
                return True
    except Exception as e:
        print(f"⚠ Warning: Could not create PostgreSQL database automatically: {e}")
        print("\n📝 Please create the database manually using one of these methods:")
        print(f"\n1. Using psql:")
        print(f"   psql -U {parsed.username} -h {parsed.hostname} -p {parsed.port or 5432}")
        print(f"   CREATE DATABASE carrier_guide WITH TEMPLATE template0;")
        print(f"\n2. Using createdb command:")
        print(f"   createdb -U {parsed.username} -h {parsed.hostname} -p {parsed.port or 5432} carrier_guide")
        print(f"\n3. Fix PostgreSQL collation issue first (if needed):")
        print(f"   psql -U {parsed.username} -h {parsed.hostname} -p {parsed.port or 5432} -d postgres")
        print(f"   ALTER DATABASE template1 REFRESH COLLATION VERSION;")
        return None


def init_db():
    """
    Initialize database - creates database and tables if they don't exist.
    Call this function when the application starts.
    """
    # Import all models here to ensure they are registered with Base
    import middleware.models
    # This will be populated as you create model files
    # Example: from app.models import User, Student, Parent, Admin
    
    # For PostgreSQL, try to create the database if it doesn't exist
    if IS_POSTGRESQL:
        db_creation_result = create_postgresql_database_if_not_exists()
        # If database creation failed and returned None, we might need manual intervention
        if db_creation_result is None:
            # Still try to connect - maybe user created it manually
            pass
    
    # Check if database already exists (has tables)
    db_exists = False
    
    try:
        if IS_SQLITE:
            # For SQLite, check if the database file exists
            db_path = DATABASE_URL.replace("sqlite:///", "")
            db_exists = os.path.exists(db_path) and os.path.getsize(db_path) > 0
        elif IS_POSTGRESQL:
            # For PostgreSQL, check if we can connect and if any tables exist
            try:
                with engine.connect() as conn:
                    inspector = inspect(engine)
                    existing_tables = inspector.get_table_names()
                    db_exists = len(existing_tables) > 0
            except Exception as conn_error:
                # Connection failed - database might not exist
                print(f"\n❌ Cannot connect to PostgreSQL database 'carrier_guide'")
                print("The database does not exist. Please create it manually:")
                print("\nOption 1 - Using psql:")
                print("  psql -U postgres -p 5433")
                print("  CREATE DATABASE carrier_guide WITH TEMPLATE template0;")
                print("\nOption 2 - Using createdb command:")
                print("  createdb -U postgres -p 5433 carrier_guide")
                print("\nOption 3 - Fix PostgreSQL collation issue first:")
                print("  psql -U postgres -p 5433")
                print("  ALTER DATABASE template1 REFRESH COLLATION VERSION;")
                print("  Then restart the application")
                raise
        else:
            # For other databases, check if any tables exist
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            db_exists = len(existing_tables) > 0
    except Exception as e:
        # If connection fails, assume database doesn't exist
        if IS_POSTGRESQL:
            # Already printed error message above, re-raise
            raise
        print(f"Warning: Could not check database status: {e}")
        db_exists = False
    
    # Create all tables (SQLAlchemy will skip if they already exist)
    try:
        Base.metadata.create_all(bind=engine)
        
        # Show appropriate message
        if db_exists:
            print("Database is already created")
        else:
            print("Database is created")
    except Exception as e:
        print(f"\n❌ Error creating database tables: {e}")
        if IS_POSTGRESQL:
            print("\nMake sure:")
            print("1. PostgreSQL server is running")
            print("2. Database 'carrier_guide' exists")
            print("3. User has proper permissions")
        raise


def get_db():
    """
    Dependency function to get database session.
    Use this in FastAPI route dependencies.
    
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session():
    """
    Get a database session directly (for use outside of FastAPI routes).
    Remember to close it manually or use it in a context manager.
    
    Example:
        with get_db_session() as db:
            user = db.query(User).first()
    """
    return SessionLocal()

