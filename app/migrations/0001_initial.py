# Generated by Django 5.0 on 2023-12-30 18:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('owner', models.CharField(max_length=64)),
                ('platform', models.CharField(max_length=64)),
                ('thumbnail', models.URLField(blank=True)),
                ('last_modified', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('artist', models.CharField(max_length=64)),
                ('platform', models.CharField(max_length=64)),
                ('playlist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tracks', to='app.playlist')),
            ],
        ),
    ]
