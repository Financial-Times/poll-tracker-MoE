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
