
import * as d3 from "d3";

export function getLastDate(state, pollData ){
    
    const lastDate = new Date(state.x.datetime_max) <
        new Date(d3.extent(pollData, (d) => d.date)[1])
            ? new Date(state.x.datetime_max)
            : d3.extent(pollData, (d) => d.date)[1];

    return lastDate
}