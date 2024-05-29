import * as d3 from "d3";

export function getAdjustedMargin(facet, lastDate, xScale, rightLabelWidth) {
  let newMargin;
  const maxXDate = facet.node.chartLayout.xData().max;

  if (lastDate.getTime() < maxXDate.getTime()) {
    const labelOffset = xScale(maxXDate) - xScale(lastDate);
    if (labelOffset < rightLabelWidth) {
      newMargin = rightLabelWidth - labelOffset;
    }
    if (labelOffset > rightLabelWidth) {
      newMargin = 20;
    }
  } else {
    newMargin = rightLabelWidth;
  }

  return newMargin;
}
