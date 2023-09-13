import initLayout from "@flourish/layout";
import {
  createLegendContainer,
  createDiscreteColorLegend,
} from "@flourish/legend";
import initialisePopup from "@flourish/info-popup";
import initAxesHighlights from "@flourish/axes-highlights";
import createColors from "@flourish/colors";
// I have no idea why the following won't import -æ.
// import tracking from "@financial-times/flourish-send-custom-analytics";
import state from "./state";

export const appFactory = (drawFunc, updateFunc) => {
  const draw = drawFunc || Function;
  const update = updateFunc || draw;
  const app = {
    state,

    data: {},
    layout: {},
    popup: {},
  };

  app.layout = initLayout(app.state.layout);
  app.popup = initialisePopup(app.state.popup);
  app.axes_highlights = initAxesHighlights(app.state.axes_highlights);
  app.colors = createColors(state.color);

  app.legendContainer = createLegendContainer(state.legend_container);

  const legendCategorical = createDiscreteColorLegend(state.legend_categorical);
  app.legendContainer
    .appendTo(app.layout.getSection("legend"))
    .add([legendCategorical]);
  app.legendContainer.update();

  // Draw hooks
  app.predraw = function predraw() {};

  app.postdraw = function postdraw() {};
  app.draw = () => {
    app.predraw.call(app);
    draw.call(app);
    app.postdraw.call(app);
    app.draw.called = true;
  };
  app.draw.called = false;

  // Update hooks
  app.preupdate = () => {};
  app.postupdate = () => {};
  app.update = () => {
    app.preupdate.call(app);
    update.call(app);
    app.postupdate.call(app);

    app.update.called = true;
    app.update.calledTimes += 1;
  };

  app.update.called = false;
  app.update.calledTimes = 0;
  // tracking.init(template);
  return app;
};
