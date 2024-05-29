import * as d3 from "d3";

export function getAdjustedMargin(facet, lastDate, xScale, rightLabelWidth) {
  let newMargin;
  const maxXDate = facet.node.chartLayout.xData().max;
  console.log("maxDate", maxXDate);

  if (lastDate.getTime() < maxXDate.getTime()) {
    const labelOffset = xScale(maxXDate) - xScale(lastDate);
    console.log("labelOffset", labelOffset);
    console.log("rightLabelWidth", rightLabelWidth);
    if (labelOffset < rightLabelWidth) {
      newMargin = rightLabelWidth - labelOffset;
      console.log("smaller", newMargin);
    }
    if (labelOffset > rightLabelWidth) {
      newMargin = 20;
      console.log("larger", newMargin);
    }
  } else {
    newMargin = rightLabelWidth;
  }

  return newMargin;
}
