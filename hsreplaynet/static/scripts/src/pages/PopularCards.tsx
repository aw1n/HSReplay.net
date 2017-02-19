import * as React from "react";
import ClassIcon from "../components/ClassIcon";
import { TableData, TableQueryData, ChartSeries } from "../interfaces";
import CardTile from "../components/CardTile";
import ClassFilter from "../components/ClassFilter";
import CardDetailPieChart from "../components/charts/CardDetailPieChart";
import CardDetailBarChart from "../components/charts/CardDetailBarChart";
import CardRankingTable from "../components/CardRankingTable";
import LoadingIndicator from "../components/LoadingIndicator";
import {setNames, toTitleCase, toPrettyNumber} from "../helpers";
import QueryManager from "../QueryManager";

interface PopularCardsState {
	topCardsIncluded?: Map<string, TableData>;
	topCardsPlayed?: Map<string, TableData>;
	selectedClasses?: Map<string, boolean>;
	numRowsVisible?: number;
	error?: string;
	availableIncludedDates?: string[];
	availablePlayedDates?: string[];
	availableDates?: string[]
	index?: number;
}

interface PopularCardsProps extends React.ClassAttributes<PopularCards> {
	cardData: Map<string, any>;
}

export default class PopularCards extends React.Component<PopularCardsProps, PopularCardsState> {
	private readonly queryManager: QueryManager = new QueryManager();

	constructor(props: PopularCardsProps, state: PopularCardsState) {
		super(props, state);
		this.state = {
			topCardsIncluded: new Map<string, TableData>(),
			topCardsPlayed: new Map<string, TableData>(),
			selectedClasses: new Map<string, boolean>(),
			numRowsVisible: 12,
			error: null,
			availableIncludedDates: null,
			availablePlayedDates: null,
			availableDates: [],
			index: 0,
		}

		this.queryManager.fetch(
			"/analytics/available-data/card_played_popularity_report",
			(data) => {
				if (data === "error") {
					this.fetchingError();
				}
				else {
					this.state.availablePlayedDates = data;
					this.buildAvailableDates();
				}
			}
		);
		this.queryManager.fetch(
			"/analytics/available-data/card_included_popularity_report",
			(data) => {
				if (data === "error") {
					this.fetchingError();
				}
				else {
					this.state.availableIncludedDates = data;
					this.buildAvailableDates();
				}
			}
		);
	}

	buildAvailableDates() {
		if (this.state.availableIncludedDates && this.state.availablePlayedDates) {
			const availableDates = this.state.availableIncludedDates.filter(x => this.state.availablePlayedDates.indexOf(x) !== -1);
			if (availableDates.length === 0) {
				this.setState({error: "No data available. Please check back later."});
			}
			else {
				this.state.availableDates = availableDates;
				this.loadDate(0);
			}
		}
	}

	loadDate(index: number) {
		const date = this.state.availableDates.length > index && this.state.availableDates[index];
		const prevDate = this.state.availableDates.length + 1 > index && this.state.availableDates[index + 1];
		const hasDate = this.state.topCardsPlayed.has(date) || this.state.topCardsIncluded.has(date);
		const hasPrevDate = this.state.topCardsPlayed.has(prevDate) || this.state.topCardsIncluded.has(prevDate);
		if (!hasDate) {
			this.fetchDate(index);
		}
		if (!hasPrevDate) {
			this.fetchDate(index + 1);
		}
	}

	fetchDate(index: number) {
		if (this.state.availableDates.length <= index) {
			return;
		}
		const date = this.state.availableDates[index];

		this.queryManager.fetch(
			"/analytics/query/card_played_popularity_report?query_date=" + date,
			(data) => this.setState({topCardsPlayed: this.state.topCardsPlayed.set(date, data)})
		)
		this.queryManager.fetch(
			"/analytics/query/card_included_popularity_report?query_date=" + date,
			(data) => this.setState({topCardsIncluded: this.state.topCardsIncluded.set(date, data)})
		)
	}

	fetchingError() {
		this.setState({error: "Oops. We seem to be having some technical difficulties. Please try again later."});
	}

