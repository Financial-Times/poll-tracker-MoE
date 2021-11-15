/**
 * @file
 * The update function is called whenever the user changes a data table or settings
 * in the visualisation editor, or when changing slides in the story editor.
 *
 * Tip: to make your template work nicely in the story editor, ensure that all user
 * interface controls such as buttons and sliders update the state and then call update.
 */
import state from "./state";
import update from "./update";
import data from "./data";
import { isPale, wrapStringToLines } from "@flourish/pocket-knife"
import { getMaxTextWidth } from '../parseData';
import * as d3 from 'd3';
import { timeFormat, } from 'd3-time-format';
import {layout, chart, annoLabel, chart_layout, dateFormat, parseDate, columnNames, formattedPolls, parties, colors, formattedAverages, valueExtent, plotData, legendData, annoData} from "./draw";
import { legend_container, legend_categorical } from "../init";
import initialisePopup from "@flourish/info-popup";
import { createContinuousColorLegend } from "@flourish/legend";

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
//Helper function to remove item from array
function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}
//Array to filter what party data should be displayed according to legend-NOT USE
let displayData;

export default function() {
	//Update the Flourish colorScake domain to those of thepolling data column names
	colors.updateColorScale(columnNames)
	
	// legend_categorical
	// 	.data(legendData) // See explanation below
	// 	.on("click", function(d, i) { // Add event listener to legend items (eg. "click", "mouseover", etc.)
	// 		console.log(this, d.label, i); // (Legend item node element, {label: "Brazil", color: "#333333", index: "0"}, index)
	// 		if(state.displayValues.includes(d.label)) {
	// 			removeItemOnce(state.displayValues, d.label)
	// 		}
	// 		else state.displayValues.push(d.label)
	// 		d3.select(this).style('opacity',0.5)
	// 		console.log('displayValues', state.displayValues)
	// 		displayData = plotData.filter(d => state.displayValues.includes(d.displayNameDesk))
	// 		update()
	// 	});
	// legend_container.update()
	const updateFormat = timeFormat('%b %d');
	state.layout.footer_note = 'Latest poll ' + updateFormat(formattedPolls[formattedPolls.length - 1].date)
	layout.update()

	var width = layout.getPrimaryWidth()
	var height = layout.getPrimaryHeight()
	chart
		.attr('width', width)
		.attr('height', height)
	//get the current frame breakpoint name
	const breaks = width > state.layout.breakpoint_mobile_small && width <= state.layout.breakpoint_mobile_big ? 'mobile_small'
		: width > state.layout.breakpoint_mobile_big && width <= state.layout.breakpoint_tablet ? 'mobile_big'
		: width > state.layout.breakpoint_tablet && width <= state.layout.breakpoint_desktop ? 'tablet'
		: width > state.layout.breakpoint_desktop && width <= state.layout.breakpoint_big_screen ? 'desktop'
		: 'big_screen'
	//Update the chart_layout module so its measurements match the layout
	chart_layout.width(width)
	chart_layout.height(height)
	//Set the permanent mobile/desktop breakpoint
	const breakpoint = state.layout.breakpoint_tablet
	//returns the current body text size. (Strangely this expressed as a % of footer size when returned)
	const fontSize = state.layout['font_size_' + breaks]
	//use the body size text as rem expressed in px not em
	const rem = layout.remToPx(fontSize)/100
	//Number formatting for the line lables and popups
	const format = d3.format(".1f");
	//initialise the Flourish popup module
	const popup = initialisePopup(state.popup);
	//Derive date ranges from both polls and averages datasets todefine overall date range
	const averagesExtent = d3.extent(formattedAverages, d => d.date);
	const pollsExtent = d3.extent(formattedPolls, d => d.date);
	const dateExtent = d3.extent((averagesExtent.concat(pollsExtent)), d => d);
	//set various userdefined chart visual parameters depending on chart width as defined by the breakpoint const
	const dotSize = width < breakpoint ? state.polls.smallSize : state.polls.largeSize
	const dotOpacity = width < breakpoint ? state.polls.smallOpacity : state.polls.largeOpacity
	const lineWidth = width < breakpoint ? state.averages.smallStrokeWidth : state.averages.largeStrokeWidth
	const lineOpacity = width < breakpoint ? state.averages.smallOpacity : state.averages.largeOpacity
	const moeOpacity = width < breakpoint ? state.moe.opacityMob : state.moe.opacityDesk
	//Calculate the width need for the righ chart_layput margin
	//This needs to be passed to the chrat_layout module EVERY time it is updated
	const rightLabelWidth =  getMaxTextWidth(columnNames, rem + 'px Metric') + (rem * 3.5)
	const xAlign = state.x.axis_position
	//Allow users to overide the y axis date extent
	dateExtent[0] = state.x.datetime_min ? parseDate(state.x.datetime_min) : dateExtent[0];
	dateExtent[1] = state.x.datetime_max ? parseDate(state.x.datetime_max) : dateExtent[1];
	//Work out how many days are in the date range, used conditionally format y axis tick labels
	const numDays = Math.floor((dateExtent[1] - dateExtent[0]) / 86400000);
	//Filter the plotData to the user defined yaxis range
	const filteredData = plotData.map(({ dots, lines,...d }) => {
			return {
				...d,
				dots: dots.filter(el => el.date > dateExtent[0] && el.date , dateExtent[1]),
				lines: lines.filter(el => el.date > dateExtent[0] && el.date , dateExtent[1]),
			};
		})
	//If no user defined tick format than format as full years unless date dange is less than three years, then months and years
	//The number of axis ticks is defineded by the Flourish chart_layout module
	const xTixkFormat = state.tickFormat? state.tickFormat
	: numDays < 1095 ? '%b %y' : '%Y';
	//define the y axis
	chart_layout.yData([0,valueExtent[1]])
	//pass the date formatting function (not format) to the chart_layout. User defined date min and max will not work properly without this
	chart_layout.xDatetimeParse(parseDate);
	//define the x axis and tick format
	chart_layout.xData(dateExtent);
	chart_layout.xFormat(timeFormat(xTixkFormat));
	//Define a margin for the annotations label to sit in depending x axis orientation
	if(xAlign == 'bottom') {
		chart_layout.update({margins: {top: 50, right: rightLabelWidth}})
	}
	else {chart_layout.update({margins: {bottom: 50, right: rightLabelWidth}})}
	//const that is the g element where the chart content is rendered to
	const plot = chart_layout.data_foreground
	//Add a g element specifically for holding the annotations in the front
	const popHolder = plot.append('g')
	//Const for holding the chart_layout scales
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

	//Add Margin of error shaded areas
	plot.selectAll('.areas')
		.data(filteredData)
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
		.data(filteredData)
		.enter()
		.append('g')
		.attr('class','dotHolder')
	
	//Add the polling circles
	plot.selectAll('.dotHolder').selectAll('circle')
		.data(d => d.dots)
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
		.data(filteredData)
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
	
	//Add a group for each series of popup circles
	plot.selectAll('.popHolder')
		.data(filteredData)
		.enter()
		.append('g')
		.attr('class','popHolder')
	//date format for the popus 
	const popFormat = '%b %d %Y'
	const popDate = timeFormat(popFormat)
	//Build a dataset for each day to be used to create invisible line for popups
	const filteredAverages = formattedAverages.filter((d) => {
		return d.date >= dateExtent[0] && d.date <= dateExtent[1]
	})
	//function for adding colour to the popup iyems category names
	function popupCallback(node, data) {
		console.log(node, data)
		if (!node) return;
		let items = d3.select(".main-content").selectAll(".data-heading").nodes()
		for (let i = 0; i < items.length; i++) {
			let mobileName = d3.select(items[i]).text()
			const partyData = parties.filter(d => d.displayNameMobile === mobileName);
			d3.select(items[i]).style('color', colors.getColor(partyData[0].party))
		}
	}	

	//Add lines to trigger popup
	plot.selectAll('.popHolder').selectAll('line')
		.data(filteredAverages)
		.join(
		function(enter) {
			return enter
			.append('line')
			.attr('x1', d => xScale(d.date))
			.attr('x2', d => xScale(d.date))
			.attr('y1', 0)
			.attr('y2', height)
			.on("mouseover",  function(ev, d) {
				//build a dataset of party values that can be sorted before defining the popup column names
				let popUps = columnNames.map((el, i) => {
					const partyData = parties.filter(d => d.party === el);
					console.log('partyData', partyData)
					return{
						name: el,
						displayName: partyData[0].displayNameMobile,
						value: d[el],
					}
				})
					.filter(d  => d.value !== '' )
					.sort((a, b) => b.value - a.value)
				let popColumns = {name: 'name'}
				//Define other popup column heading. Note that the element name (code) and not displayName defines the category this is so that
				//the party name can be coloured using the Flourish getColour. But the displayName appears in the rendered popup
				popUps.map((el, i) => {
					popColumns[el.name] = el.displayName
				})
				popup.setColumnNames(popColumns)
					.update()
				//Pass the sorted data to the popup as defined by the current date the mouse is over
				let popData = {name: popDate(d.date)}
				popUps.map((el, i) => {
					popData[el.name] = format(el.value)
				})
				//select the invisible line and make it visible			
				const el = this
				const popLine = d3.select(this);
				popLine.attr('opacity', 1)
				popup.mouseover(el, popData, popupCallback)
				
			})
			.on("mouseout", function() {
				//Make the line invisible when mousing out
				const popLine = d3.select(this);
				popLine.attr('opacity', 0)
				popup.mouseout();
			})
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
	.attr('opacity', 0)
	.style('stroke', '#66605C')
	.style('stroke-width',1)
	//Calculate the last date to be rendered. allows for a data greater or lesser than the range in the dataset
	const lastDate = parseDate(state.x.datetime_max) > averagesExtent[1] ? averagesExtent[1]
	: state.x.datetime_max ? parseDate(state.x.datetime_max)
	: averagesExtent[1];
	// Set up label data
	const labelData = filteredData
		.map(({ lines, party, displayNameDesk, displayNameMob, }) => {
				const line = lines.filter((d) => { return d.date <= lastDate})
				const average = line[line.length - 1].value;
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


	layout.update()




}
