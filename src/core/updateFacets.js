import createChartLayout from "@flourish/chart-layout";
import { timeFormat } from "d3-time-format";
import {updateLabels} from './labels'
import { updateLines } from "./lines";
import {updateDots} from './dots'
import { updateAxesHighlights } from "./axesHighlights";
import {updateAreas} from './areas'
import { updateLegend } from "./legend";
import { getLabelData } from "./getLabelData";
import {getValueExtent} from "./getValueExtent"
import { getSpaceForLabels } from "./getSpaceForLabels";
import { getLastDate } from "./getLastDate";
import { getAdjustedMargin } from "./getAdjustedMargin";

// called once PER FACET
export const updateFacets = ({
    facet, 
    colors, 
    layout, 
    width,
    pollData,
    linesData,
    state,
    props,
    columnNames,
    dateExtent,
    data,
    axesHighlights,
    popup,
    legendCategorical,
    legendContainer
  }) => {

    //Returns the range of numbers for the y axis
    const valueExtent = getValueExtent(state, pollData, linesData, columnNames, facet)

    //Chart layout created and updated if none exists. Needs to be updated before anything else so that a REM value can be returned
    if (!facet.node.chartLayout)  {
        facet.node.chartLayout = createChartLayout(facet.node, props).update();
    }
    // Returns the rem size to be the same as the x axis tick label
    const rem = (layout.remToPx(100) / 100) * state.x.tick_label_size;
    const {displayData} = data
    const isMobile = width <= state.layout.breakpoint_tablet;
    const rightLabelWidth = getSpaceForLabels({state, isMobile, displayData, columnNames, rem})
    
    // Intialise the axis and update the chart layout margin
    facet.node.chartLayout
        .width(facet.width)
        .height(facet.height)
        .xData(dateExtent)
        .xFormat(timeFormat(state.tickFormat))
        .yData(valueExtent)
        .update( {margins: { right: rightLabelWidth }},
            // Blank update is called so that the scales are initiated otherwise no scale are generated.
            // Also margin values have to be passed EVERY time chartLayout update is called
        )
    //Get the scales from the updated chartLayout
    const yScale = facet.node.chartLayout.yScale();
    const xScale = facet.node.chartLayout.xScale();

    // Rewturns the last plotted date
    const lastDate = getLastDate(state, pollData)
    const newMargin = getAdjustedMargin(facet, lastDate, xScale, rightLabelWidth)

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