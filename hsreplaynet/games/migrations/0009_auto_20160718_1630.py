# -*- coding: utf-8 -*-
# Generated by Django 1.10a1 on 2016-07-18 16:30
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import hsreplaynet.utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0008_auto_20160712_0239'),
    ]

    operations = [
        migrations.RenameField(
            model_name='gamereplay',
            old_name='game_server_client_id',
            new_name='client_handle',
        ),
        migrations.RenameField(
            model_name='gamereplay',
            old_name='is_spectated_game',
            new_name='spectator_mode',
        ),
        migrations.RenameField(
            model_name='globalgame',
            old_name='game_server_game_id',
            new_name='game_handle',
        ),
        migrations.RenameField(
            model_name='globalgame',
            old_name='game_server_address',
            new_name='server_address',
        ),
        migrations.RenameField(
            model_name='globalgame',
            old_name='game_server_port',
            new_name='server_port',
        ),
        migrations.AddField(
            model_name='gamereplay',
            name='aurora_password',
            field=models.CharField(blank=True, max_length=16),
        ),
        migrations.AddField(
            model_name='gamereplay',
            name='resumable',
            field=models.NullBooleanField(),
        ),
        migrations.AddField(
            model_name='globalgame',
            name='server_version',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='gamereplay',
            name='friendly_player_id',
            field=hsreplaynet.utils.fields.PlayerIDField(choices=[(1, 1), (2, 2)], help_text='PlayerID of the friendly player (1 or 2)', null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(2)], verbose_name='Friendly PlayerID'),
        ),
        migrations.AlterField(
            model_name='gamereplay',
            name='game_server_spectate_key',
            field=models.CharField(blank=True, default='', max_length=16, verbose_name='Spectator Password'),
            preserve_default=False,
        ),
        migrations.RenameField(
            model_name='gamereplay',
            old_name='game_server_spectate_key',
            new_name='spectator_password',
        ),
        migrations.AlterField(
            model_name='pendingreplayownership',
            name='replay',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ownership_claim', to='games.GameReplay'),
        ),
    ]