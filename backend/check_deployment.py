#!/usr/bin/env python
"""
Deployment Health Check Script
Verifies database connection and system status
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

def check_database():
    """Check database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection: OK")
        print(f"  Database: {connection.settings_dict['NAME']}")
        return True
    except Exception as e:
        print(f"✗ Database connection: FAILED")
        print(f"  Error: {str(e)}")
        return False

def check_users():
    """Check if users exist"""
    try:
        User = get_user_model()
        user_count = User.objects.count()
        admin_exists = User.objects.filter(username='admin').exists()
        print(f"✓ Users in database: {user_count}")
        print(f"  Admin user exists: {'Yes' if admin_exists else 'No'}")
        return True
    except Exception as e:
        print(f"✗ User check: FAILED")
        print(f"  Error: {str(e)}")
        return False

def check_tables():
    """Check if tables exist"""
    try:
        from django.apps import apps
        models = apps.get_models()
        print(f"✓ Django models loaded: {len(models)}")
        
        # Check specific tables
        tables = ['users_worker', 'policies_policy', 'claims_claim']
        with connection.cursor() as cursor:
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    print(f"  {table}: {count} records")
                except:
                    print(f"  {table}: Table not found")
        return True
    except Exception as e:
        print(f"✗ Table check: FAILED")
        print(f"  Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Deployment Health Check")
    print("=" * 50)
    print()
    
    db_ok = check_database()
    print()
    
    if db_ok:
        check_users()
        print()
        check_tables()
    
    print()
    print("=" * 50)
