import * as d3 from "d3";

export function updateLegend({isMobile, state, facet, colors, legendCategorical, legendContainer}){
    //Return the plotData for this facet
    const facetPlotData = facet.data.plotData
    let legendData = []
    if (isMobile && state.showLegendOnMobile){
      legendData = facetPlotData.map(d=> (
        {
          label: d.displayNameDesk, 
          color: colors.getColor(d.party)
        }
      ))
    }

    legendCategorical.data(legendData);
    legendContainer.update()
}