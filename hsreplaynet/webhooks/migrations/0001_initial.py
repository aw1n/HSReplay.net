# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-28 11:07
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import hsreplaynet.webhooks.validators
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Webhook',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('url', models.URLField(help_text='The URL the webhook will POST to.', validators=[hsreplaynet.webhooks.validators.WebhookURLValidator()])),
                ('is_active', models.BooleanField(default=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('max_triggers', models.PositiveSmallIntegerField(default=0, help_text='How many triggers after which the Webhook will be deleted. (0 for unlimited)')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('timeout', models.PositiveSmallIntegerField(default=10)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='webhooks', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WebhookTrigger',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('payload', models.TextField(blank=True)),
                ('url', models.URLField(help_text='The URL that is POSTed to')),
                ('response_status', models.PositiveSmallIntegerField(null=True)),
                ('error', models.BooleanField(default=False)),
                ('response', models.TextField(blank=True)),
                ('success', models.BooleanField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('completed_time', models.PositiveIntegerField()),
                ('webhook', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='triggers', to='webhooks.Webhook')),
            ],
        ),
    ]
