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
import {layout, chart, chart_layout, dateFormat, parseDate, formattedPolls, valueExtent, dateExtent, plotData} from "./draw";
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

	const filteredPlotData = plotData.map(({ dots, lines,...d }) => {
		return {
          ...d,
          dots: dots.filter(el => el.date > dateExtent[0] && el.date , dateExtent[1]),
        };
	})
	console.log('filteredPlotData', filteredPlotData)

	const xTixkFormat = state.tickFormat? state.tickFormat
	: numDays < 1095 ? '%b %y' : '%y';

	chart_layout.yData([0,valueExtent[1]])
	//pass the date formatting function to the chart_layout. User defined date min and max will not work properly without this
	chart_layout.xDatetimeParse(parseDate);
	chart_layout.xData(dateExtent);
	chart_layout.xFormat(timeFormat(xTixkFormat));

	chart_layout.update();

	const plot = chart_layout.data_foreground
	const yScale = chart_layout.yScale()
	const xScale = chart_layout.xScale()

	//Add a group for each series of dots
	plot.selectAll('.dotHolder')
		.data(filteredPlotData)
		.enter()
		.append('g')
		.attr('class','dotHolder')
	
		//Add the polling circles
	plot.selectAll('.dotHolder').selectAll('circle')
	.data((d) => {return d.dots})
	.join(
		function(enter) {
		return enter
			.append('circle')
			.attr('cx', d => xScale(d.date))
			.attr('cy', d => yScale(d.value))
		},
		function(update) {
		return update
			.attr('cx', d => xScale(d.date))
			.attr('cy', d => yScale(d.value))
		},
		function(exit) {
		return exit
			.transition()
			.attr('r', 0)
			.on('end', function() {
			d3.select(this).remove()
			});
		}
		)
	.attr('r', 4)
	.attr('fill', '#ffffff')
	.attr('opacity', 0.5)



	layout.update()
	//console.log(state.layout)




}
