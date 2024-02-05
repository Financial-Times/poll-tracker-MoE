import * as d3 from "d3";
import {
    extentMulti
  } from "../parseData";

export function getValueExtent(state, pollData, linesData, columnNames, facet){
    // Generate condition to be used to test if differing scales are needed on the y scale
    const sameY = state.facets.sameY
    //Conditionally generate the range for the x axis depending on if the same values are wanted across each facet
    const pollExtent = sameY ? extentMulti(pollData, columnNames) : extentMulti(pollData, facet.data.parties);
    const lineExtent = sameY ?  extentMulti(linesData, ['lower', 'upper']) : extentMulti(linesData.filter((row) => {return facet.data.parties.includes(row.party)}), ['lower', 'upper']);

    const valueExtent = [(Math.min(pollExtent[0],lineExtent[0])), (Math.max(pollExtent[1],lineExtent[1]))]

    valueExtent[0] = state.y.linear_min
    ? state.y.linear_min
    : valueExtent[0];

    valueExtent[1] = state.y.linear_max
    ? state.y.linear_max
    : valueExtent[1];

    return  valueExtent
}