/**
 * @file
 * The draw function is called when the template first loads.
 */

import state from "./state";
import update from "./update";
import data from "./data";
import * as d3 from 'd3';
import { layout } from "../init";
import createChartLayout from "@flourish/chart-layout";
import createColors from "@flourish/colors"
import { extentMulti, getDots, getlines, getMoE} from '../parseData';


let chart, annoLabel, props, chart_layout, dateFormat, parseDate, columnNames, averageNames, parties, colors, formattedPolls, formattedAverages, valueExtent, plotData, legendData, annoData

export default function() {

//get the dimensions of the layout primary container
let width = layout.getPrimaryWidth()
let height = layout.getPrimaryHeight()
//get user defined date format and define the parseData function for building plotData
dateFormat = state.dateFormat;
parseDate = d3.timeParse(dateFormat);
//Append chart content svg to the primary layout div
chart = d3.select("#fl-layout-primary")
	.append('svg')
	.attr('width', width)
	.attr('height', height)
//Add seperate g element to hold the annotation labels outside the chart_layout to avoid them being masked
annoLabel = chart.append('g')
	.attr('class', 'label')
//Define the column names that are used as they key to build the formatted polls data object and define update Flourish colour domain
columnNames = data.polls.column_names.value
//Define the column names that are used as they key to build the formatted averages data object and define update Flourish colour domain
averageNames = data.averages.column_names.value
//Define the partieslooup array, used in getting the correct display depending on the chart width
parties =  data.parties
//Create the default Flourish colour pallettes
colors = createColors(state.color)
//Create formatted data object of the polling data and format the dates
formattedPolls = data.polls.map((d) => {
	var row = {date: parseDate(d.date), pollster: d.house,}
	columnNames.map((el, i) => {
		row[columnNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)
//Create formatted data object of the averages data and format the dates
formattedAverages = data.averages.map((d) => {
	var row = {date: parseDate(d.date), code: d.code, geo: d.geo, race: d.race,}
	averageNames.map((el, i) => {
		row[averageNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)
//Calculate the initual value extent used to define the y axis in the update function
valueExtent = extentMulti(formattedPolls, columnNames);
//create the data object passed to the update function that can be filtered by date to create the chart
plotData  = columnNames.map(party => {
	const partyData = parties.find(({ party: p }) => party === p);
	return {
		party,
		displayNameMob: partyData.displayNameMobile,
		displayNameDesk: partyData.displayNameDesktop,
		dots: getDots(formattedPolls, party,),
		lines: getlines(formattedAverages, party, partyData.displayNameDesktop),
		areas: getMoE(formattedAverages, party),
	}
})

// legendData = plotData.map((d) => {
// 	return {
// 		label: d.displayNameDesk,
// 		color: colors.getColor(d.party)
// 	}
// })
// state.displayValues = legendData.map(d => d.label)
//create the data object passed to the update function that can be filtered by date to create the chart annotations
annoData = data.annotations.map((d) => {
	return {
		date: parseDate(d.date),
		annotation: d.annotation,
	}
})
//update the main layout (not chart_layout) with holding svg etc
props = { x: state.x, y: state.y, y2: state.y2, background: state.chart_bg };
chart_layout = createChartLayout(chart, props);
layout.update()

//call the update function
update();
//call the update function if the browser window gets resized
window.onresize = function() { update() };
}

export {layout, chart, annoLabel ,chart_layout, dateFormat, parseDate, columnNames, parties, colors, formattedPolls, formattedAverages, valueExtent, plotData, legendData, annoData};

