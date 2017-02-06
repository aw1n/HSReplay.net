import * as React from "react";
import DeckList from "./DeckList";
import HearthstoneJSON from "hearthstonejson";
import {TableData, TableRow, ChartSeries, RenderData} from "../interfaces";
import CardTile from "./CardTile";
import ClassFilter from "./ClassFilter";
import CardDetailPieChart from "./charts/CardDetailPieChart";
import CardDetailGauge from "./charts/CardDetailGauge";
import CardDetailValue from "./charts/CardDetailValue";
import CardDetailLineChart from "./charts/CardDetailLineChart";
import CardDetailBarChart from "./charts/CardDetailBarChart";
import WinrateLineChart from "./charts/WinrateLineChart";
import PopularityLineChart from "./charts/PopularityLineChart";
import {getChartScheme} from "../helpers";
import moment from "moment";

interface Card {
	cardObj: any;
	count: number;
}

interface DeckDetailState {
	deck?: any;
	cardData?: Map<string, any>;
	selectedClasses?: Map<string, boolean>;
	tableDataAll?: TableData;
	tableDataClasses?: TableData;
	winrateSeries?: RenderData;
	averageDuration?: RenderData;
	winrateOverTime?: RenderData;
}

interface DeckDetailProps extends React.ClassAttributes<DeckDetail> {
	deckId: number;
	deckCards: string;
	deckClass: string;
	deckName?: string;
}

export default class DeckDetail extends React.Component<DeckDetailProps, DeckDetailState> {
	constructor(props: DeckDetailProps, state: DeckDetailState) {
		super(props, state);
		this.state = {
			deck: null,
			cardData: null,
			selectedClasses: null,
			tableDataAll: null,
			tableDataClasses: null,
			winrateSeries: null,
		}

		this.fetchWinrate();
		this.fetch();

		new HearthstoneJSON().getLatest((data) => {
			const map = new Map<string, any>();
			data.forEach(card => map.set(card.id, card));
			this.setState({cardData: map});
		});
	}


	render(): JSX.Element {
		let winrateLineChart = null;
		if (this.state.winrateOverTime) {
			winrateLineChart = (
				<WinrateLineChart
					data={this.state.winrateOverTime.series[0]}
					widthRatio={2}
				/>
			)
		}

		let popularityChart = null;
		if (this.state.winrateOverTime) {
			popularityChart = (
				<PopularityLineChart
					widthRatio={2}
				/>
			)
		}

		const selectedClass = this.getSelectedClass();

		const duration = this.state.averageDuration && Math.round(+this.state.averageDuration.series[0].data[0].x/60);
		return <div className="deck-detail-container">
			<div className="row">
				<div className="col-lg-3" style={{textAlign: "center", display: "flex"}}>
					<img src={STATIC_URL + "images/class-portraits/" + this.props.deckClass.toLowerCase() + ".png"} height={200}/>
					<div style={{width: "200px", margin: "5px"}}>
						<span style={{fontWeight: "bold"}}>Author</span>
						<br/>
						<span style={{fontWeight: "bold"}}>Data based on: </span>
						<span>{this.state.winrateSeries && this.state.winrateSeries.series[0].metadata["num_games"] + " replays"}</span>
						<br/>
						<span style={{fontWeight: "bold"}}>More...</span>
					</div>
				</div>
				<div className="col-lg-3">
					<div className ="row">
						<div className="chart-column col-lg-6 col-md-6 col-sm-6 col-xs-6">
							<div className="chart-wrapper">
								<CardDetailGauge
									series={this.state.winrateSeries && this.state.winrateSeries.series}
									title="Winrate"
									speedometer={true}
									scheme={getChartScheme("class")[this.props.deckClass.toLowerCase()]}
									/>
							</div>
						</div>
						<div className="chart-column col-lg-6 col-md-6 col-sm-6 col-xs-6">
							<div className="chart-wrapper">
								<CardDetailGauge
									series={[{data: [{x: "duration", y: duration}], name: ""}]}
									title="Avg. game (min)"
									speedometer={true}
									scheme={getChartScheme("class")[this.props.deckClass.toLowerCase()]}
									maxValue={15}
									reverse
									/>
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-6">
					{this.buildDeckCharts()}
				</div>
			</div>
			<div className="row">
				<div className="col-lg-4">
					<h3>Mulligan Guide</h3>
					<ClassFilter
						filters="All"
						selectionChanged={(selected) => this.setState({selectedClasses: selected})}
						multiSelect={false}
						filterStyle="icon"
						/>
					{this.buildTable(selectedClass === "ALL" ? this.state.tableDataAll : this.state.tableDataClasses, selectedClass)}
				</div>
				<div className="col-lg-8">
					<div className="row">
						<div className="col-lg-6">
							{popularityChart}
						</div>
						<div className="col-lg-6">
							{winrateLineChart}
						</div>
					</div>
				</div>
			</div>
		</div>;
	}

	buildChartSeries(): ChartSeries[] {
		const chartSeries = [];

		if (this.state.cardData && this.props.deckCards) {
			const data = {rarity: {}, cardtype: {}, cardset: {}, cost: {}};
			[0, 1, 2, 3, 4, 5, 6, 7].forEach(x => data.cost[x] = 0);
			const cards = this.props.deckCards.split(',').map(x => this.state.cardData.get(x));

			cards.forEach(card => {
				data["rarity"][card.rarity] = (data["rarity"][card.rarity] || 0) + 1;
				data["cardtype"][card.type] = (data["cardtype"][card.type] || 0) + 1;
				data["cardset"][card.set] = (data["cardset"][card.set] || 0) + 1;
				const cost = ""+Math.min(7, card.cost);
				data["cost"][cost] = (data["cost"][cost] || 0) + 1;
			});
			Object.keys(data).forEach(name => {
				const series = {
					name: name,
					data: [],
					metadata: {
						chart_scheme: name
					}
				}
				Object.keys(data[name]).forEach(value => {
					series.data.push({x: value.toLowerCase(), y: data[name][value]});
				})
				chartSeries.push(series);
			})
		}
		return chartSeries;
	}

