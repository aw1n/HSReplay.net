import {ChartScheme, ChartSchemeType} from "./interfaces";

export function staticFile(file: string) {
	return STATIC_URL + file;
}

export function joustStaticFile(file: string) {
	return JOUST_STATIC_URL + file;
}

export function image(image: string) {
	return staticFile("images/" + image);
}

export function joustAsset(asset: string) {
	return joustStaticFile("assets/" + asset);
}

export function cardArt(cardArt: string) {
	return HEARTHSTONE_ART_URL + cardArt + ".jpg";
}

export function toTitleCase(str: string) {
	return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1).toLowerCase();
}

export function getHeroColor(hero: string): string {
	if (!hero) {
		return;
	}
	switch (hero.toUpperCase()) {
		case "DRUID": return "#FF7D0A";
		case "HUNTER": return "#ABD473";
		case "MAGE": return "#69CCF0";
		case "PALADIN": return "#F58CBA";
		case "PRIEST": return "#D2D2D2";
		case "ROGUE": return "#FFF01a";
		case "SHAMAN": return "#0070DE";
		case "WARLOCK": return "#9482C9";
		case "WARRIOR": return "#C79C6E";
		case "ALL": return "#808080";
		case "NEUTRAL": return "#808080";
	}
}

export function getChartScheme(theme: ChartSchemeType): ChartScheme {
	switch (theme) {
		case "rarity":
			return rarityScheme;
		case "cardtype":
			return cardtypeScheme;
		case "cardset":
			return cardsetScheme;
		case "cost":
			return costScheme;
		case "class":
			return classColorScheme;
	}
	return null;
}

const costScheme: ChartScheme = {
	"0": {
		fill: "rgba(204, 204, 255, 0.5)",
		stroke: "rgba(204, 204, 255, 0.9)",
	},
	"1": {
		fill: "rgba(153, 153, 255, 0.5)",
		stroke: "rgba(153, 153, 255, 0.9)",
	},
	"2": {
		fill: "rgba(102, 102, 255, 0.5)",
		stroke: "rgba(102, 102, 255, 0.9)",
	},
	"3": {
		fill: "rgba(51, 51, 255, 0.5)",
		stroke: "rgba(51, 51, 255, 0.9)",
	},
	"4": {
		fill: "rgba(0, 0, 255, 0.5)",
		stroke: "rgba(0, 0, 255, 0.9)",
	},
	"5": {
		fill: "rgba(0, 0, 204, 0.5)",
		stroke: "rgba(0, 0, 204, 0.9)",
	},
	"6": {
		fill: "rgba(0, 0, 153, 0.5)",
		stroke: "rgba(0, 0, 153, 0.9)",
	},
	"7": {
		fill: "rgba(0, 0, 102, 0.5)",
		stroke: "rgba(0, 0, 102, 0.9)",
		name: "7+",
	},
};

const rarityScheme: ChartScheme = {
	"free": {
		fill: "rgba(211, 211, 211, 0.5)",
		stroke: "rgba(211, 211, 211, 0.9)",
		name: "Free",
	},
	"common": {
		fill: "rgba(169, 169, 169, 0.5)",
		stroke: "rgba(169, 169, 169, 0.9)",
		name: "Common",
	},
	"rare": {
		fill: "rgba(0, 112, 221, 0.5)",
		stroke: "rgba(0, 112, 221, 0.9)",
		name: "Rare",
	},
	"epic": {
		fill: "rgba(163, 53, 238, 0.5)",
		stroke: "rgba(163, 53, 238, 0.9)",
		name: "Epic",
	},
	"legendary": {
		fill: "rgba(255, 128, 0, 0.5)",
		stroke: "rgba(255, 128, 0, 0.9)",
		name: "Legendary",
	}
};

const cardtypeScheme: ChartScheme = {
	"minion": {
		fill: "rgba(171, 212, 115, 0.5)",
		stroke: "rgba(171, 212, 115, 0.9)",
		name: "Minion",
	},
	"spell": {
		fill: "rgba(0, 112, 222, 0.5)",
		stroke: "rgba(0, 112, 222, 0.9)",
		name: "Spell",
	},
	"weapon": {
		fill: "rgba(196, 30, 59, 0.5)",
		stroke: "rgba(196, 30, 59, 0.9)",
		name: "Weapon",
	},
};

