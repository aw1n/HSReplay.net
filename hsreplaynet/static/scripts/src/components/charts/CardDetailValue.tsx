import * as React from "react";
import {ChartSeries} from "../../interfaces";
import {VictoryLabel, VictoryPie} from "victory";

interface CardDetailValueProps extends React.ClassAttributes<CardDetailValue> {
	series: ChartSeries[];
	title: string;
}

export default class CardDetailValue extends React.Component<CardDetailValueProps, any> {

	render(): JSX.Element {
		if (!this.props.series) {
			return null;
		}
		const value = this.props.series[0].data[0].x;
		return <svg viewBox="0 0 400 450">
			<VictoryLabel textAnchor="middle" verticalAnchor="middle" x={200} y={200} text={value} style={{fontSize: 100}}/>
			<VictoryLabel textAnchor="middle" verticalAnchor="middle" x={200} y={400} text={this.props.title} style={{fontSize: 40}}/>
		</svg>;
	}

}
