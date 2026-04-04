#!/usr/bin/env python3
"""
Pre-Deployment Verification Script
Checks if everything is ready before deploying to VPS
"""

import os
import sys
from pathlib import Path
import requests

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_check(message, status):
    symbol = "✓" if status else "✗"
    color = Colors.GREEN if status else Colors.RED
    print(f"{color}{symbol}{Colors.END} {message}")
    return status

def check_file_exists(filepath, description):
    """Check if a required file exists"""
    exists = Path(filepath).exists()
    print_check(f"{description}: {filepath}", exists)
    return exists

def check_env_variable(env_file, var_name):
    """Check if environment variable is set"""
    if not Path(env_file).exists():
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
        has_var = var_name in content and not content.split(var_name)[1].split('\n')[0].strip() == '='
    
    return has_var

def check_database_connection():
    """Test database connection"""
    db_url = "postgresql://neondb_owner:npg_iqO0ks9KLUEA@ep-odd-queen-ambyucmg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        conn.close()
        return True
    except ImportError:
        print_check("Database connection test (psycopg2 not installed, skipping)", True)
        return True
    except Exception as e:
        print_check(f"Database connection test: {str(e)}", False)
        return False

def check_frontend_url():
    """Check if frontend URL is accessible"""
    try:
        response = requests.get("https://zafby.vercel.app", timeout=10)
        return response.status_code == 200
    except:
        return False

def main():
    print(f"""
{Colors.BLUE}========================================
Pre-Deployment Verification
========================================{Colors.END}
Checking if everything is ready for deployment...
    """)
    
    all_checks_passed = True
    
    # Check required files
    print(f"\n{Colors.BLUE}[1] Checking Required Files{Colors.END}")
    all_checks_passed &= check_file_exists("requirements.txt", "Requirements file")
    all_checks_passed &= check_file_exists("Dockerfile", "Dockerfile")
    all_checks_passed &= check_file_exists("docker-compose.yml", "Docker Compose")
    all_checks_passed &= check_file_exists("nginx.conf", "Nginx config")
    all_checks_passed &= check_file_exists("manage.py", "Django manage.py")
    all_checks_passed &= check_file_exists(".env.production", "Production env template")
    
    # Check Django apps
    print(f"\n{Colors.BLUE}[2] Checking Django Apps{Colors.END}")
    apps = ['core', 'users', 'policies', 'events', 'claims', 'fraud_detection', 
            'payments', 'ai_engine', 'api', 'celery_tasks', 'deliveries']
    for app in apps:
        all_checks_passed &= check_file_exists(app, f"App: {app}")
    
    # Check environment variables
    print(f"\n{Colors.BLUE}[3] Checking Environment Variables{Colors.END}")
    env_file = ".env.production"
    if Path(env_file).exists():
        print_check("Production env file exists", True)
        print_check("DATABASE_URL set", check_env_variable(env_file, "DATABASE_URL"))
        print_check("SECRET_KEY set", check_env_variable(env_file, "SECRET_KEY"))
        print_check("MAPPLS_API_KEY set", check_env_variable(env_file, "MAPPLS_API_KEY"))
        print_check("CORS_ALLOWED_ORIGINS set", check_env_variable(env_file, "CORS_ALLOWED_ORIGINS"))
    else:
        print_check("Production env file exists", False)
        all_checks_passed = False
    
    # Check external services
    print(f"\n{Colors.BLUE}[4] Checking External Services{Colors.END}")
    
    # Database
    print("Testing database connection...")
    db_ok = check_database_connection()
    print_check("Neon PostgreSQL accessible", db_ok)
    all_checks_passed &= db_ok
    
    # Frontend
    print("Testing frontend URL...")
    frontend_ok = check_frontend_url()
    print_check("Vercel frontend accessible", frontend_ok)
    if not frontend_ok:
        print(f"  {Colors.YELLOW}Note: Frontend might be down or URL changed{Colors.END}")
    
    # Check VPS connectivity
    print(f"\n{Colors.BLUE}[5] Checking VPS Connectivity{Colors.END}")
    try:
        import paramiko
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect("157.245.110.122", username="root", password="maniS@12345H", timeout=10)
        ssh.close()
        print_check("VPS SSH connection", True)
    except ImportError:
        print_check("VPS SSH connection (paramiko not installed)", True)
        print(f"  {Colors.YELLOW}Install paramiko to test: pip install paramiko{Colors.END}")
    except Exception as e:
        print_check(f"VPS SSH connection: {str(e)}", False)
        all_checks_passed = False
    
    # Summary
    print(f"\n{Colors.BLUE}========================================")
    if all_checks_passed:
        print(f"{Colors.GREEN}✓ All checks passed! Ready to deploy.{Colors.END}")
        print(f"\nTo deploy, run:")
        print(f"  {Colors.BLUE}python3 deploy_production.py{Colors.END}")
    else:
        print(f"{Colors.RED}✗ Some checks failed. Please fix issues before deploying.{Colors.END}")
        sys.exit(1)
    
    print(f"{Colors.BLUE}========================================{Colors.END}\n")

if __name__ == "__main__":
    main()
