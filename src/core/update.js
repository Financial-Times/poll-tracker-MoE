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
import { getMaxTextWidth } from '../parseData';
import createColors from "@flourish/colors"
import * as d3 from 'd3';
import { timeFormat, } from 'd3-time-format';
import {layout, chart, annoLabel, chart_layout, dateFormat, parseDate, columnNames, formattedPolls,formattedAverages, valueExtent, plotData, annoData} from "./draw";
import { legend_container, legend_categorical } from "../init";

// Helper function to position labels
const positionLabels = (labels, spacing, alpha) => {
	labels.each(d1 => {
		const y1 = d1.position;
		const a1 = d1.average;

		labels.each(d2 => {
			const y2 = d2.position;
			const a2 = d2.average;

			/* Difference between current averages for each party
			This ensures the parties are always in the correct order */
			const deltaA = a1 - a2;
			/* Difference between current positions
			When this is below the required minimum spacing the positioning
			algorithm should stop */
			const deltaY = y1 - y2;

			if (d1 !== d2 && Math.abs(deltaY) <= spacing) {
				const sign = deltaA > 0 ? -1 : 1;
				const adjust = sign * alpha;

				d1.position = +y1 + adjust;
				d2.position = +y2 - adjust;

				positionLabels(labels, spacing, alpha);
			}
		});
	});
}

