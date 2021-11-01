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
export function formatNumber(d, domain , divisor) {
    if (d / divisor === 0) {
        return d3.format(',')
    }
    if (Number.isInteger(d / divisor) === true) {
        return decimalFormat(domain[1] - domain[0]);
    }
    return d3.format(',')
    
  function decimalFormat(range) {
    let format = d3.format(',');
    if (range >= 0.5) {
        format = d3.format('.1f');
    }
    if (range < 0.5) {
        format = d3.format('.2f');
    }
    if (range <= 0.011) {
        format = d3.format('.3f');
    }
    if (range < 0.0011) {
        format = d3.format('.4f');
    }
    if (range < 0.00011) {
        format = d3.format('.5f');
    }
    if (range < 0.000011) {
        format = d3.format('.6f');
    }
    return format
  }
}

// function that calculates the position of each rectangle in the stack
export function getStacks(el, seriesNames) {
  let posCumulative = 0;
  let negCumulative = 0;
  let baseX = 0;
  let baseX1 = 0;
  const series = seriesNames.map((name, i) => {
    return {
        name,
        value: +el[name],
    };
  })
    // Sorts biggest rects to the left
    .filter(d =>d.value > 0 )
    .sort((a, b) => b.value - a.value)
  const newSeriesNames = series.map(d => d.name)
  let stacks = newSeriesNames.map((name, i) => {
    if (el[name] > 0) {
        baseX1 = posCumulative;
        posCumulative += (+el[name]);
        baseX = posCumulative;
    }
    if (el[name] < 0) {
        baseX1 = negCumulative;
        negCumulative += (+el[name]);
        baseX = negCumulative;
        if (i < 1) { baseX = 0; baseX1 = negCumulative; }
    }
    return {
        name,
        group: el.name,
        x: +baseX,
        x1: +baseX1,
        value: +el[name],
        total: d3.sum(el)
    };
  });
  stacks = stacks.filter(d => d.value != 0)
  return stacks;
};
