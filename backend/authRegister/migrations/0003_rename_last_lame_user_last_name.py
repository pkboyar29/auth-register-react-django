# Generated by Django 5.0.3 on 2024-03-23 06:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authRegister', '0002_alter_user_age_limit'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='last_lame',
            new_name='last_name',
        ),
    ]
