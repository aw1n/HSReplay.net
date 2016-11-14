import * as React from "react";
import Distribution from "./Distribution";
import {BnetGameType} from "../hearthstone";
import Matrix from "./stats/Matrix";
import SampleSizeSelector from "./stats/controls/SampleSizeSelector";

interface ArchetypeClientProps extends React.ClassAttributes<ArchetypeClient> {
}

interface ArchetypeClientState {
	popularities?: any;
	winrates?: any;
	sampleSize?: number;
}

export default class ArchetypeClient extends React.Component<ArchetypeClientProps, ArchetypeClientState> {

	constructor(props: ArchetypeClientProps, context: any) {
		super(props, context);
		fetch(
			"/cards/winrates/?lookback=7&game_types=" + BnetGameType.BGT_RANKED_STANDARD + "," + BnetGameType.BGT_CASUAL_STANDARD + "&min_rank=0&max_rank=25",
			{
				credentials: "include",
			}
		).then((response) => {
			return response.json();
		}).then((json: any) => {
			this.setState({
				popularities: json.frequencies,
				winrates: json.win_rates,
			});
		});
		this.state = {
			popularities: {},
			winrates: {},
			sampleSize: 0,
		};
	}

	public render(): JSX.Element {
		return (
			<div className="row">
				<div className="col-lg-9 col-lg-push-3">
					<h2>Winrates</h2>
					<Matrix
						matrix={this.state.winrates}
						sampleSize={this.state.sampleSize}
					/>
					<SampleSizeSelector
						sampleSize={this.state.sampleSize}
						onChangeSampleSize={(sampleSize: number): void => this.setState({sampleSize: sampleSize})}
					/>
				</div>
				<div className="col-lg-3 col-lg-pull-9">
					<h2>Popularities</h2>
					<Distribution
						distributions={this.state.popularities}
						title="Archetype"
						value="Popularity"
					/>
				</div>
			</div>
		);
	}
}
