import * as d3 from "d3";
import { timeFormat } from "d3-time-format";

export function updateDots({facet, state, xScale,yScale, pollData, isMobile, colors, popup, labelData, displayData}){
    //Return the plotData for this facet
    const facetPlotData = facet.data.plotData
    // Return the  scg plot object
    const plot = d3.select(facet.node)
    // date format for the popus
    const popFormat = "%b %e %Y";
    const popDate = timeFormat(popFormat);

    // function for adding colour to the popup iyems category names
    const popupCallback = (node) => {
      if (!node) return;
      const items = d3.select(`#${node.id}`).selectAll(".data-heading").nodes();
      // eslint-disable-next-line
      for (let i = 0; i < items.length; i++) {
        const mobileName = d3.select(items[i]).text();
        const partyData = displayData.filter(
          (d) => d.displayNameMobile === mobileName
        );
        // use alternative text colour if specified
        const newTextColour = 
          partyData[0].altTextColor !== ""
            ? partyData[0].altTextColor
            : colors.getColor(partyData[0].party);
        d3.select(items[i]).style("color", newTextColour);
      }
    };
        // Assign the various rendering options for the lines, dots and areas
    const dotOpacity =
    isMobile
        ? state.polls.opacitySmall
        : state.polls.opacityDesk;

    const dotSize =
    isMobile ? state.polls.sizeSmall : state.polls.sizeDesk;
    // Add a group for each series of dots
    plot
      .selectAll(".dotHolder")
      .data(facetPlotData)
      .enter()
      .append("g")
      .attr("class", "dotHolder");

    // Add the polling circles
    plot
      .selectAll(".dotHolder")
      .selectAll("circle")
      .data((d) => state.polls.render ? d.dots : [])
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("id", (d, i) => d.rowID),
        (updateDots) =>
          updateDots
            .attr("cx", (d) => xScale(d.date))
            .attr("cy", (d) => yScale(d.value)),
        (exit) =>
          exit
            .transition()
            .duration(500)
            .attr("r", 0)
            .on("end", function circlesExitOnEnd() {
              d3.select(this).remove();
            })
      )
      .attr("r", dotSize)
      .attr("fill", (d) => colors.getColor(d.party))
      .attr("opacity", dotOpacity ) 
      .on("mouseover", function circlesOnMouseover(ev, d) {
        const lookUp = ev.rowID
        const dot = this;
        // Create the titel field for the popup  
        const popFields = { name: "name" };
        
        // Filter the data with the same row (data from that particular poll)
        const pollPopData = pollData.filter(
          (el,) =>  el.rowID === lookUp
        );
        // build a dataset of party values that can be sorted before defining the popup column fields
        const popUps = labelData
          .map((el) => {
            const partyLookup = displayData.filter((row) => row.party === el.party);
            return {
              name: el.party,
              displayName: partyLookup[0].displayNameMobile,
              value: pollPopData[0][el.party],
            };
          })
          .sort((a, b) => b.value - a.value)
          .filter((el) => el.value !== 0 || el.value === '');

        // Define other popup fields. Note that the element name (code) and not displayName defines the category this is so that
        // the party name can be coloured using the Flourish getColour. But the displayName appears in the rendered popup
        popUps.forEach((el) => {
          popFields[el.name] = el.displayName;
        });

        // Number formatting for the popups
        const format = d3.format(".0f");

         // Set the column fields using the definitions from the popFields object
        popup.setColumnNames(popFields).update();

        // Pass the sorted data to the popup as defined by the unique row ID the mouse is over
        const popData = {
          name: `${popDate(pollPopData[0].date)} <br>Pollster: ${pollPopData[0].pollster}`,
        };
          popUps.forEach((el) => {
            popData[el.name] = format(el.value);
          });
          popup.popupDirections(["left", "right"]);
          popup.mouseover(dot, popData, popupCallback);

          // Select all the dots from this particular poll via the row id
          const dots = plot
            .selectAll(".dotHolder")
            .selectAll("circle")
            .filter((item) => item.rowID === ev.rowID);
          dots
            .attr("r", dotSize * 2)
            .attr("stroke", "#000000")
            .attr("opacity", 1)
            .attr("stroke-width", 1);
      })
        .on("mouseout", (ev, d) => {
          popup.mouseout();
          // Select all the dots from this particular poll via the row id
          const dots = plot
            .selectAll(".dotHolder")
            .selectAll("circle")
            .filter((item) => item.rowID === ev.rowID);
          dots
            .attr("r", dotSize)
            .attr("stroke", "none")
            .attr("stroke-width", 0)
            .attr("opacity", dotOpacity);
    });


}