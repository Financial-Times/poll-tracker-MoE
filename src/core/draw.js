/**
 * @file
 * The draw function is called when the template first loads.
 */

import * as d3 from "d3";
import createChartLayout from "@flourish/chart-layout";
import createColors from "@flourish/colors";
import initFacets from "@flourish/facets";
import initAxesHighlights from "@flourish/axes-highlights";


export default function draw() {
  const { layout, state } = this;

  // get the dimensions of the layout primary container
  const width = layout.getPrimaryWidth();
  const height = layout.getPrimaryHeight();

  // Append chart content svg to the primary layout div
  this.chart = d3
    .select("#fl-layout-primary")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
    this.axesHighlights = initAxesHighlights(state.axes_highlights);

  
    const grid = this.chart.append('g')

  // Create the default Flourish colour pallettes
  this.colors = createColors(state.color);
  this.facets = initFacets(state.facets);
  this.facets.appendTo(grid.node()).debug(false);

  // update the main layout (not chart_layout) with holding svg etc
  this.props = {
    x: state.x,
    y: state.y,
    y2: state.y2,
    background: state.chart_bg,
  };
  this.layout.update();

  // Call the update function
  this.update();

  // call the update function if the browser window gets resized
  window.onresize = this.update;
}
