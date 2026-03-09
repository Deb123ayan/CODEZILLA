import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def delete_all_claims():
    with connection.cursor() as cursor:
        print("Truncating claims_claim table...")
        cursor.execute("TRUNCATE TABLE claims_claim CASCADE;")
        print("Success.")

if __name__ == "__main__":
    delete_all_claims()
