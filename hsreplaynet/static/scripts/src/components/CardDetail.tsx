import * as React from "react";
import WinrateByTurnLineChart from "./charts/WinrateByTurnLineChart";
import CardDetailBarChart from "./charts/CardDetailBarChart";
import CardDetailGauge from "./charts/CardDetailGauge";
import CardDetailValue from "./charts/CardDetailValue";
import CardDetailPieChart from "./charts/CardDetailPieChart";
import CardDetailFilter from "./CardDetailFilter";
import CardDetailDecksList from "./charts/CardDetailDecksList";
import CardRankingTable from "./CardRankingTable";
import PopularityLineChart from "./charts/PopularityLineChart";
import WinrateLineChart from "./charts/WinrateLineChart";
import LoadingIndicator from "./LoadingIndicator";
import TurnPlayedBarChart from "./charts/TurnPlayedBarChart";
import TopCardsList from "./TopCardsList";
import ClassFilter from "./ClassFilter";
import {
	FilterData, Filter, FilterElement, FilterDefinition, KeyValuePair,
	Query, RenderData, ChartSeries, ChartSeriesMetaData, DataPoint} from "../interfaces";
import HearthstoneJSON from "hearthstonejson";
import {toTitleCase, getChartScheme} from "../helpers";

interface CardDetailState {
	queries?: Query[];
	renders?: Map<string, RenderData>;
	filterData?: FilterData;
	selectedFilters?: Map<string, string>;
	queryTime?: Date;
	fetching?: boolean;
	cardData?: Map<string, any>;
	card?: any;
	classDistribution?: RenderData;
	winrateByTurn?: RenderData;
}

interface CardDetailProps extends React.ClassAttributes<CardDetail> {
	cardId: string;
	isPremium: boolean;
}

export default class CardDetail extends React.Component<CardDetailProps, CardDetailState> {
	constructor(props: CardDetailProps, state: CardDetailState) {
		super(props, state);
		this.state = {
			queries: null,
			renders: new Map<string, RenderData>(),
			filterData: null,
			selectedFilters: new Map<string, string>(),
			queryTime: null,
			fetching: true,
			cardData: new Map<string, any>(),
			card: null,
		}

		// this.fetchFilters();
		this.fetch();

		new HearthstoneJSON().getLatest((data) => {
			const map = new Map<string, any>();
			let thisCard = null;
			data.forEach(card => {
				map.set(card.id, card);
				if (card.id == this.props.cardId) {
					thisCard = card;
				}
			});
			this.setState({cardData: map, card: thisCard});
		});
	}

	componentDidUpdate() {
		if (this.state.fetching) {
			window.setTimeout(() => this.forceUpdate(), 1000);
		}
	}

	render(): JSX.Element {
		let classChart = null;
		if (this.state.classDistribution) {
			classChart = (
				<CardDetailPieChart
					percent
					data={this.state.classDistribution.series}
					title={"Class Popularity"}
					scheme={getChartScheme("class")}
					textPrecision={2}
					sortByValue
					removeEmpty
				/>
			);
		}

		let turnWinrateChart = null;
		if (this.state.winrateByTurn) {
			turnWinrateChart = (
				<WinrateByTurnLineChart
					data={this.state.winrateByTurn.series}
					widthRatio={2}
				/>
			)
		}

		let popularityChart = null;
		if (this.state.winrateByTurn) {
			popularityChart = (
				<PopularityLineChart
					widthRatio={2}
				/>
			)
		}

		let winrateChart = null;
		if (this.state.winrateByTurn) {
			winrateChart = (
				<WinrateLineChart
					widthRatio={2}
				/>
			)
		}

		let turnPlayedChart = null;
		if (this.state.winrateByTurn) {
			turnPlayedChart = (
				<TurnPlayedBarChart
					widthRatio={2}
				/>
			)
		}

		let topCardsPlayed = (
			<CardRankingTable
				cardData={this.state.cardData}
				numRows={5}
				tableRows={[
					{card_id: "KAR_077", rank: "1", popularity: "7.4"},
					{card_id: "KAR_075", rank: "2", popularity: "6.5"},
					{card_id: "EX1_166", rank: "3", popularity: "3.8"},
					{card_id: "GAME_005", rank: "4", popularity: "2.3"},
					{card_id: "NEW1_003", rank: "5", popularity: "1.9"},
				]}
			/>
		);

		return <div className="card-detail-container">
			<div className="row">
				<div className="col-lg-4" style={{textAlign: "center"}}>
					<img src={"http://media.services.zam.com/v1/media/byName/hs/cards/enus/" + this.props.cardId + ".png"} height="400px" />
					<div className="row">
					</div>
					<div className="btn-group" role="group">
						<button type="button" className="btn btn-primary">Standard</button>
						<button type="button" className="btn btn-default disabled">Wild</button>
						<button type="button" className="btn btn-default disabled">Arena</button>
					</div>
					<div style={{maxWidth: "250px", margin: "0 auto"}}>
						{classChart}
					</div>
				</div>
				<div className="col-lg-8">
					<h1 style={{paddingTop: "40px"}}>{this.state.card && this.state.card.name}</h1>
					<h5>{this.state.card && (toTitleCase(this.state.card.playerClass) + " " + toTitleCase(this.state.card.type))}</h5>
					<div className="row">
						<div className="col-lg-6 col-md-6">
							{popularityChart}
						</div>
						<div className="col-lg-6 col-md-6">
							{winrateChart}
						</div>
					</div>
					<div className="row">
						<div className="col-lg-6 col-md-6">
							{turnPlayedChart}
						</div>
						<div className="col-lg-6 col-md-6">
							{turnWinrateChart}
						</div>
					</div>
					<div className="row">
						<div className="col-lg-6 col-md-6">
							<h4>Top cards played on same turn</h4>	
							{topCardsPlayed}
						</div>
						<div className="col-lg-6 col-md-6">
							<h4>Most popular targets</h4>	
							{topCardsPlayed}
						</div>
					</div>
					<div style={{display: "flex", justifyContent: "center", paddingTop: "30px"}}>
						<LoadingIndicator height={20}/>
					</div>
				</div>
			</div>
		</div>;
	}

