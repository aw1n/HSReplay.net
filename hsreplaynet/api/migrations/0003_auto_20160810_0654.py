# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-10 06:54
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_20160808_1731'),
    ]

    operations = [
        migrations.RenameField(
            model_name='authtoken',
            old_name='is_test_data',
            new_name='test_data',
        ),
    ]