	render(): JSX.Element {
		const showMoreButton = this.state.numRowsVisible >= 100 ? null
			: <button className="btn btn-default"
			type="button"
			onClick={() => this.setState({numRowsVisible: Math.max(15, this.state.numRowsVisible) * 2})}>
			{"Show more..."}
		</button>;

		const date = this.state.availableDates.length > this.state.index &&  this.state.availableDates[this.state.index];
		const prevDate = this.state.availableDates.length + 1 > this.state.index && this.state.availableDates[this.state.index + 1];
		const topCardsIncluded = date ? this.state.topCardsIncluded.get(date) : "loading";
		const topCardsPlayed = date ? this.state.topCardsPlayed.get(date) : "loading";
		const prevTopCardsIncluded = prevDate ? this.state.topCardsIncluded.get(prevDate) : "loading";
		const prevTopCardsPlayed = prevDate ? this.state.topCardsPlayed.get(prevDate) : "loading";
		const error = topCardsIncluded === "error" || topCardsPlayed === "error";
		const loaded = !error && (topCardsIncluded !== "loaded" && topCardsPlayed !== "loaded");

		let content = null;

		if (this.state.error) {
			content = <div className="error-message">
				<h3>{this.state.error}</h3>
			</div>;
		}
		else if (!loaded || !topCardsIncluded || !topCardsPlayed) {
			content = <div className="loading-message">
				<h3>Loading...</h3>
				<div className="loading-wrapper">
					<LoadingIndicator height={20}/>
				</div>
			</div>;
		}
		else {
			const selectedClass = this.getSelectedClass();
			const chartSeries = this.buildChartSeries(topCardsIncluded as TableQueryData);
			content = [
				<div className ="row">
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							<CardDetailPieChart percent title="Rarity" renderData={chartSeries.length ? {series: [chartSeries[0]]} : "loading"}/>
						</div>
					</div>
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							<CardDetailPieChart percent title="Type" renderData={chartSeries.length ? {series: [chartSeries[1]]} : "loading"}/>
						</div>
					</div>
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							<CardDetailPieChart percent title="Set" renderData={chartSeries.length ? {series: [chartSeries[2]]} : "loading"}/>
						</div>
					</div>
					<div className="chart-column col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<div className="chart-wrapper">
							<CardDetailPieChart percent title="Cost" renderData={chartSeries.length ? {series: [chartSeries[3]]} : "loading"}/>
						</div>
					</div>
				</div>,
				<div className="row">
					<div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
						<h2>Most included cards</h2>
						<div>
							<CardRankingTable 
								numRows={this.state.numRowsVisible}
								tableData={topCardsIncluded}
								prevTableData={prevTopCardsIncluded}
								dataKey={selectedClass}
								cardData={this.props.cardData}
							/>
						</div>
					</div>
					<div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
						<h2>Most played cards</h2>
						<div>
							<CardRankingTable 
								numRows={this.state.numRowsVisible}
								tableData={topCardsPlayed}
								prevTableData={prevTopCardsPlayed}
								dataKey={selectedClass}
								cardData={this.props.cardData}
							/>
						</div>
					</div>
				</div>,
				<div className="button-more-wrapper row">
					{showMoreButton}
				</div>
			];
		}

		const hasNext = this.state.index > 0;
		const hasPrevious = this.state.index < this.state.availableDates.length - 1;
		const previousClassName = "btn btn-default" + (hasPrevious ? "" : " disabled");
		const nextClassName = "btn btn-default" + (hasNext ? "" : " disabled");

		const loadPrevious = () => {
			if (hasPrevious) {
				const nextIndex = this.state.index + 1;
				this.setState({index: nextIndex});
				this.loadDate(nextIndex);
				this.loadDate(nextIndex + 1);
			}
		}
		const loadNext = () => {
			if (hasNext) {
				const nextIndex = this.state.index - 1;
				this.setState({index: nextIndex});
				this.loadDate(nextIndex);
			}
		}

		const replayCount = topCardsPlayed && topCardsPlayed !== "error"
			&& topCardsPlayed !== "loading" && toPrettyNumber(+topCardsPlayed.series.metadata["total_games"]);

		return <div className="report-container" id="card-popularity-report">
			<div className="row">
				<div className="info-column col-lg-4">
					<img className="title-card" src={STATIC_URL + "images/title-cards/ranked-standard-popularity.png"}/>
					<div className="controls-wrapper row">
						<div className="date-control-wrapper col-md-12">
							<button type="button" className={previousClassName} onClick={loadPrevious}>
								<span className="glyphicon glyphicon-chevron-left"/>
							</button>
							<div>
								{date}
							</div>
							<button type="button" className={nextClassName} onClick={loadNext}>
								<span className="glyphicon glyphicon-chevron-right"/>
							</button>
						</div>
						<div className="col-md-12">
							{!this.state.error && loaded ? ("Based on " + replayCount + " replays") : null}
						</div>
						<div className="col-md-12">
							<ClassFilter
								filters="AllNeutral"
								selectionChanged={(selected) => this.setState({selectedClasses: selected})}
								multiSelect={false}
								hideAll
							/>
						</div>
					</div>
					<div className="ad-wrapper">
					</div>
				</div>
				<div className="content-wrapper col-lg-8">
					{content}
				</div>
			</div>
			<div className="row">
			</div>
		</div>;
	}

	buildChartSeries(topCardsIncluded: TableQueryData): ChartSeries[] {
		const chartSeries = [];

		if (this.props.cardData && this.state.topCardsIncluded) {
			const selectedClass = this.getSelectedClass();
			const rows = topCardsIncluded.series.data[selectedClass];
			const data = {rarity: {}, cardtype: {}, cardset: {}, cost: {}};
			const totals = {rarity: 0, cardtype: 0, cardset: 0, cost: 0};
			rows.forEach(row => {
				const card = this.props.cardData.get(row["card_id"])
				const value = +row["popularity"]
				data["rarity"][card.rarity] = (data["rarity"][card.rarity] || 0) + value;
				totals["rarity"] += value;
				data["cardtype"][card.type] = (data["cardtype"][card.type] || 0) + value;
				totals["cardtype"] += value;
				data["cardset"][card.set] = (data["cardset"][card.set] || 0) + value;
				totals["cardset"] += value;
				const cost = ""+Math.min(7, card.cost);
				data["cost"][cost] = (data["cost"][cost] || 0) + value;
				totals["cost"] += value;
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
					series.data.push({x: value.toLowerCase(), y: Math.ceil(100.0 * data[name][value] / totals[name])});
				})
				chartSeries.push(series);
			})
		}
		return chartSeries;
	}

	getSelectedClass(): string {
		let selectedClass = "ALL";
		this.state.selectedClasses.forEach((value, key) => {
			if(value) {
				selectedClass = key;
			}
		});
		return selectedClass;
	}
}