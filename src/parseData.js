import * as d3 from "d3";
import { getTextWidth } from "@flourish/pocket-knife";

export function formatData(data, dateFormat) {
  console.log(data, dateFormat);
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
  const exclude = excludeColumns || [
    "date",
    "label",
    "annotate",
    "highlight",
    "type",
  ];
  const allSeriesNames = (
    Array.isArray(data)
      ? data.reduce((acc, curr) => [...acc, ...Object.keys(curr)], [])
      : Object.keys(data)
  ).filter((d) => !exclude.includes(d));
  return [...new Set(allSeriesNames)];
}

export function getMaxTextWidth(text) {
  let maxWidth = 0;
  text.forEach((d) => {
    maxWidth = Math.max(maxWidth, getTextWidth(String(d), "16px MetricWeb"));
  });
  return maxWidth;
}

export function extentMulti(data, columns) {
  const ext = data.reduce((acc, row) => {
    const values = columns.map((key) => +row[key]);
    const [min, max] = d3.extent(values);
    if (!acc.max) {
      acc.max = max;
      acc.min = min;
    } else {
      acc.max = Math.max(acc.max, max);
      acc.min = Math.min(acc.min, min);
    }
    return acc;
  }, {});
  return [ext.min, ext.max];
}

// A function that returns an array of poll data for a given party
export function getDots(d, group) {
  const dotsData = [];
  d.map((el) => {
    const column = {};
    column.party = group;
    column.date = el.date;
    column.rowID = el.rowID
    column.value = Number(el[group]);
    column.pollster = el.pollster;
    if (el[group]) {
      dotsData.push(column);
    }
  });
  return dotsData;
}

export function getlines(d, displayNameDesk) {
  // console.log('d and group',d,group)
  const lineData = [];
  d.forEach((el) => {
    const column = {};
    column.displayName = displayNameDesk;
    column.name = el.party;
    column.date = el.date;
    column.value = el.value;
    if (el.value) {
      lineData.push(column);
    }

    // if(el[group] == false) {
    //     lineData.push(null)
    // }
    if (el.value === false) {
      lineData.push(null);
    }
  });
  return lineData;
}

export function getMoE(d, group,) {
  const areaData = [];
  d.forEach((el) => {
    //console.log(el)
    const column = {};
    column.party = group;
    column.date = el.date;
    column.upper = el.upper;
    column.lower = el.lower;
    column.value = el.value;

    if (el.party) {
      areaData.push(column);
    }

  });
  return areaData;
}