	// fetchFilters(): void {
	// 	fetch("https://dev.hsreplay.net/analytics/filters", {
	// 		credentials: "include",
	// 	}).then((response) => {
	// 		return response.json();
	// 	}).then((json: any) => {
	// 		const defaultFilters = new Map<string, string>();
	// 		const data = json as FilterData;
	// 		data.filters.forEach(filter => {
	// 			defaultFilters.set(filter.name, filter.elements.find(x => x.is_default).name);
	// 		})
	// 		defaultFilters.set("TimeRange", "CURRENT_SEASON");
	// 		this.setState({filterData: json, selectedFilters: defaultFilters})
	// 		this.fetchQueries();
	// 	});
	// }

	// fetchQueries(): void {
	// 	fetch("https://dev.hsreplay.net/analytics/inventory/card/" + this.props.cardId, {
	// 		credentials: "include",
	// 	}).then((response) => {
	// 		return response.json();
	// 	}).then((json: any) => {
	// 		console.log("received queries for", this.props.cardId, ":", json.map(x => x.endpoint));
	// 		this.state.queries = json;
	// 		this.setState({fetching: true, queryTime: new Date()})
	// 		this.state.queries.filter(x => x.avg_query_duration_seconds).forEach(query => {
	// 			this.fetchQuery(query);
	// 		})
	// 		this.state.queries.filter(x => !x.avg_query_duration_seconds).forEach(query => {
	// 			this.fetchQuery(query);
	// 		})
	// 	});
	// }

	// fetchQuery(query: Query): void {
	// 	if (query.endpoint === "/analytics/query/single_card_winrate_when_drawn_by_turn") {
	// 		console.warn("SKIPPING", query.endpoint)
	// 		return;
	// 	}
	// 	let url = "https://dev.hsreplay.net" + query.endpoint + "?"
	// 		+ query.params.map(param => param+ "=" + this.resolveParam(param))
	// 			.reduce((prev, curr) => prev + "&" + curr);
	// 	console.log("Fetching", query.endpoint);
	// 	fetch(url, {
	// 		credentials: "include"
	// 	}).then((response) => {
	// 		return response.json();
	// 	}).then((json: any) => {
	// 		this.setState({
	// 			renders: this.state.renders.set(query.endpoint, json),
	// 			fetching: false
	// 		});
	// 	}).catch(() => {
	// 		this.setState({fetching: false})
	// 	});
	// }

	fetch() {
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_card_winrate_by_turn?card_id=" + this.props.cardId + "&TimeRange=CURRENT_SEASON&RankRange=ALL&GameType=RANKED_STANDARD",
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({winrateByTurn: json})
		})
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_card_class_distribution_by_play_count?card_id=" + this.props.cardId + "&TimeRange=CURRENT_SEASON&RankRange=ALL&GameType=RANKED_STANDARD",
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({classDistribution: json})
		})
	}

	resolveParam(param: string): string {
		if (param === "card_id") {
			return this.props.cardId;
		}
		return this.state.selectedFilters.get(param);
	}
}
