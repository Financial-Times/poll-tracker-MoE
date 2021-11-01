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
import createColors from "@flourish/colors"
import * as d3 from 'd3';
import { timeFormat, } from 'd3-time-format';
import {layout, chart, chart_layout, dateFormat, parseDate, columnNames, formattedPolls, valueExtent, dateExtent, plotData,} from "./draw";
import { update } from "..";

export default function() {
	const colors = createColors(state.color)
	colors.updateColorScale(columnNames)
	var width = layout.getPrimaryWidth()
	var height = layout.getPrimaryHeight()
	chart
		.attr('width', width)
		.attr('height', height)
	
	chart_layout.width(width)
	chart_layout.height(height)
	const breakpoint = state.layout.breakpoint_tablet
	console.log('breakpoint', breakpoint)
	const dotSize = width < breakpoint ? state.polls.smallSize : state.polls.largeSize
	const dotOpacity = width < breakpoint ? state.polls.smallOpacity : state.polls.largeOpacity
	const lineWidth = width < breakpoint ? state.averages.smallStrokeWidth : state.averages.largeStrokeWidth
	const lineOpacity = width < breakpoint ? state.averages.smallOpacity : state.averages.largeOpacity
	const moeOpacity = width < breakpoint ? state.moe.opacityMob : state.moe.opacityDesk

	console.log('lineWidth', lineWidth)
	dateExtent[0] = state.x.datetime_min ? new Date(state.x.datetime_min) : d3.extent(formattedPolls, d => d.date)[0];
	dateExtent[1] = state.x.datetime_max ? new Date(state.x.datetime_max) : d3.extent(formattedPolls, d => d.date)[1];
	const numDays = Math.floor((dateExtent[1] - dateExtent[0]) / 86400000);
	console.log('numDays', numDays)

	const filteredPlotData = plotData.map(({ dots, lines,...d }) => {
		return {
			...d,
			dots: dots.filter(el => el.date > dateExtent[0] && el.date , dateExtent[1]),
			lines: lines.filter(el => el.date > dateExtent[0] && el.date , dateExtent[1]),
        };
	})
	console.log('filteredPlotData', filteredPlotData)

	const xTixkFormat = state.tickFormat? state.tickFormat
	: numDays < 1095 ? '%b %y' : '%Y';

	chart_layout.yData([0,valueExtent[1]])
	//pass the date formatting function to the chart_layout. User defined date min and max will not work properly without this
	chart_layout.xDatetimeParse(parseDate);
	chart_layout.xData(dateExtent);
	chart_layout.xFormat(timeFormat(xTixkFormat));

	chart_layout.update();

	const plot = chart_layout.data_foreground
	const yScale = chart_layout.yScale()
	const xScale = chart_layout.xScale()

	//set up line interpolation and line drawing function
	const areaData = d3.area()
		.x(d => xScale(d.x))
		.y1(d => yScale(d.y1))
		.y0(d => yScale(d.y0));
	
	//Add Margin of error
	plot.selectAll('.areas')
		.data(filteredPlotData)
		.join(
		function(enter) {
			return enter
			.append('path')
			.attr('d', d => areaData(d.areas))
		},
		function(update) {
			return update
			.attr('d', d => areaData(d.areas))
		},
		function(exit) {
			return exit
			.transition()
			.duration(100)
			.on('end', function() {
				d3.select(this).remove()
			});
		},
		)
		.attr('class', 'areas')
		.attr('fill', d => colors.getColor(d.party))
		.attr('id', d => d.party)
		.attr('opacity', moeOpacity)

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
	.attr('r', dotSize)
	.attr('fill', d => colors.getColor(d.name))
	.attr('opacity', dotOpacity)

	//set up line interpolation and line drawing function
	let interpolation = d3.curveLinear;
	const lineData = d3.line()
		.defined(d => d)
		.curve(interpolation)
		.x(d => xScale(d.date))
		.y(d => yScale(d.value));
	
	plot.selectAll('.lines')
		.data(filteredPlotData)
		.join(
		function(enter) {
			return enter
			.append('path')
		},
		function(update) {
			return update
			.attr('d', d => lineData(d.lines))
		},
		function(exit) {
			return exit
			.transition()
			.duration(100)
			.attr('d', d => lineData(d.lines))
			.on('end', function() {
				d3.select(this).remove()
			});
		},
		)
		.attr('class', 'lines')
		.attr('fill', 'none')
		.attr('stroke-width', lineWidth)
		.attr('stroke', d => colors.getColor(d.party))
		.attr('id', d => d.party)
		.attr('opacity', lineOpacity)
		.attr('d', d => lineData(d.lines))
	

	layout.update()
	//console.log(state.layout)




}
