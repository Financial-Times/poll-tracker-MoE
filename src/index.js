import { appFactory } from "./core/app";
import drawFunc from "./core/draw";
import updateFunc from "./core/update";

const app = appFactory(drawFunc, updateFunc);

export const { state, data, draw, update } = app;
