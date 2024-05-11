# Generated by Django 5.0.6 on 2024-05-11 19:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('brewery', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='playlist',
            name='watcher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlists', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='track',
            name='playlist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tracks', to='brewery.playlist'),
        ),
    ]