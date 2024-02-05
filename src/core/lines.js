import * as d3 from "d3";

export function updateLines(plot, facetPlotData, colors, isMobile, state, xScale, yScale){
    const lineWidth =
    isMobile
      ? state.averages.smallStrokeWidth
      : state.averages.largeStrokeWidth;
      
    const lineOpacity =
        isMobile
        ? state.averages.smallOpacity
        : state.averages.largeOpacity;

    // set up line interpolation and line drawing function
    const interpolation = d3.curveLinear;
    const lineData = d3
        .line()
        .defined((d) => d)
        .curve(interpolation)
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value));

    const highlightStrokeWidth = isMobile ? lineWidth + 4 : lineWidth + 4;
    
    // Add the stroke highlightlines to the chart
    plot
    .selectAll(".strokeLines")
    .data(facetPlotData)
    .join(
        (enter) =>
        enter.append("path").attr("d", (d) => lineData(d.areas)),
        (updateLines) => updateLines.attr("d", (d) => lineData(d.areas)),
        (exit) =>
        exit
            .transition()
            .duration(100)
            .attr("d", (d) => lineData(d.areas))
            .on("end", function linesOnEnd() {
            d3.select(this).remove();
            })
    )
    .attr("class", "strokeLines")
    .attr("fill", "none")
    .attr("stroke-width", highlightStrokeWidth)
    .attr("stroke", "#FFF1E5")
    .attr("id", (d) => d.party)
    .attr("opacity", 1)
    

    // Add the lines to the chart
    plot
      .selectAll(".lines")
      .data(facetPlotData)
      .join(
        (enter) =>
        enter.append("path").attr("d", (d) => lineData(d.areas)),
        (updateLines) => updateLines.attr("d", (d) => lineData(d.areas)),
        (exit) =>
          exit
            .transition()
            .duration(100)
            .attr("d", (d) => lineData(d.areas))
            .on("end", function linesOnEnd() {
              d3.select(this).remove();
            })
      )
      .attr("class", "lines")
      .attr("fill", "none")
      .attr("stroke-width", lineWidth)
      .attr("stroke", (d) => colors.getColor(d.party))
      .attr("id", (d) => d.party)
      .attr("opacity", state.averages.render ? lineOpacity : 0);

}