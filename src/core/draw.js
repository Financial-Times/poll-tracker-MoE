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


let chart, annoLabel, props, chart_layout, dateFormat, parseDate, columnNames, averageNames, colors, formattedPolls, formattedAverages, valueExtent, plotData, legendData, annoData

export default function() {

//get the dimensions of the layout primary container
let width = layout.getPrimaryWidth()
let height = layout.getPrimaryHeight()
dateFormat = state.dateFormat;
parseDate = d3.timeParse(dateFormat);

chart = d3.select("#fl-layout-primary")
	.append('svg')
	.attr('width', width)
	.attr('height', height)

annoLabel =  chart.append('g')
	.attr('class', 'label')

columnNames = data.polls.column_names.value
averageNames = data.averages.column_names.value
const parties =  data.parties
colors = createColors(state.color)
colors.updateColorScale(columnNames)

formattedPolls = data.polls.map((d) => {
	var row = {date: parseDate(d.date), pollster: d.house,}
	columnNames.map((el, i) => {
		row[columnNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)

formattedAverages = data.averages.map((d) => {
	var row = {date: parseDate(d.date), code: d.code, geo: d.geo, race: d.race,}
	averageNames.map((el, i) => {
		row[averageNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)

valueExtent = extentMulti(formattedPolls, columnNames);

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

annoData = data.annotations.map((d) => {
	return {
		date: parseDate(d.date),
		annotation: d.annotation,
	}
})

props = { x: state.x, y: state.y, y2: state.y2, background: state.chart_bg };
chart_layout = createChartLayout(chart, props);
layout.update()

//call the update function
update();
//call the update function if the browser window gets resized
window.onresize = function() { update() };
}

export {layout, chart, annoLabel ,chart_layout, dateFormat, parseDate, columnNames, colors, formattedPolls, formattedAverages, valueExtent, plotData, legendData, annoData};

