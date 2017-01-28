import * as React from "react";

interface LoadingIndicatorProps extends React.ClassAttributes<LoadingIndicator> {
	height: number;
}

export default class LoadingIndicator extends React.Component<LoadingIndicatorProps, any> {
	render(): JSX.Element {
		return <div className="loading-indicator" style={{width: this.props.height*7}}>
			<svg viewBox="0 0 700 100" >
				<circle className="dot dot-one" cx="50" cy="50" r="20" stroke="blue" fill="rgba(0, 0, 255, 0.3)"/>
				<circle className="dot dot-two" cx="350" cy="50" r="20" stroke="blue" fill="rgba(0, 0, 255, 0.3)"/>
				<circle className="dot dot-three" cx="650" cy="50" r="20" stroke="blue" fill="rgba(0, 0, 255, 0.3)"/>
			</svg>
		</div>
	}
}
