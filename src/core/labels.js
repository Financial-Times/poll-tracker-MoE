import * as d3 from "d3";

export function updateLabels({facet, rem, isMobile, labelData, colors, xScale, lastDate, showLegendOnMobile}){
    // Return the  scg plot object
    const plot = d3.select(facet.node)
    // Create a group for each label
    plot
      .selectAll(".labelHolder")
      .data(labelData)
      .enter()
      .append("g")
      .attr("class", "labelHolder");
    
    // Calculate new label positions recursively
    positionLabels(
      plot.selectAll(".labelHolder"),
      rem, // Minimum spacing between labels (increase for more space)
      0.5 // Amount to change label positon by each iteration
    );

    // Add the label rects
    const thirdRem = rem * 0.3
    if (!isMobile){
      plot
        .selectAll(".labelHolder")
        .selectAll("rect")
        .data((d) => [d])
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("height", rem),
          (updateRect) =>
          updateRect
              .attr("y", (d) => d.position - rem * 0.5)
              .attr("x", () => xScale(lastDate) + thirdRem)
              .attr("width", rem * 0.5),
          (exit) =>
            exit
              .transition()
              .attr("width", 0)
              .on("end", function labelHolderRectExitOnEnd() {
                d3.select(this).remove();
              })
        )
        .attr("fill", (d) => colors.getColor(d.party))
        .attr("height", rem)
        .attr("width", rem * 0.5);
    }

    // Formatting for the label number
    const formatLabel = d3.format(".1f");

    const labelOffset = !isMobile ? rem : thirdRem
    // add the party name labels
    plot
      .selectAll(".labelHolder")
      .selectAll("text")
      .data((d) => [d])
      .join(
        (enter) =>
          enter
            .append("text"),
        (updateText) =>
        updateText
            .attr("y", (d) => d.position + thirdRem)
            .attr("x", () => xScale(lastDate) + labelOffset),
        (exit) =>
          exit
            .transition()
            .attr("opacity", 0)
            .on("end", function labelHolderTextExitOnEnd() {
              d3.select(this).remove();
            })
      )
      .attr("font-weight", 600)
      .attr("font-size", rem)
      .style("fill", (d) => {
        // Conditionally set the color of the text depending on if an alternative colour is defined
        return d.altTextColor || colors.getColor(d.party)
      })
      .text((d) => {
        if (isMobile) {
          const mobileDisplayName = d.displayNameMob || ""
          const text = showLegendOnMobile ?  "" : mobileDisplayName
          return `${text} ${formatLabel(d.average)}`;
        }
        return `${d.displayNameDesk} ${formatLabel(d.average)}`;
      });

  }


// Helper function to position labels
const positionLabels = (labels, spacing, alpha) => {
  labels.each((d1) => {
    const y1 = d1.position;
    const a1 = d1.average;

    labels.each((d2) => {
      const y2 = d2.position;
      const a2 = d2.average;

      /* Difference between current averages for each party
            This ensures the parties are always in the correct order */
      const deltaA = a1 - a2;
      /* Difference between current positions
            When this is below the required minimum spacing the positioning
            algorithm should stop */
      const deltaY = y1 - y2;

      if (d1 !== d2 && Math.abs(deltaY) <= spacing) {
        const sign = deltaA > 0 ? -1 : 1;
        const adjust = sign * alpha;

        /* eslint-disable no-param-reassign */
        d1.position = +y1 + adjust;
        d2.position = +y2 - adjust;
        /* eslint-enable */

        positionLabels(labels, spacing, alpha);
      }
    });
  });
};