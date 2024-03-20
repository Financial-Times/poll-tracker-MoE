import * as d3 from "d3";
import {
    getMaxTextWidth,
  } from "../parseData";
import { getTextWidth } from "@flourish/pocket-knife";

export function getSpaceForLabels({state, isMobile, displayData, columnNames, rem}){
    const labelTune = state.tuneLabel; // Fine tunes the lable spacing on the lines
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
  const desktopRightLabelWidth = getMaxTextWidth(labels, `${rem}px MetricWeb`) + numberWidth + labelTune;
  const rightLabelWidth = isMobile ? mobileRightLabelWidth: desktopRightLabelWidth

  return rightLabelWidth
}