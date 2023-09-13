import {
  createLegendContainer,
  createDiscreteColorLegend,
} from "@flourish/legend";
import initLayout from "@flourish/layout";
import state from "./core/state";

const layout = initLayout(state.layout);
const legendContainer = createLegendContainer(state.legend_container);
const legendCategorical = createDiscreteColorLegend(state.legend_categorical);
legendContainer.appendTo(layout.getSection("legend")).add([legendCategorical]);
legendContainer.update();

export { layout, legendContainer, legendCategorical };
