import moment from "moment";
import * as React from "react";
import {
	VictoryArea, VictoryAxis, VictoryChart, VictoryLabel,
} from "victory";
import {VictoryVoronoiContainer} from "victory";
import {getChartMetaData, sliceZeros, toDynamicFixed, toTimeSeries} from "../../helpers";
import {RenderData} from "../../interfaces";
import ChartHighlighter from "./ChartHighlighter";

interface PopularityLineChartProps extends React.ClassAttributes<PopularityLineChart>{
	data?: RenderData;
	maxYDomain: 10 | 100;
	widthRatio?: number;
}

export default class PopularityLineChart extends React.Component<PopularityLineChartProps, any> {
	private readonly colorMin = "rgba(0, 196, 255, 1.0)";
	private readonly colorMax = "rgba(255, 128, 0, 1.0)";

	render(): JSX.Element {
		const width = 150 * (this.props.widthRatio || 3);

		const series = toTimeSeries(this.props.data.series.find((x) => x.name === "popularity_over_time") || this.props.data.series[0]);
		const metadata = getChartMetaData(series.data, undefined, true, 1);
		metadata.yDomain = [0, this.props.maxYDomain];

		return (
			<svg viewBox={"0 0 " + width + " 150"}>
				<defs>
					<linearGradient id="popularity-gradient" x1="50%" y1="100%" x2="50%" y2="0%">
						<stop stopColor="rgba(255, 255, 255, 0)" offset={0}/>
						<stop stopColor="rgba(0, 128, 255, 0.6)" offset={1}/>
					</linearGradient>
				</defs>
				<VictoryChart
					height={150}
					width={width}
					domainPadding={{x: 0, y: 10}}
					domain={{x: metadata.xDomain, y: metadata.yDomain}}
					padding={{left: 40, top: 10, right: 20, bottom: 30}}
					containerComponent={<VictoryVoronoiContainer
						dimension="x"
						labels={(d) => moment(d.x).format("YYYY-MM-DD") + ": " + sliceZeros(toDynamicFixed(d.y, 2)) + "%"}
						labelComponent={<ChartHighlighter xCenter={metadata.xCenter} />}
					/>}
				>
					<VictoryAxis
						scale="time"
						tickValues={metadata.seasonTicks}
						tickFormat={(tick) => moment(tick).add(1, "day").format("MMMM")}
						style={{axisLabel: {fontSize: 8}, tickLabels: {fontSize: 8}, grid: {stroke: "gray"}, axis: {visibility: "hidden"}}}
					/>
					<VictoryAxis
						dependentAxis
						scale="sqrt"
						label={"Popularity"}
						axisLabelComponent={<VictoryLabel dy={-1} dx={20} />}
						tickValues={this.props.maxYDomain === 10 ? [0, 0.5, 2, 5, 10] : [0, 5, 20, 50, 100]}
						tickFormat={(tick) => metadata.toFixed(tick) + "%"}
						style={{axisLabel: {fontSize: 8} , tickLabels: {fontSize: 8}, grid: {stroke: (d) => d === metadata.yCenter ? "gray" : "lightgray"}, axis: {visibility: "hidden"}}}
					/>
					<VictoryArea
						data={series.data.map((p) => {return {x: p.x, y: p.y, _y0: metadata.yDomain[0]}; })}
						style={{data: {fill: "url(#popularity-gradient)", stroke: "black", strokeWidth: 0.3}}}
						interpolation="monotoneX"
					/>
				</VictoryChart>
			</svg>
		);
	}
}
