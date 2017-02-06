import * as React from "react";
import {ChartSeries} from "../../interfaces";

interface CardDetailDecksListState {
}

interface CardDetailDecksListProps extends React.ClassAttributes<CardDetailDecksList> {
	series?: ChartSeries[];
	title?: string;
}

export default class CardDetailDecksList extends React.Component<CardDetailDecksListProps, CardDetailDecksListState> {
	constructor(props: CardDetailDecksListProps, state: CardDetailDecksListState) {
		super(props, state);
		this.state = {
		}
	}

	render(): JSX.Element {
		const rows = [];
		console.log(this.props.series);
		const data = this.props.series[0].data;
		Object.keys(data).forEach(key => {
			data[key].forEach(val => {
				rows.push(
					<a href={"/cards/decks/" + val["deck_id"]}>
						<div style={{display: "flex"}}>
							<span style={{lineHeight: "34px", paddingRight: "10px", color: "black", fontWeight: "bold"}}>{key + " " + val["num_games"]}</span>
						</div>
					</a>
				)
			})
		})
		return <div>
			{rows}
		</div>;
	}
}
