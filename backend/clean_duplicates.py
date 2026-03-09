import os
import django
from django.db.models import Count

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from claims.models import Claim

def clean_duplicate_claims():
    # Identify duplicates
    duplicates = Claim.objects.values('worker', 'claim_date', 'claim_reason') \
        .annotate(count=Count('claim_id')) \
        .filter(count__gt=1)

    print(f"Found {len(duplicates)} sets of duplicates.")

    for entry in duplicates:
        # Get all records for this set
        records = Claim.objects.filter(
            worker=entry['worker'],
            claim_date=entry['claim_date'],
            claim_reason=entry['claim_reason']
        ).order_by('created_at')

        # Keep the first one, delete the rest
        to_delete = records[1:]
        count = to_delete.count()
        for record in to_delete:
            record.delete()
        
        print(f"Deleted {count} duplicates for worker {entry['worker']} on {entry['claim_date']} ({entry['claim_reason']})")

if __name__ == "__main__":
    clean_duplicate_claims()
