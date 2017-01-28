import * as React from "react";
import {getHeroColor, toTitleCase} from "../helpers";
import ClassIcon from "./ClassIcon";

type FilterOption = "ALL" | "DRUID" | "HUNTER" | "MAGE"
	| "PALADIN" | "PRIEST" | "ROGUE" | "SHAMAN"
	| "WARLOCK" | "WARRIOR" | "NEUTRAL";

type FilterPreset = "All" | "AllNeutral" | "Neutral" | "ClassesOnly";

type FilterStyle = "label" | "icon";

interface ClassFilterState {
	selectedClasses?: Map<string, boolean>;
}

interface ClassFilterProps extends React.ClassAttributes<ClassFilter> {
	filters: FilterOption[] | FilterPreset;
	selectionChanged: (selected: Map<string, boolean>) => void;
	multiSelect: boolean;
	filterStyle: FilterStyle;
}

export default class ClassFilter extends React.Component<ClassFilterProps, ClassFilterState> {
	private readonly classes: FilterOption[] = [
		"DRUID", "HUNTER", "MAGE",
		"PALADIN", "PRIEST", "ROGUE",
		"SHAMAN", "WARLOCK", "WARRIOR"
	];

	private readonly presets = new Map<FilterPreset, FilterOption[]>([
		["All", ["ALL"].concat(this.classes) as FilterOption[]],
		["AllNeutral", ["ALL", "NEUTRAL"].concat(this.classes) as FilterOption[]],
		["Neutral", ["NEUTRAL"].concat(this.classes) as FilterOption[]],
		["ClassesOnly", this.classes]
	]);

	constructor(props: ClassFilterProps, state: ClassFilterState) {
		super(props, state);
		const selectedClasses = new Map<string, boolean>();
		if (this.props.multiSelect) {
			this.presets.get("AllNeutral").forEach(c => selectedClasses.set(c, true));
		}
		else {
			selectedClasses.set(this.getAvailableFilters()[0], true);
		}
		this.state = {
			selectedClasses: selectedClasses,
		}
		this.props.selectionChanged(this.state.selectedClasses)
	}

	getAvailableFilters(): FilterOption[] {
		const fromPreset = this.presets.get(this.props.filters as FilterPreset);
		return fromPreset || this.props.filters as FilterOption[];
	}

	render(): JSX.Element {
		const keys = this.getAvailableFilters();
		const filters = [];
		keys.forEach(key => {
			const selected = this.state.selectedClasses.get(key);
			const filter = this.props.filterStyle == "label" ?
				this.buildLabel(key, selected) : this.buildIcon(key, selected);
			filters.push(filter);

		})
		return <div className="class-filter-wrapper">
			{filters}
		</div>;
	}

	buildLabel(className: string, selected: boolean): JSX.Element {
		const labelStyle = selected || this.allSelected() ? {backgroundColor: getHeroColor(className), color: this.getTextColor(className)} : null;
		const labelClassName = "label" + (selected ? "" : " unselected");
		return <span className={labelClassName} style={labelStyle}
			onClick={() => this.onLabelClick(className, selected)}
		>
			{className}
		</span>
	}

	buildIcon(className: string, selected: boolean): JSX.Element {
		const isSelected = selected || this.allSelected();
		const wrapperClassName = "class-icon-label-wrapper" + (isSelected ? "" : " deselected");
		const labelClassName = "class-label " + (isSelected ? className.toLowerCase() : "deselected");
		return <span className={wrapperClassName} onClick={() => this.onLabelClick(className, selected)}>
			<ClassIcon heroClassName={className} small />
			<div className={labelClassName}>{toTitleCase(className)}</div>
		</span>;
	}

	onLabelClick(className: string, selected: boolean) {
		const newState = this.props.multiSelect ?
			this.state.selectedClasses.set(className, !selected)
			: new Map<string, boolean>([[className, true]])
		this.setState({selectedClasses: newState});
		this.props.selectionChanged(newState);
	}

	allSelected(): boolean {
		return this.state.selectedClasses.get("ALL");
	}

	private getTextColor(hero: string): string {
		switch(hero.toUpperCase()) {
			case "SHAMAN":
				return "white";
		}
		return "black";
	}
}
