# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-01-20 15:42
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('uploads', '0003_uploadevent_descriptor_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='RedshiftStagingTrack',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('track_prefix', models.CharField(max_length=100, verbose_name='Track Prefix')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('active_at', models.DateTimeField(db_index=True, null=True)),
                ('closed_at', models.DateTimeField(db_index=True, null=True)),
                ('insert_started_at', models.DateTimeField(null=True)),
                ('insert_ended_at', models.DateTimeField(null=True)),
                ('analyze_started_at', models.DateTimeField(null=True)),
                ('analyze_ended_at', models.DateTimeField(null=True)),
                ('vacuum_started_at', models.DateTimeField(null=True)),
                ('vacuum_ended_at', models.DateTimeField(null=True)),
                ('track_cleanup_at', models.DateTimeField(null=True)),
                ('predecessor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='uploads.RedshiftStagingTrack')),
                ('successor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='uploads.RedshiftStagingTrack')),
            ],
        ),
        migrations.CreateModel(
            name='RedshiftStagingTrackTable',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('staging_table', models.CharField(max_length=100, verbose_name='Staging Table')),
                ('target_table', models.CharField(max_length=100, verbose_name='Target Table')),
                ('firehose_stream', models.CharField(max_length=100, verbose_name='Firehose Stream')),
                ('final_staging_table_size', models.IntegerField(null=True)),
                ('insert_count', models.IntegerField(null=True)),
                ('insert_duration_seconds', models.IntegerField(null=True)),
                ('track', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tables', to='uploads.RedshiftStagingTrack')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='redshiftstagingtracktable',
            unique_together=set([('track', 'target_table')]),
        ),
    ]
