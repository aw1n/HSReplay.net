import * as React from "react";
import {VictoryAxis, VictoryArea, VictoryChart, VictoryContainer, VictoryGroup, VictoryLabel, VictoryLine, VictoryScatter, VictoryVoronoiTooltip} from "victory";
import {ChartSeries} from "../../interfaces";

interface CardDetailLineChartProps {
	data: ChartSeries[];
	title: string;
	domainY?: [number, number];
	domainX?: [number, number];
	labelX?: string;
	labelY?: string;
	timeData?: boolean;
	widthRatio?: number;
}

export default class CardDetailLineChart extends React.Component<CardDetailLineChartProps, any> {
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
		});
		series.forEach(series => {
			lines.push(<VictoryArea
				data={series.data.map(p => {return {x: p.x, y: p.y, y0: 50}})}
				animate={{duration: 300}}
				style={{data: {fill: "rgba(0, 0, 255, 0.3)"}}}
				interpolation="natural"
			/>)
		});
		series.filter(x => x.metadata && x.metadata["is_winrate_data"]).forEach(data => {
			lines.push(<VictoryLine
				data={[{x: data.data[0].x, y: 50}, {x: data.data[data.data.length - 1].x, y: 50}]}
				interpolation="natural"
				style={{data: {strokeWidth: 1}}}
			/>)
		})
		series.forEach(series => {
			lines.push(
				<VictoryLine
					label={series.name}
					data={series.data}
					animate={{duration: 300}}
					interpolation="natural"
					style={{data: {strokeWidth: 1}}}
			/>)
		});

		return <svg viewBox={"0 0 " + width +  " 150"}>
			<VictoryChart
				height={150}
				width={width}
				containerComponent={<VictoryContainer title={""}/>}
				domainPadding={{x: 0, y: this.props.domainY ? 0 : 10}}
				padding={{left: 50, top: 30, right: 30, bottom: 40}}
				>
				<VictoryAxis
					label={this.props.labelX}
					domain={this.props.domainX}
					scale={this.props.timeData ? "time" : "linear"}
					style={{axisLabel: {fontSize: 8}, tickLabels: {fontSize: 8}, grid: {stroke: "gray"}}}/>
				<VictoryAxis
					dependentAxis
					axisLabelComponent={<VictoryLabel dx={10} />}
					label={this.props.labelY}
					style={{axisLabel: {fontSize: 8} ,tickLabels: {fontSize: 8}, grid: {stroke: "gray"}}}
					domain={this.props.domainY}
					/>
				{lines}
			</VictoryChart>
			<VictoryLabel text={this.props.title} style={{fontSize: 10}} textAnchor="middle" verticalAnchor="start" x={width/2} y={10}/>
		</svg>;
	}
}
