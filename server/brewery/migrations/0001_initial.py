# Generated by Django 5.0.6 on 2024-05-11 19:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('playlist_id', models.CharField(max_length=128)),
                ('name', models.CharField(max_length=128)),
                ('owner', models.CharField(max_length=128)),
                ('link', models.URLField()),
                ('platform', models.CharField(max_length=128)),
                ('thumbnail', models.URLField(blank=True)),
                ('last_modified', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('track_id', models.CharField(max_length=128)),
                ('name', models.CharField(max_length=128)),
                ('artist', models.CharField(max_length=128)),
                ('platform', models.CharField(max_length=128)),
            ],
        ),
    ]