	buildDeckCharts(): JSX.Element[] {
			const chartSeries = this.buildChartSeries();
			const rarityChart = chartSeries[0] && <CardDetailPieChart title="Rarity" data={[chartSeries[0]]}/>
			const typeChart = chartSeries[1] && <CardDetailPieChart title="Type" data={[chartSeries[1]]}/>
			const setChart = chartSeries[2] && <CardDetailPieChart title="Set" data={[chartSeries[2]]}/>
			const costChart = chartSeries[3] && <CardDetailBarChart labelX="Manacurve" widthRatio={1.8} title="Cost" data={[chartSeries[3]]}/>
			return [
				<div className ="row">
					<div className="chart-column col-lg-6 col-md-6 col-sm-6 col-xs-6">
						<div className="chart-wrapper wide">
							{costChart}
						</div>
					</div>
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							{rarityChart}
						</div>
					</div>
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							{typeChart}
						</div>
					</div>
				</div>
			];
	}

	getGroupedCards(cards: string[]): Map<string, number> {
		let map = new Map<string, number>();
		cards.forEach(c => map = map.set(c, (map.get(c) || 0) + 1));
		return map;
	}

	sortBy(prop: string): any {
		return (a, b) => a.cardObj[prop] > b.cardObj[prop] ? 1 : -1;
	}


	buildTable(tableData: TableData, key: string): JSX.Element {
		const cardRows = [];
		if (this.state.cardData) {
			if (tableData) {
				const rows = tableData.series.data[key];
				if (rows) {
					const baseWinrate = key === "ALL" ? this.getBaseWinrate() : tableData.series.metadata[key]["base_win_rate"]
					const cardList = []
					const groupedCards = this.getGroupedCards(this.props.deckCards.split(","));
					groupedCards.forEach((count, cardId) => cardList.push({cardObj: this.state.cardData.get(cardId), count: count}));
					cardList.sort(this.sortBy("name")).sort(this.sortBy("cost"));
					cardList.forEach(card => {
						const row = rows.find(r => r["card_id"] == card.cardObj.id);
						cardRows.push(this.buildCardRow(card, row, key !== "ALL", baseWinrate));
					})
				}
			}
		}

		const headers = [];
		headers.push(
			<th>Decklist</th>,
			<th>{"Winrate impact"}</th>,
			<th>% Kept</th>,
		)

		return <table className="table table-striped">
			<thead>
				<tr>
					{headers}
				</tr>
			</thead>
			<tbody>
				{cardRows}
			</tbody>
		</table>;
	}

	buildCardRow(card: any, row: TableRow, full: boolean, baseWinrate: number): JSX.Element {
		if (!card) {
			return null;
		}
		const cols = [];
		cols.push(<td>
			<div className="card-wrapper">
				<a href={"/cards/" + card.cardObj.id}>
					<CardTile height={34} card={card.cardObj} count={card.count} />
				</a>
			</div>
		</td>);
		if (row){
			const winrateDelta = +row["win_rate"] - baseWinrate;
			const tendencyStr = winrateDelta === 0 ? "    " : (winrateDelta > 0 ? "▲" : "▼");
			const multiplier = Math.min(5, Math.abs(winrateDelta));
			const color = winrateDelta > 0 ? "rgb(0, " + Math.round(150 * multiplier / 5) + ", 0)" : "rgb(" + Math.round(255 * multiplier / 5) + ", 0, 0)";
			cols.push(<td className="winrate-cell" style={{color: color}}>{tendencyStr + winrateDelta.toFixed(2) + "%"}</td>);
			cols.push(<td>{ (row["keep_percentage"]) + "%"}</td>);
		}
		return <tr className="card-table-row">
			{cols}
		</tr>;
	}

	getSelectedClass(): string {
		if (!this.state.selectedClasses) {
			return undefined;
		}
		let selectedClass = "ALL";
		this.state.selectedClasses.forEach((value, key) => {
			if(value) {
				selectedClass = key;
			}
		});
		return selectedClass;
	}

	getBaseWinrate(): number {
		return this.state.winrateSeries && this.state.winrateSeries.series[0].data[0].y;
	}

	fetchWinrate() {
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_deck_base_winrate?TimeRange=LAST_1_DAY&RankRange=ALL&GameType=RANKED_STANDARD&deck_id=" + this.props.deckId,
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			this.setState({winrateSeries: json})
		})
	}

	fetch() {
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_deck_mulligan_guide_by_class?TimeRange=LAST_1_DAY&RankRange=ALL&GameType=RANKED_STANDARD&deck_id=" + this.props.deckId,
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({tableDataClasses: json})
		})
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_deck_mulligan_guide?TimeRange=LAST_1_DAY&RankRange=ALL&GameType=RANKED_STANDARD&deck_id=" + this.props.deckId,
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({tableDataAll: json})
		})
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_deck_average_game_duration?TimeRange=LAST_1_DAY&RankRange=ALL&GameType=RANKED_STANDARD&deck_id=" + this.props.deckId,
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({averageDuration: json})
		})
		fetch(
			"https://dev.hsreplay.net/analytics/query/single_deck_winrate_over_time?TimeRange=LAST_14_DAYS&RankRange=ALL&GameType=RANKED_STANDARD&deck_id=" + this.props.deckId,
			{credentials: "include"}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			console.log(json)
			this.setState({winrateOverTime: json})
		})
	}

}
