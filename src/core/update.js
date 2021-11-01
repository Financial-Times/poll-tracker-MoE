/**
 * @file
 * The update function is called whenever the user changes a data table or settings
 * in the visualisation editor, or when changing slides in the story editor.
 *
 * Tip: to make your template work nicely in the story editor, ensure that all user
 * interface controls such as buttons and sliders update the state and then call update.
 */
import state from "./state";
import data from "./data";
import { isPale, wrapStringToLines } from "@flourish/pocket-knife"
import { getMaxTextWidth, getStacks } from '../parseData';
import * as d3 from 'd3';
import { scaleLinear, scaleBand } from "d3-scale";
import {layout, chart, chart_layout} from "./draw";
import { update } from "..";

export default function() {
	var width = layout.getPrimaryWidth()
	var height = layout.getPrimaryHeight()
	chart
		.attr('width', width)
		.attr('height', height)
	
	chart_layout.width(width)
	chart_layout.height(height)
	const breakpoint = state.layout.breakpoint_tablet
	// console.log('breakpoint', breakpoint)
	// const rem = width > breakpoint ? state.layout.font_size_desktop
	// 	: state.layout.font_size_mobile_big
	// 	; 14
	console.log('data', data.data)
	const columnNames = data.data.column_names.value
	const formattedData = data.data.map((d) => {
		var row = {name: d.name}
		columnNames.map((el, i) => {
			row[columnNames[i]] = Number(d.value[i])
			})
			return row
	})
	const groupNames = formattedData.map( d => d.name)
            .filter((item, pos, groupNames) => groupNames.indexOf(item) === pos);
	
			console.log ('chart_layout', chart_layout)
	const yDomain = data.data.column_names.value
	//chart_layout.yData(groupNames)
	console.log(chart_layout.yTitle())
	chart_layout.update()


	layout.update()
	//console.log(state.layout)




}
