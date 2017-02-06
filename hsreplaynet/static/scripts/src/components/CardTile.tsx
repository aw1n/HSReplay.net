import * as React from "react";

interface CardTileProps extends React.ClassAttributes<CardTile> {
	card: any;
	count: number;
	height?: number;
	rarityColored?: boolean;
}

export default class CardTile extends React.Component<CardTileProps, any> {

	public render(): JSX.Element {
		const baseHeight = 34;
		const baseCountWidth = 24;
		const baseImageWidth = 134;

		let showCountBox = this.props.count > 1 || this.props.card.rarity === "LEGENDARY";
		let countWidth = this.props.height / baseHeight * baseCountWidth;

		let tileStyle = {height: this.props.height + "px", lineHeight: this.props.height + "px"};
		let gemStyle = {width: this.props.height + "px"};
		let costStyle = {fontSize: this.props.height / baseHeight * 1.25 + "em"};
		let nameStyle = {fontSize: this.props.height / baseHeight * 0.9 + "em", width: "calc(100% - " + ((showCountBox ? countWidth : 0) + 4) + "px)"};

		let imageWidth = this.props.height / baseHeight * baseImageWidth;
		let imageRight = showCountBox ? (this.props.height / baseHeight * baseCountWidth - 2) + "px" : "0"
		let imageStyle = {width: imageWidth + "px", right: imageRight};

		let countBox = null;
		if (showCountBox) {
			let singleLegendary = this.props.card.rarity === "LEGENDARY" && this.props.count == 1;
			let countboxStyle = {width: countWidth + "px"};
			let countStyle = {fontSize: this.props.height / baseHeight * 1.15 + "em", top: singleLegendary ? "-2px" : 0};

			countBox = (
				<div className="card-countbox" style={countboxStyle}>
					<span className="card-count" style={countStyle}>{singleLegendary ? "★" : this.props.count}</span>
				</div>
			);
		}

		let gemClassNames = ["card-gem"];
		if (this.props.rarityColored) {
			gemClassNames.push("rarity-" + (this.props.card.rarity || "free").toLowerCase());
		}

		return (
			<div className="card-tile" style={tileStyle}>
				<div className={gemClassNames.join(" ")} style={gemStyle}>
					<span className="card-cost" style={costStyle}>{this.props.card.cost}</span>
				</div>
				<div className="card-frame">
					<img className="card-image" src={"https://art.hearthstonejson.com/v1/tiles/" + this.props.card.id + ".png"} style={imageStyle}/>
					{countBox}
					<span className={"card-fade-" + (showCountBox ? "countbox" : "no-countbox")} />
					<span className="card-name" style={nameStyle}>{this.props.card.name}</span>
				</div>
			</div>
		);
	}
}
