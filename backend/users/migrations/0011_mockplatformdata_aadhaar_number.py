from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_mockplatformdata'),
    ]

    operations = [
        migrations.AddField(
            model_name='mockplatformdata',
            name='aadhaar_number',
            field=models.CharField(blank=True, max_length=14, null=True),
        ),
    ]
