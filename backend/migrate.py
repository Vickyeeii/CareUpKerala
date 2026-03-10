#!/usr/bin/env python3
"""
Alembic Migration Helper Script

This script provides convenient commands for managing database migrations.

Quick Usage:
    python migrate.py create <message>  # Create a new migration
    python migrate.py upgrade [revision] # Apply migrations (default: head)
    python migrate.py downgrade [revision] # Rollback migrations
    python migrate.py current           # Show current revision
    python migrate.py history           # Show migration history
    python migrate.py show <revision>   # Show migration details
    python migrate.py stamp <revision>  # Stamp database to a revision

For detailed documentation, see:
    - MIGRATION_GUIDE.md (comprehensive guide)
    - MIGRATION_QUICK_REF.md (quick reference)
"""

import sys
import subprocess
import os
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent
os.chdir(backend_dir)


def run_alembic_command(args):
    """Run an alembic command with the given arguments."""
    try:
        cmd = ["alembic"] + args
        result = subprocess.run(cmd, check=True, capture_output=False)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error running alembic command: {e}")
        return False
    except FileNotFoundError:
        print("Error: Alembic not found. Make sure it's installed:")
        print("  pip install alembic")
        return False


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "init":
        print("Alembic is already initialized. Use 'create' to make new migrations.")
        sys.exit(0)

    elif command == "create":
        if len(sys.argv) < 3:
            print("Error: Please provide a message for the migration.")
            print("Usage: python migrate.py create <message>")
            sys.exit(1)
        message = " ".join(sys.argv[2:])
        run_alembic_command(["revision", "--autogenerate", "-m", message])

    elif command == "upgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        print(f"Upgrading database to revision: {revision}")
        run_alembic_command(["upgrade", revision])

    elif command == "downgrade":
        if len(sys.argv) < 3:
            print("Error: Please specify a revision to downgrade to.")
            print("Usage: python migrate.py downgrade <revision>")
            print("  Use 'python migrate.py downgrade -1' to go back one revision")
            sys.exit(1)
        revision = sys.argv[2]
        print(f"Downgrading database to revision: {revision}")
        run_alembic_command(["downgrade", revision])

    elif command == "current":
        print("Current database revision:")
        run_alembic_command(["current"])

    elif command == "history":
        print("Migration history:")
        run_alembic_command(["history"])

    elif command == "show":
        if len(sys.argv) < 3:
            print("Error: Please specify a revision to show.")
            print("Usage: python migrate.py show <revision>")
            sys.exit(1)
        revision = sys.argv[2]
        run_alembic_command(["show", revision])

    elif command == "stamp":
        if len(sys.argv) < 3:
            print("Error: Please specify a revision to stamp.")
            print("Usage: python migrate.py stamp <revision>")
            sys.exit(1)
        revision = sys.argv[2]
        print(f"Stamping database to revision: {revision}")
        run_alembic_command(["stamp", revision])

    elif command == "help" or command == "-h" or command == "--help":
        print(__doc__)
        sys.exit(0)

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()

