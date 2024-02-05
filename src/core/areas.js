import * as d3 from "d3";

export function updateAreas({plot, facetPlotData, state, isMobile, xScale, yScale, colors}){


    const areaOpacity = isMobile ? state.moe.opacityMob
    : state.moe.opacityDesk

    // set up area interpolation and area drawing function
    const areaData = d3
      .area()
      .x(d => xScale(d.date))
      .y1(d => yScale(d.upper))
      .y0(d => yScale(d.lower));
    
    // Add Margin of error shaded areas
    plot
      .selectAll(".areas")
      .data(facetPlotData)
      .join(
        (enter) =>
        enter.append("path")
          .attr("d", (d) => areaData(d.areas)),
        (update) =>
        update
        .attr("d", (d) => areaData(d.areas)),
        (exit) =>
          exit
            .transition()
            .duration(100)
            .on("end", function areasOnExit() {
              d3.select(this).remove();
            })
      )
      .attr("class", "areas")
      .attr("fill", (d) => colors.getColor(d.party))
      .attr("id", (d) => d.party)
      .attr("opacity", state.moe.render ? areaOpacity : 0) ;
}