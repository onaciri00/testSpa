# Generated by Django 4.2.10 on 2024-11-09 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usermangement', '0003_alter_matchhistoric_create_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='matchhistoric',
            name='level',
            field=models.IntegerField(default=0),
        ),
    ]
