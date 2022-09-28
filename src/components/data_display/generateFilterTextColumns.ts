const generateFilterTextColumns = async (tableName: string) => {
  // Get all auto-gen columns for table from data_view_column_definitions
  //   - ignore any that don't have correct suffix
  //   - handle suffix like data_table prefix, shouldn't be required, and
  //     exceptions for "user", "org" tables
  //
  // Get all current columns from table with "filter_text" suffix
  //
  // For each column in column_definitions:
  //   - if exists in table, continue
  //   - if not, create it
  //   - remove from "current_columns" list
  //   - finally, delete any columns remaining in "current_columns"
  //
  // Create column details array: [{column, textFilterExpression}...]
  //
  // For each record in table:
  //   - iterate over column details array
  //   - evaluate expression to "results" array
  //   - write record: columns => results
}
