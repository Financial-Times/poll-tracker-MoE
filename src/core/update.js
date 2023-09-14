/**
 * @file
 * The update function is called whenever the user changes a data table or settings
 * in the visualisation editor, or when changing slides in the story editor.
 *
 * Tip: to make your template work nicely in the story editor, ensure that all user
 * interface controls such as buttons and sliders update the state and then call update.
 */
import * as d3 from "d3";
import initialisePopup from "@flourish/info-popup";
import { timeFormat } from "d3-time-format";
import {
  extentMulti,
  getDots,
  getlines,
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
  const { colors, layout, chart, chartLayout, data, state, facets } = this;

///////////// DATA

console.log('data', data)

console.log('state.gridKey', state.gridKey)

// Conditionally maps the facet names depending on if a grod of charts or a single plot is requires
const facetNames = state.gridKey ? data.Lines.map( d => d.facet)
.filter((item, pos, facetNames) => facetNames.indexOf(item) === pos)
: [""]

console.log('facetNames', facetNames)

 //const facetData = state.gridKey ? getFacetData() : state.layout.subtitle
const facetData = facetNames.map((facetName) => {

  // Create a list of parties that are only plotted in this particular facet
  const parties = data.Lines
  .filter((row) =>  row.facet === facetName)
  .map( d => d.party)
  .filter((item, pos, parties) => parties.indexOf(item) === pos);

console.log('parties', parties)

  return {
    name: facetName,
    lines: 'not yet aded',
  }
})

console.log('facetData', facetData)

facets
		.width(layout.getPrimaryWidth())
		.height(layout.getPrimaryHeight())
		.data(facetData, d => d.name)
		.update(function(facet) {
      console.log('facet.data', facet.data)
			// Here we update each facet
		});
// Hides the facet title on single charts
facets.hideTitle(facetNames[0])








  // // Define the column names that are used as they key to build the formatted polls data object and define update Flourish colour domain
  // const columnNames = data.polls.column_names.value;
  // // Update the Flourish colorScake domain to those of thepolling data column names
  // // Define the column names that are used as they key to build the formatted averages data object and define update Flourish colour domain
  // const averageNames = data.averages.column_names.value;
  // // Define the partieslooup array, used in getting the correct display depending on the chart width
  // const { parties } = data;
  // colors.updateColorScale(columnNames);

  // const updateFormat = timeFormat("%b %d");
  // const { dateFormat } = state;
  // const parseDate = d3.timeParse(dateFormat);
  // // Create formatted data object of the polling data and format the dates
  // const formattedPolls = data.polls
  //   .map((d) => {
  //     const row = { date: parseDate(d.date), pollster: d.house };
  //     columnNames.forEach((el, i) => {
  //       row[columnNames[i]] = Number(d.value[i]);
  //     });
  //     return row;
  //   })
  //   .sort((a, b) => a.date - b.date);
  // // Create formatted data object of the averages data and format the dates
  // const formattedAverages = data.averages
  //   .map((d) => {
  //     const row = {
  //       date: parseDate(d.date),
  //       code: d.code,
  //       geo: d.geo,
  //       race: d.race,
  //     };
  //     averageNames.forEach((el, i) => {
  //       row[averageNames[i]] = Number(d.value[i]);
  //     });
  //     return row;
  //   })
  //   .sort((a, b) => a.date - b.date);
  // // Calculate the initual value extent used to define the y axis in the update function
  // const valueExtent = extentMulti(formattedPolls, columnNames);
  // // create the data object passed to the update function that can be filtered by date to create the chart
  // const plotData = columnNames.map((party) => {
  //   const partyData = parties.find(({ party: p }) => party === p);
  //   return {
  //     party,
  //     displayNameMob: partyData.displayNameMobile,
  //     displayNameDesk: partyData.displayNameDesktop,
  //     dots: getDots(formattedPolls, party),
  //     lines: getlines(formattedAverages, party, partyData.displayNameDesktop),
  //     areas: getMoE(formattedAverages, party),
  //   };
  // });

  // state.layout.footer_note = `Latest poll ${updateFormat(
  //   formattedPolls[formattedPolls.length - 1].date
  // )}`;
  // layout.update();

  // const width = layout.getPrimaryWidth();
  // const height = layout.getPrimaryHeight();
  // chart.attr("width", width).attr("height", height);

  // /* eslint-disable no-nested-ternary */
  // // get the current frame breakpoint name
  // const breaks =
  //   width > state.layout.breakpoint_mobile_small &&
  //   width <= state.layout.breakpoint_mobile_big
  //     ? "mobile_small"
  //     : width > state.layout.breakpoint_mobile_big &&
  //       width <= state.layout.breakpoint_tablet
  //     ? "mobile_big"
  //     : width > state.layout.breakpoint_tablet &&
  //       width <= state.layout.breakpoint_desktop
  //     ? "tablet"
  //     : width > state.layout.breakpoint_desktop &&
  //       width <= state.layout.breakpoint_big_screen
  //     ? "desktop"
  //     : "big_screen";
  // /* eslint-enable no-nested-ternary */

  // // Update the chartLayout module so its measurements match the layout
  // chartLayout.width(width);
  // chartLayout.height(height);
  // // Set the permanent mobile/desktop breakpoint
  // const breakpoint = state.layout.breakpoint_tablet;
  // // returns the current body text size. (Strangely this expressed as a % of footer size when returned)
  // const fontSize = state.layout[`font_size_${breaks}`];
  // // use the body size text as rem expressed in px not em
  // const rem = layout.remToPx(fontSize) / 100;
  // // Number formatting for the line lables and popups
  // const format = d3.format(".1f");

  // // initialise the Flourish popup module
  // const popup = initialisePopup(state.popup);
  // // Derive date ranges from both polls and averages datasets todefine overall date range
  // const averagesExtent = d3.extent(formattedAverages, (d) => d.date);
  // const pollsExtent = d3.extent(formattedPolls, (d) => d.date);
  // const dateExtent = d3.extent(averagesExtent.concat(pollsExtent), (d) => d);
  // // set various userdefined chart visual parameters depending on chart width as defined by the breakpoint const
  // const dotSize =
  //   width < breakpoint ? state.polls.smallSize : state.polls.largeSize;
  // const dotOpacity =
  //   width < breakpoint ? state.polls.smallOpacity : state.polls.largeOpacity;
  // const lineWidth =
  //   width < breakpoint
  //     ? state.averages.smallStrokeWidth
  //     : state.averages.largeStrokeWidth;
  // const lineOpacity =
  //   width < breakpoint
  //     ? state.averages.smallOpacity
  //     : state.averages.largeOpacity;
  // const moeOpacity =
  //   width < breakpoint ? state.moe.opacityMob : state.moe.opacityDesk;
  // // Calculate the width need for the righ chart_layput margin
  // // This needs to be passed to the chrat_layout module EVERY time it is updated
  // const rightLabelWidth =
  //   getMaxTextWidth(columnNames, `${rem}px Metric`) + rem * 3.5;
  // const xAlign = state.x.axis_position;
  // // Allow users to overide the y axis date extent
  // dateExtent[0] = state.x.datetime_min
  //   ? parseDate(state.x.datetime_min)
  //   : dateExtent[0];
  // dateExtent[1] = state.x.datetime_max
  //   ? parseDate(state.x.datetime_max)
  //   : dateExtent[1];
  // // Work out how many days are in the date range, used conditionally format y axis tick labels
  // const numDays = Math.floor((dateExtent[1] - dateExtent[0]) / 86400000);
  // // Filter the plotData to the user defined yaxis range
  // const filteredData = plotData.map(({ dots, lines, ...d }) => ({
  //   ...d,
  //   dots: dots.filter(
  //     (el) => el.date > dateExtent[0] && el.date,
  //     dateExtent[1]
  //   ),
  //   lines: lines.filter(
  //     (el) => el.date > dateExtent[0] && el.date,
  //     dateExtent[1]
  //   ),
  // }));

  // // If no user defined tick format than format as full years unless date dange is less than three years, then months and years
  // // The number of axis ticks is defineded by the Flourish chartLayout module
  // const xTixkFormat = state.tickFormat
  //   ? state.tickFormat
  //   : numDays < 1095
  //   ? "%b %y"
  //   : "%Y";
  // // define the y axis
  // chartLayout.yData([0, valueExtent[1]]);

  // // pass the date formatting function (not format) to the chartLayout. User defined date min and max will not work properly without this
  // chartLayout.xDatetimeParse(parseDate);

  // // define the x axis and tick format
  // chartLayout.xData(dateExtent);
  // chartLayout.xFormat(timeFormat(xTixkFormat));

  // // Define a margin for the annotations label to sit in depending x axis orientation
  // if (xAlign === "bottom") {
  //   chartLayout.update({ margins: { top: 50, right: rightLabelWidth } });
  // } else {
  //   chartLayout.update({ margins: { bottom: 50, right: rightLabelWidth } });
  // }
  // // const that is the g element where the chart content is rendered to
  // const plot = chartLayout.data_foreground;

  // // Add a g element specifically for holding the annotations in the front
  // plot.append("g");

  // // Const for holding the chartLayout scales
  // const yScale = chartLayout.yScale();
  // const xScale = chartLayout.xScale();

  // // set up line interpolation and line drawing function
  // const areaData = d3
  //   .area()
  //   .x((d) => xScale(d.x))
  //   .y1((d) => yScale(d.y1))
  //   .y0((d) => yScale(d.y0));


  // // Add Margin of error shaded areas
  // plot
  //   .selectAll(".areas")
  //   .data(filteredData)
  //   .join(
  //     (enter) => enter.append("path").attr("d", (d) => areaData(d.areas)),
  //     (updateSel) => updateSel.attr("d", (d) => areaData(d.areas)),
  //     (exit) =>
  //       exit
  //         .transition()
  //         .duration(100)
  //         .on("end", function areasOnExit() {
  //           d3.select(this).remove();
  //         })
  //   )
  //   .attr("class", "areas")
  //   .attr("fill", (d) => colors.getColor(d.party))
  //   .attr("id", (d) => d.party)
  //   .attr("opacity", moeOpacity);

  // // Add a group for each series of dots
  // plot
  //   .selectAll(".dotHolder")
  //   .data(filteredData)
  //   .enter()
  //   .append("g")
  //   .attr("class", "dotHolder");

  // // Add the polling circles
  // plot
  //   .selectAll(".dotHolder")
  //   .selectAll("circle")
  //   .data((d) => d.dots)
  //   .join(
  //     (enter) =>
  //       enter
  //         .append("circle")
  //         .attr("cx", (d) => xScale(d.date))
  //         .attr("cy", (d) => yScale(d.value)),
  //     (updateSel) =>
  //       updateSel
  //         .attr("cx", (d) => xScale(d.date))
  //         .attr("cy", (d) => yScale(d.value)),
  //     (exit) =>
  //       exit.transition().on("end", function dotHolderCircleOnExit() {
  //         d3.select(this).remove();
  //       })
  //   )
  //   .attr("r", dotSize)
  //   .attr("fill", (d) => colors.getColor(d.name))
  //   .attr("opacity", dotOpacity);

  // // set up line interpolation and line drawing function
  // const interpolation = d3.curveLinear;
  // const lineData = d3
  //   .line()
  //   .defined((d) => d)
  //   .curve(interpolation)
  //   .x((d) => xScale(d.date))
  //   .y((d) => yScale(d.value));

  // plot
  //   .selectAll(".lines")
  //   .data(filteredData)
  //   .join(
  //     (enter) => enter.append("path").attr("d", (d) => lineData(d.lines)),
  //     (updateSel) => updateSel.attr("d", (d) => lineData(d.lines)),
  //     (exit) =>
  //       exit
  //         .transition()
  //         .duration(100)
  //         .attr("d", (d) => lineData(d.lines))
  //         .on("end", function linesOnEnd() {
  //           d3.select(this).remove();
  //         })
  //   )
  //   .attr("class", "lines")
  //   .attr("fill", "none")
  //   .attr("stroke-width", lineWidth)
  //   .attr("stroke", (d) => colors.getColor(d.party))
  //   .attr("id", (d) => d.party)
  //   .attr("opacity", lineOpacity);

  // // Add a group for each series of popup circles
  // plot
  //   .selectAll(".popHolder")
  //   .data(filteredData)
  //   .enter()
  //   .append("g")
  //   .attr("class", "popHolder");
  // // date format for the popus
  // const popFormat = "%b %d %Y";
  // const popDate = timeFormat(popFormat);
  // // Build a dataset for each day to be used to create invisible line for popups
  // const filteredAverages = formattedAverages.filter(
  //   (d) => d.date >= dateExtent[0] && d.date <= dateExtent[1]
  // );
  // // function for adding colour to the popup iyems category names
  // function popupCallback(node) {
  //   if (!node) return;
  //   const items = d3.select(".main-content").selectAll(".data-heading").nodes();
  //   for (let i = 0; i < items.length; i += 1) {
  //     const mobileName = d3.select(items[i]).text();
  //     const partyData = parties.filter(
  //       (d) => d.displayNameMobile === mobileName
  //     );
  //     d3.select(items[i]).style("color", colors.getColor(partyData[0].party));
  //   }
  // }

  // // Calculate the last date to be rendered. allows for a data greater or lesser than the range in the dataset
  // const lastDate =
  //   parseDate(state.x.datetime_max) > averagesExtent[1]
  //     ? averagesExtent[1]
  //     : state.x.datetime_max
  //     ? parseDate(state.x.datetime_max)
  //     : averagesExtent[1];
  // // Set up label data
  // const labelData = filteredData
  //   .map(({ lines, party, displayNameDesk, displayNameMob }) => {
  //     const line = lines.filter((d) => d.date <= lastDate);
  //     const average = line[line.length - 1].value;
  //     return {
  //       party,
  //       displayNameDesk,
  //       displayNameMob,
  //       average,
  //       // Set initial positions for each label
  //       position: yScale(average),
  //     };
  //   })
  //   .sort((a, b) => b.average - a.average);

  // chart
  //   .selectAll(".labelHolder")
  //   .data(labelData)
  //   .enter()
  //   .append("g")
  //   .attr("class", "labelHolder");

  // // Calculate new label positions recursively
  // positionLabels(
  //   chart.selectAll(".labelHolder"),
  //   rem, // Minimum spacing between labels (increase for more space)
  //   0.5 // Amount to change label positon by each iteration
  // );

  // chart
  //   .selectAll(".labelHolder")
  //   .selectAll("rect")
  //   .data((d) => [d])
  //   .join(
  //     (enter) =>
  //       enter
  //         .append("rect")
  //         .attr("height", rem)
  //         .attr("y", (d) => d.position - rem * 0.5)
  //         .attr("x", () => xScale(lastDate) + rem * 0.3),
  //     (updateSel) =>
  //       updateSel
  //         .attr("y", (d) => d.position - rem * 0.5)
  //         .attr("x", () => xScale(lastDate) + rem * 0.3)
  //         .attr("width", rem * 0.5),
  //     (exit) =>
  //       exit
  //         .transition()
  //         .attr("width", 0)
  //         .on("end", function labelHoldRectOnEnd() {
  //           d3.select(this).remove();
  //         })
  //   )
  //   .attr("fill", (d) => colors.getColor(d.party))
  //   .attr("height", rem)
  //   .attr("width", rem * 0.5);

  // chart
  //   .selectAll(".labelHolder")
  //   .selectAll("text")
  //   .data((d) => [d])
  //   .join(
  //     (enter) =>
  //       enter
  //         .append("text")
  //         .attr("y", (d) => d.position + rem * 0.3)
  //         .attr("x", () => xScale(lastDate) + rem),
  //     (updateSel) =>
  //       updateSel
  //         .attr("y", (d) => d.position + rem * 0.3)
  //         .attr("x", () => xScale(lastDate) + rem),

  //     (exit) =>
  //       exit
  //         .transition()
  //         .attr("opacity", 0)
  //         .on("end", function labelHoldOnEnd() {
  //           d3.select(this).remove();
  //         })
  //   )
  //   .attr("font-weight", 600)
  //   .style("fill", (d) => colors.getColor(d.party))
  //   .text((d) => {
  //     if (breaks === "mobile_small" || breaks === "mobile_big") {
  //       return `${d.displayNameMob} ${format(d.average)}`;
  //     }
  //     return `${d.displayNameDesk} ${format(d.average)}`;
  //   });

  // layout.update();
}
