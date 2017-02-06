import * as React from "react";
import {VictoryAxis, VictoryArea, VictoryChart, VictoryContainer, VictoryGroup, VictoryLabel, VictoryLine, VictoryScatter, VictoryVoronoiTooltip, VictoryTooltip} from "victory";
import {ChartSeries} from "../../interfaces";
import moment from "moment";
import {getChartMetaData} from "../../helpers";
import WinLossGradient from "./gradients/WinLossGradient";

interface WinrateByTurnLineChartProps {
	data: ChartSeries[];
	widthRatio?: number;
}

export default class WinrateByTurnLineChart extends React.Component<WinrateByTurnLineChartProps, any> {
	constructor(props: WinrateByTurnLineChartProps, state: any) {
		super(props, state);
		this.state = {
			cursorPos: null,
		}
	}

	render(): JSX.Element {
		const width = 150 * (this.props.widthRatio || 3);
		const lines = [];
		const series = this.props.data.map(s => {
			return {
				data:
					s.data.map(d => {
						return {x: new Date(d.x).getTime(), y: d.y}
					}),
				name: s.name,
				metadata: s.metadata
			}
		})[0];

		const metaData = getChartMetaData(series.data, 50, false);

		lines.push(<VictoryArea
			data={series.data.map(p => {return {x: p.x, y: p.y, y0: 50}})}
			style={{data: {fill: "url(#winlossGradient)"}}}
			interpolation="step"
		/>)
		lines.push(
				<VictoryLine
					data={series.data}
					interpolation="step"
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
				domainPadding={{x: 0, y: 10}}
				padding={{left: 40, top: 30, right: 20, bottom: 30}}
				domain={{x: metaData.xDomain, y: metaData.yDomain}}
				>
				<VictoryAxis
					tickFormat={tick => "Turn " + tick}
					style={{axisLabel: {fontSize: 8}, tickLabels: {fontSize: 8}, grid: {stroke: "gray"}, axis: {visibility: "hidden"}}}/>
				<VictoryAxis
					dependentAxis
					axisLabelComponent={<VictoryLabel dx={10} />}
					tickValues={[50].concat(metaData.yDomain)}
					tickFormat={tick => tick + " %"}
					style={{axisLabel: {fontSize: 8} ,tickLabels: {fontSize: 8}, grid: {stroke: d => d === 50 ? "gray" : "transparent"}, axis: {visibility: "hidden"}}}
					/>
				{lines}
				<VictoryVoronoiTooltip
					data={series.data.map(d => {return {x: d.x, y: 50, yValue: d.y}})}
					labels={d => "Turn " + d.x + "\n" + d.yValue + "%"}
					labelComponent={tooltip}
					style={{
						labels: {fontSize: 6, padding: 5}
					}}
					/>
			</VictoryChart>
			<VictoryLabel text={"Winrate - by turn played"} style={{fontSize: 10}} textAnchor="start" verticalAnchor="start" x={0} y={10}/>
		</svg>;
	}
}
