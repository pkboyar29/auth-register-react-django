# Generated by Django 5.0.3 on 2024-03-24 19:19

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authRegister', '0004_alter_user_age_limit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]