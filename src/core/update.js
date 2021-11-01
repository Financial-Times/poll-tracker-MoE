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
import { timeFormat, } from 'd3-time-format';
import {layout, chart, chart_layout, dateFormat, parseDate, formattedPolls, valueExtent, dateExtent} from "./draw";
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
	
	dateExtent[0] = state.x.datetime_min ? new Date(state.x.datetime_min) : d3.extent(formattedPolls, d => d.date)[0];
	dateExtent[1] = state.x.datetime_max ? new Date(state.x.datetime_max) : d3.extent(formattedPolls, d => d.date)[1];
	const numDays = Math.floor((dateExtent[1] - dateExtent[0]) / 86400000);
	console.log('numDays', numDays)
	const xTixkFormat = state.tickFormat? state.tickFormat
	: numDays < 1095 ? '%b %y' : '%y';

	chart_layout.yData([0,valueExtent[1]])
	//pass the date formatting function to the chart_layout. User defined date min and max will not work properly without this
	chart_layout.xDatetimeParse(parseDate);
	chart_layout.xData(dateExtent);
	chart_layout.xFormat(timeFormat(xTixkFormat));
	//chart_layout.yData(groupNames)
	chart_layout.update();


	layout.update()
	//console.log(state.layout)




}
