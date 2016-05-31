# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-31 10:43
from __future__ import unicode_literals

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import hearthstone.enums
import hsreplaynet.fields
import hsreplaynet.web.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cards', '__first__'),
        ('api', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GameReplayUpload',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('upload_timestamp', models.DateTimeField()),
                ('is_spectated_game', models.BooleanField(default=False)),
                ('friendly_player_id', hsreplaynet.fields.PlayerIDField(choices=[(1, 1), (2, 2)], help_text='PlayerID of the friendly player (1 or 2)', null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(2)], verbose_name='Friendly Player ID')),
                ('game_server_spectate_key', models.CharField(blank=True, max_length=50, null=True)),
                ('game_server_client_id', models.IntegerField(blank=True, null=True)),
                ('replay_xml', models.FileField(upload_to=hsreplaynet.web.models._generate_replay_upload_key)),
                ('hsreplay_version', models.CharField(help_text='The HSReplay spec version of the HSReplay XML file', max_length=20, verbose_name='HSReplay version')),
                ('is_deleted', models.BooleanField(default=False, help_text='Indicates user request to delete the upload', verbose_name='Soft deleted')),
                ('exclude_in_aggregate_stats', models.BooleanField(default=False)),
                ('won', models.NullBooleanField()),
                ('disconnected', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ('global_game',),
            },
        ),
        migrations.CreateModel(
            name='GlobalGame',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('game_server_game_id', models.IntegerField(blank=True, help_text='This is the game_id from the Net.log', null=True, verbose_name='Battle.net Game ID')),
                ('game_server_address', models.GenericIPAddressField(blank=True, null=True)),
                ('game_server_port', models.IntegerField(blank=True, null=True)),
                ('hearthstone_build', models.CharField(blank=True, help_text='Patch number at the time the game was played.', max_length=50, null=True, verbose_name='Hearthstone Build Number')),
                ('match_start_timestamp', models.DateTimeField(help_text='Must be a timezone aware datetime.', verbose_name='Match Start Timestamp')),
                ('match_end_timestamp', models.DateTimeField(help_text='Must be a timezone aware datetime.', verbose_name='Match End Timestamp')),
                ('game_type', hsreplaynet.fields.IntEnumField(blank=True, choices=[(0, 'BGT_UNKNOWN'), (1, 'BGT_FRIENDS'), (2, 'BGT_RANKED_STANDARD'), (3, 'BGT_ARENA'), (4, 'BGT_VS_AI'), (5, 'BGT_TUTORIAL'), (6, 'BGT_ASYNC'), (9, 'BGT_NEWBIE'), (7, 'BGT_CASUAL_STANDARD'), (8, 'BGT_TEST1'), (10, 'BGT_TEST3'), (16, 'BGT_TAVERNBRAWL_PVP'), (17, 'BGT_TAVERNBRAWL_1P_VERSUS_AI'), (18, 'BGT_TAVERNBRAWL_2P_COOP'), (30, 'BGT_RANKED_WILD'), (31, 'BGT_CASUAL_WILD'), (32, 'BGT_LAST')], null=True, validators=[hsreplaynet.fields.IntEnumValidator(hearthstone.enums.BnetGameType)], verbose_name='Game Type')),
                ('ladder_season', models.IntegerField(blank=True, help_text='The season as calculated from the match start timestamp.', null=True, verbose_name='Ladder season')),
                ('brawl_season', models.IntegerField(default=0, help_text='The brawl season which increments every week the brawl changes.', verbose_name='Tavern Brawl Season')),
                ('scenario_id', models.IntegerField(blank=True, help_text='ID from DBF/SCENARIO.xml or Scenario cache', null=True, verbose_name='Scenario ID')),
                ('num_turns', models.IntegerField()),
                ('num_entities', models.IntegerField()),
            ],
            options={
                'ordering': ('-match_start_timestamp',),
            },
        ),
        migrations.CreateModel(
            name='GlobalGamePlayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=64, verbose_name='Player name')),
                ('player_id', hsreplaynet.fields.PlayerIDField(blank=True, choices=[(1, 1), (2, 2)], null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(2)])),
                ('account_hi', models.BigIntegerField(blank=True, help_text='The region value from account hilo', null=True, verbose_name='Account Hi')),
                ('account_lo', models.BigIntegerField(blank=True, help_text='The account ID value from account hilo', null=True, verbose_name='Account Lo')),
                ('is_ai', models.BooleanField(default=False, help_text='Whether the player is an AI.', verbose_name='Is AI')),
                ('is_first', models.BooleanField(help_text='Whether the player is the first player', verbose_name='Is first player')),
                ('rank', models.SmallIntegerField(blank=True, help_text='1 through 25, or 0 for legend.', null=True, verbose_name='Rank')),
                ('legend_rank', models.PositiveIntegerField(blank=True, null=True, verbose_name='Legend rank')),
                ('hero_premium', models.BooleanField(default=False, help_text="Whether the player's initial hero is golden.", verbose_name='Hero Premium')),
                ('final_state', hsreplaynet.fields.IntEnumField(choices=[(0, 'INVALID'), (1, 'PLAYING'), (2, 'WINNING'), (3, 'LOSING'), (4, 'WON'), (5, 'LOST'), (6, 'TIED'), (7, 'DISCONNECTED'), (8, 'CONCEDED')], default=0, validators=[hsreplaynet.fields.IntEnumValidator(hearthstone.enums.PlayState)], verbose_name='Final State')),
                ('duplicated', models.BooleanField(default=False, help_text='Set to true if the player was created from a deduplicated upload.', verbose_name='Duplicated')),
                ('deck_list', models.ForeignKey(help_text="As much as is known of the player's starting deck list.", on_delete=django.db.models.deletion.CASCADE, to='cards.Deck')),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='players', to='web.GlobalGame')),
                ('hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cards.Card')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PendingReplayOwnership',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('replay', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='web.GameReplayUpload')),
                ('token', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replay_claims', to='api.AuthToken')),
            ],
        ),
        migrations.CreateModel(
            name='SingleGameRawLogUpload',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('upload_timestamp', models.DateTimeField()),
                ('match_start_timestamp', models.DateTimeField(help_text='Uses upload_timestamp as a fallback.')),
                ('log', models.FileField(upload_to=hsreplaynet.web.models._generate_raw_log_key, validators=[hsreplaynet.web.models._validate_raw_log])),
                ('hearthstone_build', models.CharField(blank=True, max_length=50, null=True)),
                ('game_type', hsreplaynet.fields.IntEnumField(blank=True, choices=[(0, 'BGT_UNKNOWN'), (1, 'BGT_FRIENDS'), (2, 'BGT_RANKED_STANDARD'), (3, 'BGT_ARENA'), (4, 'BGT_VS_AI'), (5, 'BGT_TUTORIAL'), (6, 'BGT_ASYNC'), (9, 'BGT_NEWBIE'), (7, 'BGT_CASUAL_STANDARD'), (8, 'BGT_TEST1'), (10, 'BGT_TEST3'), (16, 'BGT_TAVERNBRAWL_PVP'), (17, 'BGT_TAVERNBRAWL_1P_VERSUS_AI'), (18, 'BGT_TAVERNBRAWL_2P_COOP'), (30, 'BGT_RANKED_WILD'), (31, 'BGT_CASUAL_WILD'), (32, 'BGT_LAST')], null=True, validators=[hsreplaynet.fields.IntEnumValidator(hearthstone.enums.BnetGameType)])),
                ('is_spectated_game', models.BooleanField(default=False)),
                ('friendly_player_id', hsreplaynet.fields.PlayerIDField(blank=True, choices=[(1, 1), (2, 2)], null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(2)])),
                ('scenario_id', models.IntegerField(blank=True, null=True)),
                ('player_1_rank', models.IntegerField(blank=True, null=True, validators=[hsreplaynet.web.models._validate_player_rank])),
                ('player_1_legend_rank', models.IntegerField(blank=True, null=True, validators=[hsreplaynet.web.models._validate_player_legend_rank])),
                ('player_1_deck_list', models.CharField(blank=True, max_length=255, null=True, validators=[hsreplaynet.web.models._validate_player_deck_list])),
                ('player_2_rank', models.IntegerField(blank=True, null=True, validators=[hsreplaynet.web.models._validate_player_rank])),
                ('player_2_legend_rank', models.IntegerField(blank=True, null=True, validators=[hsreplaynet.web.models._validate_player_legend_rank])),
                ('player_2_deck_list', models.CharField(blank=True, max_length=255, null=True, validators=[hsreplaynet.web.models._validate_player_deck_list])),
                ('game_server_reconnecting', models.NullBooleanField()),
                ('game_server_address', models.GenericIPAddressField(blank=True, null=True)),
                ('game_server_port', models.IntegerField(blank=True, null=True)),
                ('game_server_game_id', models.IntegerField(blank=True, null=True)),
                ('game_server_client_id', models.IntegerField(blank=True, null=True)),
                ('game_server_spectate_key', models.CharField(blank=True, max_length=50, null=True)),
                ('upload_token', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.AuthToken')),
            ],
        ),
        migrations.AddField(
            model_name='gamereplayupload',
            name='global_game',
            field=models.ForeignKey(help_text='References the single global game that this replay shows.', on_delete=django.db.models.deletion.CASCADE, related_name='replays', to='web.GlobalGame'),
        ),
        migrations.AddField(
            model_name='gamereplayupload',
            name='raw_log',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replays', to='web.SingleGameRawLogUpload'),
        ),
        migrations.AddField(
            model_name='gamereplayupload',
            name='upload_token',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replays', to='api.AuthToken'),
        ),
        migrations.AddField(
            model_name='gamereplayupload',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='pendingreplayownership',
            unique_together=set([('replay', 'token')]),
        ),
        migrations.AlterUniqueTogether(
            name='gamereplayupload',
            unique_together=set([('upload_token', 'global_game')]),
        ),
    ]
