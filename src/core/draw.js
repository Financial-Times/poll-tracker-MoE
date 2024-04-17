/**
 * @file
 * The draw function is called when the template first loads.
 */

import initLayout from "@flourish/layout";
import {
  createLegendContainer,
  createDiscreteColorLegend,
} from "@flourish/legend";
import initialisePopup from "@flourish/info-popup";
import initAxesHighlights from "@flourish/axes-highlights";
import createColors from "@flourish/colors";
import * as d3 from "d3";
import initFacets from "@flourish/facets";

export default function draw() {
  const { state } = this;

  this.layout = initLayout(state.layout);

  this.legendContainer = createLegendContainer(state.legend_container);

  const legendCategorical = createDiscreteColorLegend(state.legend_categorical);

  this.legendCategorical = legendCategorical;
  this.legendContainer
    .appendTo(this.layout.getSection("legend"))
    .add([legendCategorical]);
  this.legendContainer.update();

  // get the dimensions of the layout primary container
  const width = this.layout.getPrimaryWidth();
  const height = this.layout.getPrimaryHeight();

  // Append chart content svg to the primary layout div
  this.chart = d3
    .select("#fl-layout-primary")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const grid = this.chart.append("g");

  // Instantiate the Flourish modules
  this.popup = initialisePopup(state.popup);

  this.colors = createColors(state.color);

  this.facets = initFacets(state.facets);
  this.facets.appendTo(grid.node()).debug(false);

  this.axesHighlights = initAxesHighlights(state.axes_highlights);

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
