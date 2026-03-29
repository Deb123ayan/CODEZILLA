from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_mockplatformdata_aadhaar_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='mockplatformdata',
            name='pan_number',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
