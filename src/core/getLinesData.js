import * as d3 from "d3";

export function getLinesData(data, state){
    const parseDate = d3.timeParse(state.dateFormat);
    const linesData = data.Lines
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))
    .map((d) => {
      return {
        date: parseDate(d.date),
        party: d.party,
        lower: Number(d.lower),
        upper: Number(d.upper),
        value: Number(d.value)
      }
    })

    return linesData
}