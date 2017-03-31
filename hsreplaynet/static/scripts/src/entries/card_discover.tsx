import * as React from "react";
import * as ReactDOM from "react-dom";
import CardData from "../CardData";
import CardDiscover, { ViewType } from "../pages/CardDiscover";
import UserData from "../UserData";
import Fragments from "../components/Fragments";

const container = document.getElementById("card-container");
const viewType = container.getAttribute("data-view-type");
const user = new UserData();
const accounts = user.getAccounts();
const defaultAccount = accounts.length ? accounts[0] : accounts[0].region + "-" + accounts[0].lo;

const render = (cardData: CardData) => {
	ReactDOM.render(
		<Fragments
			defaults={{
				account: defaultAccount,
				cost: "",
				filterSparse: "",
				format: "",
				gameType: "RANKED_STANDARD",
				mechanics: "",
				playerClass: "ALL",
				race: "",
				rankRange: "ALL",
				rarity: "",
				set: "",
				sortBy: "timesPlayed",
				sortDirection: "descending",
				text: "",
				timeRange: "LAST_14_DAYS",
				type: "",
			}}
			debounce={"text"}
			immutable={!user.isPremium() ? ["rankRange", "timeRange"] : null}
		>
			<CardDiscover
				cardData={cardData}
				user={user}
				viewType={viewType as ViewType}
			/>
		</Fragments>,
		container,
	);
};

render(null);

const addMechanics = (card: any) => {
	const add = (card: any, mechanic: string) => {
		if (!card.mechanics) {
			card.mechanics = [];
		}
		if (card.mechanics.indexOf(mechanic) === -1) {
			card.mechanics.push(mechanic);
		}
	};
	if (card.overload) {
		add(card, "OVERLOAD");
	}
	if (card.referencedTags) {
		card.referencedTags.forEach((tag) => add(card, tag));
	}
};

new CardData(addMechanics).load(render);
