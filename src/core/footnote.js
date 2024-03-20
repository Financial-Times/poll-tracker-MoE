import { timeFormat } from "d3-time-format";

export function updateFootnote(state, pollData){
  // Format for footnote date
  const updateFormat = timeFormat("%b %e");
  // Toggle that controls the automatic update of the footnote to include last polling date
  if(state.footnoteSwitch) {
    // chart_layout.xFormat(getDateFormat('years', chart_layout.xTicks()))
    state.layout.footer_note = `Latest poll ${updateFormat(
      pollData[pollData.length - 1].date
    )}`;
  }
  else if (state.layout.footer_note === `Latest poll ${updateFormat(
    pollData[pollData.length - 1].date
  )}`)
  {state.layout.footer_note = '';}
}