const cardsetScheme: ChartScheme = {
	"core": {
		fill: "rgba(211, 211, 211, 0.5)",
		stroke: "rgba(211, 211, 211, 0.9)",
		name: "Basic",
	},
	"expert1": {
		fill: "rgba(230, 204, 128, 0.5)",
		stroke: "rgba(230, 204, 128, 0.9)",
		name: "Classic",
	},
	"naxx": {
		fill: "rgba(55, 219, 0, 0.5)",
		stroke: "rgba(55, 219, 0, 0.9)",
		name: "Curse of Naxxramas",
	},
	"gvg": {
		fill: "rgba(255, 212, 0, 0.5)",
		stroke: "rgba(255, 212, 0, 0.9)",
		name: "Goblins vs Gnomes",
	},
	"brm": {
		fill: "rgba(255, 116, 0, 0.5)",
		stroke: "rgba(255, 116, 0, 0.9)",
		name: "Blackrock Mountain",
	},
	"tgt": {
		fill: "rgba(153, 0, 0, 0.5)",
		stroke: "rgba(153, 0, 0, 0.9)",
		name: "The Grand Tournament",
	},
	"loe": {
		fill: "rgba(0, 200, 200, 0.5)",
		stroke: "rgba(0, 200, 200, 0.9)",
		name: "League of Explorers",
	},
	"og": {
		fill: "rgba(170, 0, 255, 0.5)",
		stroke: "rgba(180, 0, 255, 0.9)",
		name: "Whispers of the Old Gods",
	},
	"kara": {
		fill: "rgba(255, 128, 229, 0.5)",
		stroke: "rgba(255, 128, 229, 0.9)",
		name: "One Night in Karazhan",
	},
	"gangs": {
		fill: "rgba(65, 27, 136, 0.5)",
		stroke: "rgba(65, 27, 136, 0.9)",
		name: "Mean Streets of Gadgetzan",
	},
};

const classColorScheme: ChartScheme = {
	"all": {
		stroke: "rgba(169, 169, 169, 1)",
		fill: "rgba(169, 169, 169, 0.7)",
		name: "All",
	},
	"neutral": {
		stroke: "rgba(169, 169, 169, 1)",
		fill: "rgba(169, 169, 169, 0.7)",
		name: "Neutral",
	},
	"druid": {
		stroke: "rgba(255, 125, 10, 1)",
		fill: "rgba(255, 125, 10, 0.7)",
		name: "Druid",
	},
	"hunter": {
		stroke: "rgba(171, 212, 114, 1)",
		fill: "rgba(171, 212, 114, 0.7)",
		name: "Hunter",
	},
	"mage": {
		stroke: "rgba(105, 204, 240, 1)",
		fill: "rgba(105, 204, 240, 0.7)",
		name: "Mage",
	},
	"paladin": {
		stroke: "rgba(245, 140, 186, 1)",
		fill: "rgba(245, 140, 186, 0.7)",
		name: "Paladin",
	},
	"priest": {
		stroke: "rgba(210, 210, 210, 1)",
		fill: "rgba(210, 210, 210, 0.7)",
		name: "Priest",
	},
	"rogue": {
		stroke: "rgba(255, 217, 26, 1)",
		fill: "rgba(255, 240, 26, 0.7)",
		name: "Rogue",
	},
	"shaman": {
		stroke: "rgba(0, 122, 222, 1)",
		fill: "rgba(0, 122, 222, 0.7)",
		name: "Shaman",
	},
	"warlock": {
		stroke: "rgba(148, 130, 201, 1)",
		fill: "rgba(148, 130, 201, 0.7)",
		name: "Warlock",
	},
	"warrior": {
		stroke: "rgba(199, 156, 110, 1)",
		fill: "rgba(199, 156, 110, 0.7)",
		name: "Warrior",
	},
};

export const setNames = {
	"core": "Basic",
	"expert1": "Classic",
	"reward": "Reward",
	"promo": "Promotion",
	"naxx": "Curse of Naxxramas",
	"gvg": "Goblins vs Gnomes",
	"brm": "Blackrock Mountain",
	"tgt": "The Grand Tournament",
	"tb": "Tavern Brawl",
	"loe": "League of Explorers",
	"og": "Whispers of the Old Gods",
	"kara": "One Night in Karazhan",
	"gangs": "Mean Streets of Gadgetzan"
};

