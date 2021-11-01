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

let chart, props, chart_layout

export default function() {

//get the dimensions of the layout primary container
let width = layout.getPrimaryWidth()
let height = layout.getPrimaryHeight()

chart = d3.select("#fl-layout-primary")
	.append('svg')
	.attr('width', width)
	.attr('height', height)

props = { x: state.x, y: state.y, y2: state.y2, background: state.chart_bg };
chart_layout = createChartLayout(chart, props);


//call the update function
update();
//call the update function if the browser window gets resized
window.onresize = function() { update() };
}

export {layout, chart, chart_layout};

