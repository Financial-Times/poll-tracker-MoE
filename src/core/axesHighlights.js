

export function updateAxesHighlights(axesHighlights, plot, facet){
    // Update the annotations
    axesHighlights
    .appendTo(plot)
    .chartLayout(facet.node.chartLayout)
    .update();
}