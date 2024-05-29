import * as d3 from "d3";

export function getDateExtent(pollData, state) {
  // Create a global date extent array as this remains constant across all facets
  const dateExtent = d3.extent(pollData, (d) => d.date);
  const parseDate = d3.timeParse(state.dateFormat);

  // Check for user overideas to the dateextent array
  dateExtent[0] = state.x.datetime_min
    ? parseDate(state.x.datetime_min)
    : d3.extent(pollData, (d) => d.date)[0];

  dateExtent[1] = state.x.datetime_max
    ? parseDate(state.x.datetime_max)
    : d3.extent(pollData, (d) => d.date)[1];

  return dateExtent;
}
