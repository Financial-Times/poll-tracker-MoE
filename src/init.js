import initLayout from "@flourish/layout";
import state from "./core/state";
import { createLegendContainer, createDiscreteColorLegend, createContinuousColorLegend, createContinuousSizeLegend } from "@flourish/legend";


var layout = initLayout(state.layout);
const legend_container = createLegendContainer(state.legend_container);
const legend_categorical = createDiscreteColorLegend(state.legend_categorical);
legend_container
	.appendTo(layout.getSection("legend"))
	.add([
		legend_categorical,
	]);
legend_container.update()



export { layout,};
