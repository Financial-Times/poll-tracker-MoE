import * as d3 from "d3";

export function updateAxesHighlights({axesHighlights, facet}){
    const plot = d3.select(facet.node)
    axesHighlights
        .appendTo(plot)
        .chartLayout(facet.node.chartLayout)
        .update();
}