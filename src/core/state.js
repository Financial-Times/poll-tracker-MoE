/**
 * @file
 * The current state of template. You can make some or all of the properties
 * of the state object available to the user as settings in settings.js.
 */
import { themes } from "../themes";

export default {
  ...themes["FT Newsroom: default"].settings,
  theme: themes["FT Newsroom: default"], // this can be overridden by the chooser on the main website
  layout: {
    ...themes["FT Newsroom: default"].settings.layout,
    title: "Title not yet added",
    subtitle: "Subtitle not yet added",
    footer_note: "Source: Not yet added",
    background_color: "#fff1e5",
  },
  gridKey: false,
  facets: { sameY: true },
  lineStyle: "solid",
  lineWidth: 0.6,
  lineColor: "#66605C",
  lineOpacity: 1.0,
  lineDashWidth: 2,
  labelFontSize: 1.0,
  labelFontWeight: "400",
  labelFontColor: "#66605C",
  labelTextAnchor: "middle",
  x: {
    title_mode: "custom",
    tick_label_angle: 0,
    line_and_tick_color: "#ccc1b7",
    show_scale_settings: true,
    nice: false,
    axis_position: "bottom",
  },
  y: {
    title_mode: "custom",
    gridlines_visible: true,
    gridline_color: "#ccc1b7",
  },
  y2: {},
  color: {
    domain: ["con", "lab"],
    range: ["#149ADB", "CF4D3C"],
    categorical_custom_palette:
      "con: #149ADB\nlab: #CF4D3C\nlib: #F09000\ngreen: #8DEB9D\nukip: #7200AB",
  },
  aspectRatio: "ratio",
  aspect: { small: 0.8, desk: 1.6, breakpoint: 500 },
  tuneLabel: 0,
  polls: {
    render: true,
    sizeSmall: 2.5,
    opacitySmall: 0.2,
    decayOpacitySmall: 0.5,
    sizeDesk: 2.5,
    opacityDesk: 0.2,
    decayOpacityDesk: 0.5,
  },
  chart_bg: {},
  axes_highlights: {}, // Add any properties to this object to override the default settings
  fixedHeight: false,
  height: 550,
  dateFormat: "%Y-%m-%d",
  tickFormat: "%Y",
  dotOpacity: 0.2,
  averages: {
    render: true,
    smallStrokeWidth: 2,
    largeStrokeWidth: 3,
    smallOpacity: 1,
    largeOpacity: 1,
  },
  moe: { render: true, opacityMob: 0.3, opacityDesk: 0.3 },
  showLegendOnMobile: true,
  legend_container: {},
  legend_categorical: { swatch_width: 1.2, swatch_height: 0.3 },
  displayValues: {},
  popup: {},
  footnoteSwitch: true, // Add any properties to this object to override the default settings
};
