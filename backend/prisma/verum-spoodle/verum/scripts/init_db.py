#!/usr/bin/env python3
"""
Initialize Database

Creates all database tables based on SQLAlchemy models
"""

import sys
sys.path.append('..')

from backend.app.core.database import engine, Base
from backend.app.models.user import User
from backend.app.models.query import Query


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - queries")


if __name__ == "__main__":
    init_db()
