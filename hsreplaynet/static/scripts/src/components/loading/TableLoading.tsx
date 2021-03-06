import * as React from "react";
import CardData from "../../CardData";
import {cloneComponent} from "../../helpers";
import {LoadingStatus} from "../../interfaces";

interface TableLoadingProps extends React.ClassAttributes<TableLoading> {
	cardData?: CardData;
	customMessage?: string;
	dataKeys?: string[];
	status?: LoadingStatus;
}

export default class TableLoading extends React.Component<TableLoadingProps, void> {
	render(): JSX.Element {
		if (this.props.customMessage) {
			return <h3 className="message-wrapper">{this.props.customMessage}</h3>;
		}

		switch (this.props.status) {
			case LoadingStatus.LOADING:
				return <h3 className="message-wrapper">Loading…</h3>;
			case LoadingStatus.PROCESSING:
				return (
					<div className="message-wrapper">
						<h3>Loading…</h3>
						<p><i>This may take a few seconds</i></p>
					</div>
				);
			case LoadingStatus.ERROR:
				return <h3 className="message-wrapper">Please check back later</h3>;
		}
		if (this.props.cardData === null) {
			return <h3 className="message-wrapper">Loading…</h3>;
		}

		const noData = (this.props.dataKeys || ["data"]).some((key) => {
			const data = this.props[key].series.data;
			const keys = Object.keys(data);
			return keys.length === 0 || data[keys[0]].length === 0;
		});
		if (noData) {
			return <h3 className="message-wrapper">No available data.</h3>;
		}
		return cloneComponent(this.props.children, this.props);
	}
}
