# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-11-28 11:08
from __future__ import unicode_literals

from django.db import migrations, models


DROP_IDX_GLOBALGAMEPLAYER_CA45EDCA = """
DROP INDEX games_globalgameplayer_hero_id_ca45edca_like;
"""


DROP_IDX_GAMREPLAY_EF930F0C = """
DROP INDEX games_gamereplay_shortid_ef930f0c_like;
"""


class Migration(migrations.Migration):

	dependencies = [
		('games', '0001_initial'),
	]

	operations = [
		migrations.RunSQL(
			DROP_IDX_GLOBALGAMEPLAYER_CA45EDCA,
			None
		),
		migrations.RunSQL(
			DROP_IDX_GAMREPLAY_EF930F0C,
			None
		),
	]