export default function() {
	const colors = createColors(state.color)
	colors.updateColorScale(columnNames)
	const legendColor = colors.getColor // Using Flourish custom colors module
	legend_categorical
		.data(columnNames, legendColor) // See explanation below
		//.filtered(["Brazil"]) // Array, items that should have low opacity
		.on("click", function(d, i) { // Add event listener to legend items (eg. "click", "mouseover", etc.)
				console.log(this, d, i); // (Legend item node element, {label: "Brazil", color: "#333333", index: "0"}, index)
			});
	legend_container.update()
	var width = layout.getPrimaryWidth()
	var height = layout.getPrimaryHeight()
	chart
		.attr('width', width)
		.attr('height', height)
	//get the current frame break name
	const breaks = width > state.layout.breakpoint_mobile_small && width <= state.layout.breakpoint_mobile_big ? 'mobile_small'
		: width > state.layout.breakpoint_mobile_big && width <= state.layout.breakpoint_tablet ? 'mobile_big'
		: width > state.layout.breakpoint_tablet && width <= state.layout.breakpoint_desktop ? 'tablet'
		: width > state.layout.breakpoint_desktop && width <= state.layout.breakpoint_big_screen ? 'desktop'
		: 'big_screen'
	
	chart_layout.width(width)
	chart_layout.height(height)
	const breakpoint = state.layout.breakpoint_tablet
	//returns the current body text size. (Strangely this expressed as a % of footer size when returned)
	const fontSize = state.layout['font_size_' + breaks]
	//use the body size text as rem expressed in px not em
	const rem = layout.remToPx(fontSize)/100
	const format = d3.format(".1f");

	console.log('breakpoint', breakpoint)
	const averagesExtent = d3.extent(formattedAverages, d => d.date);
	const pollsExtent = d3.extent(formattedPolls, d => d.date);
	console.log('averagesExtent', averagesExtent);
	console.log('pollsExtent', pollsExtent);
	const dateExtent = d3.extent((averagesExtent.concat(pollsExtent)), d => d);
	const dotSize = width < breakpoint ? state.polls.smallSize : state.polls.largeSize
	const dotOpacity = width < breakpoint ? state.polls.smallOpacity : state.polls.largeOpacity
	const lineWidth = width < breakpoint ? state.averages.smallStrokeWidth : state.averages.largeStrokeWidth
	const lineOpacity = width < breakpoint ? state.averages.smallOpacity : state.averages.largeOpacity
	const moeOpacity = width < breakpoint ? state.moe.opacityMob : state.moe.opacityDesk
	//Calculate the width need for the righ chart_layput margin
	//This needs to be passed to the chrt-layout EVERY time it is updated
	const rightLabelWidth =  getMaxTextWidth(columnNames, rem + 'px Metric') + (rem * 3.5)
	const xAlign = state.x.axis_position

	console.log('lineWidth', lineWidth)
	dateExtent[0] = state.x.datetime_min ? parseDate(state.x.datetime_min) : dateExtent[0];
	dateExtent[1] = state.x.datetime_max ? parseDate(state.x.datetime_max) : dateExtent[1];
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

	//chart_layout.xFormat(getDateFormat('years', chart_layout.xTicks()))
	if(xAlign == 'bottom') {
		chart_layout.update({margins: {top: 50, right: rightLabelWidth}})
	}
	else {chart_layout.update({margins: {bottom: 50, right: rightLabelWidth}})}

	const plot = chart_layout.data_foreground
	const yScale = chart_layout.yScale()
	const xScale = chart_layout.xScale()

	//set up line interpolation and line drawing function
	const areaData = d3.area()
		.x(d => xScale(d.x))
		.y1(d => yScale(d.y1))
		.y0(d => yScale(d.y0));
	
	//Add a group for each annotation line
	plot.selectAll('.annoHolder')
		.data(annoData)
		.enter()
		.append('g')
		.attr('class','annoHolder')
	
	plot.selectAll('.annoHolder').selectAll('line')
		.data(annoData)
		.join(
		function(enter) {
			return enter
			.append('line')
			.attr('x1', d => xScale(d.date))
			.attr('x2', d => xScale(d.date))
			.attr('y1', 0)
			.attr('y2', height)
		},
		function(update) {
			return update
			.attr('x1', d => xScale(d.date))
			.attr('x2', d => xScale(d.date))
			.attr('y1', 0)
			.attr('y2', height)
		},
		function(exit) {
		return exit
			.transition()
			.on('end', function() {
			d3.select(this).remove()
			});
		})
	.style('stroke', '#66605C')
	.style('stroke-width',1)

	//The label added to its own g element in the primary chart svg so as to avoid being cropped off
	annoLabel.selectAll('text')
		.data(annoData)
		.join(
		function(enter) {
			return enter
			.append('text')
			.attr('x', d => xScale(d.date))
			.attr('y', xAlign == 'bottom' ? chart_layout.margins.top - (rem * .5):
				chart_layout.height() - chart_layout.margins.bottom + (rem *.8))
		},
		function(update) {
			return update
			.attr('x', d => xScale(d.date))
			.attr('y', xAlign == 'bottom' ? chart_layout.margins.top - (rem * .5):
				chart_layout.height() - chart_layout.margins.bottom + (rem *.8))
		},
		function(exit) {
			return exit
			.transition()
			.text('')
			.attr('opacity', 0)
			.on('end', function() {
				d3.select(this).remove()
			});
		})
	.text(d => d.annotation)
	.style('text-anchor', 'middle')
	.style('fill', '#66605C')
	.attr('font-weight', 400)

	
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
			.attr('d', d => lineData(d.lines))
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

	const lastDate = new Date(state.x.datetime_max) > averagesExtent[1] ? averagesExtent[1] :  dateExtent[1];
	// Set up label data
	const labelData = filteredPlotData
		.map(({ lines, party, displayNameDesk, displayNameMob, }) => {
			const average = lines[lines.length - 1].value;
			return {
				party,
				displayNameDesk,
				displayNameMob,
				average,
				// Set initial positions for each label
				position: yScale(average),
			};
		})
		.sort((a, b) => b.average - a.average);
	
	chart.selectAll('.labelHolder')
		.data(labelData)
		.enter()
		.append('g')
		.attr('class','labelHolder')
	
	// Calculate new label positions recursively
	positionLabels(
		chart.selectAll('.labelHolder'),
		rem, // Minimum spacing between labels (increase for more space)
		0.5 // Amount to change label positon by each iteration
	);

	chart.selectAll('.labelHolder').selectAll('rect')
		.data(d => [d])
		.join(
		function(enter) {
			return enter
			.append('rect')
			.attr('height', rem)
			.attr('y', d => d.position - (rem *.5))
			.attr('x', d => xScale(lastDate) + (rem * .3))
		},
		function(update) {
			return update
			.attr('y', d => d.position - (rem *.5))
			.attr('x', d => xScale(lastDate) + (rem * .3))
			.attr('width', rem * .5)
		},
		function(exit) {
			return exit
			.transition()
			.attr('width', 0)
			.on('end', function() {
				d3.select(this).remove()
			});
		})
	.attr('fill', d => colors.getColor(d.party))
	.attr('height', rem)
	.attr('width', rem * .5)

	chart.selectAll('.labelHolder').selectAll('text')
		.data(d => [d])
		.join(
		function(enter) {
			return enter
			.append('text')
			.attr('y', d => d.position + (rem *.3))
			.attr('x', d => xScale(lastDate) + (rem ))
		},
		function(update) {
			return update
			.attr('y', d => d.position + (rem *.3))
			.attr('x', d => xScale(lastDate) + (rem))
		},
		function(exit) {
			return exit
			.transition()
			.attr('opacity', 0)
			.on('end', function() {
				d3.select(this).remove()
			});
		}
		)
	.attr('font-weight', 600)
	.style('fill',  d => colors.getColor(d.party))
	.text((d) =>  {
		if( breaks === 'mobile_small' || breaks === 'mobile_big') {
			return  d.displayNameMob + ' ' + format(d.average)
		}
		return d.displayNameDesk + ' ' + format(d.average)
	})
		
		const updateFormat = timeFormat('%b %d');
	

	layout.update()
	//console.log(state.layout)




}
