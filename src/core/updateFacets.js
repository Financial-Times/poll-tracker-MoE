import * as d3 from "d3";
import { getTextWidth } from "@flourish/pocket-knife";
import createChartLayout from "@flourish/chart-layout";
import { timeFormat } from "d3-time-format";
import {
  getMaxTextWidth,
} from "../parseData";
import {updateLabels} from './labels'
import { updateLines } from "./lines";
import {updateDots} from './dots'
import { updateAxesHighlights } from "./axesHighlights";
import {updateAreas} from './areas'
import { updateLegend } from "./legend";
import { getLabelData } from "./getLabelData";
import {getValueExtent} from "./getValueExtent"
import { updateFacets } from "./updateFacets";


export const updateFacets = (facet) => {

    const isMobile = width <= state.layout.breakpoint_tablet;
  //Returns the range of numbers for the y axis
  const valueExtent = getValueExtent(state, pollData, linesData, columnNames, facet)

  //Chart layout created and updated if none exists. Needs to be updated before anything else so that a REM value can be returned
  if (!facet.node.chartLayout)  {
    facet.node.chartLayout = createChartLayout(facet.node, props).update();
  }
  // Returns the rem size to be the same as the x axis tick label
  const rem = (layout.remToPx(100) / 100) * state.x.tick_label_size;
  const tickFotmat = state.tickFormat; // user defined x axis date format
  const labelTuine = state.tuneLabel; // Fine tunes the lable spacing on the lines
  const numberWidth = getTextWidth(" WW.W", `${rem}px MetricWeb`); // Additional value that allows for the max width of figures on the end of the label
  


  // create an array of the correct display labeles to measure overall label width
  const labels =
    isMobile
      ? displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameMobile)
      : displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameDesktop);


  const showMobileDisplayNames = displayData.column_names.displayNameMobile && !state.showLegendOnMobile 
  // Updates the right hand margin based on the width of the longest label, this is kept common accross all facets so that y axis align in the grid
  const mobileRightLabelWidth = showMobileDisplayNames ? getMaxTextWidth(labels, `${rem}px MetricWeb`) + numberWidth : numberWidth
  const desktopRightLabelWidth = getMaxTextWidth(labels, `${rem}px MetricWeb`) + numberWidth + labelTuine;
  const rightLabelWidth = isMobile ? mobileRightLabelWidth: desktopRightLabelWidth
  // Intialise the axis and update the chart layout margin
  facet.node.chartLayout
    .width(facet.width)
    .height(facet.height)
    .xData(dateExtent)
    .xFormat(timeFormat(tickFotmat))
    .yData(valueExtent)
    .update( {margins: { right: rightLabelWidth }},
      // Blank update is called so that the scales are initiated otherwise no scale are generated.
      // Also margin values have to be passed EVERY time chartLayout update is called
    )
  //Get the scales from the updated chartLayout
  const yScale = facet.node.chartLayout.yScale();
  const xScale = facet.node.chartLayout.xScale();

  // Rewturns the lastt plotted date
  const lastDate =
    new Date(state.x.datetime_max) <
    new Date(d3.extent(pollData, (d) => d.date)[1])
      ? new Date(state.x.datetime_max)
      : d3.extent(pollData, (d) => d.date)[1];
      
  let newMargin;
  const maxXDate = facet.node.chartLayout.xData().max;
  if (lastDate.getTime() < maxXDate.getTime()) {
    const labelOffset =
      xScale(maxXDate) - xScale(lastDate);
    newMargin = rightLabelWidth - labelOffset
  }
  else {newMargin = rightLabelWidth}

  // Render the facet
  facet.node.chartLayout.update (
    {margins: {right: newMargin }},
    renderFacets()
  )
      
  // Function that draws the each chart in the grid
  function renderFacets() {
    const props = {
      isMobile, 
      state, 
      colors, 
      facet, 
      xScale, 
      yScale
    }

    updateLegend({...props, legendCategorical, legendContainer})
    updateAxesHighlights({...props, axesHighlights})
    updateAreas({ ...props})

    // Set up label data, This is done before the circles are rendered so that the label data can be used in creating the popups
    const labelData = getLabelData(facet, yScale)
    updateDots({...props, popup, labelData, displayData, pollData})
    updateLines({...props})
    updateLabels({...props, lastDate, rem, labelData})
    
  }

  }