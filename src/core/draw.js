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
import { extentMulti, getDots, getlines, getMoE} from '../parseData';


let chart, props, chart_layout, dateFormat, parseDate, columnNames, averageNames, formattedPolls, formattedAverages, valueExtent, dateExtent, plotData

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

console.log('data', data)
columnNames = data.polls.column_names.value
averageNames = data.averages.column_names.value
const parties =  data.parties
console.log('parties', parties)
console.log('averageNames', averageNames)
formattedPolls = data.polls.map((d) => {
	var row = {date: parseDate(d.date), pollster: d.house,}
	columnNames.map((el, i) => {
		row[columnNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)
console.log('formattedPolls', formattedPolls)
formattedAverages = data.averages.map((d) => {
	var row = {date: parseDate(d.date), code: d.code, geo: d.geo, race: d.race,}
	averageNames.map((el, i) => {
		row[averageNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)
console.log('formattedAverages', formattedAverages)


valueExtent = extentMulti(formattedPolls, columnNames);
//dateExtent = d3.extent(formattedPolls, d => d.date);
const averagesExtent = d3.extent(formattedAverages, d => d.date);
const pollsExtent = d3.extent(formattedPolls, d => d.date);
console.log('averagesExtent', averagesExtent);
console.log('pollsExtent', pollsExtent);

dateExtent = [Math.min(averagesExtent[0],pollsExtent[0]), Math.max(averagesExtent[1], pollsExtent[1])]
console.log('valueExtent', valueExtent);
console.log('dateExtent', dateExtent);

plotData  = columnNames.map(party => {
	const partyData = parties.find(({ party: p }) => party === p);
	console.log('partyData', partyData)
	return {
		party,
		displayNameMob: partyData.displayNameMobile,
		displayNameDesk: partyData.displayNameDesktop,
		dots: getDots(formattedPolls, party,),
		lines: getlines(formattedAverages, party),
		areas: getMoE(formattedAverages, party),
	}
})
console.log('plotData', plotData)


props = { x: state.x, y: state.y, y2: state.y2, background: state.chart_bg };
chart_layout = createChartLayout(chart, props);
layout.update()

//call the update function
update();
//call the update function if the browser window gets resized
window.onresize = function() { update() };
}

export {layout, chart, chart_layout, dateFormat, parseDate, columnNames, formattedPolls, valueExtent, dateExtent, plotData,};

