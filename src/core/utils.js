/**
 * @file
 * Various utility functions
 */

/**
 * Combines two arrays into a single array of arrays, suitable for Object.fromEntries
 *
 * @param   {array}  a  First array
 * @param   {array}  b  Second array
 *
 * @return  {array}     Zipped array
 */
export const zip = (a, b) =>
  Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

/**
 * Flourish's "columns" data type creates an array of items for each row.
 * Usually you want each row as an object. This does that.
 *
 * @param   {array}  columnNames  Array of column names to map each row onto
 * @param   {array}  data         The dataset containing all the rows
 *
 * @return  {array}               Returns array of objects
 */
export const transformColumnsDataTypeToObject = (columnNames, data) =>
  Object.fromEntries(zip(columnNames, data));

/**
 * Returns each dataset with multi-column groups merged into each object
 *
 * @param   {object}  data  Flourish data object
 *
 * @return  {object}        Flourish data object with flattened columns
 */
export const flattenColumnGroups = (data) =>
  Object.entries(data).reduce((acc, [key, dataset]) => {
    const columnGroups = Object.entries(dataset.column_names)
      .map(([k, v]) => {
        if (Array.isArray(v)) return k;
        return false;
      })
      .filter(Boolean);

    const curr = dataset.map(({ values, ...row }) => ({
      ...row,
      ...columnGroups.reduce(
        (acc1, colGroup) => ({
          ...acc1,
          ...transformColumnsDataTypeToObject(dataset.column_names[colGroup], values),
        }),
        {}
      ),
    }));

    return { ...acc, [key]: curr };
  }, {});
