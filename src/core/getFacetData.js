import {
    getDots,
    getMoE,
  } from "../parseData";

export function getFacetData({facetNames, state, data, displayData, linesData, pollData, dateExtent}){
    const columnNames = data.polls.column_names.value;
    return facetNames.map((facetName) => {

        // Create a unique list of parties that are only plotted in this particular facet
        const parties = state.gridKey
        ? data.Lines
          .filter((row) =>  row.facet === facetName)
          .map( d => d.party)
          .filter((item, pos, parties) => parties.indexOf(item) === pos)
        : columnNames
    
        // Build the plot object containing data to be rendered for each facet
        const plotData = parties.map((party) => {
          // Returns an object containing the party disply labels and text colours
          const viewData = displayData.find(({ party: p }) => party === p);
          
          // Filter the lines data so tha just those with the parties for this facet are plotted
          const plotLines = linesData
          .filter((lineRow) => {
            return lineRow.party === party;
          })
          return {
            party,
            displayNameMob: viewData.displayNameMobile,
            displayNameDesk: viewData.displayNameDesktop,
            altTextColor: viewData.altTextColor,
            dots: getDots(pollData, party).filter((el) => el.date > dateExtent[0] && el.date,
            dateExtent[1]),
            areas: getMoE(plotLines, party).filter((el) => el.date > dateExtent[0] && el.date,
            dateExtent[1]),
          };
        })
    
        return {
          name: facetName,
          parties: parties, //list of the parties to be displayed in that particular facet
          plotData: plotData,
        }
      })
}