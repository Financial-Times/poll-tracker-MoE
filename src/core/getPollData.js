
import * as d3 from "d3";

export function getPollData(data, state){
    const parseDate = d3.timeParse(state.dateFormat);
    const columnNames = data.polls.column_names.value;
    return data.polls
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .map((d, index) => {
      const row = { date: parseDate(d.date), pollster: d.pollster, rowID: index, };
      columnNames.forEach((el, i) => {
        row[columnNames[i]] = isNaN(d.value[i]) ? "" : Number(d.value[i]);
      });
      return row;
    })
}