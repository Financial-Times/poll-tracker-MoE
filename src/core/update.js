import { getFacetData } from "./getFacetData";
import { getLinesData } from "./getLinesData";
import { getPollData } from "./getPollData";
import { updateHeight } from "./height";
import { getDateExtent } from "./getDateExtent";
import { updateFootnote } from "./footnote";
import { updateFacets } from "./updateFacets";

export default function update() {
  const {
    colors,
    layout,
    chart,
    data,
    state,
    facets,
    props,
    axesHighlights,
    popup,
    legendCategorical,
    legendContainer,
  } = this;

  // /////////// DATA
  // Conditionally maps the facet names depending on if a grod of charts or a single plot is requires
  const facetNames = state.gridKey
    ? data.Lines.map((d) => d.facet).filter(
        (item, pos, arr) => arr.indexOf(item) === pos
      )
    : [""];

  const columnNames = data.polls.column_names.value;
  colors.updateColorScale(columnNames);

  // Format the polling data so that it can be used to create global values and plot points
  const pollData = getPollData(data, state);
  const linesData = getLinesData(data, state);

  const { width, height } = updateHeight(state, layout);

  updateFootnote(state, pollData);

  chart.attr("width", width).attr("height", height);

  layout.update();

  const dateExtent = getDateExtent(pollData, state);
  const facetData = getFacetData({
    facetNames,
    state,
    data,
    linesData,
    pollData,
    dateExtent,
  });

  // RENDER
  facets
    .width(width)
    .height(height)
    .data(facetData, (d) => d.name)
    .update((facet) =>
      updateFacets({
        facet,
        colors,
        width,
        layout,
        state,
        pollData,
        linesData,
        props,
        axesHighlights,
        columnNames,
        dateExtent,
        popup,
        data,
        legendCategorical,
        legendContainer,
      })
    );

  // Hides the facet title on single charts
  facets.hideTitle(facetNames[0]);
}
