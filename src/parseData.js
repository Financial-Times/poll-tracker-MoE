import * as d3 from 'd3';
import { getTextWidth } from "@flourish/pocket-knife"

export function formatData(data, dateFormat) {
  console.log(data, dateFormat)
  // var parseDate = d3.timeParse(dateFormat);
  // // eslint-disable-next-line no-prototype-builtins
  // if (data[0].hasOwnProperty('date')) {
  //   return data.map(point => ({
  //     ...point,
  //     date: parseDate(point.date),
  //   }));
  // }
  // return data;
}

export function getSeriesNames(data, excludeColumns) {
  const exclude = excludeColumns || ['date', 'label', 'annotate', 'highlight', 'type'];
  const allSeriesNames = (Array.isArray(data)
    ? data.reduce((acc, curr) => [...acc, ...Object.keys(curr)], [])
    : Object.keys(data)
  ).filter(d => !exclude.includes(d));
  return [...new Set(allSeriesNames)];
}

export function getMaxTextWidth(text, font) {
    let maxWidth = 0
    text.map(d => {
        maxWidth = Math.max(maxWidth, getTextWidth(String(d),'16px MetricWeb'))
    })
    return maxWidth
}

export function extentMulti(data, columns) {
    const ext = data.reduce((acc, row) => {
        const values = columns.map(key => +row[key]);
        const rowExtent = d3.extent(values);
        if (!acc.max) {
            acc.max = rowExtent[1];
            acc.min = rowExtent[0];
        } else {
            acc.max = Math.max(acc.max, rowExtent[1]);
            acc.min = Math.min(acc.min, rowExtent[0]);
        }
        return acc;
    }, {});
    return [ext.min, ext.max];
}
// A function that returns an array of poll data for a given party
export function getDots(d, group,) {
    const dotsData = [];
    d.map((el) => {
        const column = {};
        column.name = group;
        column.date = el.date;
        column.value = Number(el[group]);
        column.pollster = el.pollster
        if (el[group]) {
            dotsData.push(column);
        }
    });
    return dotsData;
}

export function getlines(d, group) {
    // console.log('d and group',d,group)
    const lineData = [];
    d.forEach((el) => {
        // console.log(el,i)
        const column = {};
        column.name = group;
        column.date = el.date;
        column.value = +el[group];
        if (el[group]) {
            lineData.push(column);
        }

        // if(el[group] == false) {
        //     lineData.push(null)
        // }
        if (el[group] === false && joinPoints === false) {
            lineData.push(null);
        }
    });
    return lineData;
}

export function getMoE(d, group) {
    // console.log('d and group',d,group)
    const areaData = [];
    d.forEach((el) => {
        // console.log(el,i)
        const column = {};
        column.name = group;
        column.x = el.date;
        column.y1 = +el[group + '_upper'];
        column.y0 = +el[group + '_lower'];
        if (el[group]) {
            areaData.push(column);
        }

        // if(el[group] == false) {
        //     lineData.push(null)
        // }
        if (el[group] === false && joinPoints === false) {
            areaData.push(null);
        }
    });
    return areaData;
}
