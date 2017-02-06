import * as React from "react";
import * as ReactDOM from "react-dom";
import {image, cardArt} from "../helpers";
import DeckDetail from "../components/DeckDetail";


const deckId = +document.getElementById("deck-info").getAttribute("deck-id");
const cards = document.getElementById("deck-info").getAttribute("deck-cards");
const deckClass = document.getElementById("deck-info").getAttribute("deck-class");
ReactDOM.render(
	<DeckDetail
		deckId={deckId}
		deckCards={cards}
		deckClass={deckClass}
	/>,
	document.getElementById("deck-container")
);
