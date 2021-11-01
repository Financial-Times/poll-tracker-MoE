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
import { extentMulti, getDots,} from '../parseData';


let chart, props, chart_layout, dateFormat, parseDate, columnNames, formattedPolls, valueExtent, dateExtent, plotData

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
const parties =  data.parties
console.log('columnNames', columnNames)
formattedPolls = data.polls.map((d) => {
	var row = {date: parseDate(d.date), pollster: d.house,}
	columnNames.map((el, i) => {
		row[columnNames[i]] = Number(d.value[i])
		})
		return row
}).sort((a, b) => a.date - b.date)
console.log('formattedPolls', formattedPolls)

valueExtent = extentMulti(formattedPolls, columnNames);
dateExtent = d3.extent(formattedPolls, d => d.date);
console.log('valueExtent', valueExtent);
console.log('dateExtent', dateExtent);

plotData  = columnNames.map(party => {
	const partyData = parties.find(({ party: p }) => party === p);
	return {
		party,
		displayNameMob: partyData.displayNameMobile,
		displayNameDesk: partyData.displayNameDesktop,
		dots: getDots(formattedPolls, party,),
	}
})
console.log('plotData', plotData)


props = { x: state.x, y: state.y, y2: state.y2, background: state.chart_bg };
chart_layout = createChartLayout(chart, props);


//call the update function
update();
//call the update function if the browser window gets resized
window.onresize = function() { update() };
}

export {layout, chart, chart_layout, dateFormat, parseDate, formattedPolls, valueExtent, dateExtent, plotData};

