/**
 * @file
 * The update function is called whenever the user changes a data table or settings
 * in the visualisation editor, or when changing slides in the story editor.
 *
 * Tip: to make your template work nicely in the story editor, ensure that all user
 * interface controls such as buttons and sliders update the state and then call update.
 */
import * as d3 from "d3";
import { getTextWidth } from "@flourish/pocket-knife";
import createChartLayout from "@flourish/chart-layout";
import { timeFormat } from "d3-time-format";
import {
  extentMulti,
  getDots,
  getMoE,
  getMaxTextWidth,
} from "../parseData";

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

export default function update() {
  const { colors, layout, chart, data, state, facets, props, axesHighlights, popup, legendCategorical, legendContainer} = this;

  // /////////// DATA

  // Conditionally maps the facet names depending on if a grod of charts or a single plot is requires
  const facetNames = state.gridKey ? data.Lines.map( d => d.facet)
  .filter((item, pos, facetNames) => facetNames.indexOf(item) === pos)
  : [""]
  const columnNames = data.polls.column_names.value;
  colors.updateColorScale(columnNames);

  const { displayData } = this.data;

  const { dateFormat } = state;
  const parseDate = d3.timeParse(dateFormat);

  // Format the polling data so that it can be used to create global values and plot points
  const pollData = data.polls
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .map((d, index) => {
      const row = { date: parseDate(d.date), pollster: d.pollster, rowID: index, };
      columnNames.forEach((el, i) => {
        row[columnNames[i]] = isNaN(d.value[i]) ? "" : Number(d.value[i]);
      });
      return row;
    })

  const linesData = data.Lines
  .sort((a, b) => parseDate(a.date) - parseDate(b.date))
  .map((d) => {
    return {
      date: parseDate(d.date),
      party: d.party,
      lower: Number(d.lower),
      upper: Number(d.upper),
      value: Number(d.value)
    }
  })

  // Create a global date extent array as this remains constant across all facets
  const dateExtent = d3.extent(pollData, (d) => d.date);
    // Check for user overideas to the dateextent array
    dateExtent[0] = state.x.datetime_min
      ? new Date(state.x.datetime_min)
      : d3.extent(pollData, (d) => d.date)[0];
    dateExtent[1] = state.x.datetime_max
      ? new Date(state.x.datetime_max)
      : d3.extent(pollData, (d) => d.date)[1];
  
  //Fliter the data according to the dateExtent to avoid plotting lines etc outside theaxis margins


  // calculate and apply fixed height on breakpoint before rem calculation
  // or text on bars will jump when cross the tablet breakpoint. This is also used to determine the correct Formatdisplayname
  const breakpoint = state.layout.breakpoint_tablet;
  // update the proportions of the containing svg
  let width = layout.getPrimaryWidth();
  let height;
  const isMobile = width <= breakpoint
  // Use the layout setHeight functionality to control the aspect ration when 'ratio' selected
  if (this.state.aspectRatio === "ratio") {
    // Use the breakpoint to determne which aspect ratio calculation is used
    height =
    isMobile
        ? width / state.aspect.small
        : width / state.aspect.desk;
    this.layout.setHeight(height);
  } else {
    height = layout.getPrimaryHeight();
    layout.setHeight(null);
  }
  
  // Format for footnote date
  const updateFormat = timeFormat("%b %e");
  // Toggle that controls the automatic update of the footnote to include last polling date
  if(state.footnoteSwitch) {
    // chart_layout.xFormat(getDateFormat('years', chart_layout.xTicks()))
    state.layout.footer_note = `Latest poll ${updateFormat(
      pollData[pollData.length - 1].date
    )}`;
  }
  else if (this.state.layout.footer_note === `Latest poll ${updateFormat(
    pollData[pollData.length - 1].date
  )}`)
  {state.layout.footer_note = '';}

  chart
    .attr('width', width)
    .attr('height', height)
  layout.update();

  // create an array of the correct display labeles to measure overall label width
  const labels =
    isMobile
      ? displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameMobile)
      : displayData
          .filter((el) => columnNames.includes(el.party))
          .map((d) => d.displayNameDesktop);

  const facetData = facetNames.map((facetName) => {

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

  // //// RENDER

  // Generate condition to be used to test if differing scales are needed on the y scale
  const sameY = state.facets.sameY

  // Set up the fcates object
  facets
    .width(width)
    .height(height)
    .data(facetData, d => d.name)
    .update((facet) => {

  //Conditionally generate the range for the x axis depending on if the same values are wanted across each facet
  const pollExtent = sameY ? extentMulti(pollData, columnNames)
  : extentMulti(pollData, facet.data.parties);
  const lineExtent = sameY ?  extentMulti(linesData, ['lower', 'upper'])
  : extentMulti(linesData.filter((row) => {return facet.data.parties.includes(row.party)}), ['lower', 'upper']);

  //Returns the range of numbers for the y axis
  const valueExtent = [(Math.min(pollExtent[0],lineExtent[0])), (Math.max(pollExtent[1],lineExtent[1]))]
  valueExtent[0] = state.y.linear_min
  ? state.y.linear_min
  : valueExtent[0];
  valueExtent[1] = state.y.linear_max
  ? state.y.linear_max
  : valueExtent[1];

  //Chart layout created and updated if none exists. Needs to be updated before anything else so that a REM value can be returned
  if (!facet.node.chartLayout)  {
    facet.node.chartLayout = createChartLayout(facet.node, props).update();
  }
  // Returns the rem size to be the same as the x axis tick label
  const rem = (layout.remToPx(100) / 100) * state.x.tick_label_size;
  const tickFotmat = state.tickFormat; // user defined x axis date format
  const labelTuine = state.tuneLabel; // Fine tunes the lable spacing on the lines
  const numberWidth = getTextWidth("W.W", `${rem}px MetricWeb`); // Additional value that allows for the max width of figures on the end of the label
  
  // Updates the right hand margin based on the width of the longest label, this is kept common accross all facets so that y axis align in the grid
  const mobileRightLabelWidth = numberWidth
  const desktopRightLabelWidth = getMaxTextWidth(labels, `${rem}px MetricWeb`) +
  numberWidth +
  labelTuine;
  const rightLabelWidth = isMobile ? mobileRightLabelWidth: desktopRightLabelWidth
  // Intialise the axis and update the chart layout margin
  facet.node.chartLayout
    .width(facet.width)
    .height(facet.height)
    .xData(dateExtent)
    .xFormat(timeFormat(tickFotmat))
    .yData(valueExtent)
    .update( {margins: { right: rightLabelWidth }},
      // Blank update is called so that the scales are initiated otherwise no scale are generated.
      // Also margin values have to be passed EVERY time chartLayout update is called
    )
  //Get the scales from the updated chartLayout
  const yScale = facet.node.chartLayout.yScale();
  const xScale = facet.node.chartLayout.xScale();

  // Rewturns the lastt plotted date
  const lastDate =
  new Date(state.x.datetime_max) <
  new Date(d3.extent(pollData, (d) => d.date)[1])
    ? new Date(state.x.datetime_max)
    : d3.extent(pollData, (d) => d.date)[1];
      
  // function to check if the last plotted date falls before the end of the x axis date range to adjust the right margin labelwidth accordingly
  let newMargin;
  const maxXDate = facet.node.chartLayout.xData().max;
  if (lastDate.getTime() < maxXDate.getTime()) {
    const labelOffset =
      xScale(maxXDate) - xScale(lastDate);
    newMargin = rightLabelWidth - labelOffset
  }
  else {newMargin = rightLabelWidth}

  // Render the facet
  facet.node.chartLayout.update (
    {margins: {right: newMargin }},
    renderFacets()
  )
      
  // Function that draws the each chart in the grid
  function renderFacets() {

    //Return the plotData for this facet
    const facetPlotData = facet.data.plotData
    
    // Return the  scg plot object
    
    const plot = d3.select(facet.node)
    let legendData = []
    if (isMobile && state.show_legend_on_mobile){
      legendData = facetPlotData.map(d=> (
        {
          label: d.displayNameDesk, 
          color: colors.getColor(d.party)
        }
      ))
    }

    legendCategorical.data(legendData);
    legendContainer.update()


    // Update the annotations
    axesHighlights
    .appendTo(plot)
    .chartLayout(facet.node.chartLayout)
    .update();

    // Assign the various rendering options for the lines, dots and areas
    const dotOpacity =
      isMobile
        ? state.polls.opacitySmall
        : state.polls.opacityDesk;
    const dotSize =
      isMobile ? state.polls.sizeSmall : state.polls.sizeDesk;
    const areaOpacity = isMobile ? state.moe.opacityMob
    : state.moe.opacityDesk
      const lineWidth =
      isMobile
        ? state.averages.smallStrokeWidth
        : state.averages.largeStrokeWidth;
    const lineOpacity =
      isMobile
        ? state.averages.smallOpacity
        : state.averages.largeOpacity;
    
    // Formatting for the label number
    const formatLabel = d3.format(".1f");

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

    // Set up label data, This is done before the circles are rendered so that the label data can be used in creating the popups
    const labelData = facetPlotData
      .map(({ areas, party, displayNameDesk, displayNameMob, altTextColor }) => {
        const average = areas[areas.length - 1].value;
        return {
          party,
          altTextColor,
          displayNameDesk,
          displayNameMob,
          average,
          // Set initial positions for each label
          position: yScale(average),
        };
      })
      .sort((a, b) => b.average - a.average);

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

    // set up line interpolation and line drawing function
    const interpolation = d3.curveLinear;
    const lineData = d3
      .line()
      .defined((d) => d)
      .curve(interpolation)
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    const highlightStrokeWidth = width < breakpoint ? lineWidth + 4 : lineWidth + 4;
    
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
    // add the party name labels
    const label_offset = width >= breakpoint ? rem : thirdRem
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
            .attr("x", () => xScale(lastDate) + label_offset),
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
        if (d.altTextColor) {
          return d.altTextColor;
        }
        return colors.getColor(d.party);
      })
      .text((d) => {
        if (isMobile) {
          const text = d.displayNameMob || ""
          return `${text} ${formatLabel(d.average)}`;
        }
        return `${d.displayNameDesk} ${formatLabel(d.average)}`;
      });

  }

  });
  // Hides the facet title on single charts
  facets.hideTitle(facetNames[0])

}
