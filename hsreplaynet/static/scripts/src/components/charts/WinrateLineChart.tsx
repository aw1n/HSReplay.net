import * as React from "react";
import {VictoryAxis, VictoryArea, VictoryChart, VictoryContainer, VictoryGroup, VictoryLabel, VictoryLine, VictoryScatter, VictoryVoronoiTooltip, VictoryTooltip} from "victory";
import {ChartSeries} from "../../interfaces";
import moment from "moment";
import {getChartMetaData} from "../../helpers";
import WinLossGradient from "./gradients/WinLossGradient";

interface WinrateLineChartProps {
	data?: ChartSeries;
	widthRatio?: number;
}

export default class WinrateLineChart extends React.Component<WinrateLineChartProps, any> {
	constructor(props: WinrateLineChartProps, state: any) {
		super(props, state);
		this.state = {
			cursorPos: null,
		}
	}

	render(): JSX.Element {
		const width = 150 * (this.props.widthRatio || 3);
		const lines = [];
		const series = {
			data: (this.props.data || this.data).data.map(d => {
				return {x: new Date(d.x).getTime(), y: d.y}
			}),
			name: this.data.name,
			metadata: this.data.metadata
		}

		const metaData = getChartMetaData(series.data, 50, true);

		lines.push(<VictoryArea
			data={series.data.map(p => {return {x: p.x, y: p.y, y0: 50}})}
			style={{data: {fill: "url(#winlossGradient)"}}}
			interpolation="basis"
		/>)

		lines.push(
			<VictoryLine
				data={series.data}
				interpolation="basis"
				style={{data: {strokeWidth: 1}}}/>
		)

		const tooltip = <VictoryTooltip
			cornerRadius={0}
			pointerLength={0}
			padding={1}
			dx={d => d.x > metaData.xCenter ? -40 : 40}
			dy={-12}
			flyoutStyle={{
				stroke: "gray",
				fill: "rgba(255, 255, 255, 0.85)"
			}}
		/>;

		return <svg viewBox={"0 0 " + width + " 150"}>
			<defs>
				<WinLossGradient id="winlossGradient" metadata={metaData} />
			</defs>
			<VictoryChart
				height={150}
				width={width}
				containerComponent={<VictoryContainer title={""}/>}
				padding={{left: 40, top: 30, right: 20, bottom: 30}}
				domain={{x: metaData.xDomain, y: metaData.yDomain}}
				domainPadding={{x: 0, y: 15}}
				>
				<VictoryAxis
					scale="time"
					padding={[0, 10]}
					tickValues={metaData.seasonTicks}
					tickFormat={tick => tick == metaData.seasonTicks[0] ? "Last season" : "This season"}
					style={{axisLabel: {fontSize: 8}, tickLabels: {fontSize: 8}, grid: {stroke: "gray"}, axis: {visibility: "hidden"}}}/>
				<VictoryAxis
					dependentAxis
					axisLabelComponent={<VictoryLabel dx={10} />}
					tickValues={[50].concat(metaData.yDomain)}
					tickFormat={tick => tick + "%"}
					style={{axisLabel: {fontSize: 8} ,tickLabels: {fontSize: 8}, grid: {stroke: d => d === 50 ? "gray" : "transparent"}, axis: {visibility: "hidden"}}}
					/>
				{lines}
				<VictoryVoronoiTooltip
					data={series.data}
					labels={d => moment(d.x).format("YYYY-MM-DD") + "\n" + d.y + "%"}
					labelComponent={tooltip}
					style={{
						labels: {fontSize: 6, padding: 5}
					}}
					/>
			</VictoryChart>
			<VictoryLabel text={"Winrate - last 2 months"} style={{fontSize: 10}} textAnchor="start" verticalAnchor="start" x={0} y={10}/>
		</svg>;
	}

	readonly data: ChartSeries = {
		data: [
			{x: "2016-12-25", y: 50},
			{x: "2017-01-20", y: 50},
			{x: "2017-01-21", y: 51},
			{x: "2017-01-22", y: 51},
			{x: "2017-01-23", y: 52},
			{x: "2017-01-24", y: 53},
			{x: "2017-01-25", y: 50},
			{x: "2017-01-26", y: 48},
			{x: "2017-01-27", y: 47},
			{x: "2017-01-28", y: 48},
			{x: "2017-01-29", y: 45},
			{x: "2017-01-30", y: 44},
			{x: "2017-01-31", y: 47},
			{x: "2017-02-01", y: 46},
			{x: "2017-02-02", y: 41},
			{x: "2017-02-03", y: 42},
			{x: "2017-02-04", y: 45},
			{x: "2017-02-05", y: 46},
			{x: "2017-02-06", y: 45},
		],
		name: "foo",
		metadata: {}
	}
}
