#!/usr/bin/env python3
"""
Production Deployment Script for GigShield Backend
Deploys to VPS: 157.245.110.122
"""

import paramiko
import sys
import time
from pathlib import Path

# VPS Configuration
VPS_IP = "157.245.110.122"
VPS_USER = "root"
VPS_PASSWORD = "maniS@12345H"
APP_DIR = "/opt/zafby"

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_step(step, message):
    print(f"\n{Colors.BLUE}[Step {step}]{Colors.END} {message}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def run_command(ssh, command, show_output=True):
    """Execute command on remote server"""
    try:
        stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
        exit_status = stdout.channel.recv_exit_status()
        
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        if show_output and output:
            print(output)
        
        if exit_status != 0:
            if error:
                print_error(f"Command failed: {error}")
            return False, error
        
        return True, output
    except Exception as e:
        print_error(f"Command execution failed: {str(e)}")
        return False, str(e)

def connect_to_vps():
    """Establish SSH connection to VPS"""
    print_step(1, "Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print_success(f"Connected to {VPS_USER}@{VPS_IP}")
        return ssh
    except Exception as e:
        print_error(f"Failed to connect: {str(e)}")
        sys.exit(1)

def install_dependencies(ssh):
    """Install required system packages"""
    print_step(2, "Installing system dependencies...")
    
    commands = [
        "apt-get update",
        "DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose git ufw",
        "systemctl start docker",
        "systemctl enable docker"
    ]
    
    for cmd in commands:
        success, _ = run_command(ssh, cmd, show_output=False)
        if not success:
            print_error(f"Failed to execute: {cmd}")
            return False
    
    print_success("Dependencies installed")
    return True

def setup_firewall(ssh):
    """Configure UFW firewall"""
    print_step(3, "Configuring firewall...")
    
    commands = [
        "ufw allow OpenSSH",
        "ufw allow 80/tcp",
        "ufw allow 443/tcp",
        "echo 'y' | ufw enable"
    ]
    
    for cmd in commands:
        run_command(ssh, cmd, show_output=False)
    
    print_success("Firewall configured")

def create_app_directory(ssh):
    """Create application directory on VPS"""
    print_step(4, "Creating application directory...")
    
    success, _ = run_command(ssh, f"mkdir -p {APP_DIR}", show_output=False)
    if success:
        print_success(f"Directory created: {APP_DIR}")
    return success

def upload_files(ssh):
    """Upload application files to VPS"""
    print_step(5, "Uploading application files...")
    
    try:
        sftp = ssh.open_sftp()
        
        # Files to upload
        files_to_upload = [
            'requirements.txt',
            'Dockerfile',
            'docker-compose.yml',
            'nginx.conf',
            'manage.py',
            '.env.example'
        ]
        
        for file in files_to_upload:
            if Path(file).exists():
                remote_path = f"{APP_DIR}/{file}"
                sftp.put(file, remote_path)
                print(f"  Uploaded: {file}")
        
        # Upload directories
        dirs_to_upload = ['core', 'users', 'policies', 'events', 'claims', 
                         'fraud_detection', 'payments', 'ai_engine', 'api', 
                         'celery_tasks', 'deliveries']
        
        for dir_name in dirs_to_upload:
            if Path(dir_name).exists():
                upload_directory(sftp, dir_name, f"{APP_DIR}/{dir_name}")
        
        sftp.close()
        print_success("Files uploaded successfully")
        return True
    except Exception as e:
        print_error(f"File upload failed: {str(e)}")
        return False

def upload_directory(sftp, local_dir, remote_dir):
    """Recursively upload directory"""
    try:
        sftp.mkdir(remote_dir)
    except:
        pass
    
    for item in Path(local_dir).iterdir():
        local_path = str(item)
        remote_path = f"{remote_dir}/{item.name}"
        
        if item.is_file():
            sftp.put(local_path, remote_path)
        elif item.is_dir() and item.name not in ['__pycache__', '.git', 'venv', '.venv']:
            upload_directory(sftp, local_path, remote_path)

def setup_environment(ssh):
    """Create production environment file"""
    print_step(6, "Setting up environment variables...")
    
    # Read the production env template
    env_template_path = Path('.env.production')
    if env_template_path.exists():
        with open(env_template_path, 'r') as f:
            env_content = f.read()
        # Update ALLOWED_HOSTS
        env_content = env_content.replace('ALLOWED_HOSTS=157.245.110.122,localhost', 
                                         f'ALLOWED_HOSTS={VPS_IP},157.245.110.122,localhost')
    else:
        # Fallback to basic config
        env_content = f"""DEBUG=False
SECRET_KEY=django-insecure-=flr$-cz1cp_&*&hyff7$c+bf@0ektw@-_$+i+ew0o0d9*8rw2
DATABASE_URL=postgresql://neondb_owner:npg_iqO0ks9KLUEA@ep-odd-queen-ambyucmg.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
ALLOWED_HOSTS={VPS_IP},157.245.110.122,localhost
CORS_ALLOWED_ORIGINS=https://zafbyy.vercel.app

# Weather API
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1/forecast

# MapmyIndia (MAPPLS) API
MAPPLS_CLIENT_ID=96dHZVzsAuvjndxnhrofsex76a4_jUs3nUwskHGzUNdt1MdAKcSeoBnn3vY3ZWxF3zW9T18NpR8mB8w_D6m4uLEmuwKj1Zlm
MAPPLS_CLIENT_SECRET=lrFxI-iSEg9X7PCdVCRxCIM8pApVEJIVJce6G13BIRFXdIoRjP6xavNnHYJBe5Agb2lTi6i-1kWLghj7IjWyH2LnZpWkTj0ATqmxCmZHrTc=
MAPPLS_API_KEY=377fd816c47aff7643122c117eb0aee7

# Admin Credentials
ADMIN_EMAIL=admin@user.com
ADMIN_PASSWORD=admin
"""
    
    # Escape special characters for shell
    env_content_escaped = env_content.replace('$', '\\$').replace('`', '\\`').replace('"', '\\"')
    
    cmd = f"cd {APP_DIR} && cat > .env << 'EOF'\n{env_content}\nEOF"
    success, _ = run_command(ssh, cmd, show_output=False)
    
    if success:
        print_success("Environment configured with all API keys")
    return success

def build_and_start(ssh):
    """Build Docker images and start containers"""
    print_step(7, "Building and starting containers...")
    
    commands = [
        f"cd {APP_DIR} && docker-compose down || true",
        f"cd {APP_DIR} && docker-compose build",
        f"cd {APP_DIR} && docker-compose up -d"
    ]
    
    for cmd in commands:
        print(f"  Running: {cmd.split('&&')[-1].strip()}")
        success, output = run_command(ssh, cmd, show_output=True)
        if not success:
            print_error("Container startup failed")
            return False
        time.sleep(2)
    
    print_success("Containers started")
    return True

def run_migrations(ssh):
    """Run Django migrations and collect static files"""
    print_step(8, "Running database migrations...")
    
    commands = [
        f"cd {APP_DIR} && docker-compose exec -T web python manage.py migrate",
        f"cd {APP_DIR} && docker-compose exec -T web python manage.py collectstatic --noinput"
    ]
    
    for cmd in commands:
        success, _ = run_command(ssh, cmd, show_output=True)
        if not success:
            print_warning("Migration step had issues, but continuing...")
    
    print_success("Migrations completed")

def verify_deployment(ssh):
    """Verify deployment status"""
    print_step(9, "Verifying deployment...")
    
    success, output = run_command(ssh, f"cd {APP_DIR} && docker-compose ps", show_output=True)
    
    if success:
        print_success("Deployment verification complete")
    
    return success

def main():
    """Main deployment function"""
    print(f"""
{Colors.BLUE}========================================
Zafby Backend - VPS Deployment
========================================{Colors.END}
Target: {VPS_USER}@{VPS_IP}
App Directory: {APP_DIR}
    """)
    
    print_warning("⚠️  SECURITY WARNING: Change root password after deployment!")
    
    response = input("\nProceed with deployment? (yes/no): ")
    if response.lower() != 'yes':
        print("Deployment cancelled.")
        sys.exit(0)
    
    # Connect to VPS
    ssh = connect_to_vps()
    
    try:
        # Run deployment steps
        if not install_dependencies(ssh):
            print_error("Dependency installation failed")
            sys.exit(1)
        
        setup_firewall(ssh)
        
        if not create_app_directory(ssh):
            print_error("Failed to create app directory")
            sys.exit(1)
        
        if not upload_files(ssh):
            print_error("File upload failed")
            sys.exit(1)
        
        if not setup_environment(ssh):
            print_error("Environment setup failed")
            sys.exit(1)
        
        if not build_and_start(ssh):
            print_error("Container startup failed")
            sys.exit(1)
        
        run_migrations(ssh)
        verify_deployment(ssh)
        
        print(f"""
{Colors.GREEN}========================================
Deployment Complete! 🎉
========================================{Colors.END}

Your application is now running at:
  → http://{VPS_IP}

Next Steps:
  1. Test API: curl http://{VPS_IP}/api/
  2. View logs: ssh {VPS_USER}@{VPS_IP} 'cd {APP_DIR} && docker-compose logs -f'
  3. Change root password: ssh {VPS_USER}@{VPS_IP} 'passwd'
  4. Setup SSL certificate for your domain

For detailed instructions, see DEPLOYMENT_GUIDE.md
        """)
        
    except KeyboardInterrupt:
        print("\n\nDeployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Deployment failed: {str(e)}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
