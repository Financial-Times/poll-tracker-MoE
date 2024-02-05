import * as d3 from "d3";

export function getAdjustedMargin(facet,lastDate, xScale, rightLabelWidth){
    let newMargin;
    const maxXDate = facet.node.chartLayout.xData().max;

    if (lastDate.getTime() < maxXDate.getTime()) {
        const labelOffset =
            xScale(maxXDate) - xScale(lastDate);
        newMargin = rightLabelWidth - labelOffset
    }
    else { newMargin = rightLabelWidth }

    return newMargin
}