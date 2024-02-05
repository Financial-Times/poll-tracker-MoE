
import * as d3 from "d3";

export function updateHeight(state, layout ){


  // calculate and apply fixed height on breakpoint before rem calculation
  // or text on bars will jump when cross the tablet breakpoint. This is also used to determine the correct Formatdisplayname
  const breakpoint = state.layout.breakpoint_tablet;
  // update the proportions of the containing svg
  let width = layout.getPrimaryWidth();
  let height;
  const isMobile = width <= breakpoint
  // Use the layout setHeight functionality to control the aspect ration when 'ratio' selected
  if (state.aspectRatio === "ratio") {
    // Use the breakpoint to determne which aspect ratio calculation is used
    height =
    isMobile
        ? width / state.aspect.small
        : width / state.aspect.desk;
    layout.setHeight(height);
  } else {
    height = layout.getPrimaryHeight();
    layout.setHeight(null);
  }

  return {width, height}
}