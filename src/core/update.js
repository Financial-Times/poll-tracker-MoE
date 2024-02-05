/**
 * @file
 * The update function is called whenever the user changes a data table or settings
 * in the visualisation editor, or when changing slides in the story editor.
 *
 * Tip: to make your template work nicely in the story editor, ensure that all user
 * interface controls such as buttons and sliders update the state and then call update.
 */
import * as d3 from "d3";
import { getTextWidth } from "@flourish/pocket-knife";
import createChartLayout from "@flourish/chart-layout";
import { timeFormat } from "d3-time-format";
import {
  extentMulti,
  getMaxTextWidth,
} from "../parseData";
import {updateLabels} from './labels'
import { updateLines } from "./lines";
import {updateDots} from './dots'
import { updateAxesHighlights } from "./axesHighlights";
import {updateAreas} from './areas'
import { updateLegend } from "./legend";
import { getFacetData } from "./getFacetData";
import { getLinesData } from "./getLinesData";
import { getPollData } from "./getPollData";
import {updateHeight} from './height'
import { getDateExtent } from "./getDateExtent";



export default function update() {
  const { colors, layout, chart, data, state, facets, props, axesHighlights, popup, legendCategorical, legendContainer} = this;

  // /////////// DATA

  // Conditionally maps the facet names depending on if a grod of charts or a single plot is requires
  const facetNames = state.gridKey ? data.Lines.map( d => d.facet)
  .filter((item, pos, facetNames) => facetNames.indexOf(item) === pos)
  : [""]

  const columnNames = data.polls.column_names.value;
  
  colors.updateColorScale(columnNames);

  const { displayData } = this.data;

  // Format the polling data so that it can be used to create global values and plot points
  const pollData = getPollData(data, state)
  const linesData = getLinesData(data, state)

  const dateExtent = getDateExtent(pollData, state)

  const {width, height} = updateHeight(state, layout)
  const isMobile = width <= state.layout.breakpoint_tablet;
  
  // Format for footnote date
  const updateFormat = timeFormat("%b %e");
  // Toggle that controls the automatic update of the footnote to include last polling date
  if(state.footnoteSwitch) {
    // chart_layout.xFormat(getDateFormat('years', chart_layout.xTicks()))
    state.layout.footer_note = `Latest poll ${updateFormat(
      pollData[pollData.length - 1].date
    )}`;
  }
  else if (this.state.layout.footer_note === `Latest poll ${updateFormat(
    pollData[pollData.length - 1].date
  )}`)
  {state.layout.footer_note = '';}

  chart
    .attr('width', width)
    .attr('height', height)

  layout.update();

  // create an array of the correct display labeles to measure overall label width
  const labels =
    isMobile
      ? displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameMobile)
      : displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameDesktop);


  const facetData = getFacetData({facetNames, state, data, displayData, linesData, pollData, dateExtent})


  // //// RENDER

  // Generate condition to be used to test if differing scales are needed on the y scale
  const sameY = state.facets.sameY

  // Set up the facets object
  facets
    .width(width)
    .height(height)
    .data(facetData, d => d.name)
    .update((facet) => {

  //Conditionally generate the range for the x axis depending on if the same values are wanted across each facet
  const pollExtent = sameY ? extentMulti(pollData, columnNames) : extentMulti(pollData, facet.data.parties);
  const lineExtent = sameY ?  extentMulti(linesData, ['lower', 'upper']) : extentMulti(linesData.filter((row) => {return facet.data.parties.includes(row.party)}), ['lower', 'upper']);

  //Returns the range of numbers for the y axis
  const valueExtent = [(Math.min(pollExtent[0],lineExtent[0])), (Math.max(pollExtent[1],lineExtent[1]))]
  valueExtent[0] = state.y.linear_min
  ? state.y.linear_min
  : valueExtent[0];
  valueExtent[1] = state.y.linear_max
  ? state.y.linear_max
  : valueExtent[1];

  //Chart layout created and updated if none exists. Needs to be updated before anything else so that a REM value can be returned
  if (!facet.node.chartLayout)  {
    facet.node.chartLayout = createChartLayout(facet.node, props).update();
  }
  // Returns the rem size to be the same as the x axis tick label
  const rem = (layout.remToPx(100) / 100) * state.x.tick_label_size;
  const tickFotmat = state.tickFormat; // user defined x axis date format
  const labelTuine = state.tuneLabel; // Fine tunes the lable spacing on the lines
  const numberWidth = getTextWidth(" WW.W", `${rem}px MetricWeb`); // Additional value that allows for the max width of figures on the end of the label
  
  const showMobileDisplayNames = displayData.column_names.displayNameMobile && !state.showLegendOnMobile 
  // Updates the right hand margin based on the width of the longest label, this is kept common accross all facets so that y axis align in the grid
  const mobileRightLabelWidth = showMobileDisplayNames ? getMaxTextWidth(labels, `${rem}px MetricWeb`) + numberWidth : numberWidth
  const desktopRightLabelWidth = getMaxTextWidth(labels, `${rem}px MetricWeb`) +
  numberWidth +
  labelTuine;
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

    //Return the plotData for this facet
    const facetPlotData = facet.data.plotData
    // Set up label data, This is done before the circles are rendered so that the label data can be used in creating the popups
    const labelData = facetPlotData
      .map(({ areas, party, displayNameDesk, displayNameMob, altTextColor }) => {
        const average = areas[areas.length - 1].value;
        return {
          party,
          altTextColor,
          displayNameDesk,
          displayNameMob,
          average,
          // Set initial positions for each label
          position: yScale(average),
        };
      })
      .sort((a, b) => b.average - a.average);



    updateDots({...props, popup, labelData, displayData, pollData})
    updateLines({...props})
    updateLabels({...props, lastDate, showLegendOnMobile:state.showLegendOnMobile, rem, labelData})
    
  }

  });
  // Hides the facet title on single charts
  facets.hideTitle(facetNames[0])

}
